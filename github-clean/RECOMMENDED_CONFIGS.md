# Configurations recommandées

Ce fichier contient les configurations recommandées pour différents types de services d'incendie.

---

## 🔥 Types de quarts recommandés

### Service 24/7

```json
{
  "types_quarts": [
    {
      "nom": "Jour (08h-20h)",
      "heures_debut": "08:00",
      "heures_fin": "20:00",
      "duree": 12,
      "couleur": "#ef4444"
    },
    {
      "nom": "Nuit (20h-08h)",
      "heures_debut": "20:00",
      "heures_fin": "08:00",
      "duree": 12,
      "couleur": "#3b82f6"
    }
  ]
}
```

### Service 8h-18h (5 jours)

```json
{
  "types_quarts": [
    {
      "nom": "Matin (08h-16h)",
      "heures_debut": "08:00",
      "heures_fin": "16:00",
      "duree": 8,
      "couleur": "#f59e0b"
    },
    {
      "nom": "Après-midi (12h-20h)",
      "heures_debut": "12:00",
      "heures_fin": "20:00",
      "duree": 8,
      "couleur": "#10b981"
    }
  ]
}
```

### Service mixte

```json
{
  "types_quarts": [
    {
      "nom": "Jour (08h-20h)",
      "heures_debut": "08:00",
      "heures_fin": "20:00",
      "duree": 12,
      "couleur": "#ef4444"
    },
    {
      "nom": "Nuit (20h-08h)",
      "heures_debut": "20:00",
      "heures_fin": "08:00",
      "duree": 12,
      "couleur": "#3b82f6"
    },
    {
      "nom": "Garde volontaire",
      "heures_debut": "18:00",
      "heures_fin": "08:00",
      "duree": 14,
      "couleur": "#8b5cf6"
    }
  ]
}
```

---

## 👨‍🚒 Grades typiques (Canada)

### Services professionnels

```json
{
  "grades": [
    "Directeur",
    "Chef de division",
    "Capitaine",
    "Lieutenant",
    "Sergent",
    "Pompier 4e classe",
    "Pompier 3e classe",
    "Pompier 2e classe",
    "Pompier 1re classe",
    "Recrue"
  ]
}
```

### Services volontaires

```json
{
  "grades": [
    "Chef",
    "Chef adjoint",
    "Capitaine",
    "Lieutenant",
    "Pompier",
    "Pompier stagiaire"
  ]
}
```

---

## 🎓 Compétences et certifications typiques

### Certifications de base

```json
{
  "competences": [
    {
      "nom": "Pompier I",
      "type": "Certification NFPA",
      "valide_mois": 36
    },
    {
      "nom": "Pompier II",
      "type": "Certification NFPA",
      "valide_mois": 36
    },
    {
      "nom": "Premiers soins",
      "type": "Secourisme",
      "valide_mois": 24
    },
    {
      "nom": "RCR",
      "type": "Secourisme",
      "valide_mois": 12
    },
    {
      "nom": "DEA (défibrillateur)",
      "type": "Secourisme",
      "valide_mois": 12
    }
  ]
}
```

### Certifications avancées

```json
{
  "competences": [
    {
      "nom": "Officier pompier I",
      "type": "Leadership",
      "valide_mois": 60
    },
    {
      "nom": "Officier pompier II",
      "type": "Leadership",
      "valide_mois": 60
    },
    {
      "nom": "Instructeur",
      "type": "Formation",
      "valide_mois": 36
    },
    {
      "nom": "Technicien en sauvetage",
      "type": "Spécialité",
      "valide_mois": 24
    },
    {
      "nom": "Matières dangereuses - Opérations",
      "type": "Spécialité",
      "valide_mois": 12
    },
    {
      "nom": "Conducteur d'autopompe",
      "type": "Conduite",
      "valide_mois": 12
    },
    {
      "nom": "Conducteur d'échelle aérienne",
      "type": "Conduite",
      "valide_mois": 12
    }
  ]
}
```

---

## ⚙️ Règles d'auto-assignation recommandées

### Service professionnel (24/7)

```json
{
  "regles_auto_assignation": {
    "priorite_anciennete": 30,
    "priorite_disponibilite": 70,
    "rotation_equitable": true,
    "respect_heures_max": true,
    "heures_repos_minimum": 12,
    "jours_consecutifs_max": 4,
    "weekend_rotation": true
  }
}
```

### Service volontaire

```json
{
  "regles_auto_assignation": {
    "priorite_anciennete": 20,
    "priorite_disponibilite": 80,
    "rotation_equitable": true,
    "respect_heures_max": true,
    "heures_repos_minimum": 8,
    "jours_consecutifs_max": 3,
    "weekend_rotation": true
  }
}
```

---

## 👥 Structure organisationnelle type

### Petit service (< 20 pompiers)

```
Directeur (Admin)
├── Capitaine (Superviseur)
│   ├── Pompier 1 (TP)
│   ├── Pompier 2 (TP)
│   └── Pompiers 3-10 (TT)
```

**Nombre de rôles :**
- 1 Administrateur
- 1-2 Superviseurs
- 5-10 Employés temps plein
- 10-20 Employés temps partiel

### Service moyen (20-50 pompiers)

```
Directeur (Admin)
├── Chef de division A (Admin)
├── Chef de division B (Admin)
│   ├── Capitaine 1 (Superviseur)
│   │   └── Équipe A (5-8 pompiers)
│   ├── Capitaine 2 (Superviseur)
│   │   └── Équipe B (5-8 pompiers)
│   └── Capitaine 3 (Superviseur)
│       └── Équipe C (5-8 pompiers)
```

**Nombre de rôles :**
- 2-3 Administrateurs
- 3-5 Superviseurs
- 15-25 Employés temps plein
- 10-20 Employés temps partiel

### Grand service (50+ pompiers)

```
Directeur (Admin)
├── Directeur adjoint (Admin)
├── Chef prévention (Admin)
├── Chef opérations (Admin)
│   ├── Capitaine Caserne 1 (Superviseur)
│   │   ├── Lieutenant A (Superviseur)
│   │   │   └── Équipe A1 (6-8 pompiers)
│   │   └── Lieutenant B (Superviseur)
│   │       └── Équipe A2 (6-8 pompiers)
│   └── Capitaine Caserne 2 (Superviseur)
│       └── ... (similaire)
```

**Nombre de rôles :**
- 3-5 Administrateurs
- 8-15 Superviseurs
- 30-60 Employés temps plein
- 20-40 Employés temps partiel

---

## 📊 Heures maximales recommandées

### Selon le type d'emploi

```json
{
  "heures_max": {
    "temps_plein": {
      "semaine": 40,
      "mois": 160,
      "consecutif": 48
    },
    "temps_partiel": {
      "semaine": 20,
      "mois": 80,
      "consecutif": 24
    },
    "occasionnel": {
      "semaine": 12,
      "mois": 48,
      "consecutif": 12
    }
  }
}
```

### Selon les normes canadiennes

```json
{
  "normes_canadiennes": {
    "heures_regulieres": 40,
    "heures_supplementaires_max": 8,
    "repos_entre_quarts": 12,
    "jours_consecutifs_max": 6,
    "repos_hebdomadaire_min": 24
  }
}
```

---

## 🚨 Types de congés recommandés

```json
{
  "types_conges": [
    {
      "nom": "Vacances",
      "code": "VAC",
      "paye": true,
      "approbation_requise": true,
      "preavis_jours": 14
    },
    {
      "nom": "Maladie",
      "code": "MAL",
      "paye": true,
      "approbation_requise": false,
      "preavis_jours": 0,
      "justificatif_requis": true
    },
    {
      "nom": "Congé personnel",
      "code": "PERS",
      "paye": false,
      "approbation_requise": true,
      "preavis_jours": 7
    },
    {
      "nom": "Formation",
      "code": "FORM",
      "paye": true,
      "approbation_requise": true,
      "preavis_jours": 30
    },
    {
      "nom": "Congé familial",
      "code": "FAM",
      "paye": true,
      "approbation_requise": true,
      "preavis_jours": 3
    }
  ]
}
```

---

## 📅 Modèles de planification

### Rotation 4 jours / 4 nuits / 4 congés

```
Semaine 1: Jour Jour Jour Jour Congé Congé Congé
Semaine 2: Congé Nuit Nuit Nuit Nuit Congé Congé
Semaine 3: Congé Congé Jour Jour Jour Jour Congé
...
```

### Rotation 2/2/4 (Kelly Days)

```
Cycle de 28 jours:
Jour Jour Congé Congé Nuit Nuit Congé Congé Congé Congé
Jour Jour Congé Congé Nuit Nuit Congé Congé Congé Congé
...
```

### Rotation 24/72 (1 jour travail, 3 jours congé)

```
Lundi: Équipe A
Mardi: Équipe B
Mercredi: Équipe C
Jeudi: Équipe D
Vendredi: Équipe A
...
```

---

## 💰 Configuration paie (optionnel - pour futur)

```json
{
  "taux_paie": {
    "regulier": 1.0,
    "temps_supplementaire": 1.5,
    "jour_ferie": 2.0,
    "nuit": 1.1,
    "weekend": 1.2,
    "on_call": 0.5
  }
}
```

---

## 📱 Notifications recommandées (pour futur)

```json
{
  "notifications": {
    "nouveau_quart": {
      "email": true,
      "sms": false,
      "delai_heures": 48
    },
    "changement_quart": {
      "email": true,
      "sms": true,
      "delai_heures": 24
    },
    "demande_remplacement": {
      "email": true,
      "sms": false,
      "immediat": true
    },
    "formation_bientot": {
      "email": true,
      "sms": false,
      "delai_jours": 7
    },
    "certification_expire": {
      "email": true,
      "sms": false,
      "delai_jours": 30
    }
  }
}
```

---

## 🔄 Fréquence de backup recommandée

```json
{
  "backup": {
    "base_donnees": {
      "quotidien": true,
      "heure": "03:00",
      "retention_jours": 30
    },
    "documents": {
      "hebdomadaire": true,
      "jour": "dimanche",
      "heure": "02:00",
      "retention_semaines": 12
    },
    "complet": {
      "mensuel": true,
      "jour": 1,
      "heure": "01:00",
      "retention_mois": 12
    }
  }
}
```

---

## 📊 Métriques à suivre

### Performance opérationnelle

- Taux de couverture des quarts (objectif: >95%)
- Nombre d'heures supplémentaires (objectif: <10% du total)
- Délai moyen de remplacement (objectif: <48h)
- Taux d'annulation de quarts (objectif: <5%)

### Ressources humaines

- Taux d'absentéisme (objectif: <5%)
- Taux de roulement du personnel (objectif: <10%/an)
- Nombre de formations complétées (objectif: 4/employé/an)
- Taux de certification valide (objectif: 100%)

### Satisfaction

- Satisfaction des employés (sondage annuel)
- Équité de distribution des quarts
- Respect des préférences (objectif: >80%)

---

**Note** : Ces configurations sont des recommandations basées sur les meilleures pratiques. Adaptez-les selon les besoins spécifiques de votre service d'incendie et la réglementation locale.
