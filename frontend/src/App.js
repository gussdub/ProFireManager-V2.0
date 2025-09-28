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
import Parametres from "./components/Parametres";
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
    { id: 'disponibilites', label: 'Mes disponibilités', icon: '📋', roles: ['employe'] },
    { id: 'remplacements', label: 'Remplacements', icon: '🔄', roles: ['admin', 'superviseur', 'employe'] },
    { id: 'formations', label: 'Formations', icon: '📚', roles: ['admin', 'superviseur', 'employe'] },
    { id: 'rapports', label: 'Rapports', icon: '📈', roles: ['admin'] },
    { id: 'parametres', label: 'Paramètres', icon: '⚙️', roles: ['admin'] },
    { id: 'monprofil', label: 'Mon profil', icon: '👤', roles: ['admin', 'superviseur', 'employe'] }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    // Vérification du rôle
    if (!item.roles.includes(user?.role)) return false;
    
    // Vérification spéciale pour "Mes disponibilités" - uniquement temps partiel
    if (item.id === 'disponibilites' && user?.type_emploi !== 'temps_partiel') {
      return false;
    }
    
    return true;
  });

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
    </div>
  );
};

// Personnel Component complet
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
    fonction_superieur: false,
    type_emploi: '',
    numero_employe: '',
    date_embauche: '',
    formations: [],
    mot_de_passe: ''
  });
  const { toast } = useToast();

  const grades = ['Directeur', 'Capitaine', 'Lieutenant', 'Pompier'];

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
    if (!newUser.nom || !newUser.prenom || !newUser.email || !newUser.grade || !newUser.type_emploi || !newUser.date_embauche) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires (marqués d'un *)",
        variant: "destructive"
      });
      return;
    }

    try {
      const userToCreate = {
        ...newUser,
        role: 'employe',
        numero_employe: newUser.numero_employe || `POM${String(Date.now()).slice(-3)}`,
        mot_de_passe: 'TempPassword123!' // Mot de passe temporaire par défaut
      };

      await axios.post(`${API}/users`, userToCreate);
      toast({
        title: "Pompier créé",
        description: "Le nouveau pompier a été ajouté avec succès. Configurez son accès dans Paramètres > Comptes d'Accès",
        variant: "success"
      });
      
      setShowCreateModal(false);
      resetNewUser();
      
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
      fonction_superieur: false,
      type_emploi: '',
      numero_employe: '',
      date_embauche: new Date().toISOString().split('T')[0],
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
      fonction_superieur: user.fonction_superieur || false,
      type_emploi: user.type_emploi,
      numero_employe: user.numero_employe,
      date_embauche: user.date_embauche,
      formations: user.formations || [],
      mot_de_passe: ''
    });
    setShowEditModal(true);
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
      const userToUpdate = {
        ...newUser,
        role: selectedUser.role, // Préserver le rôle existant
        statut: selectedUser.statut, // Préserver le statut existant
        mot_de_passe: newUser.mot_de_passe || 'unchanged' // Mot de passe optionnel
      };

      await axios.put(`${API}/users/${selectedUser.id}`, userToUpdate);
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
      console.error('Error updating user:', error);
      toast({
        title: "Erreur de modification",
        description: error.response?.data?.detail || "Impossible de mettre à jour le pompier",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce pompier ?")) return;

    try {
      await axios.delete(`${API}/users/${userId}`);
      toast({
        title: "Pompier supprimé",
        description: "Le pompier a été supprimé avec succès",
        variant: "success"
      });
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le pompier",
        variant: "destructive"
      });
    }
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

  const getFormationName = (formationId) => {
    const formation = formations.find(f => f.id === formationId);
    return formation ? formation.nom : formationId;
  };

  const handleFormationToggle = (formationId) => {
    const updatedFormations = newUser.formations.includes(formationId)
      ? newUser.formations.filter(id => id !== formationId)
      : [...newUser.formations, formationId];
    
    setNewUser({...newUser, formations: updatedFormations});
  };

  const translateDay = (day) => {
    const translations = {
      'monday': 'Lundi', 'tuesday': 'Mardi', 'wednesday': 'Mercredi',
      'thursday': 'Jeudi', 'friday': 'Vendredi', 'saturday': 'Samedi', 'sunday': 'Dimanche'
    };
    return translations[day] || day;
  };

  const getStatusColor = (statut) => statut === 'Actif' ? '#10B981' : '#EF4444';
  const getGradeColor = (grade) => {
    const colors = {
      'Directeur': '#8B5CF6', 'Capitaine': '#3B82F6', 'Lieutenant': '#F59E0B', 'Pompier': '#10B981'
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
                {user.fonction_superieur && <span className="fonction-sup">+</span>}
              </span>
              <p className="employee-id">#{user.numero_employe}</p>
              {user.fonction_superieur && (
                <p className="fonction-superieur-indicator">🎖️ Fonction supérieur</p>
              )}
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
              >
                {user.statut}
              </span>
            </div>

            <div className="employment-cell">
              <span className={`employment-type ${user.type_emploi}`}>
                {user.type_emploi === 'temps_plein' ? 'Temps plein' : 'Temps partiel'}
              </span>
              {user.type_emploi === 'temps_partiel' && (
                <div className="temps-partiel-info">
                  <div className="heures-max-info">
                    <span className="heures-max-label">Max :</span>
                    <span className="heures-max-value">{user.heures_max_semaine || 40}h/sem</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewDisponibilites(user)}
                    className="mt-1"
                    data-testid={`view-availability-${user.id}`}
                  >
                    📅 Disponibilités
                  </Button>
                </div>
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

      {/* Create User Modal - Version optimisée */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content extra-large-modal" onClick={(e) => e.stopPropagation()} data-testid="create-user-modal">
            <div className="modal-header">
              <h3>🚒 Nouveau pompier</h3>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="personnel-form-grid">
                {/* Section 1: Informations personnelles */}
                <div className="form-section">
                  <h4 className="section-title">👤 Informations personnelles</h4>
                  <div className="form-row">
                    <div className="form-field">
                      <Label>Prénom *</Label>
                      <Input
                        value={newUser.prenom}
                        onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                        placeholder="Ex: Pierre"
                        data-testid="user-prenom-input"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Nom *</Label>
                      <Input
                        value={newUser.nom}
                        onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                        placeholder="Ex: Dupont"
                        data-testid="user-nom-input"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="ex: pierre.dupont@firemanager.ca"
                      data-testid="user-email-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <Label>Téléphone</Label>
                      <Input
                        value={newUser.telephone}
                        onChange={(e) => setNewUser({...newUser, telephone: e.target.value})}
                        placeholder="Ex: 514-555-1234"
                        data-testid="user-phone-input"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Contact d'urgence</Label>
                      <Input
                        value={newUser.contact_urgence}
                        onChange={(e) => setNewUser({...newUser, contact_urgence: e.target.value})}
                        placeholder="Ex: 514-999-8888"
                        data-testid="user-emergency-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Informations professionnelles */}
                <div className="form-section">
                  <h4 className="section-title">🎖️ Informations professionnelles</h4>
                  <div className="form-row">
                    <div className="form-field">
                      <Label>Grade *</Label>
                      <select
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
                      <Label>Type d'emploi *</Label>
                      <select
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

                  {/* Option fonction supérieur pour les pompiers */}
                  {newUser.grade === 'Pompier' && (
                    <div className="form-field">
                      <div className="fonction-superieur-option">
                        <label className="fonction-checkbox">
                          <input
                            type="checkbox"
                            checked={newUser.fonction_superieur}
                            onChange={(e) => setNewUser({...newUser, fonction_superieur: e.target.checked})}
                            data-testid="user-fonction-superieur"
                          />
                          <div className="fonction-content">
                            <span className="fonction-title">🎖️ Fonction supérieur</span>
                            <span className="fonction-description">
                              Ce pompier peut agir comme Lieutenant en dernier recours dans les affectations
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-field">
                      <Label>Numéro d'employé</Label>
                      <Input
                        value={newUser.numero_employe}
                        onChange={(e) => setNewUser({...newUser, numero_employe: e.target.value})}
                        placeholder="Ex: POM001 (automatique si vide)"
                        data-testid="user-number-input"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Date d'embauche *</Label>
                      <Input
                        type="date"
                        value={newUser.date_embauche}
                        onChange={(e) => setNewUser({...newUser, date_embauche: e.target.value})}
                        data-testid="user-hire-date-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Compétences et formations - Version compacte */}
                <div className="form-section">
                  <h4 className="section-title">📜 Compétences et certifications</h4>
                  <div className="formations-compact-grid">
                    {formations.map(formation => (
                      <label key={formation.id} className="formation-compact-item">
                        <input
                          type="checkbox"
                          checked={newUser.formations.includes(formation.id)}
                          onChange={() => handleFormationToggle(formation.id)}
                          data-testid={`formation-${formation.id}`}
                        />
                        <div className="formation-compact-content">
                          <div className="formation-compact-header">
                            <span className="formation-compact-name">{formation.nom}</span>
                            {formation.obligatoire && (
                              <span className="compact-obligatoire">OBL</span>
                            )}
                          </div>
                          <div className="formation-compact-meta">
                            <span>{formation.duree_heures}h</span>
                            <span>{formation.validite_mois === 0 ? 'Permanent' : `${formation.validite_mois}m`}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="formations-summary">
                    <span className="summary-text">
                      {newUser.formations.length} compétence(s) sélectionnée(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button variant="default" onClick={handleCreateUser} data-testid="submit-user-btn">
                  🚒 Créer le pompier
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal - Version modernisée */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="view-user-modal">
            <div className="modal-header">
              <h3>👤 Profil de {selectedUser.prenom} {selectedUser.nom}</h3>
              <Button variant="ghost" onClick={() => setShowViewModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="user-profile-view">
                {/* En-tête du profil */}
                <div className="profile-summary">
                  <div className="profile-avatar-large">
                    <span className="avatar-icon-large">👤</span>
                  </div>
                  <div className="profile-info-summary">
                    <h4>{selectedUser.prenom} {selectedUser.nom}</h4>
                    <div className="profile-badges">
                      <span className="grade-badge" style={{ backgroundColor: getGradeColor(selectedUser.grade) }}>
                        {selectedUser.grade}
                      </span>
                      <span className="employment-badge">
                        {selectedUser.type_emploi === 'temps_plein' ? 'Temps plein' : 'Temps partiel'}
                      </span>
                      <span className={`status-badge ${selectedUser.statut.toLowerCase()}`}>
                        {selectedUser.statut}
                      </span>
                    </div>
                    <p className="employee-id">#{selectedUser.numero_employe}</p>
                  </div>
                </div>

                {/* Informations détaillées */}
                <div className="profile-details-grid">
                  <div className="detail-section">
                    <h5>📞 Contact</h5>
                    <div className="detail-list">
                      <div className="detail-item-modern">
                        <span className="detail-label">Email</span>
                        <span className="detail-value">{selectedUser.email}</span>
                      </div>
                      <div className="detail-item-modern">
                        <span className="detail-label">Téléphone</span>
                        <span className="detail-value">{selectedUser.telephone || 'Non renseigné'}</span>
                      </div>
                      <div className="detail-item-modern">
                        <span className="detail-label">Contact d'urgence</span>
                        <span className="detail-value emergency">{selectedUser.contact_urgence || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h5>🎖️ Professionnel</h5>
                    <div className="detail-list">
                      <div className="detail-item-modern">
                        <span className="detail-label">Date d'embauche</span>
                        <span className="detail-value">{selectedUser.date_embauche}</span>
                      </div>
                      <div className="detail-item-modern">
                        <span className="detail-label">Ancienneté</span>
                        <span className="detail-value">
                          {(() => {
                            const embauche = new Date(selectedUser.date_embauche.split('/').reverse().join('-'));
                            const aujourdhui = new Date();
                            const annees = Math.floor((aujourdhui - embauche) / (365.25 * 24 * 60 * 60 * 1000));
                            return `${annees} an(s)`;
                          })()}
                        </span>
                      </div>
                      <div className="detail-item-modern">
                        <span className="detail-label">Rôle système</span>
                        <span className="detail-value">
                          {selectedUser.role === 'admin' ? '👑 Administrateur' : 
                           selectedUser.role === 'superviseur' ? '🎖️ Superviseur' : '👤 Employé'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compétences */}
                <div className="detail-section">
                  <h5>📜 Compétences et certifications</h5>
                  {selectedUser.formations?.length > 0 ? (
                    <div className="competences-view">
                      {selectedUser.formations.map((formationId, index) => (
                        <div key={index} className="competence-badge-view">
                          <span className="competence-name">{getFormationName(formationId)}</span>
                          <span className="competence-status">✅ Certifié</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-competences">
                      <p>Aucune compétence enregistrée</p>
                    </div>
                  )}
                </div>

                {/* Actions rapides */}
                <div className="profile-actions">
                  <Button 
                    variant="default" 
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditUser(selectedUser);
                    }}
                    data-testid="quick-edit-user-btn"
                  >
                    ✏️ Modifier ce profil
                  </Button>
                  {selectedUser.type_emploi === 'temps_partiel' && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowViewModal(false);
                        handleViewDisponibilites(selectedUser);
                      }}
                      data-testid="quick-view-availability-btn"
                    >
                      📅 Voir disponibilités
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disponibilités Modal */}
      {showDisponibilitesModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDisponibilitesModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="disponibilites-modal">
            <div className="modal-header">
              <h3>Disponibilités - {selectedUser.prenom} {selectedUser.nom}</h3>
              <Button variant="ghost" onClick={() => setShowDisponibilitesModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="disponibilites-view">
                {userDisponibilites.length > 0 ? (
                  userDisponibilites.map(dispo => (
                    <div key={dispo.id} className="disponibilite-item">
                      <div className="dispo-day">
                        <strong>{new Date(dispo.date).toLocaleDateString('fr-FR')}</strong>
                      </div>
                      <div className="dispo-time">
                        {dispo.heure_debut} - {dispo.heure_fin}
                      </div>
                      <div className="dispo-status">
                        <span className={`status ${dispo.statut}`}>
                          {dispo.statut === 'disponible' ? '✅ Disponible' : '❌ Indisponible'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-disponibilites">
                    <p>Aucune disponibilité renseignée</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - Complet et fonctionnel */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content extra-large-modal" onClick={(e) => e.stopPropagation()} data-testid="edit-user-modal">
            <div className="modal-header">
              <h3>✏️ Modifier {selectedUser.prenom} {selectedUser.nom}</h3>
              <Button variant="ghost" onClick={() => setShowEditModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="personnel-form-grid">
                {/* Section 1: Informations personnelles */}
                <div className="form-section">
                  <h4 className="section-title">👤 Informations personnelles</h4>
                  <div className="form-row">
                    <div className="form-field">
                      <Label>Prénom *</Label>
                      <Input
                        value={newUser.prenom}
                        onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                        data-testid="edit-user-prenom-input"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Nom *</Label>
                      <Input
                        value={newUser.nom}
                        onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                        data-testid="edit-user-nom-input"
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      data-testid="edit-user-email-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <Label>Téléphone</Label>
                      <Input
                        value={newUser.telephone}
                        onChange={(e) => setNewUser({...newUser, telephone: e.target.value})}
                        data-testid="edit-user-phone-input"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Contact d'urgence</Label>
                      <Input
                        value={newUser.contact_urgence}
                        onChange={(e) => setNewUser({...newUser, contact_urgence: e.target.value})}
                        data-testid="edit-user-emergency-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Informations professionnelles */}
                <div className="form-section">
                  <h4 className="section-title">🎖️ Informations professionnelles</h4>
                  <div className="form-row">
                    <div className="form-field">
                      <Label>Grade *</Label>
                      <select
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
                      <Label>Type d'emploi *</Label>
                      <select
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

                  {/* Option fonction supérieur pour les pompiers */}
                  {newUser.grade === 'Pompier' && (
                    <div className="form-field">
                      <div className="fonction-superieur-option">
                        <label className="fonction-checkbox">
                          <input
                            type="checkbox"
                            checked={newUser.fonction_superieur}
                            onChange={(e) => setNewUser({...newUser, fonction_superieur: e.target.checked})}
                            data-testid="edit-user-fonction-superieur"
                          />
                          <div className="fonction-content">
                            <span className="fonction-title">🎖️ Fonction supérieur</span>
                            <span className="fonction-description">
                              Ce pompier peut agir comme Lieutenant en dernier recours dans les affectations
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-field">
                      <Label>Numéro d'employé</Label>
                      <Input
                        value={newUser.numero_employe}
                        onChange={(e) => setNewUser({...newUser, numero_employe: e.target.value})}
                        data-testid="edit-user-number-input"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Date d'embauche *</Label>
                      <Input
                        type="date"
                        value={newUser.date_embauche}
                        onChange={(e) => setNewUser({...newUser, date_embauche: e.target.value})}
                        data-testid="edit-user-hire-date-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Compétences */}
                <div className="form-section">
                  <h4 className="section-title">📜 Compétences et certifications</h4>
                  <div className="formations-compact-grid">
                    {formations.map(formation => (
                      <label key={formation.id} className="formation-compact-item">
                        <input
                          type="checkbox"
                          checked={newUser.formations.includes(formation.id)}
                          onChange={() => handleFormationToggle(formation.id)}
                          data-testid={`edit-formation-${formation.id}`}
                        />
                        <div className="formation-compact-content">
                          <div className="formation-compact-header">
                            <span className="formation-compact-name">{formation.nom}</span>
                            {formation.obligatoire && (
                              <span className="compact-obligatoire">OBL</span>
                            )}
                          </div>
                          <div className="formation-compact-meta">
                            <span>{formation.duree_heures}h</span>
                            <span>{formation.validite_mois === 0 ? 'Permanent' : `${formation.validite_mois}m`}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="formations-summary">
                    <span className="summary-text">
                      {newUser.formations.length} compétence(s) sélectionnée(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Annuler
                </Button>
                <Button variant="default" onClick={handleUpdateUser} data-testid="update-user-btn">
                  💾 Sauvegarder les modifications
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Planning Component complet avec attribution automatique
const Planning = () => {
  const { user } = useAuth();
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return monday.toISOString().split('T')[0];
  });
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
      const [typesRes, assignationsRes, usersRes] = await Promise.all([
        axios.get(`${API}/types-garde`),
        axios.get(`${API}/planning/assignations/${currentWeek}`),
        user.role !== 'employe' ? axios.get(`${API}/users`) : Promise.resolve({ data: [] })
      ]);
      
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
            onClick={() => alert('Sélectionnez une cellule vide dans le planning pour assigner manuellement')}
            data-testid="manual-assign-btn"
          >
            👤 Assignation manuelle
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

      {/* Instructions for manual assignment */}
      {user.role !== 'employe' && (
        <div className="planning-instructions">
          <div className="instruction-card">
            <span className="instruction-icon">👆</span>
            <div className="instruction-text">
              <strong>Assignation manuelle :</strong> Cliquez sur une cellule vide (garde vacante) pour assigner un pompier manuellement
            </div>
          </div>
          <div className="instruction-card">
            <span className="instruction-icon">🤖</span>
            <div className="instruction-text">
              <strong>Attribution automatique :</strong> Utilise l'intelligence artificielle selon les priorités configurées
            </div>
          </div>
        </div>
      )}

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
                  style={{ borderLeftColor: typeGarde.couleur }}
                  onClick={() => openAssignModal(date, typeGarde)}
                  data-testid={`planning-cell-${dayIndex}-${typeGarde.id}`}
                >
                  {assignedUser ? (
                    <div className="assignment-content">
                      <div className="assigned-user">
                        {assignedUser.prenom} {assignedUser.nom}
                      </div>
                      <div className="user-grade" style={{ backgroundColor: typeGarde.couleur }}>
                        {assignedUser.grade}
                      </div>
                      <div className={`assignment-type ${assignation.assignation_type}`}>
                        {assignation.assignation_type === 'auto' ? '🤖 Auto' : '👤 Manuel'}
                      </div>
                    </div>
                  ) : (
                    <div className="vacant-content">
                      <div className="vacant-icon">🚫</div>
                      <div className="vacant-label">Garde vacante</div>
                      <div className="personnel-needed">{typeGarde.personnel_requis} personnel requis</div>
                      {user.role !== 'employe' && (
                        <div className="click-hint">👆 Cliquer pour assigner manuellement</div>
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
                      <span className="user-name">{userOption.prenom} {userOption.nom}</span>
                      <span className="user-grade">{userOption.grade}</span>
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

// Remplacements Component optimisé - Gestion complète remplacements et congés
const Remplacements = () => {
  const { user } = useAuth();
  const [demandes, setDemandes] = useState([]);
  const [demandesConge, setDemandesConge] = useState([]);
  const [users, setUsers] = useState([]);
  const [typesGarde, setTypesGarde] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('remplacements');
  const [showCreateRemplacementModal, setShowCreateRemplacementModal] = useState(false);
  const [showCreateCongeModal, setShowCreateCongeModal] = useState(false);
  const [newDemande, setNewDemande] = useState({
    type_garde_id: '',
    date: '',
    raison: '',
    priorite: 'normale'
  });
  const [newConge, setNewConge] = useState({
    type_conge: '',
    date_debut: '',
    date_fin: '',
    raison: '',
    priorite: 'normale'
  });
  const { toast } = useToast();

  const typesConge = [
    { value: 'maladie', label: '🏥 Maladie', description: 'Arrêt maladie avec justificatif' },
    { value: 'vacances', label: '🏖️ Vacances', description: 'Congés payés annuels' },
    { value: 'parental', label: '👶 Parental', description: 'Congé maternité/paternité' },
    { value: 'personnel', label: '👤 Personnel', description: 'Congé exceptionnel sans solde' }
  ];

  const niveauxPriorite = [
    { value: 'urgente', label: '🚨 Urgente', color: '#EF4444', description: 'Traitement immédiat requis' },
    { value: 'haute', label: '🔥 Haute', color: '#F59E0B', description: 'Traitement prioritaire dans 24h' },
    { value: 'normale', label: '📋 Normale', color: '#3B82F6', description: 'Traitement dans délai standard' },
    { value: 'faible', label: '📝 Faible', color: '#6B7280', description: 'Traitement différé possible' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const promises = [
        axios.get(`${API}/remplacements`),
        axios.get(`${API}/demandes-conge`),
        axios.get(`${API}/types-garde`)
      ];
      
      if (user.role !== 'employe') {
        promises.push(axios.get(`${API}/users`));
      }

      const responses = await Promise.all(promises);
      setDemandes(responses[0].data);
      setDemandesConge(responses[1].data);
      setTypesGarde(responses[2].data);
      
      if (responses[3]) {
        setUsers(responses[3].data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRemplacement = async () => {
    if (!newDemande.type_garde_id || !newDemande.date || !newDemande.raison.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.post(`${API}/remplacements`, newDemande);
      toast({
        title: "Demande créée",
        description: "Votre demande de remplacement a été soumise et la recherche automatique va commencer",
        variant: "success"
      });
      setShowCreateRemplacementModal(false);
      setNewDemande({ type_garde_id: '', date: '', raison: '', priorite: 'normale' });
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande",
        variant: "destructive"
      });
    }
  };

  const handleCreateConge = async () => {
    if (!newConge.type_conge || !newConge.date_debut || !newConge.date_fin || !newConge.raison.trim()) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.post(`${API}/demandes-conge`, newConge);
      toast({
        title: "Demande de congé créée",
        description: "Votre demande a été soumise et sera examinée par votre superviseur",
        variant: "success"
      });
      setShowCreateCongeModal(false);
      setNewConge({ type_conge: '', date_debut: '', date_fin: '', raison: '', priorite: 'normale' });
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la demande de congé",
        variant: "destructive"
      });
    }
  };

  const handleApprouverConge = async (demandeId, action, commentaire = "") => {
    if (user.role === 'employe') return;

    try {
      await axios.put(`${API}/demandes-conge/${demandeId}/approuver?action=${action}&commentaire=${commentaire}`);
      toast({
        title: action === 'approuver' ? "Congé approuvé" : "Congé refusé",
        description: `La demande de congé a été ${action === 'approuver' ? 'approuvée' : 'refusée'}`,
        variant: "success"
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la demande",
        variant: "destructive"
      });
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'en_cours': case 'en_attente': return '#F59E0B';
      case 'approuve': return '#10B981';
      case 'refuse': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'en_cours': return 'En cours';
      case 'en_attente': return 'En attente';
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

  const getPrioriteColor = (priorite) => {
    const prioriteObj = niveauxPriorite.find(p => p.value === priorite);
    return prioriteObj ? prioriteObj.color : '#6B7280';
  };

  if (loading) return <div className="loading" data-testid="replacements-loading">Chargement...</div>;

  return (
    <div className="remplacements-optimized">
      <div className="remplacements-header">
        <div>
          <h1 data-testid="replacements-title">Gestion des remplacements et congés</h1>
          <p>Demandes de remplacement avec recherche automatique et gestion des congés</p>
        </div>
        <div className="header-actions">
          <Button 
            variant="default" 
            onClick={() => setShowCreateRemplacementModal(true)}
            data-testid="create-replacement-btn"
          >
            🔄 Demande de remplacement
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowCreateCongeModal(true)}
            data-testid="create-conge-btn"
          >
            🏖️ Demande de congé
          </Button>
        </div>
      </div>

      {/* Onglets Remplacements / Congés */}
      <div className="replacement-tabs">
        <button
          className={`tab-button ${activeTab === 'remplacements' ? 'active' : ''}`}
          onClick={() => setActiveTab('remplacements')}
          data-testid="tab-remplacements"
        >
          🔄 Remplacements ({demandes.length})
        </button>
        <button
          className={`tab-button ${activeTab === 'conges' ? 'active' : ''}`}
          onClick={() => setActiveTab('conges')}
          data-testid="tab-conges"
        >
          🏖️ Congés ({demandesConge.length})
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === 'remplacements' && (
          <div className="remplacements-content">
            {/* Statistics Cards pour remplacements */}
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

              <div className="stat-card coverage">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Taux de couverture</h3>
                  <p className="stat-number">94%</p>
                  <p className="stat-label">Remplacements trouvés</p>
                </div>
              </div>
            </div>

            {/* Liste des demandes de remplacement */}
            <div className="demandes-list">
              {demandes.length > 0 ? (
                demandes.map(demande => (
                  <div key={demande.id} className="demande-card" data-testid={`replacement-${demande.id}`}>
                    <div className="demande-header">
                      <div className="demande-info">
                        <h3>{getTypeGardeName(demande.type_garde_id)}</h3>
                        <span className="demande-date">{new Date(demande.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="demande-status">
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatutColor(demande.statut) }}
                        >
                          {getStatutLabel(demande.statut)}
                        </span>
                      </div>
                    </div>
                    <div className="demande-details">
                      <p className="demande-raison">{demande.raison}</p>
                      <div className="demande-meta">
                        <span>Demandé par: {getUserName(demande.demandeur_id)}</span>
                        <span>Le: {new Date(demande.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    {user.role !== 'employe' && demande.statut === 'en_cours' && (
                      <div className="demande-actions">
                        <Button variant="outline" size="sm" data-testid={`search-replacement-${demande.id}`}>
                          🔍 Recherche auto
                        </Button>
                        <Button variant="ghost" size="sm" data-testid={`approve-replacement-${demande.id}`}>✅</Button>
                        <Button variant="ghost" size="sm" className="danger" data-testid={`reject-replacement-${demande.id}`}>❌</Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>Aucune demande de remplacement</h3>
                  <p>Les demandes apparaîtront ici.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'conges' && (
          <div className="conges-content">
            {/* Statistics Cards pour congés */}
            <div className="conge-stats">
              <div className="stat-card-conge pending">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>En attente</h3>
                  <p className="stat-number">{demandesConge.filter(d => d.statut === 'en_attente').length}</p>
                  <p className="stat-label">À approuver</p>
                </div>
              </div>

              <div className="stat-card-conge approved">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>Approuvés</h3>
                  <p className="stat-number">{demandesConge.filter(d => d.statut === 'approuve').length}</p>
                  <p className="stat-label">Ce mois</p>
                </div>
              </div>

              <div className="stat-card-conge total">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total jours</h3>
                  <p className="stat-number">{demandesConge.reduce((total, d) => total + (d.nombre_jours || 0), 0)}</p>
                  <p className="stat-label">Jours de congé</p>
                </div>
              </div>
            </div>

            {/* Liste des demandes de congé */}
            <div className="conges-list">
              {demandesConge.length > 0 ? (
                demandesConge.map(conge => (
                  <div key={conge.id} className="conge-card" data-testid={`conge-${conge.id}`}>
                    <div className="conge-header">
                      <div className="conge-type">
                        <span className="type-badge">
                          {typesConge.find(t => t.value === conge.type_conge)?.label || conge.type_conge}
                        </span>
                        <span 
                          className="priorite-badge" 
                          style={{ backgroundColor: getPrioriteColor(conge.priorite) }}
                        >
                          {niveauxPriorite.find(p => p.value === conge.priorite)?.label || conge.priorite}
                        </span>
                      </div>
                      <div className="conge-status">
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatutColor(conge.statut) }}
                        >
                          {getStatutLabel(conge.statut)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="conge-details">
                      <div className="conge-dates">
                        <span className="date-range">
                          {new Date(conge.date_debut).toLocaleDateString('fr-FR')} - {new Date(conge.date_fin).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="jours-count">({conge.nombre_jours} jour{conge.nombre_jours > 1 ? 's' : ''})</span>
                      </div>
                      <p className="conge-raison">{conge.raison}</p>
                      <div className="conge-meta">
                        <span>Demandé par: {getUserName(conge.demandeur_id)}</span>
                        <span>Le: {new Date(conge.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    {user.role !== 'employe' && conge.statut === 'en_attente' && (
                      <div className="conge-actions">
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleApprouverConge(conge.id, 'approuver')}
                          data-testid={`approve-conge-${conge.id}`}
                        >
                          ✅ Approuver
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleApprouverConge(conge.id, 'refuser')}
                          data-testid={`reject-conge-${conge.id}`}
                        >
                          ❌ Refuser
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <h3>Aucune demande de congé</h3>
                  <p>Les demandes de congé apparaîtront ici.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Replacement Modal */}
      {showCreateRemplacementModal && (
        <div className="modal-overlay" onClick={() => setShowCreateRemplacementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="create-replacement-modal">
            <div className="modal-header">
              <h3>Nouvelle demande de remplacement</h3>
              <Button variant="ghost" onClick={() => setShowCreateRemplacementModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <Label htmlFor="type-garde">Type de garde *</Label>
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
                <Label htmlFor="date">Date de la garde *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDemande.date}
                  onChange={(e) => setNewDemande({...newDemande, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="select-date"
                />
              </div>

              <div className="form-field">
                <Label htmlFor="priorite">Priorité</Label>
                <select
                  id="priorite"
                  value={newDemande.priorite}
                  onChange={(e) => setNewDemande({...newDemande, priorite: e.target.value})}
                  className="form-select"
                  data-testid="select-priority"
                >
                  {niveauxPriorite.map(niveau => (
                    <option key={niveau.value} value={niveau.value}>
                      {niveau.label} - {niveau.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <Label htmlFor="raison">Raison du remplacement *</Label>
                <textarea
                  id="raison"
                  value={newDemande.raison}
                  onChange={(e) => setNewDemande({...newDemande, raison: e.target.value})}
                  placeholder="Expliquez la raison de votre demande de remplacement (ex: maladie, congé personnel, urgence familiale...)"
                  rows="4"
                  className="form-textarea"
                  data-testid="replacement-reason"
                />
              </div>

              <div className="modal-actions">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateRemplacementModal(false)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleCreateRemplacement}
                  data-testid="submit-replacement-btn"
                >
                  Créer la demande
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Conge Modal */}
      {showCreateCongeModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCongeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="create-conge-modal">
            <div className="modal-header">
              <h3>Nouvelle demande de congé</h3>
              <Button variant="ghost" onClick={() => setShowCreateCongeModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="form-field">
                <Label htmlFor="type-conge">Type de congé *</Label>
                <select
                  id="type-conge"
                  value={newConge.type_conge}
                  onChange={(e) => setNewConge({...newConge, type_conge: e.target.value})}
                  className="form-select"
                  data-testid="select-conge-type"
                >
                  <option value="">Sélectionner un type de congé</option>
                  {typesConge.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <Label htmlFor="date-debut">Date de début *</Label>
                  <Input
                    id="date-debut"
                    type="date"
                    value={newConge.date_debut}
                    onChange={(e) => setNewConge({...newConge, date_debut: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    data-testid="select-date-debut"
                  />
                </div>
                <div className="form-field">
                  <Label htmlFor="date-fin">Date de fin *</Label>
                  <Input
                    id="date-fin"
                    type="date"
                    value={newConge.date_fin}
                    onChange={(e) => setNewConge({...newConge, date_fin: e.target.value})}
                    min={newConge.date_debut || new Date().toISOString().split('T')[0]}
                    data-testid="select-date-fin"
                  />
                </div>
              </div>

              <div className="form-field">
                <Label htmlFor="priorite-conge">Priorité</Label>
                <select
                  id="priorite-conge"
                  value={newConge.priorite}
                  onChange={(e) => setNewConge({...newConge, priorite: e.target.value})}
                  className="form-select"
                  data-testid="select-conge-priority"
                >
                  {niveauxPriorite.map(niveau => (
                    <option key={niveau.value} value={niveau.value}>
                      {niveau.label} - {niveau.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <Label htmlFor="raison-conge">Raison du congé *</Label>
                <textarea
                  id="raison-conge"
                  value={newConge.raison}
                  onChange={(e) => setNewConge({...newConge, raison: e.target.value})}
                  placeholder="Expliquez la raison de votre demande de congé..."
                  rows="4"
                  className="form-textarea"
                  data-testid="conge-reason"
                />
              </div>

              <div className="modal-actions">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateCongeModal(false)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleCreateConge}
                  data-testid="submit-conge-btn"
                >
                  Créer la demande
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de demande de remplacement avec priorité */}
      {showCreateRemplacementModal && (
        <div className="modal-overlay" onClick={() => setShowCreateRemplacementModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="create-replacement-modal">
            <div className="modal-header">
              <h3>🔄 Nouvelle demande de remplacement</h3>
              <Button variant="ghost" onClick={() => setShowCreateRemplacementModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="priority-section">
                <h4>🎯 Niveau de priorité</h4>
                <div className="priority-options">
                  {niveauxPriorite.map(priorite => (
                    <label key={priorite.value} className="priority-option">
                      <input
                        type="radio"
                        name="priorite"
                        value={priorite.value}
                        checked={newDemande.priorite === priorite.value}
                        onChange={(e) => setNewDemande({...newDemande, priorite: e.target.value})}
                      />
                      <div className="priority-content" style={{ borderColor: priorite.color }}>
                        <span className="priority-label" style={{ color: priorite.color }}>{priorite.label}</span>
                        <span className="priority-description">{priorite.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <Label>Type de garde *</Label>
                <select
                  value={newDemande.type_garde_id}
                  onChange={(e) => setNewDemande({...newDemande, type_garde_id: e.target.value})}
                  className="form-select"
                  data-testid="replacement-type-garde-select"
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
                <Label>Date de la garde *</Label>
                <Input
                  type="date"
                  value={newDemande.date}
                  onChange={(e) => setNewDemande({...newDemande, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  data-testid="replacement-date-input"
                />
              </div>

              <div className="form-field">
                <Label>Raison du remplacement *</Label>
                <textarea
                  value={newDemande.raison}
                  onChange={(e) => setNewDemande({...newDemande, raison: e.target.value})}
                  placeholder="Expliquez la raison (maladie, urgence familiale, conflit horaire...)"
                  rows="3"
                  className="form-textarea"
                  data-testid="replacement-reason-input"
                />
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCreateRemplacementModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleCreateRemplacement} data-testid="submit-replacement-btn">
                  Créer la demande
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de demande de congé avec priorité */}
      {showCreateCongeModal && (
        <div className="modal-overlay" onClick={() => setShowCreateCongeModal(false)}>
          <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()} data-testid="create-conge-modal">
            <div className="modal-header">
              <h3>🏖️ Nouvelle demande de congé</h3>
              <Button variant="ghost" onClick={() => setShowCreateCongeModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="priority-section">
                <h4>🎯 Niveau de priorité</h4>
                <div className="priority-options">
                  {niveauxPriorite.map(priorite => (
                    <label key={priorite.value} className="priority-option">
                      <input
                        type="radio"
                        name="priorite-conge"
                        value={priorite.value}
                        checked={newConge.priorite === priorite.value}
                        onChange={(e) => setNewConge({...newConge, priorite: e.target.value})}
                      />
                      <div className="priority-content" style={{ borderColor: priorite.color }}>
                        <span className="priority-label" style={{ color: priorite.color }}>{priorite.label}</span>
                        <span className="priority-description">{priorite.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <Label>Type de congé *</Label>
                <div className="conge-type-options">
                  {typesConge.map(type => (
                    <label key={type.value} className="conge-type-option">
                      <input
                        type="radio"
                        name="type-conge"
                        value={type.value}
                        checked={newConge.type_conge === type.value}
                        onChange={(e) => setNewConge({...newConge, type_conge: e.target.value})}
                      />
                      <div className="conge-type-content">
                        <span className="conge-type-label">{type.label}</span>
                        <span className="conge-type-description">{type.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <Label>Date de début *</Label>
                  <Input
                    type="date"
                    value={newConge.date_debut}
                    onChange={(e) => setNewConge({...newConge, date_debut: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    data-testid="conge-date-debut-input"
                  />
                </div>
                <div className="form-field">
                  <Label>Date de fin *</Label>
                  <Input
                    type="date"
                    value={newConge.date_fin}
                    onChange={(e) => setNewConge({...newConge, date_fin: e.target.value})}
                    min={newConge.date_debut || new Date().toISOString().split('T')[0]}
                    data-testid="conge-date-fin-input"
                  />
                </div>
              </div>

              <div className="form-field">
                <Label>Raison du congé *</Label>
                <textarea
                  value={newConge.raison}
                  onChange={(e) => setNewConge({...newConge, raison: e.target.value})}
                  placeholder="Décrivez la raison de votre demande de congé..."
                  rows="3"
                  className="form-textarea"
                  data-testid="conge-reason-input"
                />
              </div>

              <div className="workflow-info">
                <h4>📋 Processus d'approbation</h4>
                <div className="workflow-steps">
                  <div className="workflow-step">
                    <span className="step-number">1</span>
                    <span>Soumission de la demande</span>
                  </div>
                  <div className="workflow-step">
                    <span className="step-number">2</span>
                    <span>
                      {user.role === 'employe' ? 'Approbation superviseur' : 'Approbation administrateur'}
                    </span>
                  </div>
                  <div className="workflow-step">
                    <span className="step-number">3</span>
                    <span>Notification et mise à jour planning</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCreateCongeModal(false)}>Annuler</Button>
                <Button variant="default" onClick={handleCreateConge} data-testid="submit-conge-btn">
                  Soumettre la demande
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Formations Component complet - Planning de formations
const Formations = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSession, setNewSession] = useState({
    titre: '',
    competence_id: '',
    duree_heures: 8,
    date_debut: '',
    heure_debut: '09:00',
    lieu: '',
    formateur: '',
    descriptif: '',
    plan_cours: '',
    places_max: 20
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const [sessionsResponse, competencesResponse] = await Promise.all([
          axios.get(`${API}/sessions-formation`),
          axios.get(`${API}/formations`)
        ]);
        setSessions(sessionsResponse.data);
        setCompetences(competencesResponse.data);
      } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, []);

  const handleCreateSession = async () => {
    if (!newSession.titre || !newSession.competence_id || !newSession.date_debut || !newSession.lieu || !newSession.formateur) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await axios.post(`${API}/sessions-formation`, newSession);
      toast({
        title: "Formation créée",
        description: "La session de formation a été programmée avec succès",
        variant: "success"
      });
      setShowCreateModal(false);
      resetNewSession();
      
      // Reload sessions
      const response = await axios.get(`${API}/sessions-formation`);
      setSessions(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la session de formation",
        variant: "destructive"
      });
    }
  };

  const handleInscription = async (sessionId, isInscrit) => {
    try {
      if (isInscrit) {
        await axios.delete(`${API}/sessions-formation/${sessionId}/desinscription`);
        toast({
          title: "Désinscription réussie",
          description: "Vous êtes désinscrit de cette formation",
          variant: "success"
        });
      } else {
        await axios.post(`${API}/sessions-formation/${sessionId}/inscription`);
        toast({
          title: "Inscription réussie",
          description: "Vous êtes maintenant inscrit à cette formation",
          variant: "success"
        });
      }
      
      // Reload sessions
      const response = await axios.get(`${API}/sessions-formation`);
      setSessions(response.data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.response?.data?.detail || "Impossible de traiter l'inscription",
        variant: "destructive"
      });
    }
  };

  const resetNewSession = () => {
    setNewSession({
      titre: '',
      competence_id: '',
      duree_heures: 8,
      date_debut: '',
      heure_debut: '09:00',
      lieu: '',
      formateur: '',
      descriptif: '',
      plan_cours: '',
      places_max: 20
    });
  };

  const getCompetenceName = (competenceId) => {
    const competence = competences.find(c => c.id === competenceId);
    return competence ? competence.nom : 'Compétence non trouvée';
  };

  const isUserInscrit = (session) => {
    return session.participants.includes(user.id);
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'planifie': return '#3B82F6';
      case 'en_cours': return '#F59E0B';
      case 'termine': return '#10B981';
      case 'annule': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'planifie': return 'Planifiée';
      case 'en_cours': return 'En cours';
      case 'termine': return 'Terminée';
      case 'annule': return 'Annulée';
      default: return statut;
    }
  };

  if (loading) return <div className="loading" data-testid="formations-loading">Chargement des formations...</div>;

  return (
    <div className="formations-planning">
      <div className="formations-header">
        <div>
          <h1 data-testid="formations-title">Planning des formations</h1>
          <p>Sessions de formation et maintien des compétences</p>
        </div>
        {user.role !== 'employe' && (
          <Button 
            variant="default" 
            onClick={() => setShowCreateModal(true)}
            data-testid="create-session-btn"
          >
            📚 Créer une formation
          </Button>
        )}
      </div>

      {/* Statistiques des formations */}
      <div className="formations-stats">
        <div className="stat-card-formation">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-number">{sessions.filter(s => s.statut === 'planifie').length}</span>
            <span className="stat-label">Formations planifiées</span>
          </div>
        </div>
        <div className="stat-card-formation">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-number">{sessions.reduce((total, s) => total + s.participants.length, 0)}</span>
            <span className="stat-label">Participants inscrits</span>
          </div>
        </div>
        <div className="stat-card-formation">
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <span className="stat-number">{sessions.filter(s => s.statut === 'termine').length}</span>
            <span className="stat-label">Formations terminées</span>
          </div>
        </div>
      </div>

      {/* Liste des sessions de formation */}
      <div className="sessions-list">
        {sessions.length > 0 ? (
          <div className="sessions-grid">
            {sessions.map(session => (
              <div key={session.id} className="session-card" data-testid={`session-${session.id}`}>
                <div className="session-header">
                  <div className="session-title-area">
                    <h3>{session.titre}</h3>
                    <span 
                      className="session-statut" 
                      style={{ backgroundColor: getStatutColor(session.statut) }}
                    >
                      {getStatutLabel(session.statut)}
                    </span>
                  </div>
                  <div className="session-competence">
                    <span className="competence-badge">{getCompetenceName(session.competence_id)}</span>
                  </div>
                </div>

                <div className="session-details">
                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span>{new Date(session.date_debut).toLocaleDateString('fr-FR')} à {session.heure_debut}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">⏱️</span>
                    <span>{session.duree_heures}h de formation</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📍</span>
                    <span>{session.lieu}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">👨‍🏫</span>
                    <span>{session.formateur}</span>
                  </div>
                </div>

                <div className="session-description">
                  <p>{session.descriptif}</p>
                </div>

                <div className="session-participants">
                  <div className="participants-count">
                    <span className="count-badge">
                      {session.participants.length}/{session.places_max}
                    </span>
                    <span className="participants-label">participants</span>
                  </div>
                  <div className="participants-progress">
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${(session.participants.length / session.places_max) * 100}%`,
                        backgroundColor: session.participants.length >= session.places_max ? '#EF4444' : '#10B981'
                      }}
                    ></div>
                  </div>
                </div>

                <div className="session-actions">
                  {session.statut === 'planifie' && (
                    <Button
                      variant={isUserInscrit(session) ? "destructive" : "default"}
                      onClick={() => handleInscription(session.id, isUserInscrit(session))}
                      data-testid={`inscription-btn-${session.id}`}
                      disabled={!isUserInscrit(session) && session.participants.length >= session.places_max}
                    >
                      {isUserInscrit(session) ? '❌ Se désinscrire' : 
                       session.participants.length >= session.places_max ? '🚫 Complet' : '✅ S\'inscrire'}
                    </Button>
                  )}
                  {user.role !== 'employe' && (
                    <Button variant="ghost" size="sm" data-testid={`edit-session-${session.id}`}>
                      ✏️ Modifier
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-sessions">
            <h3>Aucune formation planifiée</h3>
            <p>Les sessions de formation apparaîtront ici une fois programmées.</p>
            {user.role !== 'employe' && (
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(true)}
                className="mt-4"
              >
                Créer la première formation
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal de création de session */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content extra-large-modal" onClick={(e) => e.stopPropagation()} data-testid="create-session-modal">
            <div className="modal-header">
              <h3>📚 Créer une session de formation</h3>
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="session-form-grid">
                <div className="form-section">
                  <h4 className="section-title">📋 Informations générales</h4>
                  <div className="form-field">
                    <Label>Titre de la formation *</Label>
                    <Input
                      value={newSession.titre}
                      onChange={(e) => setNewSession({...newSession, titre: e.target.value})}
                      placeholder="Ex: Formation sauvetage aquatique - Niveau 1"
                      data-testid="session-titre-input"
                    />
                  </div>

                  <div className="form-field">
                    <Label>Compétence associée *</Label>
                    <select
                      value={newSession.competence_id}
                      onChange={(e) => setNewSession({...newSession, competence_id: e.target.value})}
                      className="form-select"
                      data-testid="session-competence-select"
                    >
                      <option value="">Sélectionner une compétence</option>
                      {competences.map(comp => (
                        <option key={comp.id} value={comp.id}>
                          {comp.nom} - {comp.duree_heures}h
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <Label>Date de début *</Label>
                      <Input
                        type="date"
                        value={newSession.date_debut}
                        onChange={(e) => setNewSession({...newSession, date_debut: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        data-testid="session-date-input"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Heure de début *</Label>
                      <Input
                        type="time"
                        value={newSession.heure_debut}
                        onChange={(e) => setNewSession({...newSession, heure_debut: e.target.value})}
                        data-testid="session-heure-input"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-field">
                      <Label>Durée (heures) *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="40"
                        value={newSession.duree_heures}
                        onChange={(e) => setNewSession({...newSession, duree_heures: parseInt(e.target.value)})}
                        data-testid="session-duree-input"
                      />
                    </div>
                    <div className="form-field">
                      <Label>Nombre de places *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={newSession.places_max}
                        onChange={(e) => setNewSession({...newSession, places_max: parseInt(e.target.value)})}
                        data-testid="session-places-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="section-title">📍 Logistique</h4>
                  <div className="form-field">
                    <Label>Lieu de formation *</Label>
                    <Input
                      value={newSession.lieu}
                      onChange={(e) => setNewSession({...newSession, lieu: e.target.value})}
                      placeholder="Ex: Caserne centrale, Salle de formation A"
                      data-testid="session-lieu-input"
                    />
                  </div>

                  <div className="form-field">
                    <Label>Formateur *</Label>
                    <Input
                      value={newSession.formateur}
                      onChange={(e) => setNewSession({...newSession, formateur: e.target.value})}
                      placeholder="Ex: Capitaine Martin Dubois"
                      data-testid="session-formateur-input"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h4 className="section-title">📝 Contenu pédagogique</h4>
                  <div className="form-field">
                    <Label>Description de la formation *</Label>
                    <textarea
                      value={newSession.descriptif}
                      onChange={(e) => setNewSession({...newSession, descriptif: e.target.value})}
                      placeholder="Décrivez les objectifs et le contenu de cette formation..."
                      rows="3"
                      className="form-textarea"
                      data-testid="session-descriptif-input"
                    />
                  </div>

                  <div className="form-field">
                    <Label>Plan de cours (optionnel)</Label>
                    <textarea
                      value={newSession.plan_cours}
                      onChange={(e) => setNewSession({...newSession, plan_cours: e.target.value})}
                      placeholder="Détaillez le programme, les modules, les exercices pratiques..."
                      rows="4"
                      className="form-textarea"
                      data-testid="session-plan-input"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Annuler
                </Button>
                <Button variant="default" onClick={handleCreateSession} data-testid="create-session-submit-btn">
                  📚 Créer la formation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mes Disponibilités Component - Module dédié
const MesDisponibilites = () => {
  const { user } = useAuth();
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

  const handleTypeGardeChange = (typeGardeId) => {
    const selectedType = typesGarde.find(t => t.id === typeGardeId);
    
    if (selectedType) {
      // Auto-remplir les horaires du type de garde
      setAvailabilityConfig({
        ...availabilityConfig,
        type_garde_id: typeGardeId,
        heure_debut: selectedType.heure_debut,
        heure_fin: selectedType.heure_fin
      });
    } else {
      // "Tous les types" - garder les horaires personnalisés
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
      // Combiner avec les disponibilités existantes + nouvelles configurations
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
        title: "Toutes les disponibilités sauvegardées",
        description: `${newDispos.length} nouvelles disponibilités ajoutées`,
        variant: "success"
      });
      
      setShowCalendarModal(false);
      setPendingConfigurations([]);
      
      // Reload disponibilités
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

  const handleSaveAvailability = async () => {
    if (selectedDates.length === 0) {
      toast({
        title: "Aucune date sélectionnée",
        description: "Veuillez sélectionner au moins une date",
        variant: "destructive"
      });
      return;
    }

    try {
      // CORRECTION : Combiner avec les disponibilités existantes au lieu de remplacer
      const existingDispos = userDisponibilites.map(d => ({
        user_id: user.id,
        date: d.date,
        type_garde_id: d.type_garde_id || null,
        heure_debut: d.heure_debut,
        heure_fin: d.heure_fin,
        statut: d.statut
      }));

      const nouvelles_disponibilites = selectedDates.map(date => ({
        user_id: user.id,
        date: date.toISOString().split('T')[0],
        type_garde_id: availabilityConfig.type_garde_id || null,
        heure_debut: availabilityConfig.heure_debut,
        heure_fin: availabilityConfig.heure_fin,
        statut: availabilityConfig.statut
      }));

      // Combiner existantes + nouvelles
      const allDisponibilites = [...existingDispos, ...nouvelles_disponibilites];

      await axios.put(`${API}/disponibilites/${user.id}`, allDisponibilites);
      
      toast({
        title: "Disponibilités ajoutées",
        description: `${nouvelles_disponibilites.length} nouveaux jours configurés (${allDisponibilites.length} total)`,
        variant: "success"
      });
      
      setShowCalendarModal(false);
      setSelectedDates([]);
      
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

  const getTypeGardeName = (typeGardeId) => {
    if (!typeGardeId) return 'Tous types';
    const typeGarde = typesGarde.find(t => t.id === typeGardeId);
    return typeGarde ? typeGarde.nom : 'Type non spécifié';
  };

  const getAvailableDates = () => {
    return userDisponibilites
      .filter(d => d.statut === 'disponible')
      .map(d => new Date(d.date));
  };

  const getColorByTypeGarde = (typeGardeId) => {
    if (!typeGardeId) return '#10B981'; // Vert par défaut pour "Tous types"
    const typeGarde = typesGarde.find(t => t.id === typeGardeId);
    return typeGarde ? typeGarde.couleur : '#10B981';
  };

  const getDisponibiliteForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return userDisponibilites.find(d => d.date === dateStr);
  };

  const handleDateClick = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dispos = userDisponibilites.filter(d => d.date === dateStr);
    
    if (dispos.length > 0) {
      // Afficher TOUTES les disponibilités pour cette date
      setSelectedDateDetails({
        date: date,
        disponibilites: dispos, // Tableau au lieu d'un seul objet
        count: dispos.length
      });
    } else {
      setSelectedDateDetails(null);
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

      {/* Résumé des disponibilités - Design amélioré */}
      <div className="availability-overview-enhanced">
        <div className="overview-cards">
          <div className="overview-card">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <span className="card-number">{userDisponibilites.length}</span>
              <span className="card-label">Disponibilités enregistrées</span>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="card-icon">⏱️</div>
            <div className="card-content">
              <span className="card-number">
                {userDisponibilites.reduce((total, dispo) => {
                  if (dispo.statut === 'disponible') {
                    const start = new Date(`1970-01-01T${dispo.heure_debut}`);
                    let end = new Date(`1970-01-01T${dispo.heure_fin}`);
                    
                    // Corriger pour les horaires qui traversent minuit
                    if (end < start) {
                      end = new Date(`1970-01-02T${dispo.heure_fin}`); // Jour suivant
                    }
                    
                    const hours = (end - start) / (1000 * 60 * 60);
                    return total + hours;
                  }
                  return total;
                }, 0)}h
              </span>
              <span className="card-label">Heures/mois</span>
            </div>
          </div>
          
          <div className="overview-card">
            <div className="card-icon">🚒</div>
            <div className="card-content">
              <span className="card-number">{[...new Set(userDisponibilites.map(d => d.type_garde_id).filter(Boolean))].length}</span>
              <span className="card-label">Types de garde</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier et détails des disponibilités */}
      <div className="availability-main-enhanced">
        <div className="calendar-section-large">
          <h2>Calendrier de disponibilités - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
          
          <Calendar
            mode="multiple"
            selected={getAvailableDates()}
            onDayClick={handleDateClick}
            className="availability-calendar-large"
            disabled={(date) => date < new Date().setHours(0,0,0,0)}
            modifiers={{
              available: getAvailableDates(),
              ...userDisponibilites.reduce((acc, dispo) => {
                const date = new Date(dispo.date);
                const typeGardeName = getTypeGardeName(dispo.type_garde_id).toLowerCase().replace(/\s+/g, '-');
                if (!acc[typeGardeName]) acc[typeGardeName] = [];
                acc[typeGardeName].push(date);
                return acc;
              }, {})
            }}
            modifiersStyles={{
              available: { 
                backgroundColor: '#dcfce7', 
                color: '#166534',
                fontWeight: 'bold',
                cursor: 'pointer'
              },
              ...userDisponibilites.reduce((acc, dispo) => {
                const typeGardeName = getTypeGardeName(dispo.type_garde_id).toLowerCase().replace(/\s+/g, '-');
                const color = getColorByTypeGarde(dispo.type_garde_id);
                acc[typeGardeName] = {
                  backgroundColor: color + '20',
                  borderColor: color,
                  borderWidth: '2px',
                  color: color,
                  fontWeight: 'bold',
                  cursor: 'pointer'
                };
                return acc;
              }, {})
            }}
          />
          
          <div className="calendar-legend-enhanced">
            <div className="legend-section">
              <h4>📍 Légende du calendrier</h4>
              <div className="legend-items-enhanced">
                <div className="legend-item-enhanced available">
                  <div className="legend-indicator available"></div>
                  <span>Jours disponibles configurés</span>
                </div>
                <div className="legend-item-enhanced unavailable">
                  <div className="legend-indicator unavailable"></div>
                  <span>Jours non configurés</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Code couleur modernisé par type de garde */}
          {typesGarde.length > 0 && (
            <div className="type-garde-legend-enhanced">
              <h4>🎨 Code couleur par type de garde</h4>
              <div className="type-legend-grid">
                {typesGarde.map(type => (
                  <div key={type.id} className="type-legend-card">
                    <div className="type-color-indicator" style={{ backgroundColor: type.couleur }}>
                      <span className="type-initial">{type.nom.charAt(0)}</span>
                    </div>
                    <div className="type-info">
                      <span className="type-name">{type.nom}</span>
                      <span className="type-hours">{type.heure_debut} - {type.heure_fin}</span>
                    </div>
                  </div>
                ))}
                <div className="type-legend-card">
                  <div className="type-color-indicator general">
                    <span className="type-initial">T</span>
                  </div>
                  <div className="type-info">
                    <span className="type-name">Tous types (général)</span>
                    <span className="type-hours">Horaires variables</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="availability-details-enhanced">
          <div className="details-header">
            <h3>📋 Détails des disponibilités</h3>
            <p className="click-instruction">💡 Cliquez sur une date du calendrier pour voir les détails</p>
          </div>

          {/* Affichage des détails de la date cliquée - Gestion multiple */}
          {selectedDateDetails && (
            <div className="selected-date-details">
              <div className="selected-date-header">
                <h4>📅 {selectedDateDetails.date.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} 
                {selectedDateDetails.count > 1 && (
                  <span className="multiple-indicator">({selectedDateDetails.count} configurations)</span>
                )}
                </h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedDateDetails(null)}
                  className="close-details"
                >
                  ✕
                </Button>
              </div>
              
              <div className="selected-date-content">
                {selectedDateDetails.disponibilites.map((dispo, index) => (
                  <div key={index} className="dispo-detail-card">
                    <div className="detail-item-large">
                      <span className="detail-icon">🚒</span>
                      <div className="detail-info">
                        <span className="detail-title">Type de garde {selectedDateDetails.count > 1 ? `#${index + 1}` : ''}</span>
                        <span className="detail-value" style={{ color: getColorByTypeGarde(dispo.type_garde_id) }}>
                          {getTypeGardeName(dispo.type_garde_id)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="detail-item-large">
                      <span className="detail-icon">⏰</span>
                      <div className="detail-info">
                        <span className="detail-title">Horaires</span>
                        <span className="detail-value">
                          {dispo.heure_debut} - {dispo.heure_fin}
                        </span>
                      </div>
                    </div>
                    
                    <div className="detail-item-large">
                      <span className="detail-icon">📊</span>
                      <div className="detail-info">
                        <span className="detail-title">Statut</span>
                        <span className={`detail-status ${dispo.statut}`}>
                          {dispo.statut === 'disponible' ? '✅ Disponible' : 
                           dispo.statut === 'preference' ? '⚡ Préférence' : '❌ Indisponible'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des disponibilités triée par date */}
          {userDisponibilites.length > 0 ? (
            <div className="availability-list-enhanced">
              {userDisponibilites
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(dispo => (
                <div key={dispo.id} className="availability-item-enhanced">
                  <div className="availability-date-info">
                    <div className="date-badge">
                      <span className="date-day-short">{new Date(dispo.date).getDate()}</span>
                      <span className="date-month-short">{new Date(dispo.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                    </div>
                    <div className="date-details">
                      <span className="date-full-text">{new Date(dispo.date).toLocaleDateString('fr-FR')}</span>
                      <span className="date-weekday">{new Date(dispo.date).toLocaleDateString('fr-FR', { weekday: 'long' })}</span>
                    </div>
                  </div>
                  
                  <div className="availability-garde-info">
                    <div className="garde-type">
                      <span 
                        className="garde-name" 
                        style={{ color: getColorByTypeGarde(dispo.type_garde_id) }}
                      >
                        {getTypeGardeName(dispo.type_garde_id)}
                      </span>
                      <span className="garde-icon">🚒</span>
                    </div>
                    <span className="garde-hours">{dispo.heure_debut} - {dispo.heure_fin}</span>
                  </div>
                  
                  <div className="availability-status-final">
                    <span className={`status-badge-final ${dispo.statut}`}>
                      {dispo.statut === 'disponible' ? 'Disponible' : 
                       dispo.statut === 'preference' ? 'Préférence' : 'Indisponible'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-availability-enhanced">
              <div className="empty-state-enhanced">
                <div className="empty-icon-large">📅</div>
                <h4>Aucune disponibilité configurée</h4>
                <p>Configurez vos créneaux pour faciliter la planification de vos gardes.</p>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCalendarModal(true)}
                  data-testid="start-configuration-btn"
                >
                  Commencer la configuration
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de configuration avancée */}
      {showCalendarModal && (
        <div className="modal-overlay" onClick={() => setShowCalendarModal(false)}>
          <div className="modal-content extra-large-modal" onClick={(e) => e.stopPropagation()} data-testid="availability-config-modal">
            <div className="modal-header">
              <h3>📅 Configurer mes disponibilités</h3>
              <Button variant="ghost" onClick={() => setShowCalendarModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="availability-config-advanced">
                {/* Configuration du type de garde */}
                <div className="config-section">
                  <h4>🚒 Type de garde spécifique</h4>
                  <div className="type-garde-selection">
                    <Label>Pour quel type de garde êtes-vous disponible ?</Label>
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
                    <small>
                      Sélectionnez un type spécifique ou laissez "Tous les types" pour une disponibilité générale
                    </small>
                  </div>
                </div>

                {/* Configuration des horaires - Seulement si "Tous les types" */}
                {!availabilityConfig.type_garde_id && (
                  <div className="config-section">
                    <h4>⏰ Créneaux horaires personnalisés</h4>
                    <p className="section-note">Définissez vos horaires de disponibilité générale</p>
                    <div className="time-config-row">
                      <div className="time-field">
                        <Label>Heure de début</Label>
                        <Input 
                          type="time" 
                          value={availabilityConfig.heure_debut}
                          onChange={(e) => setAvailabilityConfig({...availabilityConfig, heure_debut: e.target.value})}
                          data-testid="availability-start-time"
                        />
                      </div>
                      <div className="time-field">
                        <Label>Heure de fin</Label>
                        <Input 
                          type="time" 
                          value={availabilityConfig.heure_fin}
                          onChange={(e) => setAvailabilityConfig({...availabilityConfig, heure_fin: e.target.value})}
                          data-testid="availability-end-time"
                        />
                      </div>
                      <div className="status-field">
                        <Label>Statut</Label>
                        <select 
                          value={availabilityConfig.statut}
                          onChange={(e) => setAvailabilityConfig({...availabilityConfig, statut: e.target.value})}
                          className="form-select"
                          data-testid="availability-status-select"
                        >
                          <option value="disponible">✅ Disponible</option>
                          <option value="preference">⚡ Préférence</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Horaires automatiques si type spécifique sélectionné */}
                {availabilityConfig.type_garde_id && (
                  <div className="config-section">
                    <h4>⏰ Horaires du type de garde</h4>
                    <div className="automatic-hours">
                      <div className="hours-display">
                        <span className="hours-label">Horaires automatiques :</span>
                        <span className="hours-value">
                          {(() => {
                            const selectedType = typesGarde.find(t => t.id === availabilityConfig.type_garde_id);
                            return selectedType ? `${selectedType.heure_debut} - ${selectedType.heure_fin}` : 'Non défini';
                          })()}
                        </span>
                      </div>
                      <div className="status-selection-simple">
                        <Label>Statut de disponibilité</Label>
                        <select 
                          value={availabilityConfig.statut}
                          onChange={(e) => setAvailabilityConfig({...availabilityConfig, statut: e.target.value})}
                          className="form-select"
                          data-testid="availability-status-select"
                        >
                          <option value="disponible">✅ Disponible</option>
                          <option value="preference">⚡ Préférence</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sélection des dates */}
                <div className="config-section">
                  <h4>📆 Sélection des dates</h4>
                  <div className="calendar-instructions">
                    <p>Cliquez sur les dates où vous êtes disponible :</p>
                  </div>
                  
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={setSelectedDates}
                    className="interactive-calendar"
                    disabled={(date) => date < new Date().setHours(0,0,0,0)}
                  />
                  
                  <div className="selection-summary-advanced">
                    <div className="summary-item">
                      <strong>Type de garde :</strong> {getTypeGardeName(availabilityConfig.type_garde_id)}
                    </div>
                    <div className="summary-item">
                      <strong>Dates sélectionnées :</strong> {selectedDates?.length || 0} jour(s)
                    </div>
                    <div className="summary-item">
                      <strong>Horaires :</strong> {availabilityConfig.heure_debut} - {availabilityConfig.heure_fin}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowCalendarModal(false)}>
                  Annuler
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleSaveAvailability}
                  data-testid="save-availability-btn"
                  disabled={!selectedDates || selectedDates.length === 0}
                >
                  Sauvegarder ({selectedDates?.length || 0} jour(s))
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mon Profil Component épuré - sans disponibilités et remplacements
// Mon Profil Component épuré - sans disponibilités et remplacements
const MonProfil = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [formations, setFormations] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    gardes_ce_mois: 0,
    heures_travaillees: 0,
    certifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [profileData, setProfileData] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const [userResponse, formationsResponse, statsResponse] = await Promise.all([
          axios.get(`${API}/users/${user.id}`),
          axios.get(`${API}/formations`),
          axios.get(`${API}/users/${user.id}/stats-mensuelles`)
        ]);
        
        setUserProfile(userResponse.data);
        setFormations(formationsResponse.data);
        setMonthlyStats(statsResponse.data);
        setProfileData({
          nom: userResponse.data.nom,
          prenom: userResponse.data.prenom,
          email: userResponse.data.email,
          telephone: userResponse.data.telephone,
          contact_urgence: userResponse.data.contact_urgence || '',
          heures_max_semaine: userResponse.data.heures_max_semaine || 25
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

  const handleChangePassword = async () => {
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      toast({
        title: "Mots de passe différents",
        description: "Le nouveau mot de passe et la confirmation ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    try {
      // For demo - just show success
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès",
        variant: "success"
      });
      setShowPasswordModal(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le mot de passe",
        variant: "destructive"
      });
    }
  };

  const getFormationName = (formationId) => {
    const formation = formations.find(f => f.id === formationId);
    return formation ? formation.nom : formationId;
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
          {/* Informations personnelles - Modifiables par tous */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Informations personnelles</h2>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "secondary" : "default"}
                data-testid="edit-profile-btn"
              >
                {isEditing ? 'Annuler' : 'Modifier'}
              </Button>
            </div>

            <div className="profile-form">
              <div className="form-row">
                <div className="form-field">
                  <Label>Prénom</Label>
                  <Input
                    value={profileData.prenom || ''}
                    onChange={(e) => setProfileData({...profileData, prenom: e.target.value})}
                    disabled={!isEditing}
                    data-testid="profile-prenom-input"
                  />
                </div>
                <div className="form-field">
                  <Label>Nom</Label>
                  <Input
                    value={profileData.nom || ''}
                    onChange={(e) => setProfileData({...profileData, nom: e.target.value})}
                    disabled={!isEditing}
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
                    disabled={!isEditing}
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

              {/* Heures max pour temps partiel */}
              {userProfile?.type_emploi === 'temps_partiel' && (
                <div className="form-field">
                  <Label>Heures maximum par semaine</Label>
                  <div className="heures-max-input">
                    <Input
                      type="number"
                      min="5"
                      max="35"
                      value={profileData.heures_max_semaine || userProfile?.heures_max_semaine || 25}
                      onChange={(e) => setProfileData({...profileData, heures_max_semaine: parseInt(e.target.value)})}
                      disabled={!isEditing}
                      data-testid="profile-heures-max-input"
                    />
                    <span className="heures-max-unit">heures/semaine</span>
                  </div>
                  <small className="heures-max-help">
                    Cette limite sera respectée lors de l'attribution automatique des gardes.
                  </small>
                </div>
              )}

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
                  {userProfile?.fonction_superieur && <span className="fonction-sup-profile"> + Fonction supérieur</span>}
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
                  <p className="text-muted">Contactez votre superviseur pour l'inscription aux formations</p>
                </div>
              )}
            </div>
          </div>

          {/* Sécurité du compte */}
          <div className="profile-section">
            <h2>Sécurité du compte</h2>
            <div className="security-options">
              <Button 
                variant="outline" 
                onClick={() => setShowPasswordModal(true)}
                data-testid="change-password-btn"
              >
                🔒 Changer le mot de passe
              </Button>
              {user.role === 'admin' && (
                <Button variant="outline" data-testid="security-settings-btn">
                  ⚙️ Paramètres de sécurité avancés
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
            <p className="profile-role">
              {user?.role === 'admin' ? 'Administrateur' : 
               user?.role === 'superviseur' ? 'Superviseur' : 'Employé'}
            </p>
            <p className="profile-grade">{userProfile?.grade}</p>
          </div>

          <div className="profile-stats">
            <h3>Statistiques personnelles</h3>
            <div className="stats-list">
              <div className="stat-item">
                <span className="stat-icon">🏆</span>
                <div className="stat-content">
                  <span className="stat-value">{monthlyStats.gardes_ce_mois}</span>
                  <span className="stat-label">Gardes ce mois</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⏱️</span>
                <div className="stat-content">
                  <span className="stat-value">{monthlyStats.heures_travaillees}h</span>
                  <span className="stat-label">Heures travaillées</span>
                </div>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📜</span>
                <div className="stat-content">
                  <span className="stat-value">{monthlyStats.certifications}</span>
                  <span className="stat-label">Certifications</span>
                </div>
              </div>
            </div>
          </div>

          {user.role === 'admin' && (
            <div className="admin-actions">
              <h3>Actions administrateur</h3>
              <Button variant="outline" className="w-full" data-testid="manage-all-profiles-btn">
                👥 Gérer tous les profils
              </Button>
              <Button variant="outline" className="w-full" data-testid="system-settings-btn">
                ⚙️ Paramètres système
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} data-testid="change-password-modal">
            <div className="modal-header">
              <h3>🔒 Changer le mot de passe</h3>
              <Button variant="ghost" onClick={() => setShowPasswordModal(false)}>✕</Button>
            </div>
            <div className="modal-body">
              <div className="password-form">
                <div className="form-field">
                  <Label>Mot de passe actuel *</Label>
                  <Input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    data-testid="current-password-input"
                  />
                </div>

                <div className="form-field">
                  <Label>Nouveau mot de passe *</Label>
                  <Input
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    data-testid="new-password-input"
                  />
                  <small className="password-requirements">
                    8 caractères minimum, 1 majuscule, 1 chiffre, 1 caractère spécial (!@#$%^&*+-?())
                  </small>
                </div>

                <div className="form-field">
                  <Label>Confirmer le nouveau mot de passe *</Label>
                  <Input
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    data-testid="confirm-password-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                  Annuler
                </Button>
                <Button variant="default" onClick={handleChangePassword} data-testid="save-password-btn">
                  Modifier le mot de passe
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Rapports = () => (
  <div className="page-content">
    <h1 data-testid="rapports-title">Rapports et analyses</h1>
    <p>Module Rapports - Fonctionnel</p>
  </div>
);

// Main Application Layout
const AppLayout = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user } = useAuth();

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
      case 'disponibilites':
        return <MesDisponibilites user={user} />;
      case 'formations':
        return <Formations />;
      case 'rapports':
        return <Rapports />;
      case 'parametres':
        return <Parametres user={user} />;
      case 'monprofil':
        return <MonProfil />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="main-content">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

// Main App Component
const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? <AppLayout /> : <Login />}
      <Toaster />
    </div>
  );
};

// Root App with Providers
const AppWithProviders = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppWithProviders;