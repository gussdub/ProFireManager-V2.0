# Politique de sécurité

## 🔒 Versions supportées

Seules les versions suivantes reçoivent des mises à jour de sécurité :

| Version | Supportée          |
| ------- | ------------------ |
| 2.0.x   | ✅ Oui             |
| < 2.0   | ❌ Non             |

---

## 🚨 Signaler une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité dans ProFireManager, merci de **NE PAS** créer d'issue publique.

### Processus de signalement

1. **Contactez-nous en privé** :
   - Email : security@profiremanager.ca
   - Sujet : `[SECURITY] Description courte`

2. **Inclure dans votre rapport** :
   - Description de la vulnérabilité
   - Steps to reproduce (étapes pour reproduire)
   - Impact potentiel
   - Version affectée
   - Suggestions de correction (optionnel)

3. **Délai de réponse** :
   - Accusé de réception : **sous 48h**
   - Évaluation initiale : **sous 7 jours**
   - Correction et patch : **selon la sévérité**

### Échelle de sévérité

- 🔴 **Critique** : Correction en 24-48h
- 🟠 **Haute** : Correction en 7 jours
- 🟡 **Moyenne** : Correction en 30 jours
- 🟢 **Basse** : Correction dans la prochaine release

---

## 🛡️ Bonnes pratiques de sécurité

### Pour les administrateurs

#### Variables d'environnement

**❌ À ne jamais faire :**
```python
# NE JAMAIS hardcoder les secrets
JWT_SECRET = "my-secret-key-123"
MONGO_URL = "mongodb://admin:password@localhost:27017"
```

**✅ Toujours faire :**
```python
# Utiliser les variables d'environnement
JWT_SECRET = os.environ.get("JWT_SECRET")
MONGO_URL = os.environ.get("MONGO_URL")
```

#### Mots de passe

- **Longueur minimum** : 8 caractères
- **Complexité requise** :
  - Au moins 1 majuscule
  - Au moins 1 chiffre
  - Au moins 1 caractère spécial
- **Pas de mots de passe faibles** : `password`, `admin123`, `123456`
- **Utiliser un gestionnaire de mots de passe**

#### JWT Secret

```bash
# Générer une clé sécurisée
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Exemple de clé forte
JWT_SECRET="kH8sP2mN9fQ4xR7wT5jV1nC3bL6yD0zA8eU4gM2iO5pW7k"
```

#### MongoDB

- **Utiliser des utilisateurs dédiés** (pas root)
- **Limiter les permissions** (read/write uniquement sur la DB nécessaire)
- **Activer l'authentification**
- **Utiliser des connexions SSL/TLS**
- **Restreindre les IPs autorisées** (pas 0.0.0.0/0 en production)

#### CORS

```python
# ❌ Trop permissif en production
allow_origins=["*"]

# ✅ Spécifier les domaines autorisés
allow_origins=["https://votre-frontend.vercel.app"]
```

---

## 🔐 Authentification & Autorisation

### JWT

- **Expiration** : 24h (configurable)
- **Algorithme** : HS256
- **Stockage côté client** : localStorage (prévoir migration vers httpOnly cookies)

### Rôles et permissions

| Rôle | Accès |
|------|-------|
| Administrateur | Tout accès |
| Superviseur | Gestion d'équipe |
| Employé TP | Lecture/Écriture limitée |
| Employé TT | Lecture/Écriture très limitée |

---

## 🌐 Sécurité réseau

### HTTPS obligatoire en production

- **Frontend** : Vercel/Netlify (HTTPS automatique)
- **Backend** : Render/Railway (HTTPS automatique)
- **Base de données** : MongoDB Atlas (SSL/TLS par défaut)

### Headers de sécurité

Ajouter dans le backend (déjà implémenté) :
```python
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📊 Logging et monitoring

### Logs à surveiller

- Tentatives de connexion échouées
- Accès aux routes protégées sans token
- Modifications de données sensibles
- Erreurs 500 répétées

### Informations à NE PAS logger

- Mots de passe (même hashés)
- Tokens JWT complets
- Clés API
- Informations personnelles sensibles

---

## 🔄 Mises à jour

### Dépendances

**Vérifier régulièrement les mises à jour de sécurité :**

```bash
# Backend
pip list --outdated
pip-audit  # Installer avec: pip install pip-audit

# Frontend
yarn outdated
yarn audit
```

### Processus de mise à jour

1. Lire les changelogs
2. Tester en local
3. Tester en staging
4. Déployer en production
5. Monitorer les logs

---

## 📱 Sécurité mobile

- Interface responsive sécurisée
- Pas de données sensibles dans le localStorage
- Validation côté serveur pour toutes les actions

---

## 🧪 Tests de sécurité

### Tests recommandés

- **Injection SQL/NoSQL** : Tester avec des payloads malicieux
- **XSS** : Tester l'injection de scripts
- **CSRF** : Vérifier la protection CSRF
- **Autorisation** : Tester l'accès aux ressources non autorisées
- **Rate limiting** : Tester les limites de taux (à implémenter)

---

## 📋 Checklist de sécurité

### Avant déploiement

- [ ] Toutes les variables sensibles sont dans .env
- [ ] JWT_SECRET est aléatoire et fort (32+ caractères)
- [ ] CORS est configuré avec des domaines spécifiques
- [ ] MongoDB utilise SSL/TLS
- [ ] Les mots de passe admin sont forts
- [ ] Les dépendances sont à jour
- [ ] HTTPS est activé
- [ ] Les logs ne contiennent pas de données sensibles
- [ ] Les erreurs ne révèlent pas d'informations sensibles
- [ ] Les limites de taux sont configurées (recommandé)

### Maintenance régulière

- [ ] Vérifier les mises à jour de sécurité (hebdomadaire)
- [ ] Analyser les logs d'accès (quotidien)
- [ ] Sauvegarder la base de données (quotidien)
- [ ] Tester les backups (mensuel)
- [ ] Revoir les accès utilisateurs (mensuel)
- [ ] Auditer le code (trimestriel)

---

## 🆘 En cas d'incident

1. **Isoler le système compromis**
2. **Évaluer l'étendue de la compromission**
3. **Notifier les parties prenantes**
4. **Changer tous les secrets/mots de passe**
5. **Patcher la vulnérabilité**
6. **Documenter l'incident**
7. **Analyser post-mortem**

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

**Dernière mise à jour** : 2025-01-04

**La sécurité est l'affaire de tous ! 🔒**
