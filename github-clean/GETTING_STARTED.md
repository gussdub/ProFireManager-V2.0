# 🔥 ProFireManager - Guide de démarrage rapide

Bienvenue dans ProFireManager ! Ce fichier vous guide pour être opérationnel en quelques minutes.

---

## ⚡ Démarrage en 5 minutes

### Option 1 : Docker (Recommandé)

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/profiremanager.git
cd profiremanager

# 2. Lancer avec Docker Compose
docker-compose up -d

# 3. Créer le premier admin
docker exec -it profiremanager-backend python create_admin.py

# ✅ Application disponible sur http://localhost:3000
```

### Option 2 : Installation locale

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/profiremanager.git
cd profiremanager

# 2. Lancer le script de setup
chmod +x dev-setup.sh
./dev-setup.sh

# 3. Configurer les .env
# Backend : Éditer backend/.env avec votre MongoDB
# Frontend : Éditer frontend/.env avec l'URL backend

# 4. Lancer le backend (terminal 1)
cd backend
source venv/bin/activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# 5. Lancer le frontend (terminal 2)
cd frontend
yarn start

# 6. Créer le premier admin (terminal 3)
cd backend
source venv/bin/activate
python create_admin.py

# ✅ Application disponible sur http://localhost:3000
```

---

## 📂 Structure du projet

```
profiremanager/
├── 📄 README.md              # Documentation principale
├── 📄 DEPLOYMENT_GUIDE.md    # Guide de déploiement détaillé
├── 📄 QUICK_COMMANDS.md      # Commandes courantes
├── 📄 CONTRIBUTING.md        # Guide de contribution
├── 📄 SECURITY.md            # Politique de sécurité
├── 📄 CHANGELOG.md           # Historique des versions
├── 📄 LICENSE                # Licence
├── 🐳 docker-compose.yml     # Configuration Docker
├── 📜 dev-setup.sh           # Script de setup rapide
│
├── 🐍 backend/               # API FastAPI
│   ├── server.py             # Application principale
│   ├── requirements.txt      # Dépendances Python
│   ├── .env.example          # Variables d'environnement exemple
│   ├── create_admin.py       # Script création admin
│   └── Dockerfile            # Image Docker
│
└── ⚛️ frontend/              # Application React
    ├── src/
    │   ├── App.js            # Composant principal
    │   ├── App.css           # Styles
    │   └── index.js          # Point d'entrée
    ├── public/
    │   ├── index.html
    │   └── manifest.json
    ├── package.json          # Dépendances Node
    ├── .env.example          # Variables d'environnement exemple
    └── Dockerfile            # Image Docker
```

---

## 🎯 Fonctionnalités principales

✅ **Gestion du personnel** - CRUD complet, compétences, contacts d'urgence  
✅ **Planning intelligent** - Auto-assignation basée sur disponibilités, grade, ancienneté  
✅ **Remplacements & Congés** - Workflow d'approbation hiérarchique  
✅ **Disponibilités** - Calendrier pour employés temps partiel  
✅ **Formations** - Gestion de sessions et inscriptions  
✅ **Rapports** - Export PDF/Excel avec analytics détaillées  
✅ **Paramètres** - Configuration complète (admin)  
✅ **Multi-rôles** - Admin, Superviseur, Employé TP, Employé TT  
✅ **Responsive** - Interface mobile complète  

---

## 🚀 Déploiement en production

### Stack recommandée

- **Frontend** : Vercel (gratuit)
- **Backend** : Render (gratuit pour commencer)
- **Database** : MongoDB Atlas (gratuit jusqu'à 512MB)

### Guide complet

👉 Consultez [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) pour un guide pas-à-pas complet avec captures d'écran.

**Résumé rapide :**

1. **MongoDB Atlas** - Créer un cluster gratuit
2. **Render** - Déployer le backend depuis GitHub
3. **Vercel** - Déployer le frontend depuis GitHub
4. **Configuration** - Variables d'environnement sur chaque plateforme
5. **Premier admin** - Créer via MongoDB Atlas ou script

---

## 🔑 Accès par défaut

Après avoir exécuté `create_admin.py`, vous aurez :

```
Email: (celui que vous avez choisi)
Mot de passe: (celui que vous avez choisi)
```

**Note** : Le mot de passe doit respecter :
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

---

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| [README.md](README.md) | Documentation complète du projet |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Guide de déploiement détaillé |
| [QUICK_COMMANDS.md](QUICK_COMMANDS.md) | Commandes courantes (Git, Docker, etc.) |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Comment contribuer au projet |
| [SECURITY.md](SECURITY.md) | Politique de sécurité |
| [CHANGELOG.md](CHANGELOG.md) | Historique des versions |

---

## 🛠️ Technologies utilisées

**Backend**
- FastAPI (Python 3.9+)
- Motor (MongoDB async)
- JWT pour l'authentification
- Pydantic pour la validation
- ReportLab (PDF) & OpenPyXL (Excel)

**Frontend**
- React 18
- Tailwind CSS
- Axios
- FontAwesome

**Database**
- MongoDB

---

## 🐛 Problèmes courants

### Port déjà utilisé

```bash
# Tuer le processus sur le port
lsof -i :8001  # Voir le PID
kill -9 <PID>  # Tuer le processus
```

### MongoDB ne se connecte pas

- Vérifier `MONGO_URL` dans `.env`
- Vérifier que MongoDB est démarré
- Vérifier les accès réseau sur MongoDB Atlas

### Frontend ne trouve pas le backend

- Vérifier `REACT_APP_BACKEND_URL` dans `frontend/.env`
- Vérifier que le backend est démarré
- Vérifier la configuration CORS sur le backend

### Erreur de mot de passe

- Le hash doit être en SHA-256
- Générer avec : `python -c "import hashlib; print(hashlib.sha256('VotreMDP'.encode()).hexdigest())"`

---

## 💡 Commandes utiles

```bash
# Backend
cd backend && uvicorn server:app --reload

# Frontend
cd frontend && yarn start

# Docker
docker-compose up -d        # Démarrer
docker-compose logs -f      # Voir les logs
docker-compose down         # Arrêter

# Créer un admin
python backend/create_admin.py

# Tests
pytest backend/              # Backend
cd frontend && yarn test     # Frontend
```

---

## 📞 Support

**Documentation** : Consultez les fichiers .md dans le repository

**Issues** : Créez une issue sur GitHub avec :
- Description du problème
- Steps to reproduce
- Version utilisée
- Logs d'erreur

**Sécurité** : Pour les vulnérabilités, contactez security@profiremanager.ca

---

## 🎓 Prochaines étapes

1. ✅ Installer et lancer l'application
2. 📖 Lire la [documentation complète](README.md)
3. 🚀 [Déployer en production](DEPLOYMENT_GUIDE.md)
4. ⚙️ Configurer les paramètres de votre organisation
5. 👥 Créer vos premiers utilisateurs
6. 📅 Commencer à planifier vos horaires !

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour :
- Standards de code
- Workflow Git
- Comment proposer des fonctionnalités
- Comment signaler des bugs

---

## 📝 Licence

Propriétaire - Tous droits réservés. Voir [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ pour les services d'incendie canadiens 🔥**

---

## ⭐ Star le projet !

Si vous trouvez ProFireManager utile, n'hésitez pas à mettre une étoile ⭐ sur GitHub !
