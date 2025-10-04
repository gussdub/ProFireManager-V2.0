# 🔥 ProFireManager - Version GitHub Propre

**Version de production prête à être sauvegardée sur GitHub**

---

## ✅ Ce package contient

Cette version est une copie **propre et professionnelle** de ProFireManager, sans aucune donnée de démonstration, prête à être versionnée sur GitHub et déployée pour vos clients.

### 📋 Contenu

✅ Code backend complet (FastAPI + MongoDB)  
✅ Code frontend complet (React + Tailwind)  
✅ Documentation exhaustive (11 fichiers .md)  
✅ Fichiers de configuration Docker  
✅ Scripts d'aide et de setup  
✅ Exemples de variables d'environnement  
✅ Guide de déploiement complet  
✅ Checklist de sécurité  

❌ **Pas de données de démonstration**  
❌ **Pas de comptes de test**  
❌ **Pas de secrets hardcodés**  

---

## 🚀 Comment utiliser ce package

### 1️⃣ Sauvegarder sur GitHub

```bash
# Naviguer vers ce dossier
cd /chemin/vers/github-clean

# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "🔥 Initial commit - ProFireManager v2.0"

# Créer un repository sur GitHub
# Puis ajouter le remote (remplacer avec votre URL)
git remote add origin https://github.com/votre-username/profiremanager.git

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

### 2️⃣ Déployer pour un client

**Consultez le guide complet :** [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Résumé rapide :**
1. Créer un cluster MongoDB Atlas
2. Déployer le backend sur Render
3. Déployer le frontend sur Vercel
4. Configurer les variables d'environnement
5. Créer le premier utilisateur admin

### 3️⃣ Développer localement

**Option A : Docker (Recommandé)**

```bash
docker-compose up -d
docker exec -it profiremanager-backend python create_admin.py
# Application disponible sur http://localhost:3000
```

**Option B : Installation manuelle**

```bash
chmod +x dev-setup.sh
./dev-setup.sh
# Suivre les instructions à l'écran
```

---

## 📚 Documentation incluse

Tous les fichiers nécessaires pour comprendre, déployer et maintenir l'application :

| Fichier | Description | Quand l'utiliser |
|---------|-------------|-----------------|
| **GETTING_STARTED.md** | Démarrage rapide (5 min) | 🟢 Première utilisation |
| **README.md** | Documentation complète | 🟢 Pour tout comprendre |
| **DEPLOYMENT_GUIDE.md** | Guide de déploiement | 🟢 Avant de déployer |
| **DEPLOYMENT_CHECKLIST.md** | Checklist pré-déploiement | ✅ Avant le déploiement |
| **QUICK_COMMANDS.md** | Commandes courantes | 🔧 Développement quotidien |
| **RECOMMENDED_CONFIGS.md** | Configurations types | ⚙️ Configuration initiale |
| **CONTRIBUTING.md** | Guide de contribution | 🤝 Pour contribuer |
| **SECURITY.md** | Sécurité et bonnes pratiques | 🔒 Toujours consulter |
| **FILE_INDEX.md** | Index de tous les fichiers | 📋 Navigation rapide |
| **PROJECT_STRUCTURE.txt** | Arbre visuel du projet | 👁️ Vue d'ensemble |

---

## 🎯 Cas d'usage

### Scénario 1 : Premier client

1. Cloner/télécharger ce package
2. Créer un repository GitHub privé
3. Pousser le code
4. Suivre [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
5. Configurer pour le client
6. Former l'équipe du client

### Scénario 2 : Nouveau client avec le même code

1. Cloner votre repository GitHub
2. Créer une nouvelle base MongoDB Atlas
3. Déployer une nouvelle instance backend sur Render
4. Déployer une nouvelle instance frontend sur Vercel
5. Configurer les variables d'environnement
6. Créer l'admin du nouveau client

### Scénario 3 : Développement de nouvelles fonctionnalités

1. Créer une branche Git
2. Développer localement (Docker ou manuel)
3. Tester avec les agents de test
4. Créer une Pull Request
5. Merger et déployer

---

## 🔐 Sécurité

### ⚠️ IMPORTANT : À faire AVANT de pousser sur GitHub

✅ Vérifier que tous les secrets sont dans `.env` (pas dans le code)  
✅ S'assurer que `.gitignore` inclut bien `.env`  
✅ Aucun mot de passe ou token dans le code  
✅ Les fichiers `.env.example` ne contiennent que des exemples  

### 🔒 Bonnes pratiques

- Utiliser des repositories **privés** sur GitHub
- Configurer des **secrets GitHub** pour CI/CD
- **Ne jamais** commiter de fichiers `.env`
- **Toujours** utiliser HTTPS en production
- **Changer** les secrets JWT pour chaque client

Consultez [SECURITY.md](SECURITY.md) pour plus de détails.

---

## 🛠️ Personnalisation pour vos clients

### Variables à configurer par client

**Backend (.env)**
```env
MONGO_URL=mongodb+srv://...           # Unique par client
DB_NAME=profiremanager_client_nom     # Unique par client
CORS_ORIGINS=https://client.app       # URL frontend du client
JWT_SECRET=...                        # Unique par client
FRONTEND_URL=https://client.app       # URL frontend du client
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=https://api-client.app  # URL backend du client
```

### Personnalisations visuelles (optionnel)

- Logo : Modifier dans `frontend/src/App.js`
- Couleurs : Modifier dans `frontend/src/App.css`
- Nom de l'application : Modifier dans `frontend/public/index.html`

---

## 📊 Architecture multi-tenant (futur)

Pour gérer plusieurs clients avec une seule instance backend :

**Option 1 : Une base de données par client**
- Même backend
- Variable `DB_NAME` différente par requête
- Isolation complète des données

**Option 2 : Collections préfixées**
- Même backend et DB
- Collections nommées `client1_users`, `client2_users`, etc.
- Plus économique mais moins isolé

**Option 3 : Instances séparées (actuel)**
- Backend + base par client
- Isolation maximale
- Plus de ressources nécessaires

---

## 🚀 Déploiement rapide (récapitulatif)

```bash
# 1. MongoDB Atlas
→ Créer cluster
→ Créer utilisateur
→ Obtenir connection string

# 2. Render (Backend)
→ Nouveau Web Service
→ Connecter GitHub
→ Root: backend/
→ Build: pip install -r requirements.txt
→ Start: uvicorn server:app --host 0.0.0.0 --port $PORT
→ Variables d'environnement

# 3. Vercel (Frontend)
→ Nouveau projet
→ Connecter GitHub
→ Root: frontend/
→ Framework: Create React App
→ Variable: REACT_APP_BACKEND_URL

# 4. Créer admin
→ MongoDB Atlas → Collections → users → Insert Document
→ Utiliser le script ou insérer manuellement

# 5. Tester
→ Se connecter sur l'URL Vercel
→ Vérifier tous les modules
```

---

## 📞 Support

### Documentation

Tous les fichiers `.md` dans ce package contiennent les informations nécessaires.

### Ordre de lecture recommandé

1. **GETTING_STARTED.md** (commencer ici)
2. **README.md** (comprendre le projet)
3. **DEPLOYMENT_GUIDE.md** (déployer)
4. **SECURITY.md** (sécuriser)
5. **QUICK_COMMANDS.md** (référence quotidienne)

### En cas de problème

1. Consulter **FILE_INDEX.md** pour trouver le bon document
2. Consulter **QUICK_COMMANDS.md** pour les commandes
3. Consulter **DEPLOYMENT_GUIDE.md** section dépannage
4. Consulter les logs (Render, Vercel, Browser console)

---

## ✅ Checklist avant de commencer

- [ ] J'ai lu **GETTING_STARTED.md**
- [ ] J'ai un compte GitHub
- [ ] J'ai un compte Vercel (ou Netlify)
- [ ] J'ai un compte Render (ou Railway)
- [ ] J'ai un compte MongoDB Atlas
- [ ] J'ai compris l'architecture (voir README.md)
- [ ] J'ai compris le flux de déploiement (voir DEPLOYMENT_GUIDE.md)
- [ ] Je suis prêt à déployer !

---

## 🎉 Félicitations !

Vous avez maintenant une version propre et professionnelle de ProFireManager, prête à être :

✅ Sauvegardée sur GitHub  
✅ Déployée pour vos clients  
✅ Personnalisée selon les besoins  
✅ Maintenue et améliorée  

**Prochaines étapes :**

1. Sauvegarder sur GitHub
2. Déployer votre première instance
3. Former votre premier client
4. Itérer et améliorer !

---

## 🔥 Bonne chance avec ProFireManager !

**Développé avec ❤️ pour les services d'incendie canadiens**

---

**Version :** 2.0.0  
**Date :** Janvier 2025  
**Auteur :** Votre équipe de développement

---

### 📌 Liens rapides

- 🚀 [Démarrage rapide](GETTING_STARTED.md)
- 📘 [Documentation complète](README.md)
- 🚀 [Guide de déploiement](DEPLOYMENT_GUIDE.md)
- 🔒 [Sécurité](SECURITY.md)
- 📋 [Index des fichiers](FILE_INDEX.md)
