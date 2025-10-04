# Commandes rapides

Ce fichier contient les commandes les plus courantes pour travailler avec ProFireManager.

---

## 🚀 Démarrage rapide

### Première installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/profiremanager.git
cd profiremanager

# Lancer le script de setup
chmod +x dev-setup.sh
./dev-setup.sh

# Ou avec Docker
docker-compose up -d
```

---

## 🐍 Backend

### Développement local

```bash
cd backend

# Activer l'environnement virtuel
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur (dev)
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Lancer le serveur (production)
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Tests et linting

```bash
# Tests
pytest

# Linting
flake8 server.py

# Format
black server.py
```

### Dépendances

```bash
# Ajouter une dépendance
pip install nouvelle-lib
pip freeze > requirements.txt

# Mettre à jour les dépendances
pip install --upgrade -r requirements.txt
```

---

## ⚛️ Frontend

### Développement local

```bash
cd frontend

# Installer les dépendances
yarn install

# Lancer le serveur de dev
yarn start

# Build de production
yarn build

# Tester le build
yarn global add serve
serve -s build
```

### Tests et linting

```bash
# Tests
yarn test

# Linting
yarn lint

# Format
yarn format
```

### Dépendances

```bash
# Ajouter une dépendance
yarn add package-name

# Ajouter une dépendance de dev
yarn add -D package-name

# Mettre à jour les dépendances
yarn upgrade
```

---

## 🐳 Docker

### Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Rebuild et restart
docker-compose up -d --build

# Supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

### Docker manuel

```bash
# Backend
docker build -t profiremanager-backend ./backend
docker run -p 8001:8001 profiremanager-backend

# Frontend
docker build -t profiremanager-frontend ./frontend
docker run -p 3000:80 profiremanager-frontend
```

---

## 🗄️ MongoDB

### Commandes locales

```bash
# Se connecter
mongosh

# Lister les bases de données
show dbs

# Utiliser une base
use profiremanager_dev

# Lister les collections
show collections

# Voir tous les utilisateurs
db.users.find().pretty()

# Créer un utilisateur admin
db.users.insertOne({
  "id": "admin-001",
  "nom": "Admin",
  "prenom": "Test",
  "email": "admin@test.ca",
  "mot_de_passe_hash": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
  "role": "Administrateur",
  ...
})

# Supprimer tous les documents d'une collection
db.users.deleteMany({})
```

### MongoDB Atlas

```bash
# Se connecter via CLI
mongosh "mongodb+srv://cluster.xxxxx.mongodb.net/profiremanager_prod" --username admin

# Backup
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" --out=/backup

# Restore
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/dbname" /backup/dbname
```

---

## 🔧 Git

### Workflow de base

```bash
# Créer une branche
git checkout -b feature/ma-fonctionnalite

# Voir les changements
git status
git diff

# Commiter
git add .
git commit -m "feat(module): description du changement"

# Pousser
git push origin feature/ma-fonctionnalite

# Mettre à jour depuis main
git checkout main
git pull
git checkout feature/ma-fonctionnalite
git merge main
```

### Commandes utiles

```bash
# Voir l'historique
git log --oneline --graph

# Annuler le dernier commit (garder les changements)
git reset --soft HEAD~1

# Annuler le dernier commit (supprimer les changements)
git reset --hard HEAD~1

# Voir les branches
git branch -a

# Supprimer une branche locale
git branch -d feature/ma-branche

# Supprimer une branche remote
git push origin --delete feature/ma-branche
```

---

## 🚀 Déploiement

### Vercel (Frontend)

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login

# Déployer
cd frontend
vercel

# Déployer en production
vercel --prod
```

### Render (Backend)

```bash
# Via Git push (automatique)
git push origin main

# Voir les logs
# Depuis le dashboard Render
```

---

## 🔍 Debugging

### Backend

```bash
# Voir les logs en temps réel
tail -f logs/backend.log

# Tester un endpoint
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.ca","mot_de_passe":"Admin@123"}'

# Avec authentification
curl -X GET http://localhost:8001/api/users \
  -H "Authorization: Bearer votre-token-jwt"
```

### Frontend

```bash
# Ouvrir la console du navigateur
F12 ou Ctrl+Shift+I

# Nettoyer le cache
Ctrl+Shift+R (hard refresh)

# Build avec détails
yarn build --verbose
```

---

## 🛠️ Utilitaires

### Générer un JWT secret

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Générer un hash de mot de passe

```bash
python -c "import hashlib; print(hashlib.sha256('VotreMotDePasse'.encode()).hexdigest())"
```

### Vérifier les ports utilisés

```bash
# Linux/Mac
lsof -i :8001
lsof -i :3000

# Windows
netstat -ano | findstr :8001
netstat -ano | findstr :3000
```

### Tuer un processus sur un port

```bash
# Linux/Mac
kill -9 $(lsof -ti:8001)

# Windows
taskkill /PID <PID> /F
```

---

## 📊 Maintenance

### Nettoyage

```bash
# Backend
rm -rf venv
rm -rf __pycache__

# Frontend
rm -rf node_modules
rm -rf build

# Tout nettoyer
rm -rf backend/venv backend/__pycache__
rm -rf frontend/node_modules frontend/build
```

### Mise à jour des dépendances

```bash
# Backend
pip list --outdated
pip install --upgrade <package>

# Frontend
yarn outdated
yarn upgrade-interactive
```

---

## 📝 Documentation

### Générer la documentation API

```bash
# FastAPI génère automatiquement la doc
# Accessible sur http://localhost:8001/docs
```

---

**💡 Astuce** : Ajoutez vos propres commandes fréquentes dans ce fichier !
