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
  
  // Modals states
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showEditTypeModal, setShowEditTypeModal] = useState(false);
  const [showCreateFormationModal, setShowCreateFormationModal] = useState(false);
  const [showEditFormationModal, setShowEditFormationModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Form states
  const [newTypeGarde, setNewTypeGarde] = useState({
    nom: '',
    heure_debut: '08:00',
    heure_fin: '16:00',
    personnel_requis: 1,
    duree_heures: 8,
    couleur: '#3B82F6',
    jours_application: [],
    officier_obligatoire: false
  });
  
  const [newFormation, setNewFormation] = useState({
    nom: '',
    description: '',
    duree_heures: 8,
    validite_mois: 12,
    obligatoire: false
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
    if (user?.role !== 'admin') return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typesResponse, formationsResponse] = await Promise.all([
        axios.get(`${API}/types-garde`),
        axios.get(`${API}/formations`)
      ]);
      setTypesGarde(typesResponse.data);
      setFormations(formationsResponse.data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTypeGarde = async () => {
    if (!newTypeGarde.nom || !newTypeGarde.heure_debut || !newTypeGarde.heure_fin) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.post(`${API}/types-garde`, newTypeGarde);
      toast({
        title: "Type de garde créé",
        description: "Le nouveau type de garde a été ajouté avec succès",
        variant: "success"
      });
      setShowCreateTypeModal(false);
      resetNewTypeGarde();
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le type de garde",
        variant: "destructive"
      });
    }
  };

  const handleEditTypeGarde = (type) => {
    setEditingItem(type);
    setNewTypeGarde({
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

  const handleUpdateTypeGarde = async () => {
    if (!newTypeGarde.nom || !newTypeGarde.heure_debut || !newTypeGarde.heure_fin) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.put(`${API}/types-garde/${editingItem.id}`, newTypeGarde);
      toast({
        title: "Type de garde mis à jour",
        description: "Les modifications ont été sauvegardées avec succès",
        variant: "success"
      });
      setShowEditTypeModal(false);
      setEditingItem(null);
      resetNewTypeGarde();
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le type de garde",
        variant: "destructive"
      });
    }
  };

  const handleDeleteType = async (typeId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce type de garde ? Cette action supprimera aussi toutes les assignations associées.")) return;
    
    try {
      await axios.delete(`${API}/types-garde/${typeId}`);
      toast({
        title: "Type supprimé",
        description: "Le type de garde a été supprimé avec succès",
        variant: "success"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Impossible de supprimer le type de garde",
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

  const handleEditFormation = (formation) => {
    setEditingItem(formation);
    setNewFormation({
      nom: formation.nom,
      description: formation.description,
      duree_heures: formation.duree_heures,
      validite_mois: formation.validite_mois,
      obligatoire: formation.obligatoire
    });
    setShowEditFormationModal(true);
  };

  const handleUpdateFormation = async () => {
    if (!newFormation.nom) {
      toast({
        title: "Champs requis",
        description: "Le nom de la formation est obligatoire",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.put(`${API}/formations/${editingItem.id}`, newFormation);
      toast({
        title: "Formation mise à jour",
        description: "Les modifications ont été sauvegardées avec succès",
        variant: "success"
      });
      setShowEditFormationModal(false);
      setEditingItem(null);
      resetNewFormation();
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la formation",
        variant: "destructive"
      });
    }
  };

  const resetNewTypeGarde = () => {
    setNewTypeGarde({
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

  const resetNewFormation = () => {
    setNewFormation({
      nom: '',
      description: '',
      duree_heures: 8,
      validite_mois: 12,
      obligatoire: false
    });
  };

  const handleJourChange = (jour) => {
    const updatedJours = newTypeGarde.jours_application.includes(jour)
      ? newTypeGarde.jours_application.filter(j => j !== jour)
      : [...newTypeGarde.jours_application, jour];
    
    setNewTypeGarde({...newTypeGarde, jours_application: updatedJours});
  };

  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h1>Accès refusé</h1>
        <p>Cette section est réservée aux administrateurs.</p>
      </div>
    );
  }

  if (loading) return <div className="loading" data-testid="parametres-loading">Chargement des paramètres...</div>;

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
      </div>

      {/* Tab Content */}
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
                        <span className="schedule-time">⏰ {type.heure_debut} - {type.heure_fin}</span>
                        <span className="personnel-required">👥 {type.personnel_requis} personnel requis</span>
                        <span className="duration">⌛ {type.duree_heures}h</span>
                        {type.officier_obligatoire && <span className="officer-req">🎖️ Officier obligatoire</span>}
                      </div>
                    </div>
                    <div className="type-actions">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleEditTypeGarde(type)}
                        data-testid={`edit-type-${type.id}`}
                      >
                        ✏️
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="danger" 
                        onClick={() => handleDeleteType(type.id)}
                        data-testid={`delete-type-${type.id}`}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>

                  <div className="type-details">
                    <div className="type-color">
                      <span className="color-preview" style={{ backgroundColor: type.couleur }}></span>
                      <span>Couleur: {type.couleur}</span>
                    </div>
                    
                    {type.jours_application?.length > 0 && (
                      <div className="type-days">
                        <span>📅 Jours: {type.jours_application.map(j => j.charAt(0).toUpperCase() + j.slice(1)).join(', ')}</span>
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
                <h2>Paramétrage des formations</h2>
                <p>Gérez le catalogue des formations disponibles</p>
              </div>
              <Button 
                variant="default" 
                onClick={() => setShowCreateFormationModal(true)}
                data-testid="create-formation-btn"
              >
                + Nouvelle Formation
              </Button>
            </div>

            <div className="formations-admin-grid">
              {formations.map(formation => (
                <div key={formation.id} className="formation-admin-card" data-testid={`formation-admin-${formation.id}`}>
                  <div className="formation-admin-header">
                    <div>
                      <h3>{formation.nom}</h3>
                      {formation.obligatoire && (
                        <span className="obligatoire-badge">OBLIGATOIRE</span>
                      )}
                    </div>
                    <div className="formation-actions">
                      <Button 
                        variant="ghost" 
                        onClick={() => handleEditFormation(formation)}
                        data-testid={`edit-formation-${formation.id}`}
                      >
                        ✏️
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="danger" 
                        onClick={() => {
                          if (window.confirm("Supprimer cette formation ?")) {
                            // handleDeleteFormation(formation.id);
                          }
                        }}
                        data-testid={`delete-formation-${formation.id}`}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                  
                  <div className="formation-admin-details">
                    <p className="formation-description">{formation.description}</p>
                    <div className="formation-meta">
                      <span>⏱️ {formation.duree_heures}h</span>
                      <span>📅 Valide {formation.validite_mois} mois</span>
                      <span>📊 Type: {formation.obligatoire ? 'Obligatoire' : 'Optionnelle'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Type Modal */}
      {showEditTypeModal && editingItem && (
        <div className="modal-overlay" onClick={() => setShowEditTypeModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="edit-type-modal">
            <div className="modal-header">
              <h3>Modifier le type de garde</h3>
              <Button variant="ghost" onClick={() => setShowEditTypeModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <Label>Nom du type de garde *</Label>
                  <Input
                    value={newTypeGarde.nom}
                    onChange={(e) => setNewTypeGarde({...newTypeGarde, nom: e.target.value})}
                    data-testid="edit-type-nom-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Heure de début *</Label>
                    <Input
                      type="time"
                      value={newTypeGarde.heure_debut}
                      onChange={(e) => setNewTypeGarde({...newTypeGarde, heure_debut: e.target.value})}
                      data-testid="edit-type-heure-debut-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Heure de fin *</Label>
                    <Input
                      type="time"
                      value={newTypeGarde.heure_fin}
                      onChange={(e) => setNewTypeGarde({...newTypeGarde, heure_fin: e.target.value})}
                      data-testid="edit-type-heure-fin-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Personnel requis</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newTypeGarde.personnel_requis}
                      onChange={(e) => setNewTypeGarde({...newTypeGarde, personnel_requis: parseInt(e.target.value)})}
                      data-testid="edit-type-personnel-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Couleur d'affichage</Label>
                    <Input
                      type="color"
                      value={newTypeGarde.couleur}
                      onChange={(e) => setNewTypeGarde({...newTypeGarde, couleur: e.target.value})}
                      data-testid="edit-type-couleur-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <Label>Jours d'application</Label>
                  <div className="days-selection">
                    {joursOptions.map(jour => (
                      <label key={jour.value} className="day-checkbox">
                        <input
                          type="checkbox"
                          checked={newTypeGarde.jours_application.includes(jour.value)}
                          onChange={() => handleJourChange(jour.value)}
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
                      checked={newTypeGarde.officier_obligatoire}
                      onChange={(e) => setNewTypeGarde({...newTypeGarde, officier_obligatoire: e.target.checked})}
                    />
                    <span>Officier obligatoire pour cette garde</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowEditTypeModal(false)}>
                  Annuler
                </Button>
                <Button variant="default" onClick={handleUpdateTypeGarde} data-testid="update-type-garde-btn">
                  Mettre à jour
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Formation Modal */}
      {showEditFormationModal && editingItem && (
        <div className="modal-overlay" onClick={() => setShowEditFormationModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="edit-formation-modal">
            <div className="modal-header">
              <h3>Modifier la formation</h3>
              <Button variant="ghost" onClick={() => setShowEditFormationModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-field">
                  <Label>Nom de la formation *</Label>
                  <Input
                    value={newFormation.nom}
                    onChange={(e) => setNewFormation({...newFormation, nom: e.target.value})}
                    data-testid="edit-formation-nom-input"
                  />
                </div>

                <div className="form-field">
                  <Label>Description</Label>
                  <textarea
                    value={newFormation.description}
                    onChange={(e) => setNewFormation({...newFormation, description: e.target.value})}
                    placeholder="Description détaillée de la formation..."
                    rows="3"
                    className="form-textarea"
                    data-testid="edit-formation-description-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label>Durée (heures)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newFormation.duree_heures}
                      onChange={(e) => setNewFormation({...newFormation, duree_heures: parseInt(e.target.value)})}
                      data-testid="edit-formation-duree-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label>Validité (mois)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={newFormation.validite_mois}
                      onChange={(e) => setNewFormation({...newFormation, validite_mois: parseInt(e.target.value)})}
                      data-testid="edit-formation-validite-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="setting-checkbox">
                    <input
                      type="checkbox"
                      checked={newFormation.obligatoire}
                      onChange={(e) => setNewFormation({...newFormation, obligatoire: e.target.checked})}
                    />
                    <span>Formation obligatoire</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowEditFormationModal(false)}>
                  Annuler
                </Button>
                <Button variant="default" onClick={handleUpdateFormation} data-testid="update-formation-btn">
                  Mettre à jour
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