# 📚 Index des fichiers - ProFireManager

Guide complet de tous les fichiers et leur utilité dans le projet.

---

## 📄 Fichiers de documentation

### 🚀 GETTING_STARTED.md
**Commencez ici !**  
Guide de démarrage rapide en 5 minutes. Parfait pour votre première installation.

**Contient :**
- Installation rapide (Docker et manuel)
- Structure du projet
- Fonctionnalités principales
- Accès par défaut
- Problèmes courants

---

### 📘 README.md
**Documentation principale complète**  
Vue d'ensemble détaillée du projet et de toutes ses fonctionnalités.

**Contient :**
- Description complète des fonctionnalités
- Stack technique détaillé
- Instructions d'installation
- Guide de déploiement
- Configuration avancée

---

### 🚀 DEPLOYMENT_GUIDE.md
**Guide de déploiement production**  
Instructions pas-à-pas pour déployer sur Vercel, Render et MongoDB Atlas.

**Contient :**
- Configuration MongoDB Atlas
- Déploiement backend sur Render
- Déploiement frontend sur Vercel
- Configuration des variables d'environnement
- Création du premier utilisateur
- Dépannage

---

### ✅ DEPLOYMENT_CHECKLIST.md
**Liste de vérification avant déploiement**  
Checklist complète pour s'assurer que rien n'est oublié.

**Contient :**
- Préparation
- Configuration MongoDB
- Configuration Render
- Configuration Vercel
- Tests post-déploiement
- Plan de rollback

---

### ⚡ QUICK_COMMANDS.md
**Commandes courantes**  
Référence rapide des commandes les plus utilisées.

**Contient :**
- Commandes backend (Python, uvicorn)
- Commandes frontend (React, yarn)
- Commandes Docker
- Commandes MongoDB
- Commandes Git
- Debugging
- Utilitaires

---

### ⚙️ RECOMMENDED_CONFIGS.md
**Configurations recommandées**  
Configurations types pour différents services d'incendie.

**Contient :**
- Types de quarts recommandés
- Grades typiques
- Compétences et certifications
- Règles d'auto-assignation
- Structure organisationnelle
- Heures maximales
- Types de congés
- Modèles de planification

---

### 🤝 CONTRIBUTING.md
**Guide de contribution**  
Pour ceux qui veulent contribuer au projet.

**Contient :**
- Standards de code (Python et React)
- Format des commits (Conventional Commits)
- Processus de Pull Request
- Comment signaler un bug
- Comment proposer une fonctionnalité

---

### 🔒 SECURITY.md
**Politique de sécurité**  
Bonnes pratiques de sécurité et comment signaler une vulnérabilité.

**Contient :**
- Signalement de vulnérabilité
- Bonnes pratiques (mots de passe, JWT, MongoDB, CORS)
- Authentification & Autorisation
- Sécurité réseau
- Logging et monitoring
- Tests de sécurité
- Checklist de sécurité

---

### 📝 CHANGELOG.md
**Historique des versions**  
Liste de toutes les modifications du projet.

**Contient :**
- Version 2.0.0 (actuelle)
- Fonctionnalités ajoutées
- Corrections de bugs
- Modifications techniques

---

### 📜 LICENSE
**Licence du projet**  
Licence propriétaire avec tous droits réservés.

---

## 🔧 Fichiers de configuration

### .gitignore
**Fichiers ignorés par Git**  
Liste des fichiers et dossiers à ne pas versionner.

**Ignore :**
- Variables d'environnement (.env)
- Dépendances (node_modules, venv)
- Builds (build/, dist/)
- IDE (.vscode/, .idea/)
- Logs

---

### .gitattributes
**Gestion des fins de lignes**  
Configuration pour normaliser les fins de lignes entre OS.

**Configure :**
- LF pour tous les fichiers texte
- Gestion des fichiers binaires
- Configuration par extension

---

### docker-compose.yml
**Configuration Docker multi-services**  
Démarre MongoDB, Backend et Frontend ensemble.

**Services :**
- mongodb (port 27017)
- backend (port 8001)
- frontend (port 3000)

---

## 🐍 Backend

### backend/server.py
**Application FastAPI principale**  
Tout le code backend en un seul fichier (API complète).

**Contient :**
- Modèles Pydantic
- Endpoints API (auth, users, planning, etc.)
- Logique métier (auto-assignation)
- Connexion MongoDB
- JWT & sécurité
- Exports PDF/Excel

**Lignes de code :** ~250 (très dense)

---

### backend/requirements.txt
**Dépendances Python**  
Liste toutes les bibliothèques Python nécessaires.

**Principales dépendances :**
- fastapi
- uvicorn
- motor (MongoDB async)
- pydantic
- python-jose (JWT)
- python-dotenv
- reportlab (PDF)
- openpyxl (Excel)

---

### backend/.env.example
**Exemple de variables d'environnement**  
Template pour créer votre fichier .env.

**Variables :**
- MONGO_URL
- DB_NAME
- CORS_ORIGINS
- JWT_SECRET
- SENDGRID_API_KEY (optionnel)
- SENDER_EMAIL (optionnel)
- FRONTEND_URL

---

### backend/Dockerfile
**Image Docker pour le backend**  
Configuration pour conteneuriser le backend.

**Base :** Python 3.11-slim  
**Port exposé :** 8001

---

### backend/create_admin.py
**Script de création d'administrateur**  
Script interactif pour créer le premier admin.

**Usage :**
```bash
python backend/create_admin.py
```

**Demande :**
- Nom, prénom
- Email
- Téléphone
- Mot de passe

---

## ⚛️ Frontend

### frontend/src/App.js
**Application React principale**  
Toute l'application frontend en un seul composant.

**Contient :**
- Tous les modules (9 modules)
- Gestion de l'état
- API calls (Axios)
- Navigation
- Modals
- Responsive design

**Lignes de code :** ~1000+

---

### frontend/src/App.css
**Styles personnalisés**  
CSS personnalisé pour l'application (complète Tailwind).

**Contient :**
- Variables CSS
- Styles globaux
- Styles de composants
- Animations
- Responsive design
- Thème rouge/blanc

---

### frontend/src/index.js
**Point d'entrée React**  
Bootstrap l'application React.

---

### frontend/public/index.html
**Page HTML principale**  
Template HTML de l'application React.

**Contient :**
- Meta tags
- Titre
- Div root
- Configuration PWA

---

### frontend/public/manifest.json
**Manifest PWA**  
Configuration Progressive Web App.

---

### frontend/package.json
**Dépendances Node.js**  
Liste toutes les dépendances JavaScript/React.

**Principales dépendances :**
- react, react-dom
- axios
- @fortawesome (icônes)
- tailwindcss
- react-scripts

**Scripts :**
- `yarn start` : Dev server
- `yarn build` : Build production
- `yarn test` : Tests

---

### frontend/.env.example
**Exemple de variables d'environnement frontend**  
Template pour créer votre fichier .env.

**Variables :**
- REACT_APP_BACKEND_URL

---

### frontend/Dockerfile
**Image Docker pour le frontend**  
Configuration pour conteneuriser le frontend.

**Base :** node:18-alpine (build) + nginx:alpine (production)  
**Port exposé :** 80

---

## 🛠️ Scripts

### dev-setup.sh
**Script de setup automatique**  
Configure l'environnement de développement local.

**Usage :**
```bash
chmod +x dev-setup.sh
./dev-setup.sh
```

**Actions :**
- Créer .env depuis .env.example
- Créer venv Python
- Installer dépendances Python
- Installer dépendances Node

---

## 📊 Statistiques du projet

### Backend
- **Fichiers Python :** 2 (server.py, create_admin.py)
- **Lignes de code :** ~300
- **Endpoints API :** 30+
- **Modèles Pydantic :** 15+

### Frontend
- **Fichiers React :** 2 (App.js, index.js)
- **Lignes de code :** ~1200
- **Composants :** 1 principal (monolithique)
- **Modules UI :** 9

### Documentation
- **Fichiers MD :** 11
- **Pages totales :** ~50 (équivalent)
- **Mots :** ~15,000

### Total projet
- **Fichiers (hors node_modules) :** 27
- **Technologies :** 10+ (React, FastAPI, MongoDB, Docker, etc.)
- **Déploiement :** Production-ready

---

## 🎯 Parcours recommandé

### Pour démarrer rapidement
1. **GETTING_STARTED.md** (5 min)
2. Lancer avec Docker ou script
3. Se connecter et explorer

### Pour déployer en production
1. **DEPLOYMENT_CHECKLIST.md** (préparation)
2. **DEPLOYMENT_GUIDE.md** (pas-à-pas)
3. Tests post-déploiement

### Pour contribuer
1. **README.md** (comprendre le projet)
2. **CONTRIBUTING.md** (standards)
3. **QUICK_COMMANDS.md** (référence)

### Pour la sécurité
1. **SECURITY.md** (bonnes pratiques)
2. Vérifier tous les .env.example
3. Checklist de sécurité

---

## 📞 Aide supplémentaire

Si vous ne trouvez pas ce que vous cherchez :

1. **Chercher dans QUICK_COMMANDS.md** pour une commande spécifique
2. **Consulter README.md** pour les concepts généraux
3. **Lire DEPLOYMENT_GUIDE.md** pour les problèmes de déploiement
4. **Vérifier SECURITY.md** pour les questions de sécurité

---

**Dernière mise à jour :** 2025-01-04  
**Version du projet :** 2.0.0

**Navigation rapide :**
- 🏠 [Retour au README](README.md)
- 🚀 [Démarrage rapide](GETTING_STARTED.md)
- 📦 [Déploiement](DEPLOYMENT_GUIDE.md)
