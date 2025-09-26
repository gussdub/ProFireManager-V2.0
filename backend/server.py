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
    grade: str  # Capitaine, Directeur, Pompier, Lieutenant
    type_emploi: str  # temps_plein, temps_partiel
    role: str  # admin, superviseur, employe
    statut: str = "Actif"  # Actif, Inactif
    numero_employe: str
    date_embauche: str
    formations: List[str] = []
    mot_de_passe_hash: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    nom: str
    prenom: str
    email: str
    telephone: str = ""
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
    return [User(**user) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "superviseur"] and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Accès refusé")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return User(**user)

# Types de garde routes
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
    return [TypeGarde(**type_garde) for type_garde in types_garde]

# Helper function to clean MongoDB documents
def clean_mongo_doc(doc):
    """Remove MongoDB ObjectId and other non-serializable fields"""
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc

# Planning routes
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
    return demande_obj

@api_router.get("/remplacements", response_model=List[DemandeRemplacement])
async def get_demandes_remplacement(current_user: User = Depends(get_current_user)):
    if current_user.role == "employe":
        demandes = await db.demandes_remplacement.find({"demandeur_id": current_user.id}).to_list(1000)
    else:
        demandes = await db.demandes_remplacement.find().to_list(1000)
    
    return [DemandeRemplacement(**demande) for demande in demandes]

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
            "grade": "Directeur",
            "type_emploi": "temps_plein",
            "role": "admin",
            "numero_employe": "ADM001",
            "date_embauche": "14/01/2020",
            "formations": ["Officier 2", "Pompier 1"],
            "mot_de_passe": "admin123"
        },
        {
            "nom": "Dubois",
            "prenom": "Sophie",
            "email": "superviseur@firemanager.ca",
            "telephone": "514-444-5566",
            "grade": "Directeur",
            "type_emploi": "temps_plein",
            "role": "superviseur",
            "numero_employe": "POM001",
            "date_embauche": "07/01/2022",
            "formations": ["Pompier 1", "Premiers Répondants"],
            "mot_de_passe": "superviseur123"
        },
        {
            "nom": "Bernard",
            "prenom": "Pierre",
            "email": "employe@firemanager.ca",
            "telephone": "418-555-9999",
            "grade": "Capitaine",
            "type_emploi": "temps_plein",
            "role": "employe",
            "numero_employe": "POM002",
            "date_embauche": "21/09/2019",
            "formations": ["Classe 4A", "Désincarcération"],
            "mot_de_passe": "employe123"
        },
        {
            "nom": "Garcia",
            "prenom": "Claire",
            "email": "partiel@firemanager.ca",
            "telephone": "514-888-9900",
            "grade": "Pompier",
            "type_emploi": "temps_partiel",
            "role": "employe",
            "numero_employe": "POM005",
            "date_embauche": "02/11/2020",
            "formations": [],
            "mot_de_passe": "partiel123"
        }
    ]
    
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