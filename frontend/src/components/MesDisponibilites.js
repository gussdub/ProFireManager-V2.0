import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { useToast } from "../hooks/use-toast";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MesDisponibilites = ({ user }) => {
  const [userDisponibilites, setUserDisponibilites] = useState([]);
  const [typesGarde, setTypesGarde] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [pendingConfigurations, setPendingConfigurations] = useState([]);
  const [availabilityConfig, setAvailabilityConfig] = useState({
    type_garde_id: '',
    heure_debut: '08:00',
    heure_fin: '16:00',
    statut: 'disponible'
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchDisponibilites = async () => {
      try {
        const [dispoResponse, typesResponse] = await Promise.all([
          axios.get(`${API}/disponibilites/${user.id}`),
          axios.get(`${API}/types-garde`)
        ]);
        setUserDisponibilites(dispoResponse.data);
        setTypesGarde(typesResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des disponibilités:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && user?.type_emploi === 'temps_partiel') {
      fetchDisponibilites();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const getTypeGardeName = (typeGardeId) => {
    if (!typeGardeId) return 'Tous types';
    const typeGarde = typesGarde.find(t => t.id === typeGardeId);
    return typeGarde ? typeGarde.nom : 'Type non spécifié';
  };

  const getColorByTypeGarde = (typeGardeId) => {
    if (!typeGardeId) return '#10B981';
    const typeGarde = typesGarde.find(t => t.id === typeGardeId);
    return typeGarde ? typeGarde.couleur : '#10B981';
  };

  const getAvailableDates = () => {
    return userDisponibilites
      .filter(d => d.statut === 'disponible')
      .map(d => new Date(d.date));
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dispo = userDisponibilites.find(d => d.date === dateStr);
    
    if (dispo) {
      setSelectedDateDetails({
        date: date,
        disponibilite: dispo,
        typeGardeName: getTypeGardeName(dispo.type_garde_id),
        couleur: getColorByTypeGarde(dispo.type_garde_id)
      });
    } else {
      setSelectedDateDetails(null);
    }
  };

  const handleTypeGardeChange = (typeGardeId) => {
    const selectedType = typesGarde.find(t => t.id === typeGardeId);
    
    if (selectedType) {
      setAvailabilityConfig({
        ...availabilityConfig,
        type_garde_id: typeGardeId,
        heure_debut: selectedType.heure_debut,
        heure_fin: selectedType.heure_fin
      });
    } else {
      setAvailabilityConfig({
        ...availabilityConfig,
        type_garde_id: typeGardeId
      });
    }
  };

  const handleAddConfiguration = () => {
    if (selectedDates.length === 0) {
      toast({
        title: "Aucune date sélectionnée",
        description: "Veuillez sélectionner au moins une date",
        variant: "destructive"
      });
      return;
    }

    const selectedType = typesGarde.find(t => t.id === availabilityConfig.type_garde_id);
    const newConfig = {
      id: Date.now(),
      type_garde_id: availabilityConfig.type_garde_id,
      type_garde_name: selectedType ? selectedType.nom : 'Tous les types',
      couleur: selectedType ? selectedType.couleur : '#10B981',
      heure_debut: selectedType ? selectedType.heure_debut : availabilityConfig.heure_debut,
      heure_fin: selectedType ? selectedType.heure_fin : availabilityConfig.heure_fin,
      statut: availabilityConfig.statut,
      dates: [...selectedDates]
    };

    setPendingConfigurations([...pendingConfigurations, newConfig]);
    setSelectedDates([]);
    
    toast({
      title: "Configuration ajoutée",
      description: `${newConfig.dates.length} jour(s) pour ${newConfig.type_garde_name}`,
      variant: "success"
    });
  };

  const handleRemoveConfiguration = (configId) => {
    setPendingConfigurations(prev => prev.filter(c => c.id !== configId));
  };

  const handleSaveAllConfigurations = async () => {
    if (pendingConfigurations.length === 0) {
      toast({
        title: "Aucune configuration",
        description: "Veuillez ajouter au moins une configuration",
        variant: "destructive"
      });
      return;
    }

    try {
      // Combiner existantes + nouvelles (pas remplacer)
      const existingDispos = userDisponibilites.map(d => ({
        user_id: user.id,
        date: d.date,
        type_garde_id: d.type_garde_id || null,
        heure_debut: d.heure_debut,
        heure_fin: d.heure_fin,
        statut: d.statut
      }));

      const newDispos = pendingConfigurations.flatMap(config => 
        config.dates.map(date => ({
          user_id: user.id,
          date: date.toISOString().split('T')[0],
          type_garde_id: config.type_garde_id || null,
          heure_debut: config.heure_debut,
          heure_fin: config.heure_fin,
          statut: config.statut
        }))
      );

      const allDisponibilites = [...existingDispos, ...newDispos];

      await axios.put(`${API}/disponibilites/${user.id}`, allDisponibilites);
      
      toast({
        title: "Disponibilités sauvegardées",
        description: `${newDispos.length} nouvelles disponibilités ajoutées (${allDisponibilites.length} total)`,
        variant: "success"
      });
      
      setShowCalendarModal(false);
      setPendingConfigurations([]);
      
      // Reload
      const dispoResponse = await axios.get(`${API}/disponibilites/${user.id}`);
      setUserDisponibilites(dispoResponse.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder",
        variant: "destructive"
      });
    }
  };

  if (user?.type_emploi !== 'temps_partiel') {
    return (
      <div className="access-denied">
        <h1>Module réservé aux employés temps partiel</h1>
        <p>Ce module permet aux employés à temps partiel de gérer leurs disponibilités.</p>
      </div>
    );
  }

  if (loading) return <div className="loading" data-testid="disponibilites-loading">Chargement...</div>;

  return (
    <div className="mes-disponibilites">
      <div className="disponibilites-header">
        <div>
          <h1 data-testid="disponibilites-title">Mes disponibilités</h1>
          <p>Gérez vos créneaux de disponibilité pour les différents types de garde</p>
        </div>
        <Button 
          variant="default" 
          onClick={() => setShowCalendarModal(true)}
          data-testid="configure-availability-btn"
        >
          📅 Configurer mes disponibilités
        </Button>
      </div>

      {/* Configuration modal avec système multi-ajout */}
      {showCalendarModal && (
        <div className="modal-overlay" onClick={() => setShowCalendarModal(false)}>
          <div className="modal-content extra-large-modal" onClick={(e) => e.stopPropagation()} data-testid="availability-config-modal">
            <div className="modal-header">
              <h3>📅 Configurer mes disponibilités</h3>
              <Button variant="ghost" onClick={() => setShowCalendarModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="multi-config-layout">
                {/* Section de configuration */}
                <div className="config-panel">
                  <div className="config-section">
                    <h4>🚒 Type de garde</h4>
                    <select
                      value={availabilityConfig.type_garde_id}
                      onChange={(e) => handleTypeGardeChange(e.target.value)}
                      className="form-select"
                      data-testid="availability-type-garde-select"
                    >
                      <option value="">Tous les types de garde</option>
                      {typesGarde.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.nom} ({type.heure_debut} - {type.heure_fin})
                        </option>
                      ))}
                    </select>
                  </div>

                  {!availabilityConfig.type_garde_id && (
                    <div className="config-section">
                      <h4>⏰ Horaires personnalisés</h4>
                      <div className="time-config-compact">
                        <Input 
                          type="time" 
                          value={availabilityConfig.heure_debut}
                          onChange={(e) => setAvailabilityConfig({...availabilityConfig, heure_debut: e.target.value})}
                        />
                        <span>à</span>
                        <Input 
                          type="time" 
                          value={availabilityConfig.heure_fin}
                          onChange={(e) => setAvailabilityConfig({...availabilityConfig, heure_fin: e.target.value})}
                        />
                      </div>
                    </div>
                  )}

                  {availabilityConfig.type_garde_id && (
                    <div className="config-section">
                      <h4>⏰ Horaires automatiques</h4>
                      <div className="auto-hours-display">
                        {(() => {
                          const type = typesGarde.find(t => t.id === availabilityConfig.type_garde_id);
                          return type ? `${type.heure_debut} - ${type.heure_fin}` : 'Non défini';
                        })()}
                      </div>
                    </div>
                  )}

                  <div className="config-section">
                    <h4>📅 Sélection des dates</h4>
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={setSelectedDates}
                      className="config-calendar"
                      disabled={(date) => date < new Date().setHours(0,0,0,0)}
                    />
                    <div className="selection-info">
                      {selectedDates?.length || 0} date(s) sélectionnée(s)
                    </div>
                  </div>

                  <div className="config-actions">
                    <Button 
                      variant="outline" 
                      onClick={handleAddConfiguration}
                      disabled={selectedDates.length === 0}
                      data-testid="add-config-btn"
                    >
                      ➕ Ajouter cette configuration
                    </Button>
                  </div>
                </div>

                {/* Panel des configurations en attente */}
                <div className="pending-panel">
                  <h4>📋 Configurations en attente</h4>
                  {pendingConfigurations.length > 0 ? (
                    <div className="pending-list">
                      {pendingConfigurations.map(config => (
                        <div key={config.id} className="pending-item">
                          <div className="pending-info">
                            <span 
                              className="pending-type" 
                              style={{ color: config.couleur }}
                            >
                              {config.type_garde_name}
                            </span>
                            <span className="pending-dates">
                              {config.dates.length} jour(s) | {config.heure_debut}-{config.heure_fin}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveConfiguration(config.id)}
                            className="remove-config"
                          >
                            🗑️
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-pending">
                      <p>Aucune configuration en attente</p>
                      <small>Configurez un type de garde et des dates, puis cliquez "Ajouter"</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCalendarModal(false)}>
                  Annuler
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleSaveAllConfigurations}
                  disabled={pendingConfigurations.length === 0}
                  data-testid="save-all-configs-btn"
                >
                  💾 Sauvegarder toutes les configurations ({pendingConfigurations.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reste du composant... */}
    </div>
  );
};

export default MesDisponibilites;