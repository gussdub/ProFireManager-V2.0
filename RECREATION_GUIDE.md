# GUIDE DE RECRÉATION PROFIREMANAGER V2.0 
# ==========================================

## 🎯 STACK TECHNIQUE
- Frontend: React 19 + Tailwind CSS + Shadcn UI
- Backend: FastAPI Python + MongoDB + JWT
- Exports: ReportLab (PDF) + OpenPyXL (Excel)

## 📋 ÉTAPES DE RECRÉATION

### 1. FRONTEND REACT
```bash
npx create-react-app profiremanager-frontend
cd profiremanager-frontend

# Installer dépendances
npm install @radix-ui/react-* lucide-react axios react-router-dom
npm install @hookform/resolvers react-hook-form zod
npm install tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install sonner date-fns

# Configurer Tailwind
npx tailwindcss init -p
```

### 2. BACKEND FASTAPI
```bash
mkdir profiremanager-backend
cd profiremanager-backend

# requirements.txt
fastapi==0.110.1
uvicorn==0.25.0
pymongo==4.5.0
motor==3.3.1
pydantic>=2.6.4
python-jose>=3.3.0
passlib>=1.7.4
python-multipart>=0.0.9
reportlab==4.4.4
openpyxl==3.1.5
python-dotenv>=1.0.1

pip install -r requirements.txt
```

### 3. STRUCTURE BASE DE DONNÉES MONGODB
```javascript
// Collections
db.users
db.types_garde  
db.assignations
db.formations
db.sessions_formation
db.disponibilites
db.demandes_remplacement
db.demandes_conge
```

### 4. FONCTIONNALITÉS CLÉS À IMPLÉMENTER
- Authentification JWT
- 9 modules (Dashboard, Personnel, Planning, etc.)
- Attribution automatique IA 5 niveaux
- Gestion disponibilités temps partiel
- Exports PDF/Excel
- Interface responsive

## 💡 CONSEIL : 
Utilisez cette architecture comme base et implémentez module par module.
Temps estimé recréation complète : 6-8 semaines développeur expérimenté.