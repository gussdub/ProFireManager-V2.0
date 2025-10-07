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
  
  const [systemSettings, setSystemSettings] = useState({
    attribution_auto: true,
    notification_email: true,
    max_personnes_contact: 5,
    grade_equivalent: true,
    privilegier_disponibles: true,
    grade_egal: true,
    competences_egales: true
  });

  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === 'admin') {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h1>Accès refusé</h1>
        <p>Cette section est réservée aux administrateurs.</p>
      </div>
    );
  }

  if (loading) return <div className="loading">Chargement...</div>;

  return (
    <div className="parametres">
      <div className="parametres-header">
        <div>
          <h1>Paramètres du système</h1>
          <p>Configuration complète de ProFireManager</p>
        </div>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'remplacements' ? 'active' : ''}`}
          onClick={() => setActiveTab('remplacements')}
        >
          🔄 Paramètres Remplacements
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'remplacements' && (
          <div className="remplacements-tab">
            <div className="tab-header">
              <div>
                <h2>Paramètres des Remplacements</h2>
                <p>Configuration des règles de validation et délais de traitement automatique</p>
              </div>
            </div>
            
            <div className="replacement-settings-compact">
              <div className="settings-row">
                <div className="settings-column">
                  <h4>🔔 Mode de notification</h4>
                  <p>Définissez comment les employés sont contactés pour les remplacements</p>
                  
                  <div className="setting-inputs-compact">
                    <div className="input-group-compact">
                      <Label>Stratégie de contact</Label>
                      <select 
                        className="form-select"
                        value={systemSettings.mode_notification || 'simultane'}
                        onChange={(e) => console.log('change')}
                      >
                        <option value="simultane">⚡ Simultané - Tous en même temps</option>
                        <option value="sequentiel">🎯 Séquentiel - Un par un</option>
                        <option value="groupe_sequentiel">🔀 Groupes séquentiels - Par groupes</option>
                      </select>
                    </div>

                    <div className="input-group-compact">
                      <Label>Délai d'attente (minutes)</Label>
                      <Input
                        type="number"
                        min="30"
                        max="4320"
                        step="30"
                        value={systemSettings.delai_attente_minutes || 1440}
                        onChange={(e) => console.log('change')}
                      />
                      <small>Temps d'attente avant de passer au suivant (en cas de non-réponse). Par défaut: 24h (1440 min)</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Parametres;