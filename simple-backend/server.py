from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# Simple FastAPI app for Railway
app = FastAPI(title="ProFireManager API", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # À restreindre en production
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    mot_de_passe: str

# Test routes
@app.get("/")
async def root():
    return {"message": "ProFireManager API v2.0", "status": "running", "environment": "railway"}

@app.get("/api/")
async def api_root():
    return {"message": "ProFireManager API v2.0", "status": "running"}

@app.post("/api/auth/login")
async def login(login_data: LoginRequest):
    # Test login simple pour démarrer
    if login_data.email == "admin@test.ca" and login_data.mot_de_passe == "admin123":
        return {
            "access_token": "test-token",
            "user": {
                "id": "1",
                "nom": "Admin", 
                "prenom": "Test",
                "email": login_data.email,
                "role": "admin",
                "grade": "Directeur",
                "type_emploi": "temps_plein"
            }
        }
    else:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

@app.get("/api/statistiques")
async def get_stats():
    return {
        "personnel_actif": 1,
        "gardes_cette_semaine": 0,
        "formations_planifiees": 0,
        "taux_couverture": 0.0,
        "heures_travaillees": 0,
        "remplacements_effectues": 0
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)