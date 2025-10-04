from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import hashlib

load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'profiremanager_prod')]

# FastAPI app
app = FastAPI(title="ProFireManager API", version="2.0.0")
api_router = APIRouter(prefix="/api")

# JWT config  
SECRET_KEY = os.environ.get("JWT_SECRET", "fallback-secret-key")
ALGORITHM = "HS256"
security = HTTPBearer()

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def clean_mongo_doc(doc):
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nom: str
    prenom: str
    email: str
    role: str
    grade: str = "Pompier"
    type_emploi: str = "temps_plein"
    mot_de_passe_hash: str = ""
    statut: str = "Actif"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    email: str
    mot_de_passe: str

class Statistiques(BaseModel):
    personnel_actif: int
    gardes_cette_semaine: int
    formations_planifiees: int
    taux_couverture: float
    heures_travaillees: int
    remplacements_effectues: int

async def get_current_user(credentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
    except:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    return User(**clean_mongo_doc(user))

# Routes
@api_router.get("/")
async def root():
    return {"message": "ProFireManager API v2.0", "status": "running", "environment": "production"}

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

@api_router.get("/statistiques")
async def get_statistiques():
    try:
        personnel_count = await db.users.count_documents({"statut": "Actif"})
        return Statistiques(
            personnel_actif=personnel_count,
            gardes_cette_semaine=0,
            formations_planifiees=0,
            taux_couverture=0.0,
            heures_travaillees=0,
            remplacements_effectues=0
        )
    except:
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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/")
async def health():
    return {"status": "ok", "service": "ProFireManager API v2.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)