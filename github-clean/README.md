# ProFireManager

Système de gestion pour services d'incendie canadiens.

## Installation

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## Déploiement

Voir DEPLOYMENT_GUIDE.md
