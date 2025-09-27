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
  const [showEditTypeModal, setShowEditTypeModal] = useState(false);
  const [showEditFormationModal, setShowEditFormationModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({
    nom: '',
    heure_debut: '',
    heure_fin: '',
    personnel_requis: 1,
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

  const [systemSettings, setSystemSettings] = useState({
    attribution_auto: true,
    notification_email: true,
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

  const handleEditType = (type) => {
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

  const handleUpdateType = async () => {
    try {
      await axios.put(`${API}/types-garde/${editingItem.id}`, editForm);
      toast({
        title: "Type mis à jour",
        description: "Les modifications ont été sauvegardées",
        variant: "success"
      });
      setShowEditTypeModal(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour",
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
                onClick={() => alert('Création en cours de développement')}
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

        {activeTab === 'formations' && (
          <div className="formations-tab">
            <div className="tab-header">
              <div>
                <h2>Gestion des formations</h2>
                <p>Configurez les formations obligatoires et optionnelles</p>
              </div>
              <Button 
                variant="default" 
                onClick={() => alert('Création formation en développement')}
                data-testid="create-formation-btn"
              >
                + Nouvelle Formation
              </Button>
            </div>

            <div className="formations-grid">
              {formations.map(formation => (
                <div key={formation.id} className="formation-card" data-testid={`formation-admin-${formation.id}`}>
                  <div className="formation-header">
                    <div className="formation-info">
                      <h3>{formation.nom}</h3>
                      <p>{formation.description}</p>
                      <div className="formation-details">
                        <span>⏱️ {formation.duree_heures}h</span>
                        <span>📅 Validité: {formation.validite_mois} mois</span>
                        {formation.obligatoire && <span className="obligatoire">⚠️ OBLIGATOIRE</span>}
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
              <h2>Attribution Automatique</h2>
              <p>Paramètres d'attribution intelligente</p>
            </div>
            <div className="attribution-content">
              <h3>Ordre de priorité (système)</h3>
              <div className="priority-list">
                <div className="priority-item">
                  <span className="priority-number">1</span>
                  <span>Assignations manuelles privilégiées ✅</span>
                </div>
                <div className="priority-item">
                  <span className="priority-number">2</span>
                  <span>Respecter les disponibilités ✅</span>
                </div>
                <div className="priority-item">
                  <span className="priority-number">3</span>
                  <span>Respecter les grades ✅</span>
                </div>
                <div className="priority-item">
                  <span className="priority-number">4</span>
                  <span>Rotation équitable ⚙️ En développement</span>
                </div>
              </div>

              <div className="settings-toggles">
                <h3>Paramètres généraux</h3>
                <label className="setting-toggle">
                  <span>Attribution automatique activée</span>
                  <input
                    type="checkbox"
                    checked={systemSettings.attribution_auto}
                    onChange={(e) => handleSettingChange('attribution_auto', e.target.checked)}
                  />
                </label>
                <label className="setting-toggle">
                  <span>Notification par email</span>
                  <input
                    type="checkbox"
                    checked={systemSettings.notification_email}
                    onChange={(e) => handleSettingChange('notification_email', e.target.checked)}
                  />
                </label>
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
                      <Button variant="ghost" size="sm" data-testid={`modify-access-${user.id}`}>
                        ✏️ Modifier accès
                      </Button>
                      <Button variant="ghost" size="sm" className="danger" data-testid={`revoke-access-${user.id}`}>
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
              <h2>Paramètres Remplacements</h2>
              <p>Configuration des règles de validation</p>
            </div>
            <div className="replacement-settings">
              <div className="setting-group">
                <h3>Délais et limites</h3>
                <div className="setting-inputs">
                  <label>
                    <span>Délai de réponse (heures)</span>
                    <Input
                      type="number"
                      value={systemSettings.delai_reponse}
                      onChange={(e) => handleSettingChange('delai_reponse', parseInt(e.target.value))}
                    />
                  </label>
                  <label>
                    <span>Max personnes à contacter</span>
                    <Input
                      type="number"
                      value={systemSettings.max_personnes_contact}
                      onChange={(e) => handleSettingChange('max_personnes_contact', parseInt(e.target.value))}
                    />
                  </label>
                </div>
              </div>
              
              <div className="setting-group">
                <h3>Règles de validation</h3>
                <label className="setting-toggle">
                  <span>Grade équivalent obligatoire</span>
                  <input
                    type="checkbox"
                    checked={systemSettings.grade_equivalent}
                    onChange={(e) => handleSettingChange('grade_equivalent', e.target.checked)}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'édition type de garde avec jours */}
      {showEditTypeModal && editingItem && (
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

      {/* Modal d'édition formation */}
      {showEditFormationModal && editingItem && (
        <div className="modal-overlay" onClick={() => setShowEditFormationModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="edit-formation-modal">
            <div className="modal-header">
              <h3>Modifier: {editingItem.nom}</h3>
              <Button variant="ghost" onClick={() => setShowEditFormationModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <Label>Nom de la formation</Label>
                  <Input
                    value={editFormation.nom}
                    onChange={(e) => setEditFormation({...editFormation, nom: e.target.value})}
                    data-testid="edit-formation-nom"
                  />
                </div>

                <div className="form-field">
                  <Label>Description</Label>
                  <textarea
                    value={editFormation.description}
                    onChange={(e) => setEditFormation({...editFormation, description: e.target.value})}
                    className="form-textarea"
                    rows="3"
                    data-testid="edit-formation-description"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Durée (heures)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editFormation.duree_heures}
                      onChange={(e) => setEditFormation({...editFormation, duree_heures: parseInt(e.target.value)})}
                      data-testid="edit-formation-duree"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Validité (mois)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editFormation.validite_mois}
                      onChange={(e) => setEditFormation({...editFormation, validite_mois: parseInt(e.target.value)})}
                      data-testid="edit-formation-validite"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={editFormation.obligatoire}
                      onChange={(e) => setEditFormation({...editFormation, obligatoire: e.target.checked})}
                    />
                    <span>Formation obligatoire</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowEditFormationModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleUpdateFormation} data-testid="save-formation-btn">
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