import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Calendar } from "./components/ui/calendar";
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
                <i className="fas fa-fire flame-icon"></i>
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
              <i className="fas fa-fire flame-icon"></i>
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
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDisponibilitesModal, setShowDisponibilitesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDisponibilites, setUserDisponibilites] = useState([]);
  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    contact_urgence: '',
    grade: '',
    type_emploi: '',
    numero_employe: '',
    date_embauche: '',
    formations: [],
    mot_de_passe: ''
  });
  const { toast } = useToast();

  const grades = ['Directeur', 'Capitaine', 'Lieutenant', 'Pompier'];
  const typesEmploi = ['temps_plein', 'temps_partiel'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, formationsResponse] = await Promise.all([
          axios.get(`${API}/users`),
          axios.get(`${API}/formations`)
        ]);
        setUsers(usersResponse.data);
        setFormations(formationsResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateUser = async () => {
    if (!newUser.nom || !newUser.prenom || !newUser.email || !newUser.grade || !newUser.type_emploi) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const userToCreate = {
        ...newUser,
        role: 'employe',
        numero_employe: newUser.numero_employe || `POM${String(Date.now()).slice(-3)}`,
        date_embauche: newUser.date_embauche || new Date().toLocaleDateString('fr-FR'),
        mot_de_passe: newUser.mot_de_passe || 'motdepasse123'
      };

      await axios.post(`${API}/users`, userToCreate);
      toast({
        title: "Pompier créé",
        description: "Le nouveau pompier a été ajouté avec succès",
        variant: "success"
      });
      
      setShowCreateModal(false);
      resetNewUser();
      
      // Reload users list
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Impossible de créer le pompier",
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
      grade: '',
      type_emploi: '',
      numero_employe: '',
      date_embauche: '',
      formations: [],
      mot_de_passe: ''
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewUser({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      contact_urgence: user.contact_urgence || '',
      grade: user.grade,
      type_emploi: user.type_emploi,
      numero_employe: user.numero_employe,
      date_embauche: user.date_embauche,
      formations: user.formations || [],
      mot_de_passe: ''
    });
    setShowEditModal(true);
  };

  const handleViewDisponibilites = async (user) => {
    if (user.type_emploi !== 'temps_partiel') {
      toast({
        title: "Information",
        description: "Les disponibilités ne concernent que les employés à temps partiel",
        variant: "default"
      });
      return;
    }

    try {
      const response = await axios.get(`${API}/disponibilites/${user.id}`);
      setUserDisponibilites(response.data);
      setSelectedUser(user);
      setShowDisponibilitesModal(true);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les disponibilités",
        variant: "destructive"
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!newUser.nom || !newUser.prenom || !newUser.email || !newUser.grade || !newUser.type_emploi) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.put(`${API}/users/${selectedUser.id}`, newUser);
      toast({
        title: "Pompier mis à jour",
        description: "Les informations ont été mises à jour avec succès",
        variant: "success"
      });
      setShowEditModal(false);
      
      // Reload users list
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Impossible de mettre à jour le pompier",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce pompier ? Cette action est irréversible.")) return;

    try {
      await axios.delete(`${API}/users/${userId}`);
      toast({
        title: "Pompier supprimé",
        description: "Le pompier a été supprimé avec succès",
        variant: "success"
      });
      
      // Reload users list
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Impossible de supprimer le pompier",
        variant: "destructive"
      });
    }
  };

  const translateDay = (day) => {
    const translations = {
      'monday': 'Lundi',
      'tuesday': 'Mardi', 
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi',
      'sunday': 'Dimanche'
    };
    return translations[day] || day;
  };

  const handleFormationToggle = (formationId) => {
    const updatedFormations = newUser.formations.includes(formationId)
      ? newUser.formations.filter(id => id !== formationId)
      : [...newUser.formations, formationId];
    
    setNewUser({...newUser, formations: updatedFormations});
  };

  const getFormationName = (formationId) => {
    const formation = formations.find(f => f.id === formationId);
    return formation ? formation.nom : formationId;
  };

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
        <Button 
          className="add-btn" 
          onClick={() => setShowCreateModal(true)}
          data-testid="add-personnel-btn"
        >
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
              {user.contact_urgence && (
                <p className="user-emergency">🚨 {user.contact_urgence}</p>
              )}
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
              {user.type_emploi === 'temps_partiel' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleViewDisponibilites(user)}
                  className="mt-1"
                  data-testid={`view-availability-${user.id}`}
                >
                  📅 Disponibilités
                </Button>
              )}
            </div>

            <div className="formations-cell">
              {user.formations?.map((formationId, index) => (
                <span key={index} className="formation-badge">
                  {getFormationName(formationId)}
                </span>
              ))}
              {user.formations?.length > 0 && (
                <p className="formations-count">+{user.formations.length} certifications</p>
              )}
              {user.formations?.length === 0 && (
                <p className="no-formations">Aucune formation</p>
              )}
            </div>

            <div className="actions-cell">
              <Button 
                variant="ghost" 
                className="action-btn" 
                onClick={() => handleViewUser(user)}
                data-testid={`view-user-${user.id}`}
                title="Visualiser"
              >
                👁️
              </Button>
              <Button 
                variant="ghost" 
                className="action-btn" 
                onClick={() => handleEditUser(user)}
                data-testid={`edit-user-${user.id}`}
                title="Modifier"
              >
                ✏️
              </Button>
              <Button 
                variant="ghost" 
                className="action-btn danger" 
                onClick={() => handleDeleteUser(user.id)}
                data-testid={`delete-user-${user.id}`}
                title="Supprimer"
              >
                ❌
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="create-user-modal">
            <div className="modal-header">
              <h3>Nouveau pompier</h3>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-row">
                  <div className="form-field">
                    <Label htmlFor="prenom">Prénom *</Label>
                    <Input
                      id="prenom"
                      value={newUser.prenom}
                      onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                      data-testid="user-prenom-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="nom">Nom *</Label>
                    <Input
                      id="nom"
                      value={newUser.nom}
                      onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                      data-testid="user-nom-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    data-testid="user-email-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label htmlFor="telephone">Téléphone</Label>
                    <Input
                      id="telephone"
                      value={newUser.telephone}
                      onChange={(e) => setNewUser({...newUser, telephone: e.target.value})}
                      data-testid="user-phone-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="contact-urgence">Contact d'urgence</Label>
                    <Input
                      id="contact-urgence"
                      value={newUser.contact_urgence}
                      onChange={(e) => setNewUser({...newUser, contact_urgence: e.target.value})}
                      placeholder="Numéro à contacter en cas d'urgence"
                      data-testid="user-emergency-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label htmlFor="grade">Grade *</Label>
                    <select
                      id="grade"
                      value={newUser.grade}
                      onChange={(e) => setNewUser({...newUser, grade: e.target.value})}
                      className="form-select"
                      data-testid="user-grade-select"
                    >
                      <option value="">Sélectionner un grade</option>
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <Label htmlFor="type-emploi">Type d'emploi *</Label>
                    <select
                      id="type-emploi"
                      value={newUser.type_emploi}
                      onChange={(e) => setNewUser({...newUser, type_emploi: e.target.value})}
                      className="form-select"
                      data-testid="user-employment-select"
                    >
                      <option value="">Sélectionner le type</option>
                      <option value="temps_plein">Temps plein</option>
                      <option value="temps_partiel">Temps partiel</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label htmlFor="numero-employe">Numéro d'employé</Label>
                    <Input
                      id="numero-employe"
                      value={newUser.numero_employe}
                      onChange={(e) => setNewUser({...newUser, numero_employe: e.target.value})}
                      placeholder="Automatique si vide"
                      data-testid="user-number-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="date-embauche">Date d'embauche</Label>
                    <Input
                      id="date-embauche"
                      type="date"
                      value={newUser.date_embauche}
                      onChange={(e) => setNewUser({...newUser, date_embauche: e.target.value})}
                      data-testid="user-hire-date-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <Label>Formations</Label>
                  <div className="formations-selection">
                    {formations.map(formation => (
                      <label key={formation.id} className="formation-checkbox">
                        <input
                          type="checkbox"
                          checked={newUser.formations.includes(formation.id)}
                          onChange={() => handleFormationToggle(formation.id)}
                          data-testid={`formation-${formation.id}`}
                        />
                        <span className="formation-label">
                          <strong>{formation.nom}</strong>
                          {formation.obligatoire && <span className="obligatoire">*</span>}
                          <br />
                          <small>{formation.description}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <Label htmlFor="mot-de-passe">Mot de passe temporaire</Label>
                  <Input
                    id="mot-de-passe"
                    type="password"
                    value={newUser.mot_de_passe}
                    onChange={(e) => setNewUser({...newUser, mot_de_passe: e.target.value})}
                    placeholder="motdepasse123 par défaut"
                    data-testid="user-password-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button variant="default" onClick={handleCreateUser} data-testid="submit-user-btn">
                  Créer le pompier
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="view-user-modal">
            <div className="modal-header">
              <h3>Détails du pompier</h3>
              <Button variant="ghost" onClick={() => setShowViewModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="user-details-view">
                <div className="detail-item">
                  <strong>Nom complet:</strong> {selectedUser.prenom} {selectedUser.nom}
                </div>
                <div className="detail-item">
                  <strong>Email:</strong> {selectedUser.email}
                </div>
                <div className="detail-item">
                  <strong>Téléphone:</strong> {selectedUser.telephone}
                </div>
                <div className="detail-item">
                  <strong>Contact d'urgence:</strong> {selectedUser.contact_urgence || 'Non renseigné'}
                </div>
                <div className="detail-item">
                  <strong>Grade:</strong> {selectedUser.grade}
                </div>
                <div className="detail-item">
                  <strong>Type d'emploi:</strong> {selectedUser.type_emploi === 'temps_plein' ? 'Temps plein' : 'Temps partiel'}
                </div>
                <div className="detail-item">
                  <strong>Numéro d'employé:</strong> #{selectedUser.numero_employe}
                </div>
                <div className="detail-item">
                  <strong>Date d'embauche:</strong> {selectedUser.date_embauche}
                </div>
                <div className="detail-item">
                  <strong>Statut:</strong> {selectedUser.statut}
                </div>
                {selectedUser.formations?.length > 0 && (
                  <div className="detail-item">
                    <strong>Formations:</strong>
                    <div className="formations-list">
                      {selectedUser.formations.map((formationId, index) => (
                        <span key={index} className="formation-badge">{getFormationName(formationId)}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="edit-user-modal">
            <div className="modal-header">
              <h3>Modifier le pompier</h3>
              <Button variant="ghost" onClick={() => setShowEditModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-row">
                  <div className="form-field">
                    <Label htmlFor="edit-prenom">Prénom *</Label>
                    <Input
                      id="edit-prenom"
                      value={newUser.prenom}
                      onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                      data-testid="edit-user-prenom-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="edit-nom">Nom *</Label>
                    <Input
                      id="edit-nom"
                      value={newUser.nom}
                      onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                      data-testid="edit-user-nom-input"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    data-testid="edit-user-email-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label htmlFor="edit-telephone">Téléphone</Label>
                    <Input
                      id="edit-telephone"
                      value={newUser.telephone}
                      onChange={(e) => setNewUser({...newUser, telephone: e.target.value})}
                      data-testid="edit-user-phone-input"
                    />
                  </div>
                  <div className="form-field">
                    <Label htmlFor="edit-contact-urgence">Contact d'urgence</Label>
                    <Input
                      id="edit-contact-urgence"
                      value={newUser.contact_urgence}
                      onChange={(e) => setNewUser({...newUser, contact_urgence: e.target.value})}
                      data-testid="edit-user-emergency-input"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <Label htmlFor="edit-grade">Grade *</Label>
                    <select
                      id="edit-grade"
                      value={newUser.grade}
                      onChange={(e) => setNewUser({...newUser, grade: e.target.value})}
                      className="form-select"
                      data-testid="edit-user-grade-select"
                    >
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <Label htmlFor="edit-type-emploi">Type d'emploi *</Label>
                    <select
                      id="edit-type-emploi"
                      value={newUser.type_emploi}
                      onChange={(e) => setNewUser({...newUser, type_emploi: e.target.value})}
                      className="form-select"
                      data-testid="edit-user-employment-select"
                    >
                      <option value="temps_plein">Temps plein</option>
                      <option value="temps_partiel">Temps partiel</option>
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <Label>Formations</Label>
                  <div className="formations-selection">
                    {formations.map(formation => (
                      <label key={formation.id} className="formation-checkbox">
                        <input
                          type="checkbox"
                          checked={newUser.formations.includes(formation.id)}
                          onChange={() => handleFormationToggle(formation.id)}
                          data-testid={`edit-formation-${formation.id}`}
                        />
                        <span className="formation-label">
                          <strong>{formation.nom}</strong>
                          {formation.obligatoire && <span className="obligatoire">*</span>}
                          <br />
                          <small>{formation.description}</small>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-field">
                  <Label htmlFor="edit-mot-de-passe">Nouveau mot de passe (optionnel)</Label>
                  <Input
                    id="edit-mot-de-passe"
                    type="password"
                    value={newUser.mot_de_passe}
                    onChange={(e) => setNewUser({...newUser, mot_de_passe: e.target.value})}
                    placeholder="Laisser vide pour conserver l'ancien"
                    data-testid="edit-user-password-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Annuler
                </Button>
                <Button variant="default" onClick={handleUpdateUser} data-testid="update-user-btn">
                  Mettre à jour
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDisponibilitesModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDisponibilitesModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="disponibilites-modal">
            <div className="modal-header">
              <h3>Disponibilités - {selectedUser.prenom} {selectedUser.nom}</h3>
              <Button variant="ghost" onClick={() => setShowDisponibilitesModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="disponibilites-view">
                <div className="disponibilites-header">
                  <p>Disponibilités données par l'employé à temps partiel</p>
                </div>
                
                <div className="disponibilites-list">
                  {userDisponibilites.length > 0 ? (
                    userDisponibilites.map(dispo => (
                      <div key={dispo.id} className="disponibilite-item">
                        <div className="dispo-day">
                          <strong>{translateDay(dispo.jour_semaine)}</strong>
                        </div>
                        <div className="dispo-time">
                          {dispo.heure_debut} - {dispo.heure_fin}
                        </div>
                        <div className="dispo-status">
                          <span className={`status ${dispo.statut}`}>
                            {dispo.statut === 'disponible' ? '✅ Disponible' : 
                             dispo.statut === 'indisponible' ? '❌ Indisponible' : 
                             '⚡ Préférence'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-disponibilites">
                      <p>Aucune disponibilité renseignée pour le moment</p>
                      <p className="text-muted">L'employé peut renseigner ses disponibilités dans son profil</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mon Profil Component
const MonProfil = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [formations, setFormations] = useState([]);
  const [userDisponibilites, setUserDisponibilites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDispoModal, setShowDispoModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [defaultTimeSlot, setDefaultTimeSlot] = useState({
    heure_debut: '08:00',
    heure_fin: '16:00',
    statut: 'disponible'
  });
  const [profileData, setProfileData] = useState({});
  const { toast } = useToast();

  const translateDay = (day) => {
    const translations = {
      'monday': 'Lundi',
      'tuesday': 'Mardi', 
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi',
      'sunday': 'Dimanche'
    };
    return translations[day] || day;
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const [userResponse, formationsResponse] = await Promise.all([
          axios.get(`${API}/users/${user.id}`),
          axios.get(`${API}/formations`)
        ]);
        
        setUserProfile(userResponse.data);
        setFormations(formationsResponse.data);
        setProfileData({
          nom: userResponse.data.nom,
          prenom: userResponse.data.prenom,
          email: userResponse.data.email,
          telephone: userResponse.data.telephone,
          contact_urgence: userResponse.data.contact_urgence || ''
        });

        // Load disponibilités if part-time employee
        if (userResponse.data.type_emploi === 'temps_partiel') {
          const dispoResponse = await axios.get(`${API}/disponibilites/${user.id}`);
          setUserDisponibilites(dispoResponse.data);
        }
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

  const handleDateSelect = (dates) => {
    setSelectedDates(dates || []);
  };

  const handleSaveDisponibilites = async () => {
    if (selectedDates.length === 0) {
      toast({
        title: "Aucune date sélectionnée",
        description: "Veuillez sélectionner au moins une date de disponibilité",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create disponibilité objects for each selected date
      const nouvelles_disponibilites = selectedDates.map(date => ({
        user_id: user.id,
        date: date.toISOString().split('T')[0],
        heure_debut: defaultTimeSlot.heure_debut,
        heure_fin: defaultTimeSlot.heure_fin,
        statut: defaultTimeSlot.statut
      }));

      await axios.put(`${API}/disponibilites/${user.id}`, nouvelles_disponibilites);
      
      toast({
        title: "Disponibilités sauvegardées",
        description: `${selectedDates.length} jours de disponibilité configurés`,
        variant: "success"
      });

      // Reload disponibilités
      const dispoResponse = await axios.get(`${API}/disponibilites/${user.id}`);
      setUserDisponibilites(dispoResponse.data);
      setShowDispoModal(false);
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les disponibilités",
        variant: "destructive"
      });
    }
  };

  const getFormationName = (formationId) => {
    const formation = formations.find(f => f.id === formationId);
    return formation ? formation.nom : formationId;
  };

  // Convert stored disponibilités to calendar dates
  const getAvailableDates = () => {
    return userDisponibilites
      .filter(d => d.statut === 'disponible')
      .map(d => new Date(d.date));
  };

  const formatDateRange = (dates) => {
    if (dates.length === 0) return "Aucune date";
    
    const sortedDates = dates.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortedDates.length === 1) {
      return new Date(sortedDates[0].date).toLocaleDateString('fr-FR');
    }
    
    return `${new Date(sortedDates[0].date).toLocaleDateString('fr-FR')} - ${new Date(sortedDates[sortedDates.length - 1].date).toLocaleDateString('fr-FR')}`;
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

              <div className="form-field">
                <Label>Contact d'urgence</Label>
                <Input
                  value={profileData.contact_urgence || ''}
                  onChange={(e) => setProfileData({...profileData, contact_urgence: e.target.value})}
                  disabled={!isEditing}
                  data-testid="profile-emergency-input"
                />
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
                  {userProfile.formations.map((formationId, index) => (
                    <div key={index} className="formation-item">
                      <span className="formation-name">{getFormationName(formationId)}</span>
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

          {/* Section disponibilités avec calendrier mensuel interactif */}
          {userProfile?.type_emploi === 'temps_partiel' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Mes disponibilités</h2>
                <Button 
                  variant="outline" 
                  onClick={() => setShowDispoModal(true)}
                  data-testid="edit-availability-btn"
                >
                  ✏️ Modifier mes disponibilités
                </Button>
              </div>
              <p className="section-description">
                Sélectionnez vos jours de disponibilité sur le calendrier mensuel.
              </p>
              
              <div className="availability-calendar-section">
                <div className="calendar-view">
                  <h3>Calendrier de disponibilités - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h3>
                  
                  <Calendar
                    mode="multiple"
                    selected={getAvailableDates()}
                    onSelect={handleDateSelect}
                    className="availability-calendar"
                    disabled={(date) => date < new Date().setHours(0,0,0,0)}
                    modifiers={{
                      available: getAvailableDates()
                    }}
                    modifiersStyles={{
                      available: { 
                        backgroundColor: '#dcfce7', 
                        color: '#166534',
                        fontWeight: 'bold'
                      }
                    }}
                  />
                  
                  <div className="calendar-legend">
                    <div className="legend-item">
                      <span className="legend-color available"></span>
                      Jours disponibles (cliquez pour modifier)
                    </div>
                    <div className="legend-item">
                      <span className="legend-color unavailable"></span>
                      Jours non disponibles
                    </div>
                  </div>
                </div>
                
                <div className="availability-summary-card">
                  <h4>Résumé de mes disponibilités</h4>
                  <div className="summary-stats">
                    <div className="summary-stat">
                      <span className="stat-number">{userDisponibilites.filter(d => d.statut === 'disponible').length}</span>
                      <span className="stat-label">Jours configurés</span>
                    </div>
                    <div className="summary-stat">
                      <span className="stat-number">
                        {userDisponibilites.reduce((total, dispo) => {
                          if (dispo.statut === 'disponible') {
                            const start = new Date(`1970-01-01T${dispo.heure_debut}`);
                            const end = new Date(`1970-01-01T${dispo.heure_fin}`);
                            const hours = (end - start) / (1000 * 60 * 60);
                            return total + hours;
                          }
                          return total;
                        }, 0)}h
                      </span>
                      <span className="stat-label">Total configuré</span>
                    </div>
                  </div>
                  
                  <div className="current-availability">
                    <h5>Disponibilités configurées :</h5>
                    {userDisponibilites.length > 0 ? (
                      <div className="availability-dates">
                        <p className="date-range">
                          <strong>Période :</strong> {formatDateRange(userDisponibilites)}
                        </p>
                        <div className="dates-list">
                          {userDisponibilites.slice(0, 5).map(dispo => (
                            <div key={dispo.id} className="date-item">
                              <span className="date-value">
                                {new Date(dispo.date).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="time-value">
                                {dispo.heure_debut}-{dispo.heure_fin}
                              </span>
                              <span className={`status-indicator ${dispo.statut}`}>
                                {dispo.statut === 'disponible' ? '✅' : '❌'}
                              </span>
                            </div>
                          ))}
                          {userDisponibilites.length > 5 && (
                            <div className="more-dates">
                              +{userDisponibilites.length - 5} autres dates...
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="no-availability">Aucune disponibilité configurée</p>
                    )}
                  </div>
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

      {/* Modal pour gérer les disponibilités avec calendrier interactif */}
      {showDispoModal && userProfile?.type_emploi === 'temps_partiel' && (
        <div className="modal-overlay" onClick={() => setShowDispoModal(false)}>
          <div className="modal-content extra-large-modal" onClick={(e) => e.stopPropagation()} data-testid="edit-availability-modal">
            <div className="modal-header">
              <h3>Configurer mes disponibilités</h3>
              <Button variant="ghost" onClick={() => setShowDispoModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="availability-config">
                <div className="config-instructions">
                  <h4>Instructions :</h4>
                  <ol>
                    <li>Sélectionnez vos jours de disponibilité sur le calendrier</li>
                    <li>Définissez vos horaires de travail préférés</li>
                    <li>Cliquez "Sauvegarder" pour confirmer</li>
                  </ol>
                </div>

                <div className="time-config">
                  <h4>Créneaux horaires par défaut :</h4>
                  <div className="time-inputs-modal">
                    <div className="time-field">
                      <Label>Heure de début</Label>
                      <Input 
                        type="time" 
                        value={defaultTimeSlot.heure_debut}
                        onChange={(e) => setDefaultTimeSlot({...defaultTimeSlot, heure_debut: e.target.value})}
                        data-testid="default-start-time"
                      />
                    </div>
                    <div className="time-field">
                      <Label>Heure de fin</Label>
                      <Input 
                        type="time" 
                        value={defaultTimeSlot.heure_fin}
                        onChange={(e) => setDefaultTimeSlot({...defaultTimeSlot, heure_fin: e.target.value})}
                        data-testid="default-end-time"
                      />
                    </div>
                    <div className="status-field">
                      <Label>Statut</Label>
                      <select 
                        value={defaultTimeSlot.statut}
                        onChange={(e) => setDefaultTimeSlot({...defaultTimeSlot, statut: e.target.value})}
                        className="form-select"
                        data-testid="default-status-select"
                      >
                        <option value="disponible">✅ Disponible</option>
                        <option value="indisponible">❌ Indisponible</option>
                        <option value="preference">⚡ Préférence</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="calendar-selection">
                  <h4>Sélectionnez vos dates de disponibilité :</h4>
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={handleDateSelect}
                    className="interactive-calendar"
                    disabled={(date) => date < new Date().setHours(0,0,0,0)}
                    modifiersStyles={{
                      selected: { 
                        backgroundColor: '#dc2626', 
                        color: 'white',
                        fontWeight: 'bold'
                      }
                    }}
                  />
                  
                  <div className="selection-summary">
                    <p><strong>Dates sélectionnées :</strong> {selectedDates.length} jour(s)</p>
                    {selectedDates.length > 0 && (
                      <p><strong>Horaires :</strong> {defaultTimeSlot.heure_debut} - {defaultTimeSlot.heure_fin}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowDispoModal(false)}>
                  Annuler
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleSaveDisponibilites}
                  data-testid="save-availability-btn"
                  disabled={selectedDates.length === 0}
                >
                  Sauvegarder mes disponibilités ({selectedDates.length} jour(s))
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Formations Component
const Formations = () => {
  const { user } = useAuth();
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await axios.get(`${API}/formations`);
        setFormations(response.data);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  const handleInscription = async (formationId) => {
    try {
      toast({
        title: "Inscription réussie",
        description: "Vous êtes maintenant inscrit à cette formation",
        variant: "success"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de s'inscrire à cette formation",
        variant: "destructive"
      });
    }
  };

  if (loading) return <div className="loading" data-testid="formations-loading">Chargement des formations...</div>;

  return (
    <div className="formations">
      <div className="formations-header">
        <div>
          <h1 data-testid="formations-title">Gestion des formations</h1>
          <p>Formations disponibles et inscriptions</p>
        </div>
        {user.role === 'admin' && (
          <Button variant="default" data-testid="create-formation-btn">
            + Nouvelle formation
          </Button>
        )}
      </div>

      <div className="formations-grid">
        {formations.map(formation => (
          <div key={formation.id} className="formation-card" data-testid={`formation-${formation.id}`}>
            <div className="formation-header">
              <h3>{formation.nom}</h3>
              {formation.obligatoire && (
                <span className="obligatoire-badge">Obligatoire</span>
              )}
            </div>
            
            <div className="formation-details">
              <p className="formation-description">{formation.description}</p>
              
              <div className="formation-meta">
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <span>{formation.duree_heures}h de formation</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">📅</span>
                  <span>Valide {formation.validite_mois} mois</span>
                </div>
              </div>
            </div>

            <div className="formation-actions">
              <Button 
                variant="default" 
                onClick={() => handleInscription(formation.id)}
                data-testid={`inscribe-formation-${formation.id}`}
              >
                S'inscrire
              </Button>
              {user.role === 'admin' && (
                <Button variant="ghost" data-testid={`edit-formation-${formation.id}`}>
                  ✏️
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {formations.length === 0 && (
        <div className="empty-state">
          <h3>Aucune formation disponible</h3>
          <p>Les formations seront affichées ici une fois configurées par l'administrateur.</p>
        </div>
      )}
    </div>
  );
};

// Planning Component
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

  const handleAttributionAuto = async () => {
    if (user.role === 'employe') return;

    try {
      const response = await axios.post(`${API}/planning/attribution-auto?semaine_debut=${currentWeek}`);
      
      toast({
        title: "Attribution automatique réussie",
        description: `${response.data.assignations_creees} nouvelles assignations créées`,
        variant: "success"
      });

      fetchPlanningData();
    } catch (error) {
      toast({
        title: "Erreur d'attribution",
        description: error.response?.data?.detail || "Impossible d'effectuer l'attribution automatique",
        variant: "destructive"
      });
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
            onClick={handleAttributionAuto}
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
            Garde assignée
          </div>
          <div className="legend-item">
            <span className="legend-color partial"></span>
            Attribution manuelle
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
                👥 {typeGarde.personnel_requis} personnel requis
                {typeGarde.officier_obligatoire && <div className="officier-required">🎖️ Officier requis</div>}
              </div>
            </div>

            {weekDates.map((date, dayIndex) => {
              const assignation = getAssignationForSlot(date, typeGarde.id);
              const assignedUser = assignation ? getUserById(assignation.user_id) : null;

              return (
                <div 
                  key={dayIndex} 
                  className={`planning-cell ${assignation ? 'assigned' : 'vacant'} ${user.role !== 'employe' ? 'clickable' : ''}`}
                  style={{ borderLeftColor: getTypeGardeColor(typeGarde) }}
                  onClick={() => openAssignModal(date, typeGarde)}
                  data-testid={`planning-cell-${dayIndex}-${typeGarde.id}`}
                >
                  {assignedUser ? (
                    <div className="assignment-content">
                      <div className="assigned-user">
                        {assignedUser.prenom} {assignedUser.nom}
                      </div>
                      <div className="user-grade" style={{ backgroundColor: getTypeGardeColor(typeGarde) }}>
                        {assignedUser.grade}
                      </div>
                      <div className={`assignment-type ${assignation.assignation_type}`}>
                        {assignation.assignation_type === 'auto' ? '🤖 Auto' : '👤 Manuel'}
                      </div>
                      {typeGarde.personnel_requis > 1 && (
                        <div className="personnel-count">
                          +{typeGarde.personnel_requis - 1} autres requis
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="vacant-content">
                      <div className="vacant-icon">🚫</div>
                      <div className="vacant-label">Garde vacante</div>
                      <div className="personnel-needed">{typeGarde.personnel_requis} personnel requis</div>
                      {user.role !== 'employe' && (
                        <div className="click-hint">Cliquer pour assigner</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedSlot && user.role !== 'employe' && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="assign-modal">
            <div className="modal-header">
              <h3>Assigner une garde</h3>
              <Button variant="ghost" onClick={() => setShowAssignModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="assignment-details">
                <p><strong>Garde:</strong> {selectedSlot.typeGarde.nom}</p>
                <p><strong>Date:</strong> {selectedSlot.date.toLocaleDateString('fr-FR')}</p>
                <p><strong>Horaires:</strong> {selectedSlot.typeGarde.heure_debut} - {selectedSlot.typeGarde.heure_fin}</p>
                <p><strong>Personnel requis:</strong> {selectedSlot.typeGarde.personnel_requis}</p>
                {selectedSlot.typeGarde.officier_obligatoire && (
                  <p className="officier-note">🎖️ <strong>Officier obligatoire pour cette garde</strong></p>
                )}
              </div>
              
              <div className="user-selection">
                <h4>Sélectionner un pompier:</h4>
                <div className="user-list">
                  {users.map(userOption => (
                    <div 
                      key={userOption.id} 
                      className="user-option"
                      onClick={() => handleAssignUser(userOption.id, selectedSlot.typeGarde.id, selectedSlot.date.toISOString().split('T')[0])}
                      data-testid={`assign-user-${userOption.id}`}
                    >
                      <div className="user-option-main">
                        <span className="user-name">{userOption.prenom} {userOption.nom}</span>
                        <span className="user-employment">{userOption.type_emploi === 'temps_plein' ? 'TP' : 'Part.'}</span>
                      </div>
                      <span className="user-grade" style={{ backgroundColor: getTypeGardeColor(selectedSlot.typeGarde) }}>
                        {userOption.grade}
                      </span>
                      <span className="user-status">{userOption.statut}</span>
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
// Remplacements Component
const Remplacements = () => {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [users, setUsers] = useState([]);
  const [typesGarde, setTypesGarde] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDemande, setNewDemande] = useState({
    type_garde_id: '',
    date: '',
    raison: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [
        axios.get(`${API}/remplacements`),
        axios.get(`${API}/types-garde`)
      ];
      
      if (user.role !== 'employe') {
        promises.push(axios.get(`${API}/users`));
      }

      const responses = await Promise.all(promises);
      setDemandes(responses[0].data);
      setTypesGarde(responses[1].data);
      
      if (responses[2]) {
        setUsers(responses[2].data);
      }
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
      fetchData();
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
    return typeGarde ? typeGarde.nom : 'Type non spécifié';
  };

  const getUserName = (userId) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? `${foundUser.prenom} ${foundUser.nom}` : `Employé #${userId?.slice(-4)}`;
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
                  <p className="user-name">{getUserName(demande.demandeur_id)}</p>
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
                    {getUserName(demande.remplacant_id)}
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
              <h3>Aucune demande de remplacement</h3>
              <p>Les demandes de remplacement apparaîtront ici.</p>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(true)}
                className="mt-4"
              >
                Créer ma première demande
              </Button>
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
// Rapports Component (Admin only)
const Rapports = () => {
  const { user } = useAuth();
  const [rapportData, setRapportData] = useState({
    taux_presence: 0,
    taux_couverture: 0,
    heures_combler: 0,
    heures_donnees: 0,
    formations_employees: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('mensuel');
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchRapportData();
    }
  }, [user, selectedPeriod]);

  const fetchRapportData = async () => {
    setLoading(true);
    try {
      // Simuler le chargement des données de rapport
      const [statsResponse, usersResponse] = await Promise.all([
        axios.get(`${API}/statistiques`),
        axios.get(`${API}/users`)
      ]);
      
      const stats = statsResponse.data;
      const users = usersResponse.data;
      
      // Calculer les données de rapport
      const totalPersonnel = users.length;
      const personnelActif = users.filter(u => u.statut === 'Actif').length;
      const tauxPresence = totalPersonnel > 0 ? (personnelActif / totalPersonnel * 100) : 0;
      
      setRapportData({
        taux_presence: tauxPresence,
        taux_couverture: stats.taux_couverture || 94,
        heures_combler: 168, // 7 jours × 24h - heures assignées
        heures_donnees: stats.heures_travaillees || 2340,
        formations_employees: users.map(u => ({
          nom: `${u.prenom} ${u.nom}`,
          grade: u.grade,
          formations: u.formations?.length || 0,
          formations_obligatoires: u.formations?.filter(f => f.includes('obligatoire')).length || 0
        }))
      });
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de rapport",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  if (loading) return <div className="loading" data-testid="rapports-loading">Chargement des rapports...</div>;

  return (
    <div className="rapports">
      <div className="rapports-header">
        <div>
          <h1 data-testid="rapports-title">Rapports et analyses</h1>
          <p>Statistiques détaillées et indicateurs de performance</p>
        </div>
        <div className="period-selector">
          <Label>Période d'analyse</Label>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="form-select"
            data-testid="period-select"
          >
            <option value="hebdomadaire">Cette semaine</option>
            <option value="mensuel">Ce mois</option>
            <option value="trimestriel">Ce trimestre</option>
            <option value="annuel">Cette année</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card presence">
          <div className="kpi-header">
            <h3>Taux de présence des pompiers</h3>
            <span className="kpi-icon">👥</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-value" data-testid="kpi-presence">
              {rapportData.taux_presence.toFixed(1)}%
            </div>
            <div className="kpi-change positive">+2.5% vs mois dernier</div>
            <div className="kpi-description">
              Pourcentage d'employés actifs sur le personnel total
            </div>
          </div>
        </div>

        <div className="kpi-card couverture">
          <div className="kpi-header">
            <h3>Taux de couverture des gardes</h3>
            <span className="kpi-icon">🛡️</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-value" data-testid="kpi-couverture">
              {rapportData.taux_couverture}%
            </div>
            <div className="kpi-change positive">+1.2% vs mois dernier</div>
            <div className="kpi-description">
              Pourcentage de gardes couvertes par rapport aux besoins
            </div>
          </div>
        </div>

        <div className="kpi-card heures-combler">
          <div className="kpi-header">
            <h3>Heures à combler par mois</h3>
            <span className="kpi-icon">⏰</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-value" data-testid="kpi-heures-combler">
              {rapportData.heures_combler}h
            </div>
            <div className="kpi-change negative">-15h vs mois dernier</div>
            <div className="kpi-description">
              Heures de garde non encore assignées ce mois
            </div>
          </div>
        </div>

        <div className="kpi-card heures-donnees">
          <div className="kpi-header">
            <h3>Heures données</h3>
            <span className="kpi-icon">✅</span>
          </div>
          <div className="kpi-content">
            <div className="kpi-value" data-testid="kpi-heures-donnees">
              {rapportData.heures_donnees}h
            </div>
            <div className="kpi-change positive">+120h vs mois dernier</div>
            <div className="kpi-description">
              Total des heures de garde effectuées ce mois
            </div>
          </div>
        </div>
      </div>

      {/* Formations Report */}
      <div className="rapport-section">
        <div className="section-header">
          <h2>Formations des employés</h2>
          <Button variant="outline" data-testid="export-formations-btn">
            📊 Exporter Excel
          </Button>
        </div>
        
        <div className="formations-rapport-table">
          <div className="table-header">
            <div className="header-cell">EMPLOYÉ</div>
            <div className="header-cell">GRADE</div>
            <div className="header-cell">FORMATIONS TOTALES</div>
            <div className="header-cell">FORMATIONS OBLIGATOIRES</div>
            <div className="header-cell">STATUT</div>
            <div className="header-cell">ACTIONS</div>
          </div>

          {rapportData.formations_employees.map((employee, index) => (
            <div key={index} className="table-row" data-testid={`formation-row-${index}`}>
              <div className="employee-cell">
                <div className="user-avatar">
                  <span className="avatar-icon">👤</span>
                </div>
                <span className="employee-name">{employee.nom}</span>
              </div>

              <div className="grade-cell">
                <span className="grade-badge">{employee.grade}</span>
              </div>

              <div className="formations-total-cell">
                <span className="formations-count">{employee.formations}</span>
                <span className="formations-label">certifications</span>
              </div>

              <div className="formations-obligatoires-cell">
                <span className="obligatoires-count">{employee.formations_obligatoires}</span>
                <span className="obligatoires-label">complétées</span>
              </div>

              <div className="formation-status-cell">
                <span className={`formation-status ${employee.formations >= 2 ? 'conforme' : 'attention'}`}>
                  {employee.formations >= 2 ? '✅ Conforme' : '⚠️ À jour requis'}
                </span>
              </div>

              <div className="actions-cell">
                <Button variant="ghost" className="action-btn" data-testid={`view-formation-details-${index}`}>
                  📋 Détails
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h3>Évolution du taux de couverture</h3>
          <div className="chart-placeholder">
            <div className="chart-mock">
              <div className="chart-bar" style={{height: '60%'}}>Jan</div>
              <div className="chart-bar" style={{height: '75%'}}>Fév</div>
              <div className="chart-bar" style={{height: '85%'}}>Mar</div>
              <div className="chart-bar" style={{height: '90%'}}>Avr</div>
              <div className="chart-bar" style={{height: '94%'}}>Mai</div>
            </div>
            <p className="chart-label">Taux de couverture par mois (%)</p>
          </div>
        </div>

        <div className="chart-container">
          <h3>Distribution des heures par grade</h3>
          <div className="chart-placeholder">
            <div className="pie-chart-mock">
              <div className="pie-segment directeur" data-value="35%">Directeur 35%</div>
              <div className="pie-segment capitaine" data-value="28%">Capitaine 28%</div>
              <div className="pie-segment lieutenant" data-value="22%">Lieutenant 22%</div>
              <div className="pie-segment pompier" data-value="15%">Pompier 15%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="export-section">
        <h2>Actions d'export</h2>
        <div className="export-buttons">
          <Button variant="outline" data-testid="export-planning-btn">
            📅 Exporter planning complet
          </Button>
          <Button variant="outline" data-testid="export-presence-btn">
            👥 Exporter rapport de présence
          </Button>
          <Button variant="outline" data-testid="export-formations-report-btn">
            🎓 Exporter suivi formations
          </Button>
          <Button variant="outline" data-testid="export-monthly-btn">
            📊 Rapport mensuel complet
          </Button>
        </div>
      </div>
    </div>
  );
};
// Simple placeholder for Parametres
const Parametres = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h1>Accès refusé</h1>
        <p>Cette section est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className="parametres">
      <div className="parametres-header">
        <div>
          <h1 data-testid="parametres-title">Paramètres du système</h1>
          <p>Configuration globale de ProFireManager - En développement avancé</p>
        </div>
      </div>
      
      <div className="settings-preview">
        <div className="preview-card">
          <h3>🚒 Types de Gardes</h3>
          <p>Configuration des types de gardes disponibles</p>
          <Button variant="outline">Gérer les types</Button>
        </div>
        
        <div className="preview-card">
          <h3>📚 Formations</h3>
          <p>Catalogue des formations et certifications</p>
          <Button variant="outline">Gérer les formations</Button>
        </div>
        
        <div className="preview-card">
          <h3>⚙️ Attribution Automatique</h3>
          <p>Paramètres d'attribution intelligente</p>
          <Button variant="outline">Configurer</Button>
        </div>
        
        <div className="preview-card">
          <h3>👥 Comptes d'Accès</h3>
          <p>Gestion des utilisateurs et permissions</p>
          <Button variant="outline">Gérer les comptes</Button>
        </div>
      </div>
    </div>
  );
};
  const { user } = useAuth();
  const [typesGarde, setTypesGarde] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('types-garde');
  
  // Modals states
  const [showCreateTypeModal, setShowCreateTypeModal] = useState(false);
  const [showCreateFormationModal, setShowCreateFormationModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  
  // Form states
  const [newTypeGarde, setNewTypeGarde] = useState({
    nom: '',
    heure_debut: '',
    heure_fin: '',
    personnel_requis: 1,
    duree_heures: 8,
    couleur: '#3B82F6',
    jours_application: [],
    officier_obligatoire: false
  });
  
  const [newFormation, setNewFormation] = useState({
    nom: '',
    description: '',
    duree_heures: 0,
    validite_mois: 12,
    obligatoire: false
  });
  
  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    contact_urgence: '',
    grade: '',
    type_emploi: '',
    role: '',
    numero_employe: '',
    date_embauche: '',
    mot_de_passe: ''
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

  const grades = ['Directeur', 'Capitaine', 'Lieutenant', 'Pompier'];
  const roles = ['admin', 'superviseur', 'employe'];

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

  const handleCreateUser = async () => {
    if (!newUser.nom || !newUser.prenom || !newUser.email || !newUser.grade || !newUser.role) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const userToCreate = {
        ...newUser,
        numero_employe: newUser.numero_employe || `${newUser.role.toUpperCase()}${String(Date.now()).slice(-3)}`,
        date_embauche: newUser.date_embauche || new Date().toLocaleDateString('fr-FR'),
        mot_de_passe: newUser.mot_de_passe || 'motdepasse123',
        formations: []
      };

      await axios.post(`${API}/users`, userToCreate);
      toast({
        title: "Compte créé",
        description: "Le nouveau compte utilisateur a été créé avec succès",
        variant: "success"
      });
      setShowCreateUserModal(false);
      resetNewUser();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Impossible de créer le compte",
        variant: "destructive"
      });
    }
  };

  const resetNewTypeGarde = () => {
    setNewTypeGarde({
      nom: '',
      heure_debut: '',
      heure_fin: '',
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
      duree_heures: 0,
      validite_mois: 12,
      obligatoire: false
    });
  };

  const resetNewUser = () => {
    setNewUser({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      contact_urgence: '',
      grade: '',
      type_emploi: '',
      role: '',
      numero_employe: '',
      date_embauche: '',
      mot_de_passe: ''
    });
  };

  const handleJourChange = (jour) => {
    const updatedJours = newTypeGarde.jours_application.includes(jour)
      ? newTypeGarde.jours_application.filter(j => j !== jour)
      : [...newTypeGarde.jours_application, jour];
    
    setNewTypeGarde({...newTypeGarde, jours_application: updatedJours});
  };

  const handleSettingChange = (setting, value) => {
    setSystemSettings({...systemSettings, [setting]: value});
    // Auto-save settings (for demo)
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

  if (loading) return <div className="loading" data-testid="parametres-loading">Chargement des paramètres...</div>;

  return (
    <div className="parametres">
      <div className="parametres-header">
        <div>
          <h1 data-testid="parametres-title">Paramètres du système</h1>
          <p>Configuration globale de ProFireManager</p>
        </div>
      </div>

      {/* Tabs Navigation */}
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
          🔄 Remplacements
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
                        <span className="schedule-time">
                          ⏰ {type.heure_debut} - {type.heure_fin}
                        </span>
                        <span className="personnel-required">
                          👥 {type.personnel_requis} personnel requis
                        </span>
                        <span className="duration">
                          ⌛ {type.duree_heures}h
                        </span>
                      </div>
                    </div>
                    <div className="type-actions">
                      <Button variant="ghost" data-testid={`edit-type-${type.id}`}>✏️</Button>
                      <Button variant="ghost" className="danger" data-testid={`delete-type-${type.id}`}>🗑️</Button>
                    </div>
                  </div>

                  <div className="type-details">
                    <div className="type-color">
                      <span className="color-preview" style={{ backgroundColor: type.couleur }}></span>
                      <span>Couleur: {type.couleur}</span>
                    </div>
                    
                    {type.jours_application?.length > 0 && (
                      <div className="type-days">
                        <span>📅 Jours: {type.jours_application.join(', ')}</span>
                      </div>
                    )}

                    {type.officier_obligatoire && (
                      <div className="type-officer">
                        <span>🎖️ Officier obligatoire</span>
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
                        <span className="obligatoire-badge">Obligatoire</span>
                      )}
                    </div>
                    <div className="formation-actions">
                      <Button variant="ghost" data-testid={`edit-formation-${formation.id}`}>✏️</Button>
                      <Button variant="ghost" className="danger" data-testid={`delete-formation-${formation.id}`}>🗑️</Button>
                    </div>
                  </div>
                  
                  <div className="formation-admin-details">
                    <p className="formation-description">{formation.description}</p>
                    <div className="formation-meta">
                      <span>⏱️ {formation.duree_heures}h</span>
                      <span>📅 Valide {formation.validite_mois} mois</span>
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
                <p>Configurez les règles d'attribution intelligente des gardes</p>
              </div>
            </div>

            <div className="attribution-settings">
              <div className="setting-section">
                <h3>Ordre de priorité (non modifiable)</h3>
                <div className="priority-list">
                  <div className="priority-item">
                    <span className="priority-number">1</span>
                    <span className="priority-text">Assignations manuelles privilégiées</span>
                    <span className="priority-status">✅ Actif</span>
                  </div>
                  <div className="priority-item">
                    <span className="priority-number">2</span>
                    <span className="priority-text">Respecter les disponibilités des employés</span>
                    <span className="priority-status">✅ Actif</span>
                  </div>
                  <div className="priority-item">
                    <span className="priority-number">3</span>
                    <span className="priority-text">Respecter les grades (1 officier par garde si requis)</span>
                    <span className="priority-status">✅ Actif</span>
                  </div>
                  <div className="priority-item">
                    <span className="priority-number">4</span>
                    <span className="priority-text">Rotation équitable des employés</span>
                    <span className="priority-status">⚠️ En développement</span>
                  </div>
                </div>
              </div>

              <div className="setting-section">
                <h3>Paramètres généraux</h3>
                <div className="settings-grid">
                  <label className="setting-toggle">
                    <span>Attribution automatique activée</span>
                    <input
                      type="checkbox"
                      checked={systemSettings.attribution_auto}
                      onChange={(e) => handleSettingChange('attribution_auto', e.target.checked)}
                      data-testid="toggle-auto-attribution"
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <label className="setting-toggle">
                    <span>Notification par email des assignations</span>
                    <input
                      type="checkbox"
                      checked={systemSettings.notification_email}
                      onChange={(e) => handleSettingChange('notification_email', e.target.checked)}
                      data-testid="toggle-email-notifications"
                    />
                    <span className="toggle-slider"></span>
                  </label>

                  <label className="setting-toggle">
                    <span>Permettre les assignations en doublon</span>
                    <input
                      type="checkbox"
                      checked={systemSettings.assignations_doublon}
                      onChange={(e) => handleSettingChange('assignations_doublon', e.target.checked)}
                      data-testid="toggle-duplicate-assignments"
                    />
                    <span className="toggle-slider"></span>
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
                <p>Créez des comptes et définissez les autorisations</p>
              </div>
              <Button 
                variant="default" 
                onClick={() => setShowCreateUserModal(true)}
                data-testid="create-user-account-btn"
              >
                + Nouveau Compte
              </Button>
            </div>

            <div className="accounts-info">
              <div className="account-type-card">
                <h3>👑 Administrateur</h3>
                <ul>
                  <li>Accès complet à tous les modules</li>
                  <li>Gestion du personnel et paramètres</li>
                  <li>Attribution manuelle et automatique</li>
                  <li>Rapports et analyses</li>
                </ul>
              </div>

              <div className="account-type-card">
                <h3>🎖️ Superviseur</h3>
                <ul>
                  <li>Consultation du personnel</li>
                  <li>Gestion du planning</li>
                  <li>Validation des remplacements</li>
                  <li>Accès aux formations</li>
                </ul>
              </div>

              <div className="account-type-card">
                <h3>👤 Employé</h3>
                <ul>
                  <li>Consultation du planning personnel</li>
                  <li>Demandes de remplacement</li>
                  <li>Inscription aux formations</li>
                  <li>Gestion des disponibilités (temps partiel)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'remplacements' && (
          <div className="remplacements-settings-tab">
            <div className="tab-header">
              <div>
                <h2>Paramètres des demandes de remplacement</h2>
                <p>Configurez les règles de validation et de traitement</p>
              </div>
            </div>

            <div className="replacement-config">
              <div className="config-group">
                <h3>Délais et limites</h3>
                <div className="config-inputs">
                  <label className="config-input">
                    <span>Délai de réponse (heures)</span>
                    <Input
                      type="number"
                      value={systemSettings.delai_reponse}
                      onChange={(e) => handleSettingChange('delai_reponse', parseInt(e.target.value))}
                      data-testid="response-delay-input"
                    />
                  </label>
                  
                  <label className="config-input">
                    <span>Nombre max de personnes à contacter</span>
                    <Input
                      type="number"
                      value={systemSettings.max_personnes_contact}
                      onChange={(e) => handleSettingChange('max_personnes_contact', parseInt(e.target.value))}
                      data-testid="max-contacts-input"
                    />
                  </label>
                </div>
              </div>

              <div className="config-group">
                <h3>Règles de validation</h3>
                <label className="setting-toggle">
                  <span>Accepter les remplacements de grade équivalent uniquement</span>
                  <input
                    type="checkbox"
                    checked={systemSettings.grade_equivalent}
                    onChange={(e) => handleSettingChange('grade_equivalent', e.target.checked)}
                    data-testid="toggle-grade-equivalent"
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="config-group">
                <h3>Workflow de validation</h3>
                <div className="workflow-steps">
                  <div className="workflow-step">
                    <span className="step-number">1</span>
                    <span className="step-text">Demande soumise par l'employé</span>
                  </div>
                  <div className="workflow-step">
                    <span className="step-number">2</span>
                    <span className="step-text">Recherche automatique de remplaçants</span>
                  </div>
                  <div className="workflow-step">
                    <span className="step-number">3</span>
                    <span className="step-text">Validation par superviseur/admin</span>
                  </div>
                  <div className="workflow-step">
                    <span className="step-number">4</span>
                    <span className="step-text">Notification aux parties concernées</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

// Main Application Layout
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
        return <Remplacements />;
      case 'formations':
        return <Formations />;
      case 'rapports':
        return <Rapports />;
      case 'parametres':
        return <Parametres />;
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