# Guide de contribution

Merci de votre intérêt pour améliorer ProFireManager ! 🔥

## 🚀 Démarrage rapide

1. **Fork** le repository
2. **Clone** votre fork localement
3. **Créez une branche** pour votre fonctionnalité : `git checkout -b feature/ma-nouvelle-fonctionnalite`
4. **Commitez** vos changements : `git commit -m 'Ajout de ma fonctionnalité'`
5. **Push** vers votre fork : `git push origin feature/ma-nouvelle-fonctionnalite`
6. **Créez une Pull Request** vers la branche `main`

---

## 📝 Standards de code

### Backend (Python/FastAPI)

- Suivre **PEP 8** pour le style Python
- Utiliser des **type hints** pour toutes les fonctions
- Documenter les fonctions complexes avec des **docstrings**
- Utiliser **Pydantic** pour la validation des données
- Tests unitaires avec **pytest** (si applicable)

```python
# Exemple
async def get_user(user_id: str) -> User:
    """
    Récupère un utilisateur par son ID.
    
    Args:
        user_id: L'identifiant unique de l'utilisateur
        
    Returns:
        User: L'objet utilisateur
        
    Raises:
        HTTPException: Si l'utilisateur n'est pas trouvé
    """
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return User(**clean_mongo_doc(user))
```

### Frontend (React)

- Utiliser **React Hooks** (pas de class components)
- Composants fonctionnels avec **destructuring**
- **PropTypes** ou TypeScript pour le typage (futur)
- Nommage en **camelCase** pour les variables et fonctions
- Nommage en **PascalCase** pour les composants
- Utiliser **Tailwind CSS** pour le styling

```javascript
// Exemple
const UserCard = ({ user, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Contenu */}
    </div>
  );
};
```

---

## 🏗️ Structure des commits

Utiliser le format **Conventional Commits** :

```
type(scope): description courte

Description plus détaillée si nécessaire.

Fixes #123
```

### Types de commits

- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `docs`: Documentation seulement
- `style`: Changements de style (formatage, point-virgule, etc.)
- `refactor`: Refactoring du code
- `perf`: Amélioration de performance
- `test`: Ajout ou modification de tests
- `chore`: Tâches de maintenance

### Exemples

```bash
feat(planning): ajout de la vue mensuelle du calendrier

fix(auth): correction du bug de déconnexion automatique

docs(readme): mise à jour des instructions d'installation

refactor(api): simplification de la logique d'auto-assignation
```

---

## 🧪 Tests

### Backend

```bash
cd backend
pytest tests/
```

### Frontend

```bash
cd frontend
yarn test
```

---

## 🐛 Signaler un bug

Créez une **issue** avec :

1. **Description claire** du problème
2. **Steps to reproduce** (étapes pour reproduire)
3. **Résultat attendu** vs **résultat obtenu**
4. **Screenshots** si applicable
5. **Environnement** (navigateur, OS, versions)

### Template d'issue

```markdown
**Description**
Description claire et concise du bug.

**Pour reproduire**
1. Aller sur '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Résultat attendu**
Ce qui devrait se passer.

**Résultat obtenu**
Ce qui se passe réellement.

**Screenshots**
Si applicable.

**Environnement**
- OS: [e.g. Windows 11]
- Navigateur: [e.g. Chrome 120]
- Version: [e.g. 2.0.0]
```

---

## ✨ Proposer une fonctionnalité

Créez une **issue** avec le label `enhancement` :

1. **Description** de la fonctionnalité proposée
2. **Cas d'usage** : pourquoi est-ce utile ?
3. **Solution proposée** (optionnel)
4. **Alternatives considérées** (optionnel)

---

## 📋 Checklist avant Pull Request

- [ ] Le code suit les standards du projet
- [ ] Les tests passent (si applicable)
- [ ] La documentation est à jour
- [ ] Les commits suivent le format Conventional Commits
- [ ] La branche est à jour avec `main`
- [ ] Pas de conflits de merge
- [ ] Les variables sensibles sont dans `.env` (pas hardcodées)
- [ ] Testé localement

---

## 🔍 Processus de review

1. Un mainteneur reviewera votre PR
2. Des changements peuvent être demandés
3. Une fois approuvée, la PR sera mergée
4. Votre contribution apparaîtra dans le prochain release

---

## 🙏 Merci !

Merci de contribuer à ProFireManager. Chaque contribution, petite ou grande, aide à améliorer l'outil pour les services d'incendie canadiens ! 🔥

---

## 📞 Questions ?

Si vous avez des questions, n'hésitez pas à :
- Ouvrir une issue
- Contacter les mainteneurs
- Consulter la documentation

**Bonne contribution ! 🚀**
