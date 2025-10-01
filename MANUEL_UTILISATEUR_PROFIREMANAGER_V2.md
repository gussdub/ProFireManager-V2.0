# 🚒 MANUEL UTILISATEUR PROFIREMANAGER V2.0
# ================================================

## APPLICATION DE GESTION DES HORAIRES ET REMPLACEMENTS AUTOMATISÉS
### POUR SERVICES D'INCENDIE AU CANADA

---

**Version :** 2.0 Avancé  
**Date :** Septembre 2025  
**Développeur :** ProFireManager Solutions Inc.  
**Support :** support@profiremanager.ca

---

## 📋 TABLE DES MATIÈRES

1. [Introduction et Vue d'ensemble](#introduction)
2. [Connexion et Premiers Pas](#connexion)
3. [Guide par Module](#modules)
   - [Tableau de Bord](#dashboard)
   - [Personnel](#personnel)
   - [Planning](#planning)
   - [Mes Disponibilités](#disponibilites)
   - [Remplacements](#remplacements)
   - [Formations](#formations)
   - [Rapports](#rapports)
   - [Paramètres](#parametres)
   - [Mon Profil](#profil)
4. [Workflows et Processus](#workflows)
5. [Guide Administrateur](#admin)
6. [FAQ et Dépannage](#faq)
7. [Glossaire](#glossaire)

---

## 🎯 INTRODUCTION {#introduction}

### Qu'est-ce que ProFireManager v2.0 ?

ProFireManager v2.0 est une application web moderne conçue spécifiquement pour les services d'incendie canadiens. Elle automatise la gestion des horaires, l'attribution des gardes, et optimise la planification du personnel grâce à l'intelligence artificielle.

### Fonctionnalités Principales

- **🤖 Attribution automatique intelligente** avec algorithme 5 niveaux
- **📱 Interface responsive** : Desktop, tablette, smartphone
- **👥 Gestion complète du personnel** : Temps plein et temps partiel
- **📅 Planning moderne** : Vue semaine et mois avec code couleur
- **🔄 Système de remplacements** et gestion des congés
- **📚 Planning de formations** avec inscriptions
- **📊 Rapports avancés** avec exports PDF/Excel
- **🔐 Sécurité enterprise** avec permissions granulaires

### Public Cible

- **Directeurs** et chefs de service
- **Superviseurs** et capitaines
- **Employés** temps plein et temps partiel
- **Administrateurs système** des casernes

---

## 🔐 CONNEXION ET PREMIERS PAS {#connexion}

### Page de Connexion

L'application s'ouvre sur une page de connexion avec le logo ProFireManager (flamme rouge).

**Éléments visibles :**
- **Logo** : Flamme rouge avec "ProFireManager v2.0 Avancé"
- **Formulaire** : Email et mot de passe
- **Comptes de démonstration** : 4 boutons pour test

### Comptes de Démonstration

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| **Administrateur** | admin@firemanager.ca | admin123 | Tous modules |
| **Superviseur** | superviseur@firemanager.ca | superviseur123 | Personnel, Planning, Remplacements, Formations |
| **Employé temps plein** | employe@firemanager.ca | employe123 | Planning, Remplacements, Formations |
| **Employé temps partiel** | partiel@firemanager.ca | partiel123 | Planning, Mes disponibilités, Remplacements, Formations |

### Première Connexion

1. **Cliquez** sur un bouton de démonstration ou saisissez vos identifiants
2. **Validez** avec le bouton "Se connecter"
3. **Accédez** automatiquement au Tableau de bord
4. **Explorez** les modules selon vos permissions

---

## 📊 MODULES DE L'APPLICATION {#modules}

## 🏠 TABLEAU DE BORD {#dashboard}

### Vue d'Ensemble

Le tableau de bord offre une vue d'ensemble de l'activité de votre service d'incendie.

### Statistiques Principales

**4 cartes dynamiques :**

1. **👥 Personnel Actif**
   - Nombre total de pompiers en service
   - Répartition temps plein / temps partiel
   - Indicateur de statut actif/inactif

2. **✅ Gardes Cette Semaine**
   - Nombre d'assignations planifiées
   - Période couverte (dates exactes)
   - Évolution par rapport à la semaine précédente

3. **🎓 Formations Planifiées**
   - Sessions de formation programmées
   - Status des inscriptions
   - Formations obligatoires en attente

4. **📊 Taux de Couverture**
   - Pourcentage de couverture des gardes
   - Indicateur couleur : 🟢 Excellent (>90%), 🟡 Bon (75-90%), 🔴 À améliorer (<75%)
   - Calcul basé sur personnel assigné / personnel requis

### Activité Récente

Liste dynamique des dernières actions :
- Nouvelles assignations automatiques
- Personnel ajouté récemment
- Formations planifiées
- Disponibilités mises à jour

### Statistiques Mensuelles

- **Heures de garde totales** : Calculées automatiquement
- **Remplacements effectués** : Demandes approuvées
- **Taux d'activité** : Personnel actif / total
- **Disponibilités configurées** : Employés temps partiel

### Vue Spécialisée par Rôle

**Pour Employés :**
- Section "👤 Mon activité" avec statistiques personnelles
- Mes gardes ce mois et heures travaillées

**Pour Admins (Démonstration) :**
- Section "🎪 Données de démonstration"
- Boutons pour créer données de test et vider planning

---

## 👥 PERSONNEL {#personnel}

### Vue d'Ensemble

Module de gestion complète du personnel du service d'incendie.

**Accès :** Administrateurs et Superviseurs uniquement

### Liste du Personnel

**Informations affichées :**
- **Nom complet** et date d'embauche
- **Grade** (Directeur, Capitaine, Lieutenant, Pompier) avec couleur
- **Numéro d'employé** unique
- **Contact** : Email, téléphone, contact d'urgence 🚨
- **Type d'emploi** : Temps plein ou temps partiel
- **Heures max/semaine** (temps partiel) : Ex: "Max : 25h/sem"
- **Formations** : Nombre de certifications
- **Actions** : Visualiser 👁️, Modifier ✏️, Supprimer ❌

### Vue Mobile

Sur smartphone et tablette, la liste se transforme en **cartes individuelles** :
- **En-tête** : Nom, grade, statut
- **Détails** : Email, téléphone, urgence, emploi, formations
- **Actions** : Boutons adaptés à l'écran tactile

### Fonctions Spéciales

**Fonction Supérieur :**
- Option pour pompiers pouvant agir comme Lieutenant
- Visible avec badge "🎖️ Fonction supérieur"
- Utilisée lors de l'attribution automatique

**Disponibilités (Temps Partiel) :**
- Bouton "📅 Disponibilités" pour employés temps partiel
- Accès direct à la consultation des créneaux configurés

### Création de Nouveau Personnel

**Modal "🚒 Nouveau pompier" avec 3 sections :**

**👤 Informations personnelles :**
- Prénom, nom, email (obligatoires)
- Téléphone, contact d'urgence

**🎖️ Informations professionnelles :**
- Grade (Directeur, Capitaine, Lieutenant, Pompier)
- Type d'emploi (temps plein, temps partiel)
- Numéro d'employé (auto-généré si vide)
- Date d'embauche
- Option "Fonction supérieur" (pompiers seulement)

**📜 Compétences :**
- Sélection multiple des formations/certifications
- Affichage en cartes compactes avec badges "OBL" (obligatoire)
- Métadonnées : durée, validité

### Modification du Personnel

**Modal d'édition** avec mêmes sections que création :
- Données pré-remplies
- Modification formations possible
- Sauvegarde avec notification de succès

### Visualisation Détaillée

**Modal modernisé** avec :
- **Avatar et badges** : Grade, type emploi, statut
- **Sections détaillées** : Contact, professionnel, compétences
- **Actions rapides** : Modifier profil, voir disponibilités
- **Calcul d'ancienneté** automatique

---

## 📅 PLANNING {#planning}

### Vue d'Ensemble

Module central de planification des gardes avec attribution intelligente.

**Accès :** Tous les rôles (lecture pour employés, gestion pour admin/superviseur)

### Types de Vue

**📅 Vue Semaine :**
- Planning hebdomadaire en cartes modernes
- Navigation : "Semaine du X au Y"
- Code couleur par couverture

**📊 Vue Mois :**
- Calendrier mensuel complet
- Vue d'ensemble du mois
- Navigation par mois

### Code Couleur Intelligent

- **🟢 Vert** : Garde complète (personnel suffisant)
- **🟡 Jaune** : Garde partielle (personnel insuffisant)
- **🔴 Rouge** : Garde vacante (aucun personnel)

### Contrôles du Planning

**4 boutons principaux :**

1. **📅 Vue semaine** / **📊 Vue mois** : Bascule entre vues
2. **✨ Attribution auto** : Intelligence artificielle 5 niveaux
3. **👤 Assignation manuelle avancée** : Modal avec récurrence

### Attribution Automatique Intelligente

**Algorithme 5 niveaux :**

1. **Assignations manuelles privilégiées** : Jamais écrasées
2. **Respect des disponibilités** : Vérification calendrier temps partiel
3. **Respect des grades** : Officier obligatoire si configuré
4. **Rotation équitable** : Répartition heures selon cumul mensuel
5. **Ancienneté** : Date d'embauche en cas d'égalité

**Fonctionnement :**
- Clic sur "✨ Attribution auto"
- Algorithme analyse tous les employés temps partiel
- Crée assignations selon disponibilités et contraintes
- Notification : "X nouvelles assignations créées"

### Assignation Manuelle Simple

**Clic sur cellule vide :**
- Modal avec liste du personnel disponible
- Sélection rapide pour cette date spécifique
- Validation et mise à jour immédiate

### Assignation Manuelle Avancée

**Modal sophistiqué avec 6 sections :**

**👥 Sélection du personnel :**
- Dropdown avec tous les pompiers
- Informations : Grade, type emploi

**🚒 Type de garde :**
- Sélection du type avec horaires

**🔄 Type d'assignation :**
- **📅 Unique** : Une seule date
- **🔁 Hebdomadaire** : Récurrence sur jours choisis
- **📆 Mensuelle** : Même date chaque mois

**📋 Jours de semaine (si hebdomadaire) :**
- Cases à cocher : Lundi à Dimanche
- Sélection multiple possible

**📅 Période :**
- Date début et fin
- Validation des périodes

**📊 Résumé :**
- Aperçu en temps réel de l'assignation
- Personnel, type garde, récurrence, période

### Détails d'une Garde

**Clic sur garde assignée :**
- Modal "🚒 Détails de la garde"
- **Personnel assigné** : Liste complète avec actions
- **Ratio couverture** : X/Y personnel avec indicateur
- **Actions** : Ajouter personnel, Retirer personnel, Supprimer tout

### Respect des Contraintes

**Types de garde :**
- **Jours d'application** : Garde semaine (Lun-Ven), Weekend (Sam-Dim)
- **Personnel requis** : 1-4 selon type
- **Officier obligatoire** : Si configuré dans Paramètres

**Employés :**
- **Disponibilités** : Créneaux configurés par temps partiel
- **Heures max** : Limite hebdomadaire personnalisable (5-168h)
- **Fonction supérieur** : Pompiers pouvant agir comme Lieutenant

---

## 📋 MES DISPONIBILITÉS {#disponibilites}

### Vue d'Ensemble

Module dédié aux employés temps partiel pour gérer leurs créneaux de disponibilité.

**Accès :** Employés temps partiel uniquement

### Interface Principale

**Positionnement :** Planning → **Mes disponibilités** → Remplacements

**3 cartes statistiques :**
- **📅 X Disponibilités enregistrées** : Nombre total
- **⏱️ Xh Heures/mois** : Calcul automatique avec gardes de nuit
- **🚒 X Types de garde** : Nombre de types configurés

### Calendrier Mensuel

**Fonctionnalités :**
- **Calendrier interactif** : Clic sur dates pour voir détails
- **Codes couleur** : Par type de garde (synchronisé avec Paramètres)
- **Légende moderne** : Jours configurés vs non configurés

**Interaction :**
- **Clic sur date** : Affichage détails à l'écran (pas en popup)
- **Détails multiples** : Si plusieurs types garde même jour
- **Fermeture** : Bouton ✕ pour masquer détails

### Configuration des Disponibilités

**Modal "📅 Configurer mes disponibilités" :**

**🚒 Type de garde spécifique :**
- **"Tous les types"** : Disponibilité générale
- **Type spécifique** : Ex. "Garde Interne AM - Semaine (06:00-12:00)"

**⏰ Créneaux horaires :**
- **Automatiques** : Si type spécifique sélectionné
- **Personnalisés** : Si "Tous les types" sélectionné
- **Statut** : Disponible, Préférence, Indisponible

**📆 Sélection des dates :**
- **Calendrier interactif** : Clic multiple sur dates
- **Validation** : Dates futures uniquement
- **Résumé** : Type, dates, horaires en temps réel

### Sauvegarde Cumulative

**Fonctionnalité clé :**
- **Ajout progressif** : Nouvelles disponibilités s'ajoutent aux existantes
- **Pas d'effacement** : Configurations précédentes préservées
- **Types multiples** : Plusieurs types garde possible même jour

### Détails des Disponibilités

**Section droite avec cartes modernes :**
- **Date** : Cercle rouge avec jour/mois
- **Type garde** : Nom avec icône 🚒
- **Horaires** : Début - fin
- **Statut** : Badge coloré "DISPONIBLE", "PRÉFÉRENCE"

**Tri chronologique** : Dates affichées dans l'ordre croissant

---

## 🔄 REMPLACEMENTS {#remplacements}

### Vue d'Ensemble

Gestion complète des demandes de remplacement et congés avec workflow d'approbation.

**Accès :** Tous les rôles (création pour employés, validation pour admin/superviseur)

### Interface par Onglets

**🔄 Remplacements :**
- Demandes de remplacement de garde
- Recherche automatique de remplaçants
- Workflow de validation

**🏖️ Congés :**
- Demandes de congé (maladie, vacances, parental, personnel)
- Workflow d'approbation hiérarchique
- Interface de gestion admin/superviseur

### Création Demande de Remplacement

**Modal "🔄 Nouvelle demande de remplacement" :**

**🎯 Niveau de priorité :**
- **🚨 Urgente** (rouge) : Traitement immédiat
- **🔥 Haute** (orange) : 24h maximum  
- **📋 Normale** (bleu) : Délai standard
- **📝 Faible** (gris) : Différé possible

**Informations :**
- **Type de garde** : Dropdown avec horaires
- **Date** : Sélecteur de date (futures uniquement)
- **Raison** : Zone texte obligatoire

### Création Demande de Congé

**Modal "🏖️ Nouvelle demande de congé" :**

**🎯 Priorité** : Même système que remplacements

**Types de congé :**
- **🏥 Maladie** : Arrêt avec justificatif
- **🏖️ Vacances** : Congés payés annuels
- **👶 Parental** : Maternité/paternité
- **👤 Personnel** : Exceptionnel sans solde

**Période :**
- Date début et fin
- Calcul automatique nombre de jours
- Raison obligatoire

**Workflow d'approbation :**
- **Employé** → Superviseur
- **Superviseur** → Admin
- **Étapes** : Soumission → Approbation → Notification

### Interface de Gestion (Admin/Superviseur)

**Onglet Congés avec en-tête spécial :**
- **👑 Gestion des demandes de congé**
- **Permissions** : Admin (toutes), Superviseur (employés seulement)
- **Indicateur** : Cercle rouge avec nombre en attente

**Boutons de gestion :**
- **🚨 Congés urgents** : Filtre demandes prioritaires
- **📊 Exporter congés** : Export Excel/CSV
- **📅 Impact planning** : Analyse impact sur planning

**Actions par demande :**
- **✅ Approuver** : Validation avec commentaire
- **❌ Refuser** : Refus avec justification
- **💬 Commenter** : Ajout de notes

### Historique d'Approbation

**Demandes traitées :**
- **Qui** : Nom de l'approbateur
- **Quand** : Date d'approbation
- **Commentaire** : Justification de la décision
- **Statut** : Approuvé/Refusé avec badge coloré

---

## 📚 FORMATIONS {#formations}

### Vue d'Ensemble

Planning des sessions de formation et maintien des compétences.

**Accès :** Tous les rôles (création pour admin/superviseur, inscription pour tous)

### Statistiques des Formations

**3 cartes :**
- **📅 Formations planifiées** : Sessions à venir
- **👥 Participants inscrits** : Total inscriptions
- **🎓 Formations terminées** : Sessions complétées

### Sessions de Formation

**Cartes détaillées :**

**En-tête :**
- **Titre** : Ex. "Formation Sauvetage Aquatique - Niveau 1"
- **Statut** : Planifiée (bleu), En cours (orange), Terminée (vert), Annulée (rouge)
- **Compétence** : Badge lié aux compétences (Paramètres)

**Détails :**
- **📅 Date et heure** : 15/01/2025 à 09:00
- **⏱️ Durée** : 32h de formation
- **📍 Lieu** : Piscine municipale
- **👨‍🏫 Formateur** : Capitaine Sarah Tremblay

**Description :**
- Objectifs de la formation
- Contenu pédagogique

**Participants :**
- **Compteur** : X/20 participants
- **Barre de progression** : Verte → Rouge si complet
- **Status** : Places disponibles ou "Complet"

**Actions :**
- **✅ S'inscrire** : Si places disponibles
- **❌ Se désinscrire** : Si déjà inscrit
- **🚫 Complet** : Si maximum atteint
- **✏️ Modifier** : Admin/superviseur seulement

### Création de Session

**Modal "📚 Créer une session de formation" (Admin/Superviseur) :**

**📋 Informations générales :**
- **Titre** : Nom de la session
- **Compétence associée** : Dropdown depuis Paramètres > Compétences
- **Date/Heure** : Programmation
- **Durée** : 1-40 heures
- **Places** : 1-50 participants

**📍 Logistique :**
- **Lieu** : Salle, caserne, externe
- **Formateur** : Nom du responsable

**📝 Contenu :**
- **Description** : Objectifs et contenu (obligatoire)
- **Plan de cours** : Programme détaillé (optionnel)

### Système d'Inscription

**Gestion automatique :**
- **Validation places** : Vérification disponibilité
- **Prévention doublons** : Un seul inscription par utilisateur
- **Mise à jour temps réel** : Compteur et barre progression
- **Notifications** : Confirmation inscription/désinscription

---

## 📈 RAPPORTS {#rapports}

### Vue d'Ensemble

Module d'analytics avancées avec exports professionnels.

**Accès :** Administrateurs uniquement

### Navigation par Sections

**4 onglets :**
- **📊 Vue d'ensemble** : KPIs généraux + exports
- **👥 Par rôle** : Statistiques admin/superviseur/employé
- **👤 Par employé** : Rapports individuels
- **📈 Analytics** : Graphiques et tendances

### Vue d'Ensemble

**KPIs principaux :**
- **👥 Personnel actif** : Comptage total avec répartition
- **📅 Assignations mois** : Nombre avec période
- **📊 Taux de couverture** : Efficacité planning
- **📚 Formations disponibles** : Compétences actives

**Options d'export :**
- **📄 Rapport PDF** : Complet avec graphiques
- **📊 Rapport Excel** : Données pour analyse

### Statistiques par Rôle

**3 cartes avec bordures colorées :**

**👑 Administrateurs** (rouge) :
- Nombre d'utilisateurs
- Assignations, heures, formations
- Export dédié

**🎖️ Superviseurs** (bleu) :
- Statistiques équipe supervision
- Performance management

**👤 Employés** (vert) :
- Données opérationnelles
- Temps de service

### Rapports par Employé

**Tableau détaillé :**
- **EMPLOYÉ** : Nom et grade
- **RÔLE** : Badge avec icône
- **ASSIGNATIONS** : Nombre mensuel
- **DISPONIBILITÉS** : Créneaux configurés
- **FORMATIONS** : Certifications acquises
- **HEURES** : Total estimé
- **ACTIONS** : Export PDF individuel

**Export individuel :**
- Dropdown sélection employé
- Rapport personnalisé PDF
- Données complètes de l'employé

### Analytics Avancées

**Graphiques visuels :**

**Évolution assignations :**
- Barres par mois
- Tendance croissante/décroissante
- Période 12 mois

**Distribution par grade :**
- Graphique secteurs
- Pourcentages par grade
- Répartition heures

**Exports spécialisés :**
- PDF analytics avec graphiques
- Excel données brutes pour analyse

### Système d'Export

**Technologies :**
- **PDF** : ReportLab avec tableaux stylés
- **Excel** : OpenPyXL avec formatage
- **Téléchargement** : Automatique via navigateur
- **Formats** : Base64 décodé en fichiers

---

## ⚙️ PARAMÈTRES {#parametres}

### Vue d'Ensemble

Configuration complète du système ProFireManager.

**Accès :** Administrateurs uniquement

### Navigation par Onglets

**5 onglets de configuration :**

1. **🚒 Types de Gardes** : Horaires et personnel requis
2. **📜 Compétences** : Catalogue formations/certifications
3. **⚙️ Attribution Auto** : Algorithme IA 5 niveaux
4. **👥 Comptes d'Accès** : Gestion utilisateurs et permissions
5. **🔄 Paramètres Remplacements** : Règles validation

### Types de Gardes

**Configuration complète :**
- **Nom** : Ex. "Garde Interne AM - Semaine"
- **Horaires** : Début et fin (06:00 - 18:00)
- **Personnel requis** : 1-10 pompiers
- **Durée** : Heures de garde
- **Couleur** : Affichage planning et calendriers
- **Jours d'application** : Lundi à Dimanche (récurrence)
- **Officier obligatoire** : Case à cocher

**Actions :**
- **Créer** : Modal avec tous les champs
- **Modifier** : Édition complète
- **Supprimer** : Avec confirmation

### Compétences (ex-Formations)

**Catalogue des compétences :**
- **Nom** : Ex. "Désincarcération"
- **Description** : Détails de la compétence
- **Durée formation** : Heures requises
- **Renouvellement** : 0 (permanent) à 60 mois ou "Pas de renouvellement"
- **Obligatoire** : Case à cocher pour toute la caserne

**Distinction importante :**
- **Paramètres > Compétences** : Catalogue des certifications
- **Module Formations** : Sessions de formation/maintien

### Attribution Automatique

**Configuration algorithme IA :**

**5 niveaux non modifiables :**
1. Assignations manuelles privilégiées ✅ Actif
2. Respect disponibilités employés ✅ Actif
3. Respect grades (officier requis) ✅ Actif
4. Rotation équitable ✅ Actif - Nouvelle version
5. Ancienneté employés ✅ Actif - Nouveau niveau

**Détails algorithme :**
- **🎯 Cible** : Employés temps partiel uniquement
- **📊 Calcul** : Cumul mensuel heures
- **📅 Ancienneté** : Date d'embauche
- **⚙️ Déclenchement** : Bouton dans Planning

**Paramètres généraux :**
- **Attribution auto activée** : Toggle système
- **Notification email** : Assignations

### Comptes d'Accès

**Gestion utilisateurs :**

**Statistiques :**
- **X Administrateurs** : Accès complet
- **X Superviseurs** : Gestion équipe
- **X Employés** : Consultation

**Liste utilisateurs :**
- **Badges** : 👑 Admin, 🎖️ Superviseur, 👤 Employé
- **Informations** : Email, grade, type emploi
- **Actions** : Modifier accès, Révoquer compte

**Création compte :**
- **Validation mot de passe** : 8 caractères, majuscule, chiffre, spécial (!@#$%^&*+-?())
- **Email bienvenue** : Automatique avec modules selon rôle
- **Rôles** : Admin, Superviseur, Employé

**Modification accès :**
- **Rôle** : Changement permissions
- **Statut** : Actif/Inactif (connexion bloquée)
- **Aperçu permissions** : Modules accessibles

**Révocation compte :**
- **Suppression définitive** : Compte + toutes données
- **Confirmation** : Double validation
- **Nettoyage** : Disponibilités, assignations, demandes

### Paramètres Remplacements

**Interface compacte :**

**Délais et limites :**
- **Délai réponse** : Minutes (plus précis qu'heures)
- **Max contacts** : Nombre de remplaçants contactés

**Règles validation (cases à cocher) :**
- **✅ Privilégier disponibles** : Priorité aux employés avec créneaux
- **✅ Grade équivalent** : Même niveau ou supérieur
- **✅ Compétences équivalentes** : Mêmes certifications

**Résumé validation :**
- **Processus** : 3 étapes avec statuts visuels
- **Délai** : X minutes pour Y remplaçants
- **Sauvegarde** : Instantanée à chaque modification

---

## 👤 MON PROFIL {#profil}

### Vue d'Ensemble

Gestion des informations personnelles et sécurité du compte.

**Accès :** Tous les utilisateurs

### Informations Personnelles

**Modifiables par tous :**
- **Prénom et nom** : Identité
- **Email** : Adresse de contact
- **Téléphone** : Numéro principal
- **Contact d'urgence** : En cas d'accident
- **Heures max/semaine** : Pour temps partiel (5-168h)

**Bouton Modifier :**
- Mode édition avec champs actifs
- Sauvegarde avec API `/users/mon-profil`
- Notification de succès
- Synchronisation avec module Personnel

### Informations d'Emploi (Verrouillées)

**Données système 🔒 :**
- **Numéro d'employé** : Ex. #PTP001
- **Grade** : Pompier, Lieutenant, Capitaine, Directeur
- **Fonction supérieur** : Si applicable
- **Type d'emploi** : Temps plein/partiel
- **Date d'embauche** : Calcul ancienneté

### Formations et Certifications

**Visualisation :**
- **Liste formations** : Certifications acquises
- **Statut** : "Certifié ✅" pour chaque formation
- **Lien** : Avec Paramètres > Compétences

### Sécurité du Compte

**🔒 Changer mot de passe :**
- **Modal sécurisé** : 3 champs obligatoires
- **Validation** : Complexité requise
- **Confirmation** : Double saisie

### Sidebar Statistiques

**Statistiques personnelles temps réel :**
- **🏆 Gardes ce mois** : API dynamique
- **⏱️ Heures travaillées** : Calcul automatique
- **📜 Certifications** : Compteur formations

---

## 🔄 WORKFLOWS ET PROCESSUS {#workflows}

### Workflow Attribution Automatique

**Processus complet :**

1. **Préparation**
   - Employés temps partiel configurent disponibilités
   - Types de garde configurés dans Paramètres
   - Heures max définies par employé

2. **Déclenchement**
   - Admin/Superviseur : Planning → "✨ Attribution auto"
   - Algorithme analyse semaine courante
   - 5 niveaux de priorité appliqués

3. **Exécution IA**
   - Niveau 1 : Préserve assignations manuelles
   - Niveau 2 : Vérifie disponibilités temps partiel
   - Niveau 3 : Respecte contraintes grades/officiers
   - Niveau 4 : Optimise rotation équitable (heures)
   - Niveau 5 : Départage par ancienneté

4. **Résultat**
   - Notification : "X nouvelles assignations créées"
   - Planning mis à jour avec code couleur
   - Synchronisation immédiate

### Workflow Demande de Remplacement

**Étapes :**

1. **Création (Employé)**
   - Modal avec priorité + détails
   - Validation automatique
   - Notification confirmation

2. **Recherche Automatique (Système)**
   - Algorithme selon Paramètres > Remplacements
   - Notifications push aux remplaçants potentiels
   - Score compatibilité calculé

3. **Validation (Admin/Superviseur)**
   - Interface de gestion avec boutons
   - Approbation/Refus avec commentaires
   - Mise à jour planning automatique

4. **Notification (Tous Concernés)**
   - Demandeur : Statut de sa demande
   - Remplaçant : Confirmation assignation
   - Planning : Remplacement visible

### Workflow Demande de Congé

**Hiérarchie d'approbation :**

1. **Soumission (Employé)**
   - Sélection type congé + priorité
   - Période avec calcul automatique jours
   - Raison obligatoire

2. **Approbation Niveau 1 (Superviseur)**
   - **Peut approuver** : Demandes employés
   - **Ne peut pas** : Demandes autres superviseurs
   - Interface dédiée onglet Congés

3. **Approbation Niveau 2 (Admin)**
   - **Peut approuver** : Toutes demandes
   - **Dernier niveau** : Décision finale
   - Commentaires et justifications

4. **Mise à Jour Planning**
   - Congé approuvé → Période bloquée
   - Recherche remplaçants automatique
   - Impact visible planning

### Workflow Formation

**Cycle complet :**

1. **Planification (Admin/Superviseur)**
   - Création session avec détails complets
   - Lien avec compétence existante
   - Ouverture inscriptions

2. **Inscription (Tous)**
   - Bouton "S'inscrire" si places
   - Validation automatique disponibilité
   - Confirmation immédiate

3. **Gestion Session**
   - Suivi participants temps réel
   - Fermeture si complet
   - Modification si nécessaire

4. **Finalisation**
   - Passage statut "Terminée"
   - Certification automatique participants
   - Mise à jour profils employés

---

## 👑 GUIDE ADMINISTRATEUR {#admin}

### Responsabilités Admin

**Accès complet :**
- Configuration système (Paramètres)
- Gestion personnel complet
- Validation toutes demandes congés
- Analytics et rapports
- Création comptes utilisateurs

### Configuration Initiale

**Étapes recommandées :**

1. **Paramètres > Types de Gardes**
   - Créer types selon vos horaires
   - Définir personnel requis
   - Configurer jours d'application
   - Activer "Officier obligatoire" si besoin

2. **Paramètres > Compétences**
   - Importer vos certifications existantes
   - Définir durées formation requises
   - Configurer renouvellements
   - Marquer obligatoires

3. **Paramètres > Comptes d'Accès**
   - Créer superviseurs et employés
   - Définir mots de passe complexes
   - Assigner rôles appropriés
   - Envoyer emails bienvenue

4. **Personnel**
   - Importer votre équipe existante
   - Assigner formations à chacun
   - Configurer fonction supérieur
   - Définir heures max temps partiel

### Gestion Quotidienne

**Tâches récurrentes :**
- **Validation demandes** : Remplacements et congés
- **Monitoring planning** : Taux de couverture
- **Gestion formations** : Créer sessions selon besoins
- **Analytics** : Suivi performance équipe

### Démonstrations Client

**Préparation démo :**
1. **Données test** : Bouton "Créer données démo client"
2. **Disponibilités** : "Créer disponibilités (tous temps partiel)"
3. **Reset** : "Vider le planning" pour montrer avant/après

**Scénario démo :**
1. Planning vide (rouge) → Attribution auto → Planning rempli (vert/jaune)
2. Gestion flexible : Clic garde → Voir personnel → Modifier
3. IA en action : 5 niveaux algorithme visible

### Maintenance

**Actions périodiques :**
- **Exports rapports** : Mensuel pour direction
- **Nettoyage données** : Anciennes assignations
- **Mise à jour formations** : Nouvelles compétences
- **Monitoring sécurité** : Comptes inactifs

---

## ❓ FAQ ET DÉPANNAGE {#faq}

### Questions Fréquentes

**Q: L'attribution automatique ne crée aucune assignation ?**
R: Vérifiez que les employés temps partiel ont configuré leurs disponibilités dans "Mes disponibilités" pour la période concernée.

**Q: Un employé ne voit pas le module "Mes disponibilités" ?**
R: Ce module est visible uniquement pour les employés temps partiel. Vérifiez le type d'emploi dans Personnel ou Paramètres > Comptes.

**Q: Le taux de couverture semble incorrect ?**
R: Le calcul : (Personnel assigné / Personnel requis) × 100. Maximum 100%. Vérifiez la configuration "Personnel requis" dans Paramètres > Types de Gardes.

**Q: Les exports PDF/Excel ne fonctionnent pas ?**
R: Fonction réservée aux administrateurs. Vérifiez vos permissions ou contactez votre admin système.

**Q: Je ne peux pas modifier mon profil ?**
R: Cliquez sur "Modifier" dans Mon profil. Certains champs sont verrouillés (grade, type emploi) - contactez votre superviseur.

### Problèmes Techniques

**Problème : Page blanche après connexion**
- Solution : Vider cache navigateur (Ctrl+F5)
- Vérifier connexion internet
- Réessayer avec navigateur différent

**Problème : Planning ne se charge pas**
- Vérifier permissions utilisateur
- Recharger page (F5)
- Contacter administrateur si persistant

**Problème : Assignations disparaissent**
- Vérifier conflits d'horaires
- Contrôler heures max employés temps partiel
- Voir logs admin pour détails

### Support Technique

**Contact :**
- **Email** : support@profiremanager.ca
- **Téléphone** : 1-800-PROFIRE
- **Heures** : Lun-Ven 8h-17h EST

**Avant de nous contacter :**
- Noter message d'erreur exact
- Préciser navigateur et appareil
- Décrire étapes pour reproduire
- Joindre capture d'écran si possible

---

## 📖 GLOSSAIRE {#glossaire}

### Termes Techniques

**Assignation :** Attribution d'un pompier à une garde spécifique
**Attribution automatique :** IA qui assigne automatiquement selon algorithme
**Disponibilité :** Créneau où employé temps partiel peut travailler
**Fonction supérieur :** Pompier pouvant agir comme Lieutenant
**Grade :** Niveau hiérarchique (Pompier, Lieutenant, Capitaine, Directeur)
**Type de garde :** Catégorie de service (AM, PM, Weekend, Externe)

### Rôles et Permissions

**Administrateur :**
- Accès total application
- Configuration système
- Création comptes
- Validation toutes demandes

**Superviseur :**
- Gestion personnel (lecture)
- Validation planning
- Approbation congés employés
- Création formations

**Employé :**
- Consultation planning personnel
- Demandes remplacement/congé
- Inscription formations
- Gestion profil

**Temps partiel :**
- Mêmes droits qu'employé
- Module "Mes disponibilités" en plus
- Configuration heures max

### Statuts

**Personnel :**
- **Actif** : Peut recevoir assignations
- **Inactif** : Bloqué temporairement

**Assignations :**
- **Planifiée** : Programmée
- **Confirmée** : Acceptée
- **Remplacée** : Personnel changé

**Formations :**
- **Planifiée** : Programmée, inscriptions ouvertes
- **En cours** : Session active
- **Terminée** : Complétée, certifications délivrées
- **Annulée** : Supprimée

**Demandes :**
- **En cours** / **En attente** : À traiter
- **Approuvée** : Validée
- **Refusée** : Rejetée

---

## 🎯 CONSEILS D'UTILISATION

### Meilleures Pratiques

**Pour Administrateurs :**
- Configurez d'abord tous les types de garde
- Importez le personnel avant les assignations
- Testez l'attribution auto sur une semaine
- Formez les superviseurs avant les employés

**Pour Superviseurs :**
- Validez les demandes rapidement (délai 48h)
- Communiquez les changements à l'équipe
- Surveillez taux de couverture hebdomadaire
- Planifiez formations selon besoins

**Pour Employés :**
- Configurez disponibilités 2 semaines à l'avance
- Respectez heures max définies
- Demandes urgentes avec justification claire
- Profil à jour pour meilleure attribution

**Pour Temps Partiel :**
- Utilisez codes couleur dans calendrier
- Variez types de garde pour flexibilité
- Mettez à jour heures max selon besoin
- Patterns réguliers facilitent attribution

### Optimisation Performance

**Planning efficace :**
- 80% employés temps partiel avec disponibilités
- Heures max réalistes (20-40h/semaine)
- Types garde bien configurés
- Fonction supérieur pour pompiers expérimentés

**Gestion remplacements :**
- Priorités utilisées avec parcimonie
- Raisons claires et justifiées
- Anticipation congés vacances
- Communication équipe importante

---

## 🚒 CONCLUSION

ProFireManager v2.0 est conçu pour optimiser la gestion de votre service d'incendie grâce à l'intelligence artificielle et une interface moderne. Cette application respecte les spécificités du travail des pompiers canadiens tout en offrant flexibilité et efficacité.

**Support continu :**
- Mises à jour régulières
- Nouvelles fonctionnalités selon retours
- Formation équipe disponible
- Integration personnalisations

**Bonne utilisation de ProFireManager v2.0 !** 🔥

---

*Manuel utilisateur ProFireManager v2.0 - Version Septembre 2025*  
*© ProFireManager Solutions Inc. - Tous droits réservés*