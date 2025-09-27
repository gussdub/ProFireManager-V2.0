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
    try {
      setLoading(true);
      
      // Fetch types garde
      const typesResponse = await axios.get(`${API}/types-garde`);
      setTypesGarde(typesResponse.data);
      
      // Fetch formations
      const formationsResponse = await axios.get(`${API}/formations`);
      setFormations(formationsResponse.data);
      
      // Fetch users
      const usersResponse = await axios.get(`${API}/users`);
      setUsers(usersResponse.data);
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
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

      {showEditModal && editingType && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="edit-type-modal">
            <div className="modal-header">
              <h3>Modifier: {editingType.nom}</h3>
              <Button variant="ghost" onClick={() => setShowEditModal(false)}>✕</Button>
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
                <Button variant="outline" onClick={() => setShowEditModal(false)}>Annuler</Button>
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