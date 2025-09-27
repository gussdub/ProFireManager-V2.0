from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import json
import hashlib

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ProFireManager API", version="2.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT and Password configuration
SECRET_KEY = os.environ.get("JWT_SECRET", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60  # 24 hours

# Simplified password hashing
import hashlib

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

security = HTTPBearer()

# Define Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    prenom: str
    email: str
    telephone: str = ""
    contact_urgence: str = ""  # Nouveau champ
    grade: str  # Capitaine, Directeur, Pompier, Lieutenant
    type_emploi: str  # temps_plein, temps_partiel
    role: str  # admin, superviseur, employe
    statut: str = "Actif"  # Actif, Inactif
    numero_employe: str
    date_embauche: str
    formations: List[str] = []  # IDs des formations
    mot_de_passe_hash: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: str
    telephone: str = ""
    contact_urgence: str = ""  # Nouveau champ
    grade: str
    type_emploi: str
    role: str
    numero_employe: str
    date_embauche: str
    formations: List[str] = []
    mot_de_passe: str

class UserLogin(BaseModel):
    email: str
    mot_de_passe: str

class TypeGarde(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    heure_debut: str
    heure_fin: str
    personnel_requis: int
    duree_heures: int
    couleur: str
    jours_application: List[str] = []  # monday, tuesday, etc.
    officier_obligatoire: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TypeGardeCreate(BaseModel):
    nom: str
    heure_debut: str
    heure_fin: str
    personnel_requis: int
    duree_heures: int
    couleur: str
    jours_application: List[str] = []
    officier_obligatoire: bool = False

class Planning(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    semaine_debut: str  # Format: YYYY-MM-DD
    semaine_fin: str
    assignations: Dict[str, Any] = {}  # jour -> type_garde -> assignation
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PlanningCreate(BaseModel):
    semaine_debut: str
    semaine_fin: str
    assignations: Dict[str, Any] = {}

class Assignation(BaseModel):
    user_id: str
    type_garde_id: str
    date: str
    statut: str = "planifie"  # planifie, confirme, remplacement_demande
    assignation_type: str = "auto"  # auto, manuel

class AssignationCreate(BaseModel):
    user_id: str
    type_garde_id: str
    date: str
    assignation_type: str = "manuel"

class DemandeRemplacement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    demandeur_id: str
    type_garde_id: str
    date: str
    raison: str
    statut: str = "en_cours"  # en_cours, approuve, refuse
    remplacant_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DemandeRemplacementCreate(BaseModel):
    type_garde_id: str
    date: str
    raison: str

class Formation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    description: str = ""
    duree_heures: int = 0
    validite_mois: int = 12  # Durée de validité en mois
    obligatoire: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FormationCreate(BaseModel):
    nom: str
    description: str = ""
    duree_heures: int = 0
    validite_mois: int = 12
    obligatoire: bool = False

class Disponibilite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    date: str  # Date exacte YYYY-MM-DD
    heure_debut: str
    heure_fin: str
    statut: str = "disponible"  # disponible, indisponible, preference
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DisponibiliteCreate(BaseModel):
    user_id: str
    date: str  # Date exacte YYYY-MM-DD
    heure_debut: str
    heure_fin: str
    statut: str = "disponible"

class Statistiques(BaseModel):
    personnel_actif: int
    gardes_cette_semaine: int
    formations_planifiees: int
    taux_couverture: float
    heures_travaillees: int
    remplacements_effectues: int

# Helper functions

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    return User(**user)

# Root route
@api_router.get("/")
async def root():
    return {"message": "ProFireManager API v2.0", "status": "running"}
@api_router.post("/auth/login")
async def login(user_login: UserLogin):
    user_data = await db.users.find_one({"email": user_login.email})
    if not user_data or not verify_password(user_login.mot_de_passe, user_data["mot_de_passe_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    user = User(**user_data)
    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "nom": user.nom,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role,
            "grade": user.grade,
            "type_emploi": user.type_emploi
        }
    }

@api_router.get("/auth/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "nom": current_user.nom,
        "prenom": current_user.prenom,
        "email": current_user.email,
        "role": current_user.role,
        "grade": current_user.grade,
        "type_emploi": current_user.type_emploi,
        "formations": current_user.formations
    }

# User management routes
@api_router.post("/users", response_model=User)
async def create_user(user_create: UserCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_create.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    user_dict = user_create.dict()
    user_dict["mot_de_passe_hash"] = get_password_hash(user_dict.pop("mot_de_passe"))
    user_obj = User(**user_dict)
    
    await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "superviseur"]:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    users = await db.users.find().to_list(1000)
    cleaned_users = [clean_mongo_doc(user) for user in users]
    return [User(**user) for user in cleaned_users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "superviseur"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    user = clean_mongo_doc(user)
    return User(**user)

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_update: UserCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Check if user exists
    existing_user = await db.users.find_one({"id": user_id})
    if not existing_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Update user data
    user_dict = user_update.dict()
    if user_dict["mot_de_passe"]:
        user_dict["mot_de_passe_hash"] = get_password_hash(user_dict.pop("mot_de_passe"))
    else:
        user_dict.pop("mot_de_passe")
        user_dict["mot_de_passe_hash"] = existing_user["mot_de_passe_hash"]
    
    user_dict["id"] = user_id
    user_dict["statut"] = existing_user.get("statut", "Actif")
    user_dict["created_at"] = existing_user.get("created_at")
    
    result = await db.users.replace_one({"id": user_id}, user_dict)
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Impossible de mettre à jour l'utilisateur")
    
    updated_user = await db.users.find_one({"id": user_id})
    updated_user = clean_mongo_doc(updated_user)
    return User(**updated_user)

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Check if user exists
    existing_user = await db.users.find_one({"id": user_id})
    if not existing_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Delete user
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Impossible de supprimer l'utilisateur")
    
    # Also delete related data
    await db.disponibilites.delete_many({"user_id": user_id})
    await db.assignations.delete_many({"user_id": user_id})
    await db.demandes_remplacement.delete_many({"demandeur_id": user_id})
    
    return {"message": "Utilisateur supprimé avec succès"}
@api_router.post("/types-garde", response_model=TypeGarde)
async def create_type_garde(type_garde: TypeGardeCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    type_garde_obj = TypeGarde(**type_garde.dict())
    await db.types_garde.insert_one(type_garde_obj.dict())
    return type_garde_obj

@api_router.get("/types-garde", response_model=List[TypeGarde])
async def get_types_garde(current_user: User = Depends(get_current_user)):
    types_garde = await db.types_garde.find().to_list(1000)
    cleaned_types = [clean_mongo_doc(type_garde) for type_garde in types_garde]
    return [TypeGarde(**type_garde) for type_garde in cleaned_types]

# Helper function to clean MongoDB documents
def clean_mongo_doc(doc):
    """Remove MongoDB ObjectId and other non-serializable fields"""
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc

@api_router.put("/types-garde/{type_garde_id}", response_model=TypeGarde)
async def update_type_garde(type_garde_id: str, type_garde_update: TypeGardeCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Check if type garde exists
    existing_type = await db.types_garde.find_one({"id": type_garde_id})
    if not existing_type:
        raise HTTPException(status_code=404, detail="Type de garde non trouvé")
    
    # Update type garde data
    type_dict = type_garde_update.dict()
    type_dict["id"] = type_garde_id
    type_dict["created_at"] = existing_type.get("created_at")
    
    result = await db.types_garde.replace_one({"id": type_garde_id}, type_dict)
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Impossible de mettre à jour le type de garde")
    
    updated_type = await db.types_garde.find_one({"id": type_garde_id})
    updated_type = clean_mongo_doc(updated_type)
    return TypeGarde(**updated_type)

@api_router.delete("/types-garde/{type_garde_id}")
async def delete_type_garde(type_garde_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Check if type garde exists
    existing_type = await db.types_garde.find_one({"id": type_garde_id})
    if not existing_type:
        raise HTTPException(status_code=404, detail="Type de garde non trouvé")
    
    # Delete type garde
    result = await db.types_garde.delete_one({"id": type_garde_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Impossible de supprimer le type de garde")
    
    # Also delete related assignations
    await db.assignations.delete_many({"type_garde_id": type_garde_id})
    
    return {"message": "Type de garde supprimé avec succès"}
@api_router.get("/planning/{semaine_debut}")
async def get_planning(semaine_debut: str, current_user: User = Depends(get_current_user)):
    planning = await db.planning.find_one({"semaine_debut": semaine_debut})
    if not planning:
        # Create empty planning for the week
        semaine_fin = (datetime.strptime(semaine_debut, "%Y-%m-%d") + timedelta(days=6)).strftime("%Y-%m-%d")
        planning_obj = Planning(semaine_debut=semaine_debut, semaine_fin=semaine_fin)
        await db.planning.insert_one(planning_obj.dict())
        planning = planning_obj.dict()
    else:
        planning = clean_mongo_doc(planning)
    
    return planning

@api_router.post("/planning/assignation")
async def create_assignation(assignation: AssignationCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "superviseur"]:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Store assignation in database
    assignation_obj = Assignation(**assignation.dict())
    await db.assignations.insert_one(assignation_obj.dict())
    return {"message": "Assignation créée avec succès"}

@api_router.get("/planning/assignations/{semaine_debut}")
async def get_assignations(semaine_debut: str, current_user: User = Depends(get_current_user)):
    semaine_fin = (datetime.strptime(semaine_debut, "%Y-%m-%d") + timedelta(days=6)).strftime("%Y-%m-%d")
    
    assignations = await db.assignations.find({
        "date": {
            "$gte": semaine_debut,
            "$lte": semaine_fin
        }
    }).to_list(1000)
    
    # Clean MongoDB documents
    cleaned_assignations = [clean_mongo_doc(assignation) for assignation in assignations]
    return [Assignation(**assignation) for assignation in cleaned_assignations]

# Remplacements routes
@api_router.post("/remplacements", response_model=DemandeRemplacement)
async def create_demande_remplacement(demande: DemandeRemplacementCreate, current_user: User = Depends(get_current_user)):
    demande_obj = DemandeRemplacement(**demande.dict(), demandeur_id=current_user.id)
    await db.demandes_remplacement.insert_one(demande_obj.dict())
    # Clean the object before returning to avoid ObjectId serialization issues
    cleaned_demande = clean_mongo_doc(demande_obj.dict())
    return DemandeRemplacement(**cleaned_demande)

@api_router.get("/remplacements", response_model=List[DemandeRemplacement])
async def get_demandes_remplacement(current_user: User = Depends(get_current_user)):
    if current_user.role == "employe":
        demandes = await db.demandes_remplacement.find({"demandeur_id": current_user.id}).to_list(1000)
    else:
        demandes = await db.demandes_remplacement.find().to_list(1000)
    
    cleaned_demandes = [clean_mongo_doc(demande) for demande in demandes]
    return [DemandeRemplacement(**demande) for demande in cleaned_demandes]

# Formations routes
@api_router.post("/formations", response_model=Formation)
async def create_formation(formation: FormationCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    formation_obj = Formation(**formation.dict())
    await db.formations.insert_one(formation_obj.dict())
    return formation_obj

@api_router.get("/formations", response_model=List[Formation])
async def get_formations(current_user: User = Depends(get_current_user)):
    formations = await db.formations.find().to_list(1000)
    cleaned_formations = [clean_mongo_doc(formation) for formation in formations]
    return [Formation(**formation) for formation in cleaned_formations]

# Disponibilités routes
@api_router.post("/disponibilites", response_model=Disponibilite)
async def create_disponibilite(disponibilite: DisponibiliteCreate, current_user: User = Depends(get_current_user)):
    disponibilite_obj = Disponibilite(**disponibilite.dict())
    await db.disponibilites.insert_one(disponibilite_obj.dict())
    return disponibilite_obj

@api_router.get("/disponibilites/{user_id}", response_model=List[Disponibilite])
async def get_user_disponibilites(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "superviseur"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    disponibilites = await db.disponibilites.find({"user_id": user_id}).to_list(1000)
    cleaned_disponibilites = [clean_mongo_doc(dispo) for dispo in disponibilites]
    return [Disponibilite(**dispo) for dispo in cleaned_disponibilites]

@api_router.put("/disponibilites/{user_id}")
async def update_user_disponibilites(user_id: str, disponibilites: List[DisponibiliteCreate], current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "superviseur"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    # Delete existing disponibilités for this user
    await db.disponibilites.delete_many({"user_id": user_id})
    
    # Insert new disponibilités
    if disponibilites:
        dispo_docs = []
        for dispo in disponibilites:
            dispo_obj = Disponibilite(**dispo.dict())
            dispo_docs.append(dispo_obj.dict())
        
        await db.disponibilites.insert_many(dispo_docs)
    
    return {"message": f"Disponibilités mises à jour avec succès ({len(disponibilites)} entrées)"}

@api_router.delete("/disponibilites/{disponibilite_id}")
async def delete_disponibilite(disponibilite_id: str, current_user: User = Depends(get_current_user)):
    # Find the disponibilité to check ownership
    disponibilite = await db.disponibilites.find_one({"id": disponibilite_id})
    if not disponibilite:
        raise HTTPException(status_code=404, detail="Disponibilité non trouvée")
    
    if current_user.role not in ["admin", "superviseur"] and current_user.id != disponibilite["user_id"]:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    result = await db.disponibilites.delete_one({"id": disponibilite_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=400, detail="Impossible de supprimer la disponibilité")
    
    return {"message": "Disponibilité supprimée avec succès"}

# Attribution automatique endpoint
@api_router.post("/planning/attribution-auto")
async def attribution_automatique(semaine_debut: str, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "superviseur"]:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    try:
        # Get all available users and types de garde
        users = await db.users.find({"statut": "Actif"}).to_list(1000)
        types_garde = await db.types_garde.find().to_list(1000)
        
        # Get existing assignations for the week
        semaine_fin = (datetime.strptime(semaine_debut, "%Y-%m-%d") + timedelta(days=6)).strftime("%Y-%m-%d")
        existing_assignations = await db.assignations.find({
            "date": {
                "$gte": semaine_debut,
                "$lte": semaine_fin
            }
        }).to_list(1000)
        
        # Attribution automatique logic (respectant les priorités définies)
        nouvelles_assignations = []
        
        for type_garde in types_garde:
            # Check each day for this type de garde
            for day_offset in range(7):
                current_date = datetime.strptime(semaine_debut, "%Y-%m-%d") + timedelta(days=day_offset)
                date_str = current_date.strftime("%Y-%m-%d")
                day_name = current_date.strftime("%A").lower()
                
                # Skip if type garde doesn't apply to this day
                if type_garde.get("jours_application") and day_name not in type_garde["jours_application"]:
                    continue
                
                # Check if already assigned manually
                existing = next((a for a in existing_assignations 
                               if a["date"] == date_str and a["type_garde_id"] == type_garde["id"]), None)
                if existing and existing.get("assignation_type") == "manuel":
                    continue  # Respecter les assignations manuelles
                
                # Find available users for this slot
                available_users = []
                for user in users:
                    # Check if user has availability (for part-time employees)
                    if user["type_emploi"] == "temps_partiel":
                        # Get user disponibilités
                        user_dispos = await db.disponibilites.find({
                            "user_id": user["id"],
                            "jour_semaine": day_name,
                            "statut": "disponible"
                        }).to_list(10)
                        
                        if not user_dispos:
                            continue  # Skip if not available
                    
                    # Check if user already assigned on this date
                    already_assigned = next((a for a in existing_assignations 
                                           if a["date"] == date_str and a["user_id"] == user["id"]), None)
                    if already_assigned:
                        continue
                    
                    available_users.append(user)
                
                # Apply grade requirements (1 officier obligatoire si configuré)
                if type_garde.get("officier_obligatoire", False):
                    # Prioritize officers (Capitaine, Lieutenant, Directeur)
                    officers = [u for u in available_users if u["grade"] in ["Capitaine", "Lieutenant", "Directeur"]]
                    if officers:
                        selected_user = officers[0]  # Simple rotation logic
                        
                        assignation_obj = Assignation(
                            user_id=selected_user["id"],
                            type_garde_id=type_garde["id"],
                            date=date_str,
                            assignation_type="auto"
                        )
                        
                        await db.assignations.insert_one(assignation_obj.dict())
                        nouvelles_assignations.append(assignation_obj.dict())
                        existing_assignations.append(assignation_obj.dict())
                
                elif available_users:
                    # Select user based on rotation (simplest approach for MVP)
                    selected_user = available_users[0]
                    
                    assignation_obj = Assignation(
                        user_id=selected_user["id"],
                        type_garde_id=type_garde["id"],
                        date=date_str,
                        assignation_type="auto"
                    )
                    
                    await db.assignations.insert_one(assignation_obj.dict())
                    nouvelles_assignations.append(assignation_obj.dict())
                    existing_assignations.append(assignation_obj.dict())
        
        return {
            "message": f"Attribution automatique effectuée avec succès",
            "assignations_creees": len(nouvelles_assignations),
            "semaine": f"{semaine_debut} - {semaine_fin}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'attribution automatique: {str(e)}")

# Statistics routes
@api_router.get("/statistiques", response_model=Statistiques)
async def get_statistiques(current_user: User = Depends(get_current_user)):
    # Calculate statistics
    personnel_count = await db.users.count_documents({"statut": "Actif"})
    
    # Get current week assignments
    today = datetime.now(timezone.utc).date()
    start_week = today - timedelta(days=today.weekday())
    end_week = start_week + timedelta(days=6)
    
    gardes_count = await db.assignations.count_documents({
        "date": {
            "$gte": start_week.strftime("%Y-%m-%d"),
            "$lte": end_week.strftime("%Y-%m-%d")
        }
    })
    
    remplacements_count = await db.demandes_remplacement.count_documents({"statut": "approuve"})
    
    return Statistiques(
        personnel_actif=personnel_count,
        gardes_cette_semaine=gardes_count,
        formations_planifiees=3,  # Mock data
        taux_couverture=94.0,
        heures_travaillees=2340,
        remplacements_effectues=remplacements_count
    )

# Initialize demo data
@api_router.post("/init-demo-data")
async def init_demo_data():
    # Clear existing data
    await db.users.delete_many({})
    await db.types_garde.delete_many({})
    await db.assignations.delete_many({})
    await db.planning.delete_many({})
    await db.demandes_remplacement.delete_many({})
    
    # Create demo users
    demo_users = [
        {
            "nom": "Dupont",
            "prenom": "Jean",
            "email": "admin@firemanager.ca",
            "telephone": "514-111-2233",
            "contact_urgence": "514-999-1111",
            "grade": "Directeur",
            "type_emploi": "temps_plein",
            "role": "admin",
            "numero_employe": "ADM001",
            "date_embauche": "14/01/2020",
            "formations": [],
            "mot_de_passe": "admin123"
        },
        {
            "nom": "Dubois",
            "prenom": "Sophie",
            "email": "superviseur@firemanager.ca",
            "telephone": "514-444-5566",
            "contact_urgence": "514-888-2222",
            "grade": "Directeur",
            "type_emploi": "temps_plein",
            "role": "superviseur",
            "numero_employe": "POM001",
            "date_embauche": "07/01/2022",
            "formations": [],
            "mot_de_passe": "superviseur123"
        },
        {
            "nom": "Bernard",
            "prenom": "Pierre",
            "email": "employe@firemanager.ca",
            "telephone": "418-555-9999",
            "contact_urgence": "418-777-3333",
            "grade": "Capitaine",
            "type_emploi": "temps_plein",
            "role": "employe",
            "numero_employe": "POM002",
            "date_embauche": "21/09/2019",
            "formations": [],
            "mot_de_passe": "employe123"
        },
        {
            "nom": "Garcia",
            "prenom": "Claire",
            "email": "partiel@firemanager.ca",
            "telephone": "514-888-9900",
            "contact_urgence": "514-666-4444",
            "grade": "Pompier",
            "type_emploi": "temps_partiel",
            "role": "employe",
            "numero_employe": "POM005",
            "date_embauche": "02/11/2020",
            "formations": [],
            "mot_de_passe": "partiel123"
        }
    ]
    
    # First create formations
    demo_formations = [
        {
            "nom": "Classe 4A",
            "description": "Formation de conduite véhicules lourds",
            "duree_heures": 40,
            "validite_mois": 60,
            "obligatoire": False
        },
        {
            "nom": "Désincarcération",
            "description": "Techniques de désincarcération",
            "duree_heures": 24,
            "validite_mois": 36,
            "obligatoire": True
        },
        {
            "nom": "Pompier 1",
            "description": "Formation de base pompier niveau 1",
            "duree_heures": 200,
            "validite_mois": 24,
            "obligatoire": True
        },
        {
            "nom": "Officier 2",
            "description": "Formation officier niveau 2",
            "duree_heures": 120,
            "validite_mois": 36,
            "obligatoire": False
        },
        {
            "nom": "Premiers Répondants",
            "description": "Formation premiers secours",
            "duree_heures": 16,
            "validite_mois": 12,
            "obligatoire": True
        }
    ]
    
    formation_ids = {}
    for formation_data in demo_formations:
        formation_obj = Formation(**formation_data)
        await db.formations.insert_one(formation_obj.dict())
        formation_ids[formation_data["nom"]] = formation_obj.id
    
    # Update users with formation IDs
    demo_users[0]["formations"] = [formation_ids["Officier 2"], formation_ids["Pompier 1"]]  # Jean
    demo_users[1]["formations"] = [formation_ids["Pompier 1"], formation_ids["Premiers Répondants"]]  # Sophie  
    demo_users[2]["formations"] = [formation_ids["Classe 4A"], formation_ids["Désincarcération"]]  # Pierre
    demo_users[3]["formations"] = []  # Claire - aucune formation
    
    for user_data in demo_users:
        user_dict = user_data.copy()
        user_dict["mot_de_passe_hash"] = get_password_hash(user_dict.pop("mot_de_passe"))
        user_dict["statut"] = "Actif"
        user_obj = User(**user_dict)
        await db.users.insert_one(user_obj.dict())
    
    # Create demo garde types
    demo_types_garde = [
        {
            "nom": "Garde Interne AM - Semaine",
            "heure_debut": "06:00",
            "heure_fin": "12:00",
            "personnel_requis": 4,
            "duree_heures": 6,
            "couleur": "#10B981",
            "jours_application": ["monday", "tuesday", "wednesday", "thursday", "friday"],
            "officier_obligatoire": True
        },
        {
            "nom": "Garde Interne PM - Semaine",
            "heure_debut": "12:00",
            "heure_fin": "18:00",
            "personnel_requis": 4,
            "duree_heures": 6,
            "couleur": "#3B82F6",
            "jours_application": ["monday", "tuesday", "wednesday", "thursday", "friday"],
            "officier_obligatoire": True
        },
        {
            "nom": "Garde Externe Citerne",
            "heure_debut": "18:00",
            "heure_fin": "06:00",
            "personnel_requis": 1,
            "duree_heures": 12,
            "couleur": "#8B5CF6",
            "jours_application": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
            "officier_obligatoire": False
        }
    ]
    
    for type_garde_data in demo_types_garde:
        type_garde_obj = TypeGarde(**type_garde_data)
        await db.types_garde.insert_one(type_garde_obj.dict())
    
    # Create demo disponibilités for part-time employee (Claire Garcia) with specific dates
    claire_user = await db.users.find_one({"email": "partiel@firemanager.ca"})
    if claire_user:
        # Create availabilities for next 2 weeks
        today = datetime.now(timezone.utc).date()
        demo_disponibilites = []
        
        # Generate availabilities for specific dates
        for week_offset in range(4):  # Next 4 weeks
            week_start = today + timedelta(weeks=week_offset)
            week_start = week_start - timedelta(days=week_start.weekday())  # Get Monday
            
            # Claire is available Monday, Wednesday, Friday
            for day_offset in [0, 2, 4]:  # Monday, Wednesday, Friday
                date_available = week_start + timedelta(days=day_offset)
                demo_disponibilites.append({
                    "user_id": claire_user["id"],
                    "date": date_available.strftime("%Y-%m-%d"),
                    "heure_debut": "08:00",
                    "heure_fin": "16:00",
                    "statut": "disponible"
                })
        
        for dispo_data in demo_disponibilites:
            dispo_obj = Disponibilite(**dispo_data)
            await db.disponibilites.insert_one(dispo_obj.dict())
    
    return {"message": "Données de démonstration créées avec succès"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()