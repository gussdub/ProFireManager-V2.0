# Changelog

Toutes les modifications notables de ProFireManager seront documentées dans ce fichier.

## [2.0.0] - 2025-01-04

### Version initiale de production

#### ✨ Fonctionnalités

**Authentification & Sécurité**
- Système d'authentification JWT
- Hashage SHA-256 des mots de passe
- Validation de complexité des mots de passe
- Gestion des rôles (Admin, Superviseur, Employé TP, Employé TT)

**Modules principaux**
- 📊 **Tableau de bord** : Vue d'ensemble avec statistiques
- 👥 **Personnel** : Gestion complète des employés
- 📅 **Planification** : Calendrier avec auto-assignation intelligente
- 🔄 **Remplacements & Congés** : Workflow d'approbation
- 📆 **Mes Disponibilités** : Soumission pour employés temps partiel
- 🎓 **Formations** : Création et gestion de sessions
- 📈 **Rapports** : Export PDF/Excel avec analytics
- ⚙️ **Paramètres** : Configuration globale (Admin)
- 👤 **Mon Profil** : Gestion profil utilisateur

**Fonctionnalités avancées**
- Auto-assignation intelligente 5 étapes
- Calendrier interactif responsive
- Export PDF et Excel
- Interface mobile complète
- Codes couleur pour taux de couverture
- Assignation manuelle avec récurrence

**Technique**
- Backend FastAPI + Motor (MongoDB async)
- Frontend React 18 + Tailwind CSS
- Architecture API REST
- Validation Pydantic
- CORS configurable

---

## Format

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

Types de changements :
- `✨ Ajouté` pour les nouvelles fonctionnalités
- `🔧 Modifié` pour les changements aux fonctionnalités existantes
- `🐛 Corrigé` pour les corrections de bugs
- `🔒 Sécurité` pour les correctifs de vulnérabilités
- `🗑️ Déprécié` pour les fonctionnalités bientôt retirées
- `❌ Retiré` pour les fonctionnalités retirées
