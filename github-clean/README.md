# ProFireManager 🔥

**Système de gestion professionnel pour services d'incendie canadiens**

ProFireManager est une application web complète conçue pour les services d'incendie canadiens, offrant une gestion intelligente des horaires, des remplacements automatisés et une administration du personnel.

---

## 🎯 Fonctionnalités principales

### 👥 Gestion du personnel
- Création et gestion complète des profils employés
- Contacts d'urgence
- Compétences et certifications
- Fonction supérieur pour pompiers
- Vue responsive (mobile et desktop)

### 📅 Planification intelligente
- Calendrier hebdomadaire et mensuel interactif
- **Auto-assignation intelligente** basée sur :
  - Disponibilités
  - Grade et ancienneté
  - Rotation équitable
  - Respect des règles métier
- Assignation manuelle avancée avec récurrence
- Codes couleur pour taux de couverture (vert/jaune/rouge)

### 🔄 Remplacements & Congés
- Gestion des demandes de remplacement
- Gestion des demandes de congés (vacances, maladie)
- Workflow d'approbation hiérarchique

### 📊 Disponibilités (Employés à temps partiel)
- Calendrier interactif pour soumettre disponibilités
- Spécification par type de quart
- Interface mobile-friendly

### 🎓 Formations
- Création et gestion de sessions de formation
- Inscription et suivi de participation

### 📈 Rapports & Analytiques
- Export PDF et Excel
- Statistiques détaillées (personnel, couverture, formations)
- Vue par rôle et employé individuel

### ⚙️ Paramètres (Admin)
- Configuration des types de quarts
- Gestion des compétences/certifications
- Règles d'auto-assignation
- Gestion des accès utilisateurs

### 👤 Gestion de rôles
- **Administrateur** : Accès complet
- **Superviseur** : Gestion d'équipe
- **Employé temps plein**
- **Employé temps partiel**

---

## 🛠️ Stack technique

### Frontend
- **React** 18
- **Tailwind CSS** pour le styling
- **Axios** pour les appels API
- **FontAwesome** pour les icônes
- **React Components** personnalisés

### Backend
- **FastAPI** (Python)
- **Motor** (MongoDB async driver)
- **JWT** pour l'authentification
- **Pydantic** pour la validation
- **ReportLab** pour les exports PDF
- **OpenPyXL** pour les exports Excel

### Base de données
- **MongoDB**

---

## 📦 Installation locale

### Prérequis
- Python 3.9+
- Node.js 16+
- Yarn
- MongoDB

### Backend

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer le serveur
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd frontend

# Installer les dépendances
yarn install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec l'URL de votre backend

# Lancer l'application
yarn start
```

L'application sera accessible sur `http://localhost:3000`

---

## 🚀 Déploiement en production

### Architecture recommandée

- **Frontend** : Vercel / Netlify
- **Backend** : Render / Railway / Heroku
- **Base de données** : MongoDB Atlas

### Configuration des variables d'environnement

#### Backend (.env)
```env
MONGO_URL=mongodb+srv://user:password@cluster.mongodb.net/
DB_NAME=profiremanager_production
CORS_ORIGINS=https://votre-frontend.vercel.app
JWT_SECRET=votre-secret-jwt-securise-256-bits
SENDGRID_API_KEY=SG.votre-cle-sendgrid
SENDER_EMAIL=noreply@votredomaine.ca
FRONTEND_URL=https://votre-frontend.vercel.app
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://votre-backend.render.com
```

### Déploiement sur Vercel (Frontend)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
cd frontend
vercel

# Production
vercel --prod
```

### Déploiement sur Render (Backend)

1. Créer un nouveau **Web Service** sur Render
2. Connecter votre repository GitHub
3. Configurer :
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Ajouter les variables d'environnement
5. Déployer

### MongoDB Atlas

1. Créer un cluster sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Configurer les accès réseau (autoriser les IPs de vos services)
3. Créer un utilisateur base de données
4. Obtenir la connection string et l'ajouter dans `MONGO_URL`

---

## 🔐 Sécurité

### Authentification
- JWT avec expiration de 24h
- Mots de passe hashés (SHA-256)
- Validation de complexité des mots de passe :
  - Minimum 8 caractères
  - Au moins 1 majuscule
  - Au moins 1 chiffre
  - Au moins 1 caractère spécial

### API
- CORS configuré
- Authentication Bearer token sur toutes les routes protégées
- Validation Pydantic sur tous les endpoints

---

## 📱 Responsive Design

L'application est entièrement responsive avec :
- Navigation hamburger sur mobile
- Vues en cartes pour les listes
- Calendrier adaptatif
- Modals optimisés pour petit écran

---

## 🆘 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les logs (backend et frontend)
3. Vérifier les variables d'environnement

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

## 👨‍💻 Développement

### Structure du projet

```
profiremanager/
├── backend/
│   ├── server.py          # API FastAPI complète
│   ├── requirements.txt   # Dépendances Python
│   └── .env.example       # Variables d'environnement exemple
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── App.js         # Application React principale
│   │   └── App.css        # Styles personnalisés
│   ├── package.json       # Dépendances Node
│   └── .env.example       # Variables d'environnement exemple
└── README.md
```

### Scripts disponibles

#### Backend
```bash
uvicorn server:app --reload  # Dev mode avec hot reload
uvicorn server:app --host 0.0.0.0 --port 8001  # Production
```

#### Frontend
```bash
yarn start      # Démarre le serveur de dev
yarn build      # Build de production
yarn test       # Lance les tests
```

---

## 🔧 Configuration avancée

### Personnalisation des règles d'auto-assignation

Les règles d'auto-assignation sont configurables via le module **Paramètres** :
- Pourcentage de priorité ancienneté
- Poids des disponibilités
- Règles de rotation équitable

### Multi-tenant

Pour déployer pour plusieurs clients :
1. Créer une base de données MongoDB par client
2. Déployer une instance backend par client (ou utiliser la variable `DB_NAME`)
3. Utiliser le même frontend avec différentes URLs backend

---

**Développé avec ❤️ pour les services d'incendie canadiens**
