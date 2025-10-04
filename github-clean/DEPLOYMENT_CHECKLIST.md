# Liste de vérification avant le premier déploiement

Utilisez cette checklist pour vous assurer que tout est prêt avant de déployer votre première instance de ProFireManager.

---

## ✅ Préparation (Avant de commencer)

### Code et Repository

- [ ] Code cloné depuis GitHub
- [ ] Toutes les dépendances sont listées dans `requirements.txt` et `package.json`
- [ ] Les fichiers `.env.example` sont présents et à jour
- [ ] Le `.gitignore` est configuré (pas de secrets dans Git)

### Comptes et services

- [ ] Compte GitHub créé et repository prêt
- [ ] Compte Vercel créé (pour le frontend)
- [ ] Compte Render créé (pour le backend)
- [ ] Compte MongoDB Atlas créé (pour la base de données)

---

## 🗄️ MongoDB Atlas

### Configuration du cluster

- [ ] Cluster MongoDB créé (M0 gratuit suffit pour commencer)
- [ ] Utilisateur de base de données créé
- [ ] Mot de passe fort généré et noté en sécurité
- [ ] Accès réseau configuré (0.0.0.0/0 temporairement, à restreindre ensuite)
- [ ] Connection string obtenue et testée

### Base de données

- [ ] Base de données créée (ex: `profiremanager_prod`)
- [ ] Collection `users` créée
- [ ] Premier utilisateur admin créé avec le bon hash de mot de passe

**Hash pour "Admin@123"** :
```
240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
```

**Générer votre propre hash** :
```bash
python -c "import hashlib; print(hashlib.sha256('VotreMDP'.encode()).hexdigest())"
```

---

## 🖥️ Backend (Render)

### Configuration du service

- [ ] Web Service créé sur Render
- [ ] Repository GitHub connecté
- [ ] Branche configurée : `main`
- [ ] Root Directory : `backend`
- [ ] Runtime : `Python 3`
- [ ] Build Command : `pip install -r requirements.txt`
- [ ] Start Command : `uvicorn server:app --host 0.0.0.0 --port $PORT`

### Variables d'environnement

- [ ] `MONGO_URL` = `mongodb+srv://user:password@cluster.mongodb.net/...`
- [ ] `DB_NAME` = `profiremanager_prod` (ou votre nom de DB)
- [ ] `CORS_ORIGINS` = `https://votre-app.vercel.app` (URL de votre frontend)
- [ ] `JWT_SECRET` = (clé aléatoire de 32+ caractères)
- [ ] `FRONTEND_URL` = `https://votre-app.vercel.app`
- [ ] `SENDGRID_API_KEY` = (optionnel, pour les emails)
- [ ] `SENDER_EMAIL` = (optionnel, pour les emails)

**Générer JWT_SECRET** :
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Déploiement

- [ ] Premier déploiement réussi
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] URL du backend notée : `https://votre-backend.onrender.com`

---

## 🌐 Frontend (Vercel)

### Configuration du projet

- [ ] Nouveau projet créé sur Vercel
- [ ] Repository GitHub connecté
- [ ] Framework Preset : `Create React App`
- [ ] Root Directory : `frontend`
- [ ] Build Command : `yarn build`
- [ ] Output Directory : `build`

### Variables d'environnement

- [ ] `REACT_APP_BACKEND_URL` = `https://votre-backend.onrender.com`

### Déploiement

- [ ] Premier déploiement réussi
- [ ] Site accessible
- [ ] URL du frontend notée : `https://votre-app.vercel.app`

---

## 🔗 Interconnexion

### Backend → MongoDB

- [ ] Le backend se connecte à MongoDB Atlas sans erreur
- [ ] Test : Logs backend montrent "Connected to MongoDB"

### Frontend → Backend

- [ ] Le frontend peut atteindre le backend
- [ ] Test : Ouvrir la console navigateur (F12), pas d'erreur CORS

### Configuration CORS

- [ ] `CORS_ORIGINS` sur Render contient l'URL Vercel exacte
- [ ] Pas de trailing slash dans l'URL (https://app.vercel.app ✅, pas https://app.vercel.app/ ❌)

---

## 🔐 Sécurité

### Mots de passe et secrets

- [ ] JWT_SECRET est aléatoire et fort (32+ caractères)
- [ ] Mot de passe MongoDB est fort et unique
- [ ] Mot de passe admin est complexe (8+ car., majuscule, chiffre, spécial)
- [ ] Aucun secret n'est hardcodé dans le code
- [ ] Tous les secrets sont dans les variables d'environnement

### HTTPS

- [ ] Frontend utilise HTTPS (automatique avec Vercel)
- [ ] Backend utilise HTTPS (automatique avec Render)
- [ ] MongoDB Atlas utilise SSL/TLS (automatique)

### Accès

- [ ] CORS configuré avec des domaines spécifiques (pas `*`)
- [ ] MongoDB Atlas : accès réseau configuré (0.0.0.0/0 OK pour commencer)

---

## 🧪 Tests post-déploiement

### Test de connexion

- [ ] Aller sur `https://votre-app.vercel.app`
- [ ] Page de login s'affiche correctement
- [ ] Pas d'erreur dans la console (F12)

### Test d'authentification

- [ ] Se connecter avec l'admin créé
- [ ] Email : votre email admin
- [ ] Mot de passe : le mot de passe que vous avez choisi
- [ ] Connexion réussie → Dashboard s'affiche

### Test des fonctionnalités

- [ ] Navigation entre les modules fonctionne
- [ ] Tableau de bord affiche les statistiques (probablement vides)
- [ ] Module Personnel accessible
- [ ] Module Planification accessible
- [ ] Module Paramètres accessible (admin)

### Test de l'API backend directement

```bash
# Test de login
curl -X POST https://votre-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.ca","mot_de_passe":"Admin@123"}'

# Devrait retourner : {"access_token":"...","token_type":"bearer"}
```

---

## 📱 Test mobile

- [ ] Ouvrir sur un smartphone
- [ ] Menu hamburger s'affiche
- [ ] Navigation fonctionne
- [ ] Modals sont responsives
- [ ] Calendrier est utilisable

---

## 📊 Monitoring

### Logs

- [ ] Backend (Render) : Vérifier les logs dans l'onglet "Logs"
- [ ] Frontend (Vercel) : Vérifier dans "Deployments" → logs
- [ ] MongoDB : Vérifier les métriques dans Atlas

### Performance

- [ ] Temps de chargement < 3 secondes
- [ ] Pas d'erreurs côté serveur (500)
- [ ] Pas d'erreurs côté client (console)

---

## 📝 Documentation

### Informations à noter

- [ ] **Frontend URL** : https://_____________________.vercel.app
- [ ] **Backend URL** : https://_____________________.onrender.com
- [ ] **MongoDB Cluster** : cluster0._____.mongodb.net
- [ ] **DB Name** : _____________________
- [ ] **Admin Email** : _____________________
- [ ] **Admin Password** : _____________________ (gardez en sécurité!)

### Accès sauvegardés

- [ ] Connection string MongoDB (sans le mot de passe!) dans un gestionnaire de mots de passe
- [ ] JWT_SECRET dans un gestionnaire de mots de passe
- [ ] Mot de passe admin dans un gestionnaire de mots de passe
- [ ] Accès GitHub, Vercel, Render, MongoDB Atlas notés

---

## 🎉 Post-déploiement

### Communication

- [ ] Informer le client que l'application est prête
- [ ] Partager l'URL du frontend
- [ ] Partager les identifiants admin (canal sécurisé)
- [ ] Fournir la documentation

### Formation

- [ ] Former l'admin sur les fonctionnalités de base
- [ ] Montrer comment créer des utilisateurs
- [ ] Expliquer le workflow de planification
- [ ] Expliquer les paramètres

### Suivi

- [ ] Monitorer les premiers jours d'utilisation
- [ ] Répondre aux questions
- [ ] Corriger les bugs éventuels
- [ ] Ajuster selon les retours

---

## 🚨 Plan de rollback

En cas de problème :

### Vercel
- Onglet "Deployments" → Déploiement précédent → "..." → "Promote to Production"

### Render
- Onglet "Events" → Redéployer une version précédente

### MongoDB
- Avoir un backup avant toute modification importante
- Commande : `mongodump --uri="..." --out=/backup`

---

## 📞 Support

En cas de problème :

1. **Consulter les logs**
   - Render : Onglet "Logs"
   - Vercel : Onglet "Deployments" → logs
   - Browser : F12 → Console

2. **Vérifier les variables d'environnement**
   - Toutes définies ?
   - Valeurs correctes ?
   - Pas de trailing slash ?

3. **Tester l'API directement**
   - Avec curl ou Postman
   - Vérifier la réponse

4. **Consulter la documentation**
   - README.md
   - DEPLOYMENT_GUIDE.md
   - SECURITY.md

---

## ✅ Déploiement terminé !

Une fois tous les points cochés, félicitations ! 🎉

Votre instance de ProFireManager est en production et prête à être utilisée par votre client.

**Prochaines étapes :**
- Créer les autres utilisateurs
- Configurer les types de quarts dans Paramètres
- Configurer les compétences/certifications
- Commencer à planifier les horaires

**Bon courage ! 🔥**
