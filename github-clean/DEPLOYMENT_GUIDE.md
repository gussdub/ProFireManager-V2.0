# Guide de déploiement GitHub → Production

Ce guide vous accompagne pas à pas pour déployer ProFireManager sur GitHub et en production.

---

## 📋 Étape 1 : Préparer votre repository GitHub

### 1.1 Créer un nouveau repository

1. Allez sur [GitHub](https://github.com) et connectez-vous
2. Cliquez sur le bouton **"New repository"** (ou le +)
3. Remplissez :
   - **Repository name** : `profiremanager` (ou le nom de votre choix)
   - **Description** : "Système de gestion pour services d'incendie"
   - **Visibilité** : Private (recommandé) ou Public
   - **Ne pas** initialiser avec README, .gitignore ou license (on a déjà tout)
4. Cliquez sur **"Create repository"**

### 1.2 Pousser le code vers GitHub

```bash
# Naviguer vers le dossier du projet
cd /chemin/vers/github-clean

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - ProFireManager v2.0"

# Ajouter le remote GitHub (remplacer avec votre URL)
git remote add origin https://github.com/votre-username/profiremanager.git

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

---

## 🚀 Étape 2 : Déployer le Frontend sur Vercel

### 2.1 Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub

### 2.2 Déployer depuis GitHub

1. Cliquez sur **"Add New Project"**
2. Sélectionnez votre repository `profiremanager`
3. Configurez le projet :
   - **Framework Preset** : Create React App
   - **Root Directory** : `frontend`
   - **Build Command** : `yarn build`
   - **Output Directory** : `build`

4. **Variables d'environnement** :
   ```
   REACT_APP_BACKEND_URL = (laisser vide pour l'instant, on l'ajoutera après)
   ```

5. Cliquez sur **"Deploy"**
6. Attendez la fin du déploiement (2-3 min)
7. **Notez l'URL** de votre frontend : `https://votre-app.vercel.app`

---

## ⚙️ Étape 3 : Configurer MongoDB Atlas

### 3.1 Créer un cluster

1. Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un compte gratuit (M0)
3. Créez un nouveau cluster (choisir la région proche de vous)
4. Attendez la création (5-10 min)

### 3.2 Configurer les accès

1. **Database Access** :
   - Cliquez sur "Database Access" dans le menu
   - Ajoutez un utilisateur :
     - Username : `pfm_admin`
     - Password : **générez un mot de passe fort** et notez-le
     - Rôle : `Atlas admin` ou `Read and write to any database`

2. **Network Access** :
   - Cliquez sur "Network Access"
   - Ajoutez l'IP : `0.0.0.0/0` (permet l'accès depuis n'importe où)
   - ⚠️ En production, restreignez aux IPs de votre backend

### 3.3 Obtenir la connection string

1. Retournez sur "Clusters"
2. Cliquez sur **"Connect"**
3. Choisissez **"Connect your application"**
4. Copiez la connection string :
   ```
   mongodb+srv://pfm_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Remplacez** `<password>` par votre mot de passe

### 3.4 Créer la base de données

1. Cliquez sur **"Browse Collections"**
2. Cliquez sur **"Add My Own Data"**
3. Database name : `profiremanager_prod`
4. Collection name : `users`

---

## 🖥️ Étape 4 : Déployer le Backend sur Render

### 4.1 Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Connectez-vous avec votre compte GitHub

### 4.2 Créer un Web Service

1. Cliquez sur **"New +"** → **"Web Service"**
2. Connectez votre repository GitHub
3. Sélectionnez `profiremanager`
4. Configurez :
   - **Name** : `profiremanager-backend`
   - **Region** : Choisir proche de vous
   - **Branch** : `main`
   - **Root Directory** : `backend`
   - **Runtime** : `Python 3`
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan** : Free

### 4.3 Configurer les variables d'environnement

Dans la section **Environment Variables**, ajoutez :

```env
MONGO_URL = mongodb+srv://pfm_admin:votre-password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME = profiremanager_prod
CORS_ORIGINS = https://votre-app.vercel.app
JWT_SECRET = votre-secret-jwt-aleatoire-tres-long-et-securise-256-caracteres
SENDGRID_API_KEY = SG.votre-cle-si-vous-avez (optionnel)
SENDER_EMAIL = noreply@votredomaine.ca (optionnel)
FRONTEND_URL = https://votre-app.vercel.app
```

**Pour JWT_SECRET**, générez une clé aléatoire :
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

4. Cliquez sur **"Create Web Service"**
5. Attendez le déploiement (3-5 min)
6. **Notez l'URL** de votre backend : `https://profiremanager-backend.onrender.com`

---

## 🔗 Étape 5 : Lier Frontend et Backend

### 5.1 Mettre à jour Vercel

1. Retournez sur votre projet Vercel
2. Allez dans **"Settings"** → **"Environment Variables"**
3. Modifiez `REACT_APP_BACKEND_URL` :
   ```
   REACT_APP_BACKEND_URL = https://profiremanager-backend.onrender.com
   ```
4. Cliquez sur **"Save"**
5. Allez dans l'onglet **"Deployments"**
6. Cliquez sur les **"..."** du dernier déploiement → **"Redeploy"**

### 5.2 Mettre à jour Render

1. Retournez sur votre service Render
2. Allez dans **"Environment"**
3. Vérifiez que `CORS_ORIGINS` et `FRONTEND_URL` contiennent bien l'URL Vercel
4. Si modifié, Render redéploiera automatiquement

---

## 👤 Étape 6 : Créer le premier utilisateur admin

### 6.1 Via MongoDB Atlas

1. Retournez sur MongoDB Atlas
2. Cliquez sur **"Browse Collections"**
3. Base : `profiremanager_prod` → Collection : `users`
4. Cliquez sur **"INSERT DOCUMENT"**
5. Passez en mode **JSON View** et collez :

```json
{
  "id": "admin-001",
  "nom": "Admin",
  "prenom": "Système",
  "email": "admin@votreserviceincendie.ca",
  "telephone": "555-0100",
  "contact_urgence": "",
  "grade": "Chef",
  "fonction_superieur": false,
  "type_emploi": "Temps plein",
  "heures_max_semaine": 40,
  "role": "Administrateur",
  "statut": "Actif",
  "numero_employe": "ADM-001",
  "competences": [],
  "mot_de_passe_hash": "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
  "date_embauche": "2025-01-01",
  "anciennete": 1
}
```

**Note** : Le hash correspond au mot de passe `Admin@123` (majuscule A)

6. Cliquez sur **"Insert"**

### 6.2 Tester la connexion

1. Allez sur votre frontend : `https://votre-app.vercel.app`
2. Connectez-vous avec :
   - **Email** : `admin@votreserviceincendie.ca`
   - **Mot de passe** : `Admin@123`

3. ✅ Si la connexion réussit, félicitations ! 🎉

---

## 🔧 Étape 7 : Maintenance et mises à jour

### 7.1 Faire des modifications

```bash
# Modifier votre code localement
git add .
git commit -m "Description des changements"
git push origin main
```

Vercel et Render se mettront à jour automatiquement !

### 7.2 Voir les logs

**Backend (Render)** :
- Onglet "Logs" sur votre service Render

**Frontend (Vercel)** :
- Onglet "Deployments" → Cliquer sur un déploiement → "View Function Logs"

### 7.3 Rollback en cas de problème

**Vercel** :
- Onglet "Deployments" → Choisir un déploiement précédent → "..." → "Promote to Production"

**Render** :
- Dans l'onglet "Events", vous pouvez redéployer une version précédente

---

## ⚠️ Dépannage courant

### Frontend ne se connecte pas au backend

1. Vérifiez que `REACT_APP_BACKEND_URL` est correctement défini sur Vercel
2. Vérifiez que `CORS_ORIGINS` sur Render contient l'URL Vercel
3. Ouvrez la console du navigateur (F12) pour voir les erreurs

### Backend ne démarre pas

1. Consultez les logs sur Render
2. Vérifiez que toutes les variables d'environnement sont définies
3. Vérifiez la connection string MongoDB

### Impossible de se connecter

1. Vérifiez que l'utilisateur existe dans MongoDB
2. Vérifiez le hash du mot de passe (doit être SHA-256)
3. Consultez les logs backend

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez les logs (Vercel + Render + MongoDB)
2. Vérifiez toutes les URLs et variables d'environnement
3. Testez le backend directement : `https://votre-backend.onrender.com/api/auth/login`

---

**🎉 Félicitations ! Votre application est maintenant en production !**
