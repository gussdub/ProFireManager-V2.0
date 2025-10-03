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
import re

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="ProFireManager API", version="2.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# JWT configuration
SECRET_KEY = os.environ.get("JWT_SECRET", "your-production-jwt-secret-key-256-bits")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 24 * 60

security = HTTPBearer()

# Helper functions
def validate_complex_password(password: str) -> bool:
    if len(password) < 8:
        return False
    
    has_uppercase = bool(re.search(r'[A-Z]', password))
    has_digit = bool(re.search(r'\d', password))
    has_special = bool(re.search(r'[!@#$%^&*+\-?()]', password))
    
    return has_uppercase and has_digit and has_special

def verify_password(plain_password, hashed_password):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

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
    return User(**clean_mongo_doc(user))

def clean_mongo_doc(doc):
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc

# Define Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    prenom: str
    email: str
    telephone: str = ""
    contact_urgence: str = ""
    grade: str
    fonction_superieur: bool = False
    type_emploi: str
    heures_max_semaine: int = 40
    role: str
    statut: str = "Actif"
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
    contact_urgence: str = ""
    grade: str
    fonction_superieur: bool = False
    type_emploi: str
    heures_max_semaine: int = 40
    role: str
    numero_employe: str
    date_embauche: str
    formations: List[str] = []
    mot_de_passe: str

class UserLogin(BaseModel):
    email: str
    mot_de_passe: str

class ProfileUpdate(BaseModel):
    prenom: str
    nom: str
    email: str
    telephone: str = ""
    contact_urgence: str = ""
    heures_max_semaine: int = 25

class Statistiques(BaseModel):
    personnel_actif: int
    gardes_cette_semaine: int
    formations_planifiees: int
    taux_couverture: float
    heures_travaillees: int
    remplacements_effectues: int

# Authentication routes
@api_router.post("/auth/login")
async def login(user_login: UserLogin):
    user_data = await db.users.find_one({"email": user_login.email})
    if not user_data or not verify_password(user_login.mot_de_passe, user_data["mot_de_passe_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    user = User(**clean_mongo_doc(user_data))
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
        "type_emploi": current_user.type_emploi
    }

# Users management
@api_router.put("/users/mon-profil", response_model=User)
async def update_mon_profil(
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user)
):
    try:
        result = await db.users.update_one(
            {"id": current_user.id}, 
            {"$set": profile_data.dict()}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=400, detail="Impossible de mettre à jour le profil")
        
        updated_user = await db.users.find_one({"id": current_user.id})
        updated_user = clean_mongo_doc(updated_user)
        return User(**updated_user)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur mise à jour profil: {str(e)}")

# Statistics
@api_router.get("/statistiques", response_model=Statistiques)
async def get_statistiques(current_user: User = Depends(get_current_user)):
    try:
        # Personnel actif
        personnel_count = await db.users.count_documents({"statut": "Actif"})
        
        # Gardes cette semaine
        today = datetime.now(timezone.utc).date()
        start_week = today - timedelta(days=today.weekday())
        end_week = start_week + timedelta(days=6)
        
        gardes_count = await db.assignations.count_documents({
            "date": {
                "$gte": start_week.strftime("%Y-%m-%d"),
                "$lte": end_week.strftime("%Y-%m-%d")
            }
        })
        
        # Formations planifiées
        formations_count = await db.sessions_formation.count_documents({"statut": "planifie"})
        
        # Taux de couverture
        taux_couverture = 0.0
        if gardes_count > 0:
            # Calcul basique - à améliorer selon besoins client
            taux_couverture = min(gardes_count * 10, 100.0)
        
        # Heures travaillées ce mois
        start_month = today.replace(day=1)
        end_month = (start_month + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        assignations_mois = await db.assignations.count_documents({
            "date": {
                "$gte": start_month.strftime("%Y-%m-%d"),
                "$lte": end_month.strftime("%Y-%m-%d")
            }
        })
        
        heures_totales = assignations_mois * 8  # Estimation 8h par garde
        
        # Remplacements effectués
        remplacements_count = await db.demandes_remplacement.count_documents({"statut": "approuve"})
        
        return Statistiques(
            personnel_actif=personnel_count,
            gardes_cette_semaine=gardes_count,
            formations_planifiees=formations_count,
            taux_couverture=taux_couverture,
            heures_travaillees=heures_totales,
            remplacements_effectues=remplacements_count
        )
        
    except Exception as e:
        # Fallback pour nouvelle installation
        return Statistiques(
            personnel_actif=0,
            gardes_cette_semaine=0,
            formations_planifiees=0,
            taux_couverture=0.0,
            heures_travaillees=0,
            remplacements_effectues=0
        )

# Include router
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