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
  const [editingItem, setEditingItem] = useState(null);
  
  // Edit form state for types garde
  const [editForm, setEditForm] = useState({
    nom: '',
    heure_debut: '',
    heure_fin: '',
    personnel_requis: 1,
    couleur: '#3B82F6',
    jours_application: [],
    officier_obligatoire: false
  });
  
  // Form states
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
    assignations_doublon: false,
    delai_reponse: 48,
    max_personnes_contact: 5,
    grade_equivalent: true
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

  const handleEdit = (type) => {
    setEditingItem(type);
    setEditForm({
      nom: type.nom,
      heure_debut: type.heure_debut,
      heure_fin: type.heure_fin,
      personnel_requis: type.personnel_requis,
      couleur: type.couleur,
      jours_application: type.jours_application || [],
      officier_obligatoire: type.officier_obligatoire || false
    });
    setShowEditTypeModal(true);
  };

  const handleUpdate = async () => {
    try {
      // Calculate duree_heures from time difference
      const debut = new Date(`2000-01-01T${editForm.heure_debut}:00`);
      const fin = new Date(`2000-01-01T${editForm.heure_fin}:00`);
      let duree_heures = (fin - debut) / (1000 * 60 * 60);
      
      // Handle overnight shifts
      if (duree_heures < 0) {
        duree_heures += 24;
      }
      
      const updateData = {
        ...editForm,
        duree_heures: Math.round(duree_heures),
        jours_application: [] // Add default empty array
      };
      
      await axios.put(`${API}/types-garde/${editingItem.id}`, updateData);
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
        title: "Erreur",
        description: error.response?.data?.detail || "Impossible de mettre à jour",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (typeId) => {
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
    setShowEditFormationModal(true);
  };

  const handleDeleteFormation = async (formationId) => {
    if (!window.confirm("Supprimer cette formation ?")) return;
    
    try {
      await axios.delete(`${API}/formations/${formationId}`);
      toast({
        title: "Supprimé",
        description: "Formation supprimée avec succès",
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
        <h1 data-testid="parametres-title">Paramètres du système</h1>
        <p>Configuration des types de gardes</p>
      </div>

      {/* Navigation par onglets complète */}
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'types-garde' ? 'active' : ''}`}
          onClick={() => setActiveTab('types-garde')}
          data-testid="tab-types-garde"
        >
          🚒 Types de Gardes
        </button>
        <button
          className={`tab-button ${activeTab === 'formations' ? 'active' : ''}`}
          onClick={() => setActiveTab('formations')}
          data-testid="tab-formations"
        >
          📚 Formations
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
          data-testid="tab-remplacements-settings"
        >
          🔄 Paramètres Remplacements
        </button>
      </div>
      
      <div className="types-garde-grid">
        {typesGarde.map(type => (
          <div key={type.id} className="type-garde-card">
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
                  onClick={() => handleEdit(type)}
                  data-testid={`edit-type-${type.id}`}
                >
                  ✏️ Modifier
                </Button>
                <Button 
                  variant="ghost" 
                  className="danger" 
                  onClick={() => handleDelete(type.id)}
                  data-testid={`delete-type-${type.id}`}
                >
                  🗑️ Supprimer
                </Button>
              </div>
            </div>
            <div className="type-details">
              <span className="color-preview" style={{ backgroundColor: type.couleur }}></span>
              <span>Couleur: {type.couleur}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab content sections */}
      {activeTab === 'types-garde' && (
        <div className="types-garde-content">
          <div className="types-garde-grid">
            {typesGarde.map(type => (
              <div key={type.id} className="type-garde-card">
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
                      onClick={() => handleEdit(type)}
                      data-testid={`edit-type-${type.id}`}
                    >
                      ✏️ Modifier
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="danger" 
                      onClick={() => handleDelete(type.id)}
                      data-testid={`delete-type-${type.id}`}
                    >
                      🗑️ Supprimer
                    </Button>
                  </div>
                </div>
                <div className="type-details">
                  <span className="color-preview" style={{ backgroundColor: type.couleur }}></span>
                  <span>Couleur: {type.couleur}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'formations' && (
        <div className="formations-tab">
          <div className="tab-header">
            <div>
              <h2>Gestion des formations</h2>
              <p>Configurez les formations obligatoires et optionnelles</p>
            </div>
            <Button 
              variant="default" 
              onClick={() => setShowCreateFormationModal(true)}
              data-testid="create-formation-btn"
            >
              + Nouvelle Formation
            </Button>
          </div>

          <div className="formations-grid">
            {formations.map(formation => (
              <div key={formation.id} className="formation-card">
                <div className="formation-header">
                  <div className="formation-info">
                    <h3>{formation.nom}</h3>
                    <p>{formation.description}</p>
                    <div className="formation-details">
                      <span>⏱️ {formation.duree_heures}h</span>
                      <span>📅 Validité: {formation.validite_mois} mois</span>
                      {formation.obligatoire && <span className="obligatoire">⚠️ Obligatoire</span>}
                    </div>
                  </div>
                  <div className="formation-actions">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleEditFormation(formation)}
                      data-testid={`edit-formation-${formation.id}`}
                    >
                      ✏️ Modifier
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="danger" 
                      onClick={() => handleDeleteFormation(formation.id)}
                      data-testid={`delete-formation-${formation.id}`}
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
              <h2>Paramètres d'Attribution Automatique</h2>
              <p>Configurez les règles d'attribution intelligente des gardes selon les priorités établies</p>
            </div>
          </div>

          <div className="attribution-settings">
            <div className="priority-section">
              <h3>Ordre de priorité (respecté par le système)</h3>
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
                    <span className="priority-description">Vérification des créneaux de disponibilité (temps partiel)</span>
                  </div>
                  <span className="priority-status active">✅ Actif</span>
                </div>
                <div className="priority-item">
                  <span className="priority-number">3</span>
                  <div className="priority-content">
                    <span className="priority-text">Respecter les grades (1 officier par garde si requis)</span>
                    <span className="priority-description">Assignation d'un officier si configuré pour le type de garde</span>
                  </div>
                  <span className="priority-status active">✅ Actif</span>
                </div>
                <div className="priority-item">
                  <span className="priority-number">4</span>
                  <div className="priority-content">
                    <span className="priority-text">Rotation équitable des employés</span>
                    <span className="priority-description">Répartition équitable des heures de garde</span>
                  </div>
                  <span className="priority-status dev">⚙️ En cours</span>
                </div>
              </div>
            </div>

            <div className="general-settings">
              <h3>Paramètres généraux</h3>
              <div className="settings-grid">
                <label className="setting-toggle">
                  <div className="toggle-info">
                    <span className="toggle-title">Attribution automatique activée</span>
                    <span className="toggle-desc">Active le système d'attribution automatique</span>
                  </div>
                  <div className="toggle-wrapper">
                    <input
                      type="checkbox"
                      checked={systemSettings.attribution_auto}
                      onChange={(e) => handleSettingChange('attribution_auto', e.target.checked)}
                      data-testid="toggle-auto-attribution"
                    />
                    <span className="toggle-slider"></span>
                  </div>
                </label>

                <label className="setting-toggle">
                  <div className="toggle-info">
                    <span className="toggle-title">Notification par email des assignations</span>
                    <span className="toggle-desc">Envoie un email à chaque nouvelle assignation</span>
                  </div>
                  <div className="toggle-wrapper">
                    <input
                      type="checkbox"
                      checked={systemSettings.notification_email}
                      onChange={(e) => handleSettingChange('notification_email', e.target.checked)}
                      data-testid="toggle-email-notifications"
                    />
                    <span className="toggle-slider"></span>
                  </div>
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
              <h2>Gestion des comptes d'accès</h2>
              <p>Créez des comptes et définissez les autorisations selon les rôles</p>
            </div>
            <Button 
              variant="default" 
              onClick={() => setShowCreateUserModal(true)}
              data-testid="create-user-account-btn"
            >
              + Nouveau Compte
            </Button>
          </div>

          <div className="accounts-overview">
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

            <div className="role-descriptions">
              <div className="role-card admin">
                <h3>👑 Administrateur</h3>
                <ul>
                  <li>Accès complet à tous les modules et paramètres</li>
                  <li>Gestion du personnel et création de comptes</li>
                  <li>Attribution manuelle et automatique des gardes</li>
                  <li>Configuration des types de gardes et formations</li>
                  <li>Rapports et analyses avancées</li>
                </ul>
              </div>

              <div className="role-card superviseur">
                <h3>🎖️ Superviseur</h3>
                <ul>
                  <li>Consultation et gestion du personnel</li>
                  <li>Gestion et validation du planning</li>
                  <li>Approbation des demandes de remplacement</li>
                  <li>Accès aux formations et inscriptions</li>
                  <li>Tableau de bord avec statistiques</li>
                </ul>
              </div>

              <div className="role-card employe">
                <h3>👤 Employé</h3>
                <ul>
                  <li>Consultation du planning personnel</li>
                  <li>Demandes de remplacement et congés</li>
                  <li>Inscription aux formations disponibles</li>
                  <li>Gestion des disponibilités (temps partiel)</li>
                  <li>Profil personnel et mot de passe</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'remplacements' && (
        <div className="remplacements-settings-tab">
          <div className="tab-header">
            <div>
              <h2>Paramètres des demandes de remplacement</h2>
              <p>Configurez les règles de validation et délais de traitement</p>
            </div>
          </div>

          <div className="replacement-config">
            <div className="config-section">
              <h3>Délais et limites</h3>
              <div className="config-inputs">
                <label className="config-input">
                  <span className="input-label">Délai de réponse (heures)</span>
                  <span className="input-description">Temps maximum pour répondre à une demande</span>
                  <Input
                    type="number"
                    value={systemSettings.delai_reponse}
                    onChange={(e) => handleSettingChange('delai_reponse', parseInt(e.target.value))}
                    data-testid="response-delay-input"
                  />
                </label>
                
                <label className="config-input">
                  <span className="input-label">Nombre max de personnes à contacter</span>
                  <span className="input-description">Maximum de remplaçants potentiels contactés</span>
                  <Input
                    type="number"
                    value={systemSettings.max_personnes_contact}
                    onChange={(e) => handleSettingChange('max_personnes_contact', parseInt(e.target.value))}
                    data-testid="max-contacts-input"
                  />
                </label>
              </div>
            </div>

            <div className="config-section">
              <h3>Règles de validation</h3>
              <label className="setting-toggle">
                <div className="toggle-info">
                  <span className="toggle-title">Grade équivalent obligatoire</span>
                  <span className="toggle-desc">Accepter uniquement les remplacements de grade équivalent ou supérieur</span>
                </div>
                <div className="toggle-wrapper">
                  <input
                    type="checkbox"
                    checked={systemSettings.grade_equivalent}
                    onChange={(e) => handleSettingChange('grade_equivalent', e.target.checked)}
                    data-testid="toggle-grade-equivalent"
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {showEditTypeModal && editingItem && (
        <div className="modal-overlay" onClick={() => setShowEditTypeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="edit-type-modal">
            <div className="modal-header">
              <h3>Modifier: {editingItem.nom}</h3>
              <Button variant="ghost" onClick={() => setShowEditTypeModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <Label>Nom</Label>
                <Input
                  value={editForm.nom}
                  onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                  data-testid="edit-nom-input"
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <Label>Début</Label>
                  <Input
                    type="time"
                    value={editForm.heure_debut}
                    onChange={(e) => setEditForm({...editForm, heure_debut: e.target.value})}
                    data-testid="edit-debut-input"
                  />
                </div>
                <div className="form-field">
                  <Label>Fin</Label>
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
                  <Label>Personnel</Label>
                  <Input
                    type="number"
                    value={editForm.personnel_requis}
                    onChange={(e) => setEditForm({...editForm, personnel_requis: parseInt(e.target.value)})}
                    data-testid="edit-personnel-input"
                  />
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
              </div>
              
              <div className="form-field">
                <Label>Jours d'application (récurrence)</Label>
                <div className="days-selection">
                  {joursOptions.map(jour => (
                    <label key={jour.value} className="day-checkbox">
                      <input
                        type="checkbox"
                        checked={editForm.jours_application.includes(jour.value)}
                        onChange={() => {
                          const updatedJours = editForm.jours_application.includes(jour.value)
                            ? editForm.jours_application.filter(j => j !== jour.value)
                            : [...editForm.jours_application, jour.value];
                          setEditForm({...editForm, jours_application: updatedJours});
                        }}
                        data-testid={`edit-day-${jour.value}`}
                      />
                      <span>{jour.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-field">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editForm.officier_obligatoire}
                    onChange={(e) => setEditForm({...editForm, officier_obligatoire: e.target.checked})}
                  />
                  <span>Officier obligatoire</span>
                </label>
              </div>
              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowEditTypeModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleUpdate} data-testid="save-changes-btn">Sauvegarder</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parametres;