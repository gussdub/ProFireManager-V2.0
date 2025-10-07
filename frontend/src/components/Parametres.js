import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "../hooks/use-toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Parametres = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('types-garde');
  const [typesGarde, setTypesGarde] = useState([]);
  const [formations, setFormations] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Modals states
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showEditTypeModal, setShowEditTypeModal] = useState(false);
  const [showCreateFormationModal, setShowCreateFormationModal] = useState(false);
  const [showEditFormationModal, setShowEditFormationModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [showEditAccessModal, setShowEditAccessModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [userAccess, setUserAccess] = useState({
    role: '',
    statut: ''
  });
  
  // Edit form state for types garde
  const [editForm, setEditForm] = useState({
    nom: '',
    heure_debut: '',
    heure_fin: '',
    personnel_requis: 1,
    duree_heures: 8,
    couleur: '#3B82F6',
    jours_application: [],
    officier_obligatoire: false
  });

  // Create form state for new types garde
  const [createForm, setCreateForm] = useState({
    nom: '',
    heure_debut: '08:00',
    heure_fin: '16:00',
    personnel_requis: 1,
    duree_heures: 8,
    couleur: '#3B82F6',
    jours_application: [],
    officier_obligatoire: false
  });

  const [editFormation, setEditFormation] = useState({
    nom: '',
    description: '',
    duree_heures: 8,
    validite_mois: 12,
    obligatoire: false
  });

  const [newFormation, setNewFormation] = useState({
    nom: '',
    description: '',
    duree_heures: 8,
    validite_mois: 12,
    obligatoire: false
  });

  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    contact_urgence: '',
    grade: 'Pompier',
    type_emploi: 'temps_plein',
    role: 'employe',
    numero_employe: '',
    date_embauche: '',
    mot_de_passe: 'motdepasse123'
  });

  const [systemSettings, setSystemSettings] = useState({
    attribution_auto: true,
    notification_email: true,
    max_personnes_contact: 5,
    grade_equivalent: true,
    // Nouvelles règles de validation pour remplacements
    privilegier_disponibles: true,
    grade_egal: true,
    competences_egales: true
  });

  const { toast } = useToast();

  const joursOptions = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' }
  ];

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const handleCreateType = async () => {
    if (!createForm.nom || !createForm.heure_debut || !createForm.heure_fin) {
      toast({
        title: "Champs requis",
        description: "Nom, heure de début et heure de fin sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.post(`${API}/types-garde`, createForm);
      toast({
        title: "Type de garde créé",
        description: "Le nouveau type de garde a été ajouté avec succès",
        variant: "success"
      });
      setShowCreateTypeModal(false);
      resetCreateForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le type de garde",
        variant: "destructive"
      });
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      nom: '',
      heure_debut: '08:00',
      heure_fin: '16:00',
      personnel_requis: 1,
      duree_heures: 8,
      couleur: '#3B82F6',
      jours_application: [],
      officier_obligatoire: false
    });
  };

  const handleCreateJourChange = (jour) => {
    const updatedJours = createForm.jours_application.includes(jour)
      ? createForm.jours_application.filter(j => j !== jour)
      : [...createForm.jours_application, jour];
    
    setCreateForm({...createForm, jours_application: updatedJours});
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesResponse, formationsResponse, usersResponse] = await Promise.all([
        axios.get(`${API}/types-garde`),
        axios.get(`${API}/formations`),
        axios.get(`${API}/users`)
      ]);
      setTypesGarde(typesResponse.data);
      setFormations(formationsResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditType = (type) => {
    setEditingItem(type);
    setEditForm({
      nom: type.nom,
      heure_debut: type.heure_debut,
      heure_fin: type.heure_fin,
      personnel_requis: type.personnel_requis,
      duree_heures: type.duree_heures,
      couleur: type.couleur,
      jours_application: type.jours_application || [],
      officier_obligatoire: type.officier_obligatoire || false
    });
    setShowEditTypeModal(true);
  };

  const handleUpdateType = async () => {
    if (!editForm.nom || !editForm.heure_debut || !editForm.heure_fin) {
      toast({
        title: "Champs requis",
        description: "Nom, heure de début et heure de fin sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Updating type with data:', editForm);
      const response = await axios.put(`${API}/types-garde/${editingItem.id}`, editForm);
      console.log('Update response:', response.data);
      
      toast({
        title: "Type mis à jour",
        description: "Les modifications ont été sauvegardées",
        variant: "success"
      });
      setShowEditTypeModal(false);
      fetchData();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Erreur de modification",
        description: error.response?.data?.detail || "Impossible de mettre à jour le type de garde",
        variant: "destructive"
      });
    }
  };

  const handleDeleteType = async (typeId) => {
    if (!window.confirm("Supprimer ce type de garde ?")) return;
    
    try {
      await axios.delete(`${API}/types-garde/${typeId}`);
      toast({
        title: "Supprimé",
        description: "Type de garde supprimé avec succès",
        variant: "success"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer",
        variant: "destructive"
      });
    }
  };

  const handleEditFormation = (formation) => {
    setEditingItem(formation);
    setEditFormation({
      nom: formation.nom,
      description: formation.description,
      duree_heures: formation.duree_heures,
      validite_mois: formation.validite_mois,
      obligatoire: formation.obligatoire
    });
    setShowEditFormationModal(true);
  };

  const handleUpdateFormation = async () => {
    try {
      await axios.put(`${API}/formations/${editingItem.id}`, editFormation);
      toast({
        title: "Formation mise à jour",
        description: "Les modifications ont été sauvegardées",
        variant: "success"
      });
      setShowEditFormationModal(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la formation",
        variant: "destructive"
      });
    }
  };

  const handleCreateFormation = async () => {
    if (!newFormation.nom) {
      toast({
        title: "Champs requis",
        description: "Le nom de la formation est obligatoire",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.post(`${API}/formations`, newFormation);
      toast({
        title: "Formation créée",
        description: "La nouvelle formation a été ajoutée avec succès",
        variant: "success"
      });
      setShowCreateFormationModal(false);
      resetNewFormation();
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la formation",
        variant: "destructive"
      });
    }
  };

  const resetNewFormation = () => {
    setNewFormation({
      nom: '',
      description: '',
      duree_heures: 8,
      validite_mois: 12,
      obligatoire: false
    });
  };

  const handleDeleteFormation = async (formationId) => {
    if (!window.confirm("Supprimer cette formation ?")) return;
    
    try {
      await axios.delete(`${API}/formations/${formationId}`);
      toast({
        title: "Formation supprimée",
        description: "La formation a été supprimée avec succès",
        variant: "success"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la formation",
        variant: "destructive"
      });
    }
  };

  const handleJourChange = (jour) => {
    const updatedJours = editForm.jours_application.includes(jour)
      ? editForm.jours_application.filter(j => j !== jour)
      : [...editForm.jours_application, jour];
    
    setEditForm({...editForm, jours_application: updatedJours});
  };

  const handleSettingChange = (setting, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    toast({
      title: "Paramètre mis à jour",
      description: "La configuration a été sauvegardée",
      variant: "success"
    });
  };

  const validatePassword = (password) => {
    if (password.length < 8) return false;
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*+\-?()]/.test(password);
    return hasUppercase && hasDigit && hasSpecial;
  };

  const handleCreateUser = async () => {
    if (!newUser.nom || !newUser.prenom || !newUser.email || !newUser.mot_de_passe) {
      toast({
        title: "Champs requis",
        description: "Nom, prénom, email et mot de passe sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (!validatePassword(newUser.mot_de_passe)) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir 8 caractères, une majuscule, un chiffre et un caractère spécial (!@#$%^&*+-?())",
        variant: "destructive"
      });
      return;
    }

    try {
      const userToCreate = {
        ...newUser,
        numero_employe: newUser.numero_employe || `${newUser.role.toUpperCase()}${String(Date.now()).slice(-3)}`,
        date_embauche: newUser.date_embauche || new Date().toLocaleDateString('fr-FR'),
        formations: []
      };

      await axios.post(`${API}/users`, userToCreate);
      toast({
        title: "Compte créé avec succès",
        description: "Un email de bienvenue a été envoyé avec les informations de connexion",
        variant: "success"
      });
      setShowCreateUserModal(false);
      resetNewUser();
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Impossible de créer le compte",
        variant: "destructive"
      });
    }
  };

  const handleEditAccess = (user) => {
    setEditingUser(user);
    setUserAccess({
      role: user.role,
      statut: user.statut
    });
    setShowEditAccessModal(true);
  };

  const handleUpdateAccess = async () => {
    try {
      await axios.put(`${API}/users/${editingUser.id}/access?role=${userAccess.role}&statut=${userAccess.statut}`);
      toast({
        title: "Accès modifié",
        description: "Les permissions de l'utilisateur ont été mises à jour",
        variant: "success"
      });
      setShowEditAccessModal(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'accès",
        variant: "destructive"
      });
    }
  };

  const handleRevokeUser = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir révoquer définitivement le compte de ${userName} ?\n\nCette action supprimera :\n- Le compte utilisateur\n- Toutes ses disponibilités\n- Ses assignations\n- Ses demandes de remplacement\n\nCette action est IRRÉVERSIBLE.`)) {
      return;
    }

    try {
      await axios.delete(`${API}/users/${userId}/revoke`);
      toast({
        title: "Compte révoqué",
        description: "Le compte et toutes les données associées ont été supprimés définitivement",
        variant: "success"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de révoquer le compte",
        variant: "destructive"
      });
    }
  };

  const resetNewUser = () => {
    setNewUser({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      contact_urgence: '',
      grade: 'Pompier',
      type_emploi: 'temps_plein',
      role: 'employe',
      numero_employe: '',
      date_embauche: '',
      mot_de_passe: 'motdepasse123'
    });
  };

  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h1>Accès refusé</h1>
        <p>Cette section est réservée aux administrateurs.</p>
      </div>
    );
  }

  if (loading) return <div className="loading" data-testid="parametres-loading">Chargement...</div>;

  return (
    <div className="parametres">
      <div className="parametres-header">
        <div>
          <h1 data-testid="parametres-title">Paramètres du système</h1>
          <p>Configuration complète de ProFireManager</p>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'types-garde' ? 'active' : ''}`}
          onClick={() => setActiveTab('types-garde')}
          data-testid="tab-types-garde"
        >
          🚒 Types de Gardes
        </button>
        <button
          className={`tab-button ${activeTab === 'competences' ? 'active' : ''}`}
          onClick={() => setActiveTab('competences')}
          data-testid="tab-competences"
        >
          📜 Compétences
        </button>
        <button
          className={`tab-button ${activeTab === 'attribution' ? 'active' : ''}`}
          onClick={() => setActiveTab('attribution')}
          data-testid="tab-attribution"
        >
          ⚙️ Attribution Auto
        </button>
        <button
          className={`tab-button ${activeTab === 'comptes' ? 'active' : ''}`}
          onClick={() => setActiveTab('comptes')}
          data-testid="tab-comptes"
        >
          👥 Comptes d'Accès
        </button>
        <button
          className={`tab-button ${activeTab === 'remplacements' ? 'active' : ''}`}
          onClick={() => setActiveTab('remplacements')}
          data-testid="tab-remplacements"
        >
          🔄 Paramètres Remplacements
        </button>
      </div>

      {/* Contenu conditionnel selon l'onglet actif */}
      <div className="tab-content">
        {activeTab === 'types-garde' && (
          <div className="types-garde-tab">
            <div className="tab-header">
              <div>
                <h2>Paramétrage des gardes</h2>
                <p>Créez et modifiez les types de gardes disponibles</p>
              </div>
              <Button 
                variant="default" 
                onClick={() => setShowCreateTypeModal(true)}
                data-testid="create-type-garde-btn"
              >
                + Nouveau Type de Garde
              </Button>
            </div>

            <div className="types-garde-grid">
              {typesGarde.map(type => (
                <div key={type.id} className="type-garde-card" data-testid={`type-garde-${type.id}`}>
                  <div className="type-garde-header">
                    <div className="type-info">
                      <h3>{type.nom}</h3>
                      <div className="type-schedule">
                        <span>⏰ {type.heure_debut} - {type.heure_fin}</span>
                        <span>👥 {type.personnel_requis} personnel</span>
                        {type.officier_obligatoire && <span>🎖️ Officier requis</span>}
                      </div>
                    </div>
                    <div className="type-actions">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleEditType(type)}
                        data-testid={`edit-type-${type.id}`}
                      >
                        ✏️ Modifier
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="danger" 
                        onClick={() => handleDeleteType(type.id)}
                        data-testid={`delete-type-${type.id}`}
                      >
                        🗑️ Supprimer
                      </Button>
                    </div>
                  </div>
                  <div className="type-details">
                    <span className="color-preview" style={{ backgroundColor: type.couleur }}></span>
                    <span>Couleur: {type.couleur}</span>
                    {type.jours_application?.length > 0 && (
                      <div className="type-days">
                        <span>📅 Jours: {type.jours_application.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'competences' && (
          <div className="competences-tab">
            <div className="tab-header">
              <div>
                <h2>Gestion des compétences</h2>
                <p>Définissez les compétences et certifications requises pour évaluer le niveau des employés</p>
              </div>
              <Button 
                variant="default" 
                onClick={() => setShowCreateFormationModal(true)}
                data-testid="create-competence-btn"
              >
                + Nouvelle Compétence
              </Button>
            </div>

            <div className="competences-grid">
              {formations.map(formation => (
                <div key={formation.id} className="competence-card" data-testid={`competence-${formation.id}`}>
                  <div className="competence-header">
                    <div className="competence-info">
                      <h3>{formation.nom}</h3>
                      <p className="competence-description">{formation.description}</p>
                      <div className="competence-details">
                        <span className="detail-item">⏱️ {formation.duree_heures}h de formation</span>
                        <span className="detail-item">
                          📅 Validité: {formation.validite_mois === 0 ? 'Pas de renouvellement' : `${formation.validite_mois} mois`}
                        </span>
                        {formation.obligatoire && (
                          <span className="detail-item obligatoire-indicator">⚠️ COMPÉTENCE OBLIGATOIRE</span>
                        )}
                      </div>
                    </div>
                    <div className="competence-actions">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleEditFormation(formation)}
                        data-testid={`edit-competence-${formation.id}`}
                        title="Modifier cette compétence"
                      >
                        ✏️ Modifier
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="danger" 
                        onClick={() => handleDeleteFormation(formation.id)}
                        data-testid={`delete-competence-${formation.id}`}
                        title="Supprimer cette compétence"
                      >
                        🗑️ Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'attribution' && (
          <div className="attribution-tab">
            <div className="tab-header">
              <div>
                <h2>Attribution Automatique Intelligente</h2>
                <p>Configurez l'algorithme d'assignation automatique en 5 niveaux de priorité</p>
              </div>
              <Button variant="outline" data-testid="test-attribution-btn">
                🧪 Tester l'algorithme
              </Button>
            </div>
            
            <div className="attribution-content">
              <div className="priority-section">
                <h3>Algorithme d'assignation automatique (5 niveaux)</h3>
                <div className="priority-list">
                  <div className="priority-item">
                    <span className="priority-number">1</span>
                    <div className="priority-content">
                      <span className="priority-text">Assignations manuelles privilégiées</span>
                      <span className="priority-description">Les assignations manuelles ne sont jamais écrasées</span>
                    </div>
                    <span className="priority-status active">✅ Actif</span>
                  </div>
                  
                  <div className="priority-item">
                    <span className="priority-number">2</span>
                    <div className="priority-content">
                      <span className="priority-text">Respecter les disponibilités des employés</span>
                      <span className="priority-description">Vérification des créneaux de disponibilité (temps partiel uniquement)</span>
                    </div>
                    <span className="priority-status active">✅ Actif</span>
                  </div>
                  
                  <div className="priority-item">
                    <span className="priority-number">3</span>
                    <div className="priority-content">
                      <span className="priority-text">Respecter les grades requis</span>
                      <span className="priority-description">Assignation d'un officier si configuré pour le type de garde</span>
                    </div>
                    <span className="priority-status active">✅ Actif</span>
                  </div>
                  
                  <div className="priority-item">
                    <span className="priority-number">4</span>
                    <div className="priority-content">
                      <span className="priority-text">Rotation équitable du personnel</span>
                      <span className="priority-description">Favorise les employés avec moins d'heures dans le mois</span>
                    </div>
                    <span className="priority-status active">✅ Actif - Nouvelle version</span>
                  </div>
                  
                  <div className="priority-item">
                    <span className="priority-number">5</span>
                    <div className="priority-content">
                      <span className="priority-text">Ancienneté des employés</span>
                      <span className="priority-description">En cas d'égalité d'heures, privilégier l'ancienneté (date d'embauche)</span>
                    </div>
                    <span className="priority-status active">✅ Actif - Nouveau niveau</span>
                  </div>
                </div>
              </div>

              <div className="algorithm-details">
                <h3>Détails de l'algorithme</h3>
                <div className="details-grid">
                  <div className="detail-card">
                    <h4>🎯 Cible</h4>
                    <p>Employés temps partiel uniquement</p>
                    <small>Les temps plein ont un planning fixe manuel</small>
                  </div>
                  
                  <div className="detail-card">
                    <h4>📊 Calcul équitable</h4>
                    <p>Cumul mensuel des heures</p>
                    <small>Favorise ceux avec moins d'heures assignées</small>
                  </div>
                  
                  <div className="detail-card">
                    <h4>📅 Ancienneté</h4>
                    <p>Basée sur la date d'embauche</p>
                    <small>Plus ancien = priorité en cas d'égalité</small>
                  </div>
                  
                  <div className="detail-card">
                    <h4>⚙️ Déclenchement</h4>
                    <p>Bouton "Attribution auto" dans Planning</p>
                    <small>Processus sur demande pour préserver le manuel</small>
                  </div>
                </div>
              </div>

              <div className="settings-toggles">
                <h3>Paramètres généraux</h3>
                <div className="toggle-list">
                  <label className="setting-toggle">
                    <div className="toggle-info">
                      <span>Attribution automatique activée</span>
                      <small>Active l'algorithme intelligent à 5 niveaux</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.attribution_auto}
                      onChange={(e) => handleSettingChange('attribution_auto', e.target.checked)}
                    />
                  </label>
                  
                  <label className="setting-toggle">
                    <div className="toggle-info">
                      <span>Notification par email</span>
                      <small>Envoie un email pour chaque nouvelle assignation</small>
                    </div>
                    <input
                      type="checkbox"
                      checked={systemSettings.notification_email}
                      onChange={(e) => handleSettingChange('notification_email', e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'comptes' && (
          <div className="comptes-tab">
            <div className="tab-header">
              <div>
                <h2>Comptes d'Accès</h2>
                <p>Gestion des utilisateurs et permissions</p>
              </div>
              <Button 
                variant="default" 
                onClick={() => setShowCreateUserModal(true)}
                data-testid="create-user-account-btn"
              >
                + Nouveau Compte
              </Button>
            </div>
            
            <div className="accounts-stats">
              <div className="account-stat">
                <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
                <span className="stat-label">Administrateurs</span>
              </div>
              <div className="account-stat">
                <span className="stat-number">{users.filter(u => u.role === 'superviseur').length}</span>
                <span className="stat-label">Superviseurs</span>
              </div>
              <div className="account-stat">
                <span className="stat-number">{users.filter(u => u.role === 'employe').length}</span>
                <span className="stat-label">Employés</span>
              </div>
            </div>

            {/* Liste des utilisateurs existants */}
            <div className="existing-users-section">
              <h3>Utilisateurs existants</h3>
              <div className="users-list">
                {users.map(user => (
                  <div key={user.id} className="user-access-card" data-testid={`user-access-${user.id}`}>
                    <div className="user-access-info">
                      <div className="user-avatar">
                        <span className="avatar-icon">👤</span>
                      </div>
                      <div className="user-details">
                        <h4>{user.prenom} {user.nom}</h4>
                        <p className="user-email">{user.email}</p>
                        <div className="user-badges">
                          <span className={`role-badge ${user.role}`}>
                            {user.role === 'admin' ? '👑 Administrateur' : 
                             user.role === 'superviseur' ? '🎖️ Superviseur' : 
                             '👤 Employé'}
                          </span>
                          <span className="grade-badge">{user.grade}</span>
                          <span className="employment-badge">{user.type_emploi === 'temps_plein' ? 'Temps plein' : 'Temps partiel'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="user-access-actions">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditAccess(user)}
                        data-testid={`modify-access-${user.id}`}
                      >
                        ✏️ Modifier accès
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="danger" 
                        onClick={() => handleRevokeUser(user.id, `${user.prenom} ${user.nom}`)}
                        data-testid={`revoke-access-${user.id}`}
                      >
                        🚫 Révoquer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="role-descriptions">
              <div className="role-card admin">
                <h3>👑 Administrateur</h3>
                <ul>
                  <li>Accès complet à tous les modules</li>
                  <li>Gestion du personnel et comptes</li>
                  <li>Configuration système</li>
                </ul>
              </div>
              <div className="role-card superviseur">
                <h3>🎖️ Superviseur</h3>
                <ul>
                  <li>Gestion du personnel</li>
                  <li>Validation du planning</li>
                  <li>Approbation des remplacements</li>
                </ul>
              </div>
              <div className="role-card employe">
                <h3>👤 Employé</h3>
                <ul>
                  <li>Consultation du planning</li>
                  <li>Demandes de remplacement</li>
                  <li>Gestion des disponibilités</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'remplacements' && (
          <div className="remplacements-tab">
            <div className="tab-header">
              <div>
                <h2>Paramètres des Remplacements</h2>
                <p>Configuration des règles de validation et délais de traitement automatique</p>
              </div>
            </div>
            
            <div className="replacement-settings-compact">
              {/* Nouveau : Mode de notification */}
              <div className="settings-row">
                <div className="settings-column">
                  <h4 className="compact-title">🔔 Mode de notification</h4>
                  <p style={{fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem'}}>
                    Définissez comment les employés sont contactés pour les remplacements
                  </p>
                  
                  <div className="setting-inputs-compact">
                    <div className="input-group-compact">
                      <Label>Stratégie de contact</Label>
                      <select 
                        className="form-select"
                        value={systemSettings.mode_notification || 'simultane'}
                        onChange={(e) => handleSettingChange('mode_notification', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          border: '1px solid #d1d5db',
                          fontSize: '0.95rem'
                        }}
                      >
                        <option value="simultane">⚡ Simultané - Tous en même temps</option>
                        <option value="sequentiel">🎯 Séquentiel - Un par un</option>
                        <option value="groupe_sequentiel">🔀 Groupes séquentiels - Par groupes</option>
                      </select>
                      <small style={{display: 'block', marginTop: '0.5rem', color: '#6b7280'}}>
                        {systemSettings.mode_notification === 'simultane' && 'Tous les employés disponibles reçoivent la notification immédiatement'}
                        {systemSettings.mode_notification === 'sequentiel' && 'Les employés sont contactés un par un selon la priorité'}
                        {systemSettings.mode_notification === 'groupe_sequentiel' && 'Les employés sont contactés par groupes successifs'}
                      </small>
                    </div>

                    {systemSettings.mode_notification === 'groupe_sequentiel' && (
                      <div className="input-group-compact">
                        <Label>Taille du groupe</Label>
                        <div className="input-with-reset">
                          <Input
                            type="number"
                            min="2"
                            max="10"
                            value={systemSettings.taille_groupe || 3}
                            onChange={(e) => handleSettingChange('taille_groupe', parseInt(e.target.value))}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSettingChange('taille_groupe', 3)}
                          >
                            🔄
                          </Button>
                        </div>
                        <small style={{display: 'block', marginTop: '0.5rem', color: '#6b7280'}}>
                          Nombre d'employés notifiés simultanément dans chaque groupe
                        </small>
                      </div>
                    )}

                    {(systemSettings.mode_notification === 'sequentiel' || systemSettings.mode_notification === 'groupe_sequentiel') && (
                      <div className="input-group-compact">
                        <Label>Délai d'attente (minutes)</Label>
                        <div className="input-with-reset">
                          <Input
                            type="number"
                            min="30"
                            max="4320"
                            step="30"
                            value={systemSettings.delai_attente_minutes || 1440}
                            onChange={(e) => handleSettingChange('delai_attente_minutes', parseInt(e.target.value))}
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSettingChange('delai_attente_minutes', 1440)}
                          >
                            🔄
                          </Button>
                        </div>
                        <small style={{display: 'block', marginTop: '0.5rem', color: '#6b7280'}}>
                          Temps d'attente avant de passer au suivant (en cas de non-réponse). Par défaut: 24h (1440 min)
                        </small>
                      </div>
                    )}

                    <div className="input-group-compact">
                      <Label>Max personnes à contacter</Label>
                      <div className="input-with-reset">
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={systemSettings.max_personnes_contact || 5}
                          onChange={(e) => handleSettingChange('max_personnes_contact', parseInt(e.target.value))}
                        />
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSettingChange('max_personnes_contact', 5)}
                        >
                          🔄
                        </Button>
                      </div>
                      <small style={{display: 'block', marginTop: '0.5rem', color: '#6b7280'}}>
                        Nombre maximum d'employés à contacter pour un remplacement
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-column">
                  <h4 className="compact-title">Règles de validation automatique</h4>
                  <div className="validation-rules-compact">
                    <label className="validation-rule-compact">
                      <input
                        type="checkbox"
                        checked={systemSettings.privilegier_disponibles}
                        onChange={(e) => handleSettingChange('privilegier_disponibles', e.target.checked)}
                        data-testid="toggle-privilegier-disponibles"
                      />
                      <div className="rule-content-compact">
                        <span className="rule-title">Privilégier les personnes disponibles</span>
                        <span className="rule-description">Priorité aux employés ayant renseigné leur disponibilité</span>
                      </div>
                    </label>
                    
                    <label className="validation-rule-compact">
                      <input
                        type="checkbox"
                        checked={systemSettings.grade_egal}
                        onChange={(e) => handleSettingChange('grade_egal', e.target.checked)}
                        data-testid="toggle-grade-egal"
                      />
                      <div className="rule-content-compact">
                        <span className="rule-title">Grade équivalent ou supérieur</span>
                        <span className="rule-description">Accepter uniquement les grades égaux ou supérieurs</span>
                      </div>
                    </label>
                    
                    <label className="validation-rule-compact">
                      <input
                        type="checkbox"
                        checked={systemSettings.competences_egales}
                        onChange={(e) => handleSettingChange('competences_egales', e.target.checked)}
                        data-testid="toggle-competences-egales"
                      />
                      <div className="rule-content-compact">
                        <span className="rule-title">Compétences équivalentes</span>
                        <span className="rule-description">Mêmes compétences que le demandeur</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="validation-summary-compact">
                <h4>Résumé de la validation</h4>
                <div className="summary-content">
                  <p>Processus appliqué lors d'une demande de remplacement :</p>
                  <div className="validation-steps">
                    <span className={`step ${systemSettings.privilegier_disponibles ? 'active' : 'inactive'}`}>
                      {systemSettings.privilegier_disponibles ? '✅' : '❌'} Disponibilité
                    </span>
                    <span className={`step ${systemSettings.grade_egal ? 'active' : 'inactive'}`}>
                      {systemSettings.grade_egal ? '✅' : '❌'} Grade
                    </span>
                    <span className={`step ${systemSettings.competences_egales ? 'active' : 'inactive'}`}>
                      {systemSettings.competences_egales ? '✅' : '❌'} Compétences
                    </span>
                  </div>
                  <p className="summary-result">
                    <strong>Mode :</strong> {
                      systemSettings.mode_notification === 'simultane' ? '⚡ Simultané' :
                      systemSettings.mode_notification === 'sequentiel' ? '🎯 Séquentiel' :
                      '🔀 Groupes séquentiels'
                    } | <strong>Contacts :</strong> max {systemSettings.max_personnes_contact || 5} personnes
                    {(systemSettings.mode_notification === 'sequentiel' || systemSettings.mode_notification === 'groupe_sequentiel') && 
                      ` | Délai : ${systemSettings.delai_attente_minutes || 1440} min`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals Section */}
      {/* Modal d'édition type de garde avec jours */}
      {false && showEditTypeModal && editingItem && (
        <div className="modal-overlay" onClick={() => setShowEditTypeModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="edit-type-modal">
            <div className="modal-header">
              <h3>Modifier: {editingItem.nom}</h3>
              <Button variant="ghost" onClick={() => setShowEditTypeModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <Label>Nom du type de garde</Label>
                  <Input
                    value={editForm.nom}
                    onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                    data-testid="edit-nom-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Heure de début</Label>
                    <Input
                      type="time"
                      value={editForm.heure_debut}
                      onChange={(e) => setEditForm({...editForm, heure_debut: e.target.value})}
                      data-testid="edit-debut-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Heure de fin</Label>
                    <Input
                      type="time"
                      value={editForm.heure_fin}
                      onChange={(e) => setEditForm({...editForm, heure_fin: e.target.value})}
                      data-testid="edit-fin-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Personnel requis</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editForm.personnel_requis}
                      onChange={(e) => setEditForm({...editForm, personnel_requis: parseInt(e.target.value)})}
                      data-testid="edit-personnel-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Durée (heures)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editForm.duree_heures}
                      onChange={(e) => setEditForm({...editForm, duree_heures: parseInt(e.target.value)})}
                      data-testid="edit-duree-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <Label>Couleur</Label>
                  <Input
                    type="color"
                    value={editForm.couleur}
                    onChange={(e) => setEditForm({...editForm, couleur: e.target.value})}
                    data-testid="edit-couleur-input"
                  />
                </div>

                <div className="form-field">
                  <Label>Jours d'application (récurrence)</Label>
                  <div className="days-selection">
                    {joursOptions.map(jour => (
                      <label key={jour.value} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={editForm.jours_application.includes(jour.value)}
                          onChange={() => handleJourChange(jour.value)}
                          data-testid={`edit-day-${jour.value}`}
                        />
                        <span>{jour.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={editForm.officier_obligatoire}
                      onChange={(e) => setEditForm({...editForm, officier_obligatoire: e.target.checked})}
                    />
                    <span>Officier obligatoire pour cette garde</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowEditTypeModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleUpdateType} data-testid="save-changes-btn">
                  Sauvegarder les modifications
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition compétence */}
      {false && showEditFormationModal && editingItem && (
        <div className="modal-overlay" onClick={() => setShowEditFormationModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="edit-competence-modal">
            <div className="modal-header">
              <h3>Modifier la compétence: {editingItem.nom}</h3>
              <Button variant="ghost" onClick={() => setShowEditFormationModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <Label>Nom de la compétence *</Label>
                  <Input
                    value={editFormation.nom}
                    onChange={(e) => setEditFormation({...editFormation, nom: e.target.value})}
                    data-testid="edit-competence-nom"
                  />
                </div>

                <div className="form-field">
                  <Label>Description de la compétence</Label>
                  <textarea
                    value={editFormation.description}
                    onChange={(e) => setEditFormation({...editFormation, description: e.target.value})}
                    className="form-textarea"
                    rows="3"
                    placeholder="Décrivez cette compétence et ses exigences..."
                    data-testid="edit-competence-description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Durée de formation requise (heures)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editFormation.duree_heures}
                      onChange={(e) => setEditFormation({...editFormation, duree_heures: parseInt(e.target.value)})}
                      data-testid="edit-competence-duree"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Renouvellement de la compétence</Label>
                    <select
                      value={editFormation.validite_mois}
                      onChange={(e) => setEditFormation({...editFormation, validite_mois: parseInt(e.target.value)})}
                      className="form-select"
                      data-testid="edit-competence-validite"
                    >
                      <option value="0">Pas de renouvellement</option>
                      <option value="6">6 mois</option>
                      <option value="12">12 mois</option>
                      <option value="24">24 mois</option>
                      <option value="36">36 mois</option>
                      <option value="60">60 mois</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={editFormation.obligatoire}
                      onChange={(e) => setEditFormation({...editFormation, obligatoire: e.target.checked})}
                    />
                    <span>Compétence obligatoire pour tous les pompiers</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowEditFormationModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleUpdateFormation} data-testid="save-competence-btn">
                  Sauvegarder la compétence
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création d'utilisateur */}
      {false && showCreateUserModal && (
        <div className="modal-overlay" onClick={() => setShowCreateUserModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="create-user-modal">
            <div className="modal-header">
              <h3>Nouveau compte d'accès</h3>
              <Button variant="ghost" onClick={() => setShowCreateUserModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-row">
                  <div className="form-field">
                    <Label>Prénom *</Label>
                    <Input
                      value={newUser.prenom}
                      onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                      data-testid="new-user-prenom"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Nom *</Label>
                    <Input
                      value={newUser.nom}
                      onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                      data-testid="new-user-nom"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    data-testid="new-user-email"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Grade</Label>
                    <select
                      value={newUser.grade}
                      onChange={(e) => setNewUser({...newUser, grade: e.target.value})}
                      className="form-select"
                      data-testid="new-user-grade"
                    >
                      <option value="Pompier">Pompier</option>
                      <option value="Lieutenant">Lieutenant</option>
                      <option value="Capitaine">Capitaine</option>
                      <option value="Directeur">Directeur</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <Label>Rôle *</Label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      className="form-select"
                      data-testid="new-user-role"
                    >
                      <option value="employe">👤 Employé</option>
                      <option value="superviseur">🎖️ Superviseur</option>
                      <option value="admin">👑 Administrateur</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Type d'emploi</Label>
                    <select
                      value={newUser.type_emploi}
                      onChange={(e) => setNewUser({...newUser, type_emploi: e.target.value})}
                      className="form-select"
                      data-testid="new-user-employment"
                    >
                      <option value="temps_plein">Temps plein</option>
                      <option value="temps_partiel">Temps partiel</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <Label>Mot de passe temporaire *</Label>
                    <Input
                      type="password"
                      value={newUser.mot_de_passe}
                      onChange={(e) => setNewUser({...newUser, mot_de_passe: e.target.value})}
                      data-testid="new-user-password"
                      placeholder="Minimum 8 caractères complexes"
                    />
                    <div className="password-requirements">
                      <small className="requirement-title">Exigences du mot de passe :</small>
                      <div className="requirements-list">
                        <span className={`requirement ${newUser.mot_de_passe.length >= 8 ? 'valid' : 'invalid'}`}>
                          {newUser.mot_de_passe.length >= 8 ? '✅' : '❌'} 8 caractères minimum
                        </span>
                        <span className={`requirement ${/[A-Z]/.test(newUser.mot_de_passe) ? 'valid' : 'invalid'}`}>
                          {/[A-Z]/.test(newUser.mot_de_passe) ? '✅' : '❌'} 1 majuscule
                        </span>
                        <span className={`requirement ${/\d/.test(newUser.mot_de_passe) ? 'valid' : 'invalid'}`}>
                          {/\d/.test(newUser.mot_de_passe) ? '✅' : '❌'} 1 chiffre
                        </span>
                        <span className={`requirement ${/[!@#$%^&*+\-?()]/.test(newUser.mot_de_passe) ? 'valid' : 'invalid'}`}>
                          {/[!@#$%^&*+\-?()]/.test(newUser.mot_de_passe) ? '✅' : '❌'} 1 caractère spécial (!@#$%^&*+-?())
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCreateUserModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleCreateUser} data-testid="create-account-btn">
                  Créer le compte
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de type de garde */}
      {showCreateTypeModal && (
        <div className="modal-overlay" onClick={() => setShowCreateTypeModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="create-type-modal">
            <div className="modal-header">
              <h3>Nouveau type de garde</h3>
              <Button variant="ghost" onClick={() => setShowCreateTypeModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <Label>Nom du type de garde *</Label>
                  <Input
                    value={createForm.nom}
                    onChange={(e) => setCreateForm({...createForm, nom: e.target.value})}
                    placeholder="Ex: Garde Interne Nuit"
                    data-testid="create-nom-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Heure de début *</Label>
                    <Input
                      type="time"
                      value={createForm.heure_debut}
                      onChange={(e) => setCreateForm({...createForm, heure_debut: e.target.value})}
                      data-testid="create-debut-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Heure de fin *</Label>
                    <Input
                      type="time"
                      value={createForm.heure_fin}
                      onChange={(e) => setCreateForm({...createForm, heure_fin: e.target.value})}
                      data-testid="create-fin-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Personnel requis</Label>
                    <Input
                      type="number"
                      min="1"
                      value={createForm.personnel_requis}
                      onChange={(e) => setCreateForm({...createForm, personnel_requis: parseInt(e.target.value)})}
                      data-testid="create-personnel-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Couleur</Label>
                    <Input
                      type="color"
                      value={createForm.couleur}
                      onChange={(e) => setCreateForm({...createForm, couleur: e.target.value})}
                      data-testid="create-couleur-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <Label>Jours d'application (récurrence)</Label>
                  <div className="days-selection">
                    {joursOptions.map(jour => (
                      <label key={jour.value} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={createForm.jours_application.includes(jour.value)}
                          onChange={() => handleCreateJourChange(jour.value)}
                          data-testid={`create-day-${jour.value}`}
                        />
                        <span>{jour.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={createForm.officier_obligatoire}
                      onChange={(e) => setCreateForm({...createForm, officier_obligatoire: e.target.checked})}
                    />
                    <span>Officier obligatoire pour cette garde</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCreateTypeModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleCreateType} data-testid="create-type-btn">
                  Créer le type de garde
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création de compétence */}
      {showCreateFormationModal && (
        <div className="modal-overlay" onClick={() => setShowCreateFormationModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="create-competence-modal">
            <div className="modal-header">
              <h3>Nouvelle compétence</h3>
              <Button variant="ghost" onClick={() => setShowCreateFormationModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <Label>Nom de la compétence *</Label>
                  <Input
                    value={newFormation.nom}
                    onChange={(e) => setNewFormation({...newFormation, nom: e.target.value})}
                    placeholder="Ex: Conduite d'échelle, Sauvetage aquatique"
                    data-testid="create-competence-nom"
                  />
                </div>

                <div className="form-field">
                  <Label>Description de la compétence</Label>
                  <textarea
                    value={newFormation.description}
                    onChange={(e) => setNewFormation({...newFormation, description: e.target.value})}
                    placeholder="Décrivez cette compétence, les exigences et les critères d'évaluation..."
                    rows="3"
                    className="form-textarea"
                    data-testid="create-competence-description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Durée de formation requise (heures)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newFormation.duree_heures}
                      onChange={(e) => setNewFormation({...newFormation, duree_heures: parseInt(e.target.value)})}
                      data-testid="create-competence-duree"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Renouvellement de la compétence</Label>
                    <select
                      value={newFormation.validite_mois}
                      onChange={(e) => setNewFormation({...newFormation, validite_mois: parseInt(e.target.value)})}
                      className="form-select"
                      data-testid="create-competence-validite"
                    >
                      <option value="0">Pas de renouvellement</option>
                      <option value="6">6 mois</option>
                      <option value="12">12 mois</option>
                      <option value="24">24 mois</option>
                      <option value="36">36 mois</option>
                      <option value="60">60 mois</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={newFormation.obligatoire}
                      onChange={(e) => setNewFormation({...newFormation, obligatoire: e.target.checked})}
                    />
                    <span>Compétence obligatoire pour tous les pompiers</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCreateFormationModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleCreateFormation} data-testid="create-competence-submit-btn">
                  Créer la compétence
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification d'accès utilisateur */}
      {showEditAccessModal && editingUser && (
        <div className="modal-overlay" onClick={() => setShowEditAccessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="edit-access-modal">
            <div className="modal-header">
              <h3>Modifier l'accès - {editingUser.prenom} {editingUser.nom}</h3>
              <Button variant="ghost" onClick={() => setShowEditAccessModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="current-user-info">
                <div className="user-summary">
                  <div className="user-avatar">
                    <span className="avatar-icon">👤</span>
                  </div>
                  <div className="user-details">
                    <h4>{editingUser.prenom} {editingUser.nom}</h4>
                    <p>{editingUser.email}</p>
                    <p>Grade: {editingUser.grade} | {editingUser.type_emploi === 'temps_plein' ? 'Temps plein' : 'Temps partiel'}</p>
                  </div>
                </div>
              </div>

              <div className="access-form">
                <div className="form-field">
                  <Label>Rôle/Autorisation</Label>
                  <select
                    value={userAccess.role}
                    onChange={(e) => setUserAccess({...userAccess, role: e.target.value})}
                    className="form-select"
                    data-testid="edit-user-role-select"
                  >
                    <option value="employe">👤 Employé</option>
                    <option value="superviseur">🎖️ Superviseur</option>
                    <option value="admin">👑 Administrateur</option>
                  </select>
                  <small className="field-description">
                    Détermine les modules et fonctionnalités accessibles
                  </small>
                </div>

                <div className="form-field">
                  <Label>Statut du compte</Label>
                  <select
                    value={userAccess.statut}
                    onChange={(e) => setUserAccess({...userAccess, statut: e.target.value})}
                    className="form-select"
                    data-testid="edit-user-status-select"
                  >
                    <option value="Actif">✅ Actif - Peut se connecter</option>
                    <option value="Inactif">❌ Inactif - Connexion bloquée</option>
                  </select>
                  <small className="field-description">
                    Un compte inactif ne peut plus se connecter temporairement
                  </small>
                </div>

                <div className="permissions-preview">
                  <h4>Aperçu des permissions :</h4>
                  <div className="permissions-list">
                    {userAccess.role === 'admin' && (
                      <div className="permission-group">
                        <span className="permission-title">👑 Administrateur</span>
                        <ul>
                          <li>Accès complet à tous les modules</li>
                          <li>Gestion du personnel et création de comptes</li>
                          <li>Configuration système et paramètres</li>
                        </ul>
                      </div>
                    )}
                    {userAccess.role === 'superviseur' && (
                      <div className="permission-group">
                        <span className="permission-title">🎖️ Superviseur</span>
                        <ul>
                          <li>Gestion du personnel (consultation)</li>
                          <li>Validation du planning et remplacements</li>
                          <li>Accès aux formations</li>
                        </ul>
                      </div>
                    )}
                    {userAccess.role === 'employe' && (
                      <div className="permission-group">
                        <span className="permission-title">👤 Employé</span>
                        <ul>
                          <li>Consultation du planning personnel</li>
                          <li>Demandes de remplacement</li>
                          <li>Gestion des disponibilités</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowEditAccessModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleUpdateAccess} data-testid="save-access-btn">
                  Sauvegarder les modifications
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parametres;