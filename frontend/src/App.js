import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { useToast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Auth Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info
      axios.get(`${API}/auth/me`)
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, mot_de_passe) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        mot_de_passe
      });
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Erreur de connexion' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Login Component
const Login = () => {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, motDePasse);
    
    if (!result.success) {
      toast({
        title: "Erreur de connexion",
        description: result.error,
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const loadDemoAccount = (role) => {
    const accounts = {
      admin: { email: 'admin@firemanager.ca', password: 'admin123' },
      superviseur: { email: 'superviseur@firemanager.ca', password: 'superviseur123' },
      employe: { email: 'employe@firemanager.ca', password: 'employe123' },
      partiel: { email: 'partiel@firemanager.ca', password: 'partiel123' }
    };
    
    const account = accounts[role];
    setEmail(account.email);
    setMotDePasse(account.password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo">
            <div className="logo-flame">
              <div className="flame-container">
                <div className="flame-icon"></div>
              </div>
            </div>
            <h1>ProFireManager</h1>
            <p className="version">v2.0 Avancé</p>
          </div>
        </div>
        
        <Card className="login-card">
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email-input"
                />
              </div>
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  required
                  data-testid="login-password-input"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                data-testid="login-submit-btn"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
            
            <div className="demo-accounts">
              <h3>Comptes de démonstration :</h3>
              <div className="demo-buttons">
                <Button variant="outline" onClick={() => loadDemoAccount('admin')} data-testid="demo-admin-btn">
                  Admin (Jean Dupont)
                </Button>
                <Button variant="outline" onClick={() => loadDemoAccount('superviseur')} data-testid="demo-supervisor-btn">
                  Superviseur (Sophie Dubois)
                </Button>
                <Button variant="outline" onClick={() => loadDemoAccount('employe')} data-testid="demo-employee-btn">
                  Employé (Pierre Bernard)
                </Button>
                <Button variant="outline" onClick={() => loadDemoAccount('partiel')} data-testid="demo-parttime-btn">
                  Temps partiel (Claire Garcia)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Sidebar Navigation
const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊', roles: ['admin', 'superviseur', 'employe'] },
    { id: 'personnel', label: 'Personnel', icon: '👥', roles: ['admin', 'superviseur'] },
    { id: 'planning', label: 'Planning', icon: '📅', roles: ['admin', 'superviseur', 'employe'] },
    { id: 'remplacements', label: 'Remplacements', icon: '🔄', roles: ['admin', 'superviseur', 'employe'] },
    { id: 'formations', label: 'Formations', icon: '📚', roles: ['admin', 'superviseur', 'employe'] },
    { id: 'rapports', label: 'Rapports', icon: '📈', roles: ['admin'] },
    { id: 'parametres', label: 'Paramètres', icon: '⚙️', roles: ['admin'] },
    { id: 'monprofil', label: 'Mon profil', icon: '👤', roles: ['admin', 'superviseur', 'employe'] }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-flame">
            <div className="flame-container">
              <div className="flame-icon"></div>
            </div>
          </div>
          <div>
            <h2>ProFireManager</h2>
            <p className="version">v2.0 Avancé</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredMenuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
            data-testid={`nav-${item.id}-btn`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-avatar">
            <span className="user-icon">👤</span>
          </div>
          <div className="user-details">
            <p className="user-name">{user?.prenom} {user?.nom}</p>
            <p className="user-role">{user?.role === 'admin' ? 'Administrateur' : 
                                    user?.role === 'superviseur' ? 'Superviseur' : 'Employé'}</p>
            <p className="user-grade">{user?.grade}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          onClick={logout} 
          className="logout-btn"
          data-testid="logout-btn"
        >
          🚪 Déconnexion
        </Button>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/statistiques`);
        setStats(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading" data-testid="dashboard-loading">Chargement...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 data-testid="dashboard-title">Tableau de bord</h1>
        <p>Bienvenue, {user?.prenom} {user?.nom}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card personnel">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Personnel Actif</h3>
            <p className="stat-number" data-testid="stat-personnel">{stats?.personnel_actif || 0}</p>
            <p className="stat-label">Pompiers en service</p>
          </div>
        </div>

        <div className="stat-card gardes">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Gardes Cette Semaine</h3>
            <p className="stat-number" data-testid="stat-gardes">{stats?.gardes_cette_semaine || 0}</p>
            <p className="stat-label">Assignations planifiées</p>
          </div>
        </div>

        <div className="stat-card formations">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>Formations Planifiées</h3>
            <p className="stat-number" data-testid="stat-formations">{stats?.formations_planifiees || 0}</p>
            <p className="stat-label">Sessions à venir</p>
          </div>
        </div>

        <div className="stat-card couverture">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Taux de Couverture</h3>
            <p className="stat-number" data-testid="stat-couverture">{stats?.taux_couverture || 0}%</p>
            <p className="stat-label">Efficacité du planning</p>
          </div>
        </div>
      </div>

      <div className="activity-section">
        <h2>Activité Récente</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">👤</span>
            <span className="activity-text">Nouveau personnel ajouté</span>
            <span className="activity-time">Il y a 2h</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🔄</span>
            <span className="activity-text">Attribution automatique effectuée</span>
            <span className="activity-time">Il y a 4h</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🎓</span>
            <span className="activity-text">Formation planifiée</span>
            <span className="activity-time">Hier</span>
          </div>
        </div>
      </div>

      <div className="monthly-stats">
        <h2>Statistiques du Mois</h2>
        <div className="monthly-grid">
          <div className="monthly-item">
            <span className="monthly-label">Heures de garde totales</span>
            <span className="monthly-value" data-testid="monthly-hours">{stats?.heures_travaillees || 0}h</span>
          </div>
          <div className="monthly-item">
            <span className="monthly-label">Remplacements effectués</span>
            <span className="monthly-value" data-testid="monthly-replacements">{stats?.remplacements_effectues || 0}</span>
          </div>
          <div className="monthly-item">
            <span className="monthly-label">Formations complétées</span>
            <span className="monthly-value" data-testid="monthly-trainings">12</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Personnel Component
const Personnel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API}/users`);
        setUsers(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement du personnel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getStatusColor = (statut) => {
    return statut === 'Actif' ? '#10B981' : '#EF4444';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'Directeur': '#8B5CF6',
      'Capitaine': '#3B82F6',
      'Lieutenant': '#F59E0B',
      'Pompier': '#10B981'
    };
    return colors[grade] || '#6B7280';
  };

  if (loading) return <div className="loading" data-testid="personnel-loading">Chargement...</div>;

  return (
    <div className="personnel">
      <div className="personnel-header">
        <div>
          <h1 data-testid="personnel-title">Gestion du personnel</h1>
          <p>{users.length} pompier(s) enregistré(s)</p>
        </div>
        <Button className="add-btn" data-testid="add-personnel-btn">
          + Nouveau pompier
        </Button>
      </div>

      <div className="personnel-table">
        <div className="table-header">
          <div className="header-cell">POMPIER</div>
          <div className="header-cell">GRADE / N° EMPLOYÉ</div>
          <div className="header-cell">CONTACT</div>
          <div className="header-cell">STATUT</div>
          <div className="header-cell">TYPE D'EMPLOI</div>
          <div className="header-cell">FORMATIONS</div>
          <div className="header-cell">ACTIONS</div>
        </div>

        {users.map(user => (
          <div key={user.id} className="table-row" data-testid={`user-row-${user.id}`}>
            <div className="user-cell">
              <div className="user-avatar">
                <span className="avatar-icon">👤</span>
              </div>
              <div>
                <p className="user-name">{user.prenom} {user.nom}</p>
                <p className="user-hire-date">Embauché le {user.date_embauche}</p>
              </div>
            </div>

            <div className="grade-cell">
              <span className="grade" style={{ backgroundColor: getGradeColor(user.grade) }}>
                {user.grade}
              </span>
              <p className="employee-id">#{user.numero_employe}</p>
            </div>

            <div className="contact-cell">
              <p className="user-email">{user.email}</p>
              <p className="user-phone">{user.telephone}</p>
            </div>

            <div className="status-cell">
              <span 
                className="status-badge" 
                style={{ backgroundColor: getStatusColor(user.statut) }}
                data-testid={`user-status-${user.id}`}
              >
                {user.statut}
              </span>
            </div>

            <div className="employment-cell">
              <span className={`employment-type ${user.type_emploi}`}>
                {user.type_emploi === 'temps_plein' ? 'Temps plein' : 'Temps partiel'}
              </span>
            </div>

            <div className="formations-cell">
              {user.formations?.map((formation, index) => (
                <span key={index} className="formation-badge">
                  {formation}
                </span>
              ))}
              {user.formations?.length > 0 && (
                <p className="formations-count">+{user.formations.length} autres</p>
              )}
            </div>

            <div className="actions-cell">
              <Button variant="ghost" className="action-btn" data-testid={`view-user-${user.id}`}>👁️</Button>
              <Button variant="ghost" className="action-btn" data-testid={`edit-user-${user.id}`}>✏️</Button>
              <Button variant="ghost" className="action-btn danger" data-testid={`delete-user-${user.id}`}>❌</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Remplacements Component
const Remplacements = () => {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [typesGarde, setTypesGarde] = useState([]);
  const [newDemande, setNewDemande] = useState({
    type_garde_id: '',
    date: '',
    raison: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRemplacements();
    fetchTypesGarde();
  }, []);

  const fetchRemplacements = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/remplacements`);
      setDemandes(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des remplacements:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les demandes de remplacement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTypesGarde = async () => {
    try {
      const response = await axios.get(`${API}/types-garde`);
      setTypesGarde(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des types de garde:', error);
    }
  };

  const handleCreateDemande = async () => {
    if (!newDemande.type_garde_id || !newDemande.date || !newDemande.raison.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.post(`${API}/remplacements`, newDemande);
      toast({
        title: "Demande créée",
        description: "Votre demande de remplacement a été soumise",
        variant: "success"
      });
      setShowCreateModal(false);
      setNewDemande({ type_garde_id: '', date: '', raison: '' });
      fetchRemplacements();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande",
        variant: "destructive"
      });
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_cours': return '#F59E0B';
      case 'approuve': return '#10B981';
      case 'refuse': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'en_cours': return 'En cours';
      case 'approuve': return 'Approuvé';
      case 'refuse': return 'Refusé';
      default: return statut;
    }
  };

  const getTypeGardeName = (typeGardeId) => {
    const typeGarde = typesGarde.find(t => t.id === typeGardeId);
    return typeGarde ? typeGarde.nom : 'Non spécifié';
  };

  if (loading) return <div className="loading" data-testid="replacements-loading">Chargement des remplacements...</div>;

  return (
    <div className="remplacements">
      <div className="remplacements-header">
        <div>
          <h1 data-testid="replacements-title">Gestion des remplacements</h1>
          <p>Demandes de remplacement et validation automatisée</p>
        </div>
        <div className="remplacements-controls">
          <Button 
            variant="default" 
            onClick={() => setShowCreateModal(true)}
            data-testid="create-replacement-btn"
          >
            + Nouvelle demande
          </Button>
          {user.role !== 'employe' && (
            <Button variant="outline" data-testid="validate-replacements-btn">
              Valider les demandes
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="replacement-stats">
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>En cours</h3>
            <p className="stat-number">{demandes.filter(d => d.statut === 'en_cours').length}</p>
            <p className="stat-label">Demandes en attente</p>
          </div>
        </div>

        <div className="stat-card approved">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Approuvées</h3>
            <p className="stat-number">{demandes.filter(d => d.statut === 'approuve').length}</p>
            <p className="stat-label">Ce mois</p>
          </div>
        </div>

        <div className="stat-card refused">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Refusées</h3>
            <p className="stat-number">{demandes.filter(d => d.statut === 'refuse').length}</p>
            <p className="stat-label">Ce mois</p>
          </div>
        </div>

        <div className="stat-card coverage">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Taux de couverture</h3>
            <p className="stat-number">94%</p>
            <p className="stat-label">Remplacements trouvés</p>
          </div>
        </div>
      </div>

      {/* Replacements List */}
      <div className="replacements-list">
        <div className="list-header">
          <h2>Toutes les demandes</h2>
          <div className="filter-controls">
            <Button variant="ghost" size="sm">Toutes</Button>
            <Button variant="ghost" size="sm">En cours</Button>
            <Button variant="ghost" size="sm">Approuvées</Button>
          </div>
        </div>

        <div className="replacements-table">
          <div className="table-header">
            <div className="header-cell">DEMANDEUR</div>
            <div className="header-cell">TYPE DE GARDE</div>
            <div className="header-cell">DATE</div>
            <div className="header-cell">RAISON</div>
            <div className="header-cell">STATUT</div>
            <div className="header-cell">REMPLAÇANT</div>
            <div className="header-cell">ACTIONS</div>
          </div>

          {demandes.map(demande => (
            <div key={demande.id} className="table-row" data-testid={`replacement-row-${demande.id}`}>
              <div className="demandeur-cell">
                <div className="user-avatar">
                  <span className="avatar-icon">👤</span>
                </div>
                <div>
                  <p className="user-name">Demandeur #{demande.demandeur_id?.slice(-4)}</p>
                  <p className="request-date">
                    Demandé le {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="type-garde-cell">
                <span className="type-garde-name">
                  {getTypeGardeName(demande.type_garde_id)}
                </span>
              </div>

              <div className="date-cell">
                <span className="garde-date">
                  {new Date(demande.date).toLocaleDateString('fr-FR')}
                </span>
              </div>

              <div className="raison-cell">
                <p className="raison-text">{demande.raison}</p>
              </div>

              <div className="statut-cell">
                <span 
                  className="statut-badge" 
                  style={{ backgroundColor: getStatutColor(demande.statut) }}
                  data-testid={`status-${demande.id}`}
                >
                  {getStatutLabel(demande.statut)}
                </span>
              </div>

              <div className="remplacant-cell">
                {demande.remplacant_id ? (
                  <span className="remplacant-name">
                    Remplaçant #{demande.remplacant_id?.slice(-4)}
                  </span>
                ) : (
                  <span className="no-remplacant">En recherche...</span>
                )}
              </div>

              <div className="actions-cell">
                <Button variant="ghost" className="action-btn" data-testid={`view-replacement-${demande.id}`}>👁️</Button>
                {user.role !== 'employe' && (
                  <>
                    <Button variant="ghost" className="action-btn" data-testid={`approve-replacement-${demande.id}`}>✅</Button>
                    <Button variant="ghost" className="action-btn danger" data-testid={`reject-replacement-${demande.id}`}>❌</Button>
                  </>
                )}
              </div>
            </div>
          ))}

          {demandes.length === 0 && (
            <div className="empty-state">
              <p>Aucune demande de remplacement</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Replacement Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="create-replacement-modal">
            <div className="modal-header">
              <h3>Nouvelle demande de remplacement</h3>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <Label htmlFor="type-garde">Type de garde</Label>
                <select
                  id="type-garde"
                  value={newDemande.type_garde_id}
                  onChange={(e) => setNewDemande({...newDemande, type_garde_id: e.target.value})}
                  className="form-select"
                  data-testid="select-garde-type"
                >
                  <option value="">Sélectionner un type de garde</option>
                  {typesGarde.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.nom} ({type.heure_debut} - {type.heure_fin})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <Label htmlFor="date">Date de la garde</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDemande.date}
                  onChange={(e) => setNewDemande({...newDemande, date: e.target.value})}
                  data-testid="select-date"
                />
              </div>

              <div className="form-field">
                <Label htmlFor="raison">Raison du remplacement</Label>
                <textarea
                  id="raison"
                  value={newDemande.raison}
                  onChange={(e) => setNewDemande({...newDemande, raison: e.target.value})}
                  placeholder="Expliquez la raison de votre demande de remplacement..."
                  rows="4"
                  className="form-textarea"
                  data-testid="replacement-reason"
                />
              </div>

              <div className="modal-actions">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleCreateDemande}
                  data-testid="submit-replacement-btn"
                >
                  Créer la demande
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const Planning = () => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return monday.toISOString().split('T')[0];
  });
  const [planning, setPlanning] = useState(null);
  const [typesGarde, setTypesGarde] = useState([]);
  const [assignations, setAssignations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const { toast } = useToast();

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeek);
    date.setDate(date.getDate() + i);
    return date;
  });

  useEffect(() => {
    fetchPlanningData();
  }, [currentWeek]);

  const fetchPlanningData = async () => {
    setLoading(true);
    try {
      const [planningRes, typesRes, assignationsRes, usersRes] = await Promise.all([
        axios.get(`${API}/planning/${currentWeek}`),
        axios.get(`${API}/types-garde`),
        axios.get(`${API}/planning/assignations/${currentWeek}`),
        user.role !== 'employe' ? axios.get(`${API}/users`) : Promise.resolve({ data: [] })
      ]);
      
      setPlanning(planningRes.data);
      setTypesGarde(typesRes.data);
      setAssignations(assignationsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement du planning:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le planning",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async (userId, typeGardeId, date) => {
    if (user.role === 'employe') return;

    try {
      await axios.post(`${API}/planning/assignation`, {
        user_id: userId,
        type_garde_id: typeGardeId,
        date: date,
        assignation_type: "manuel"
      });

      toast({
        title: "Attribution réussie",
        description: "L'assignation a été créée avec succès",
        variant: "success"
      });

      fetchPlanningData();
      setShowAssignModal(false);
    } catch (error) {
      toast({
        title: "Erreur d'attribution",
        description: "Impossible de créer l'assignation",
        variant: "destructive"
      });
    }
  };

  const getAssignationForSlot = (date, typeGardeId) => {
    const dateStr = date.toISOString().split('T')[0];
    return assignations.find(a => a.date === dateStr && a.type_garde_id === typeGardeId);
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId);
  };

  const getTypeGardeColor = (typeGarde) => {
    return typeGarde.couleur || '#6B7280';
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate.toISOString().split('T')[0]);
  };

  const openAssignModal = (date, typeGarde) => {
    if (user.role === 'employe') return;
    setSelectedSlot({ date, typeGarde });
    setShowAssignModal(true);
  };

  if (loading) return <div className="loading" data-testid="planning-loading">Chargement du planning...</div>;

  return (
    <div className="planning">
      <div className="planning-header">
        <div>
          <h1 data-testid="planning-title">Planning des gardes</h1>
          <p>Affectation manuelle privilégiée et attribution automatique</p>
        </div>
        <div className="planning-controls">
          <Button variant="outline" data-testid="week-view-btn">Vue semaine</Button>
          <Button 
            variant="default" 
            disabled={user.role === 'employe'}
            data-testid="auto-assign-btn"
          >
            ✨ Attribution auto
          </Button>
          <Button 
            variant="destructive" 
            disabled={user.role === 'employe'}
            data-testid="manual-assign-btn"
          >
            + Assignation manuelle
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        <Button variant="ghost" onClick={() => navigateWeek(-1)} data-testid="prev-week-btn">
          ← Semaine précédente
        </Button>
        <h2 className="week-title">
          Semaine du {weekDates[0].toLocaleDateString('fr-FR')} au {weekDates[6].toLocaleDateString('fr-FR')}
        </h2>
        <Button variant="ghost" onClick={() => navigateWeek(1)} data-testid="next-week-btn">
          Semaine suivante →
        </Button>
      </div>

      {/* Legend */}
      <div className="planning-legend">
        <h3>Planning hebdomadaire - Gardes par horaires</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color complete"></span>
            Garde complète
          </div>
          <div className="legend-item">
            <span className="legend-color partial"></span>
            Garde partielle
          </div>
          <div className="legend-item">
            <span className="legend-color vacant"></span>
            Garde vacante
          </div>
        </div>
      </div>

      {/* Planning Grid */}
      <div className="planning-grid">
        <div className="grid-header">
          <div className="header-cell">Horaires</div>
          {weekDays.map((day, index) => (
            <div key={day} className="header-cell">
              <div className="day-name">{day}</div>
              <div className="day-date">{weekDates[index].getDate()}</div>
            </div>
          ))}
        </div>

        {typesGarde.map(typeGarde => (
          <div key={typeGarde.id} className="grid-row">
            <div className="time-cell">
              <div className="time-label">{typeGarde.nom}</div>
              <div className="time-range">
                {typeGarde.heure_debut} - {typeGarde.heure_fin}
              </div>
              <div className="time-details">
                {typeGarde.personnel_requis} personnel requis
              </div>
            </div>

            {weekDates.map((date, dayIndex) => {
              const assignation = getAssignationForSlot(date, typeGarde.id);
              const assignedUser = assignation ? getUserById(assignation.user_id) : null;

              return (
                <div 
                  key={dayIndex} 
                  className={`planning-cell ${assignation ? 'assigned' : 'vacant'}`}
                  style={{ borderLeftColor: getTypeGardeColor(typeGarde) }}
                  onClick={() => openAssignModal(date, typeGarde)}
                  data-testid={`planning-cell-${dayIndex}-${typeGarde.id}`}
                >
                  {assignedUser ? (
                    <div className="assignment-content">
                      <div className="assigned-user">
                        {assignedUser.prenom} {assignedUser.nom}
                      </div>
                      <div className="user-grade">{assignedUser.grade}</div>
                      <div className="assignment-type">
                        {assignation.assignation_type === 'auto' ? 'Auto' : 'Manuel'}
                      </div>
                      <div className="personnel-count">
                        +{typeGarde.personnel_requis - 1} autres
                      </div>
                    </div>
                  ) : (
                    <div className="vacant-content">
                      <div className="vacant-label">+{typeGarde.personnel_requis} autres</div>
                      <div className="auto-assign">Auto</div>
                      <div className="personnel-needed">{typeGarde.personnel_requis} personnel</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedSlot && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="assign-modal">
            <div className="modal-header">
              <h3>Assigner une garde</h3>
              <Button variant="ghost" onClick={() => setShowAssignModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <p><strong>Garde:</strong> {selectedSlot.typeGarde.nom}</p>
              <p><strong>Date:</strong> {selectedSlot.date.toLocaleDateString('fr-FR')}</p>
              <p><strong>Horaires:</strong> {selectedSlot.typeGarde.heure_debut} - {selectedSlot.typeGarde.heure_fin}</p>
              
              <div className="user-selection">
                <h4>Sélectionner un pompier:</h4>
                <div className="user-list">
                  {users.map(user => (
                    <div 
                      key={user.id} 
                      className="user-option"
                      onClick={() => handleAssignUser(user.id, selectedSlot.typeGarde.id, selectedSlot.date.toISOString().split('T')[0])}
                      data-testid={`assign-user-${user.id}`}
                    >
                      <span className="user-name">{user.prenom} {user.nom}</span>
                      <span className="user-grade">{user.grade}</span>
                      <span className="user-status">{user.statut}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
const MonProfil = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${API}/users/${user.id}`);
        setUserProfile(response.data);
        setProfileData({
          nom: response.data.nom,
          prenom: response.data.prenom,
          email: response.data.email,
          telephone: response.data.telephone
        });
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchUserProfile();
    }
  }, [user?.id]);

  const handleSaveProfile = async () => {
    try {
      // For demo purposes, we'll just show success message
      // In real implementation, this would update the backend
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
        variant: "success"
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive"
      });
    }
  };

  if (loading) return <div className="loading" data-testid="profile-loading">Chargement du profil...</div>;

  return (
    <div className="mon-profil">
      <div className="profile-header">
        <h1 data-testid="profile-title">Mon profil</h1>
        <p>Gérez vos informations personnelles et paramètres de compte</p>
      </div>

      <div className="profile-content">
        <div className="profile-main">
          <div className="profile-section">
            <div className="section-header">
              <h2>Informations personnelles</h2>
              {user.role !== 'employe' && (
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "secondary" : "default"}
                  data-testid="edit-profile-btn"
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </Button>
              )}
            </div>

            <div className="profile-form">
              <div className="form-row">
                <div className="form-field">
                  <Label>Prénom</Label>
                  <Input
                    value={profileData.prenom || ''}
                    onChange={(e) => setProfileData({...profileData, prenom: e.target.value})}
                    disabled={!isEditing || user.role === 'employe'}
                    data-testid="profile-prenom-input"
                  />
                </div>
                <div className="form-field">
                  <Label>Nom</Label>
                  <Input
                    value={profileData.nom || ''}
                    onChange={(e) => setProfileData({...profileData, nom: e.target.value})}
                    disabled={!isEditing || user.role === 'employe'}
                    data-testid="profile-nom-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <Label>Email</Label>
                  <Input
                    value={profileData.email || ''}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing || user.role === 'employe'}
                    data-testid="profile-email-input"
                  />
                </div>
                <div className="form-field">
                  <Label>Téléphone</Label>
                  <Input
                    value={profileData.telephone || ''}
                    onChange={(e) => setProfileData({...profileData, telephone: e.target.value})}
                    disabled={!isEditing}
                    data-testid="profile-phone-input"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <Button onClick={handleSaveProfile} data-testid="save-profile-btn">
                    Sauvegarder les modifications
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Informations verrouillées */}
          <div className="profile-section">
            <h2>Informations d'emploi</h2>
            <div className="locked-info">
              <div className="info-item">
                <span className="info-label">Numéro d'employé:</span>
                <span className="info-value locked" data-testid="profile-employee-id">
                  {userProfile?.numero_employe} 🔒
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Grade:</span>
                <span className="info-value locked" data-testid="profile-grade">
                  {userProfile?.grade} 🔒
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Type d'emploi:</span>
                <span className="info-value locked" data-testid="profile-employment-type">
                  {userProfile?.type_emploi === 'temps_plein' ? 'Temps plein' : 'Temps partiel'} 🔒
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Date d'embauche:</span>
                <span className="info-value locked" data-testid="profile-hire-date">
                  {userProfile?.date_embauche} 🔒
                </span>
              </div>
            </div>
          </div>

          {/* Formations */}
          <div className="profile-section">
            <h2>Formations et certifications</h2>
            <div className="formations-list" data-testid="profile-formations">
              {userProfile?.formations?.length > 0 ? (
                <div className="formations-grid">
                  {userProfile.formations.map((formation, index) => (
                    <div key={index} className="formation-item">
                      <span className="formation-name">{formation}</span>
                      <span className="formation-status">Certifié ✅</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-formations">
                  <p>Aucune formation enregistrée</p>
                </div>
              )}
            </div>
          </div>

          {/* Section disponibilités (uniquement pour temps partiel) */}
          {userProfile?.type_emploi === 'temps_partiel' && (
            <div className="profile-section">
              <h2>Mes disponibilités</h2>
              <p className="section-description">
                En tant qu'employé à temps partiel, vous pouvez gérer vos disponibilités ici.
              </p>
              <div className="availability-calendar">
                <div className="availability-placeholder">
                  <p>📅 Calendrier des disponibilités - En développement</p>
                </div>
              </div>
            </div>
          )}

          {/* Section remplacements (pour employés) */}
          {user.role === 'employe' && (
            <div className="profile-section">
              <h2>Mes demandes de remplacement</h2>
              <div className="replacements-summary">
                <div className="replacement-stat">
                  <span className="stat-number">0</span>
                  <span className="stat-label">En cours</span>
                </div>
                <div className="replacement-stat">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Approuvées</span>
                </div>
                <div className="replacement-stat">
                  <span className="stat-number">0</span>
                  <span className="stat-label">Ce mois</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" data-testid="view-replacements-btn">
                Voir toutes mes demandes
              </Button>
            </div>
          )}

          {/* Sécurité du compte */}
          <div className="profile-section">
            <h2>Sécurité du compte</h2>
            <div className="security-options">
              <Button variant="outline" data-testid="change-password-btn">
                Changer le mot de passe
              </Button>
              {user.role === 'admin' && (
                <Button variant="outline" data-testid="security-settings-btn">
                  Paramètres de sécurité avancés
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar avec statistiques personnelles */}
        <div className="profile-sidebar">
          <div className="profile-card">
            <div className="profile-avatar">
              <span className="avatar-large">👤</span>
            </div>
            <h3 data-testid="profile-fullname">{userProfile?.prenom} {userProfile?.nom}</h3>
            <p className="profile-role">{user?.role === 'admin' ? 'Administrateur' : 
                                        user?.role === 'superviseur' ? 'Superviseur' : 'Employé'}</p>
            <p className="profile-grade">{userProfile?.grade}</p>
          </div>

          <div className="profile-stats">
            <h3>Statistiques personnelles</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-icon">🏆</span>
                <div className="stat-content">
                  <span className="stat-value">24</span>
                  <span className="stat-label">Gardes ce mois</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⏱️</span>
                <div className="stat-content">
                  <span className="stat-value">288h</span>
                  <span className="stat-label">Heures travaillées</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📜</span>
                <div className="stat-content">
                  <span className="stat-value">{userProfile?.formations?.length || 0}</span>
                  <span className="stat-label">Certifications</span>
                </div>
              </div>
            </div>
          </div>

          {user.role === 'admin' && (
            <div className="admin-actions">
              <h3>Actions administrateur</h3>
              <Button variant="outline" className="w-full" data-testid="manage-all-profiles-btn">
                Gérer tous les profils
              </Button>
              <Button variant="outline" className="w-full" data-testid="system-settings-btn">
                Paramètres système
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const AppLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'personnel':
        return <Personnel />;
      case 'planning':
        return <Planning />;
      case 'remplacements':
        return <div className="page-placeholder">Remplacements - En développement</div>;
      case 'formations':
        return <div className="page-placeholder">Formations - En développement</div>;
      case 'rapports':
        return <div className="page-placeholder">Rapports - En développement</div>;
      case 'parametres':
        return <div className="page-placeholder">Paramètres - En développement</div>;
      case 'monprofil':
        return <MonProfil />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content" data-testid="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize demo data
    const initDemoData = async () => {
      try {
        await axios.post(`${API}/init-demo-data`);
        console.log('Données de démonstration initialisées');
      } catch (error) {
        console.log('Données de démonstration déjà présentes ou erreur:', error.response?.data?.message);
      } finally {
        setInitialized(true);
      }
    };

    initDemoData();
  }, []);

  if (!initialized) {
    return <div className="loading-app" data-testid="app-loading">Initialisation de ProFireManager...</div>;
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <AuthGuard>
            <AppLayout />
          </AuthGuard>
          <Toaster />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

// Auth Guard Component
const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-app" data-testid="auth-loading">Vérification de l'authentification...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return children;
};

export default App;