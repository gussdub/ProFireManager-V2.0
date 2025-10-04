#!/usr/bin/env python3
"""
Script pour créer le premier utilisateur administrateur dans la base de données.
Usage: python create_admin.py
"""

import asyncio
import hashlib
import uuid
from datetime import date
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os

# Charger les variables d'environnement
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def create_admin():
    """Crée un utilisateur administrateur dans la base de données."""
    
    # Configuration
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print("❌ Erreur: Les variables MONGO_URL et DB_NAME doivent être définies dans .env")
        return
    
    print("🔥 ProFireManager - Création du premier administrateur\n")
    
    # Connexion à MongoDB
    try:
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        print(f"✅ Connecté à MongoDB: {db_name}")
    except Exception as e:
        print(f"❌ Erreur de connexion à MongoDB: {e}")
        return
    
    # Vérifier si un admin existe déjà
    existing_admin = await db.users.find_one({"role": "Administrateur"})
    if existing_admin:
        print(f"\n⚠️  Un administrateur existe déjà: {existing_admin.get('email')}")
        response = input("Voulez-vous créer un autre admin quand même ? (o/N): ")
        if response.lower() != 'o':
            print("Annulé.")
            return
    
    # Demander les informations
    print("\n📝 Informations du nouvel administrateur:\n")
    
    nom = input("Nom: ").strip() or "Admin"
    prenom = input("Prénom: ").strip() or "Système"
    email = input("Email: ").strip()
    
    if not email:
        print("❌ L'email est obligatoire")
        return
    
    # Vérifier si l'email existe déjà
    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        print(f"❌ Un utilisateur avec l'email {email} existe déjà")
        return
    
    telephone = input("Téléphone (optionnel): ").strip() or ""
    
    # Mot de passe
    print("\n🔐 Mot de passe (minimum 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial)")
    mot_de_passe = input("Mot de passe: ").strip()
    
    if not mot_de_passe:
        print("❌ Le mot de passe est obligatoire")
        return
    
    # Valider le mot de passe
    if len(mot_de_passe) < 8:
        print("❌ Le mot de passe doit contenir au moins 8 caractères")
        return
    
    # Créer le hash
    mot_de_passe_hash = hashlib.sha256(mot_de_passe.encode()).hexdigest()
    
    # Créer l'utilisateur
    admin_user = {
        "id": str(uuid.uuid4()),
        "nom": nom,
        "prenom": prenom,
        "email": email,
        "telephone": telephone,
        "contact_urgence": "",
        "grade": "Chef",
        "fonction_superieur": False,
        "type_emploi": "Temps plein",
        "heures_max_semaine": 40,
        "role": "Administrateur",
        "statut": "Actif",
        "numero_employe": f"ADM-{str(uuid.uuid4())[:8].upper()}",
        "competences": [],
        "mot_de_passe_hash": mot_de_passe_hash,
        "date_embauche": date.today().isoformat(),
        "anciennete": 1
    }
    
    # Insérer dans la base de données
    try:
        result = await db.users.insert_one(admin_user)
        print(f"\n✅ Administrateur créé avec succès!")
        print(f"\n📋 Informations de connexion:")
        print(f"   Email: {email}")
        print(f"   Mot de passe: {mot_de_passe}")
        print(f"   Numéro employé: {admin_user['numero_employe']}")
        print(f"\n⚠️  Notez ces informations en lieu sûr!")
        
    except Exception as e:
        print(f"\n❌ Erreur lors de la création: {e}")
    
    # Fermer la connexion
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
