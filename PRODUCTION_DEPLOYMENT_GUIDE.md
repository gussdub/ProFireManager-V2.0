# 🚒 PROFIREMANAGER V2.0 - GUIDE DÉPLOIEMENT PRODUCTION
# ================================================================

## 🎯 DÉPLOIEMENT POUR PREMIER CLIENT

### PHASE 1: PRÉPARATION ENVIRONNEMENT

#### 1.1 NETTOYER LE CODE
```bash
# Supprimer endpoints démo
- /api/init-demo-data
- /api/init-demo-client-data  
- /api/init-disponibilites-semaine-courante
- /api/repair-demo-passwords

# Garder seulement endpoints production
- /api/auth/*
- /api/users/*
- /api/planning/*
- /api/formations/*
- /api/remplacements/*
- /api/rapports/*
```

#### 1.2 VARIABLES ENVIRONNEMENT PRODUCTION
```env
# Frontend (.env)
REACT_APP_BACKEND_URL=https://api.votreclient-firemanager.com

# Backend (.env)
MONGO_URL=mongodb://production-mongodb-url
DB_NAME=profiremanager_client1_prod
CORS_ORIGINS=https://votreclient-firemanager.com
SENDGRID_API_KEY=SG.real-sendgrid-key
SENDER_EMAIL=noreply@votreclient-firemanager.com
FRONTEND_URL=https://votreclient-firemanager.com
JWT_SECRET=super-secure-production-jwt-secret-256-bits
```

#### 1.3 SÉCURITÉ PRODUCTION
- [ ] JWT secret complexe (256 bits)
- [ ] HTTPS obligatoire (SSL)
- [ ] CORS restreint au domaine client
- [ ] Rate limiting API
- [ ] Monitoring logs erreurs

### PHASE 2: DÉPLOIEMENT

#### 2.1 OPTION AWS (Recommandée)
```bash
# 1. S3 + CloudFront (Frontend)
aws s3 create-bucket --bucket votreclient-firemanager-frontend
aws cloudfront create-distribution

# 2. ECS + Fargate (Backend)
docker build -t profiremanager-backend .
aws ecr create-repository --repository-name profiremanager-backend
docker push

# 3. DocumentDB (Database)
aws docdb create-db-cluster --db-cluster-identifier profiremanager-prod
```

#### 2.2 OPTION VERCEL + RAILWAY (Plus simple)
```bash
# 1. Frontend sur Vercel
npm install -g vercel
vercel --prod

# 2. Backend sur Railway
railway login
railway new
railway add mongodb
railway deploy
```

### PHASE 3: CONFIGURATION CLIENT

#### 3.1 BASE DE DONNÉES PROPRE
```javascript
// Base MongoDB vide avec seulement:
db.users (vide)
db.types_garde (vide) 
db.assignations (vide)
db.formations (vide)
db.disponibilites (vide)
db.remplacements (vide)
db.sessions_formation (vide)

// PAS de données démo !
```

#### 3.2 PREMIER COMPTE ADMIN CLIENT
```python
# Créer manuellement via script ou API
{
  "nom": "Nom du chef",
  "prenom": "Prénom", 
  "email": "chef@serviceclient.ca",
  "role": "admin",
  "grade": "Directeur",
  "mot_de_passe": "MotDePasseComplexe123!",
  "type_emploi": "temps_plein"
}
```

### PHASE 4: ONBOARDING CLIENT (2 semaines)

#### SEMAINE 1: FORMATION ADMIN
- [ ] **Formation admin** (2h) - Configuration système
- [ ] **Paramètres > Types de garde** selon leurs horaires  
- [ ] **Paramètres > Compétences** selon leurs certifications
- [ ] **Import 5-10 employés** test via Personnel

#### SEMAINE 2: DÉPLOIEMENT COMPLET  
- [ ] **Import complet** personnel (Excel → MongoDB)
- [ ] **Formation équipe** superviseurs (1h)
- [ ] **Formation employés** (30min)
- [ ] **Tests acceptation** utilisateur
- [ ] **Go-live** + support intensif 2 semaines

### PHASE 5: MAINTENANCE ET SUPPORT

#### 5.1 MONITORING
- [ ] **Uptime monitoring** (UptimeRobot)
- [ ] **Error tracking** (Sentry)
- [ ] **Performance** (New Relic)
- [ ] **Backup automatique** base données

#### 5.2 SUPPORT CLIENT
- [ ] **Email support** dédié: support@profiremanager.ca
- [ ] **Documentation** utilisateur fournie
- [ ] **Formation continue** équipe
- [ ] **Mises à jour** mensuelles

## 💰 FACTURATION

### PRICING CLIENT 1
```
Service X pompiers:
- Si 1-25 pompiers: 199$ CAD/mois
- Si 26-100 pompiers: 399$ CAD/mois  
- Si 100+ pompiers: 799$ CAD/mois

Inclus:
✅ Hébergement sécurisé
✅ Backup quotidien
✅ Support email
✅ Mises à jour
✅ Formation initiale
```

### COÛTS INFRASTRUCTURE
```
AWS Production:
- Frontend (S3+CloudFront): 50$/mois
- Backend (ECS Fargate): 200$/mois
- Database (DocumentDB): 150$/mois
- Monitoring + Backup: 100$/mois
Total: ~500$/mois

Marge: 60-80% selon pricing client
```

## 🎯 CHECKLIST GO-LIVE

### TECHNIQUE
- [ ] Domain SSL configuré
- [ ] Base données production vide
- [ ] Premier admin créé
- [ ] Endpoints démo supprimés
- [ ] Monitoring configuré
- [ ] Backup automatique actif

### BUSINESS  
- [ ] Contrat signé
- [ ] Formation programmée
- [ ] Support organisé
- [ ] Facturation configurée
- [ ] Documentation fournie

### POST GO-LIVE
- [ ] Monitoring première semaine
- [ ] Feedback client collecté
- [ ] Ajustements selon besoins
- [ ] Planning maintenance

## 🏆 PROFIREMANAGER V2.0 - PREMIER CLIENT

**ÉTAPES IMMÉDIATES:**
1. Choisir infrastructure (AWS ou Vercel+Railway)
2. Nettoyer code (supprimer démo)
3. Déployer environnement production
4. Créer premier admin client
5. Former et accompagner

**SUCCÈS ATTENDU:**
- Application enterprise professionnelle
- Client autonome après formation
- Base solide pour clients suivants
- Référence pour prospection

Félicitations pour cette première vente ! 🎉