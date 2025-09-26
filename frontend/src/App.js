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
            <span className="logo-icon">🚒</span>
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
    { id: 'rapports', label: 'Rapports', icon: '📈', roles: ['admin', 'superviseur'] },
    { id: 'parametres', label: 'Paramètres', icon: '⚙️', roles: ['admin'] }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🚒</span>
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
        return <div className="page-placeholder">Planning - En développement</div>;
      case 'remplacements':
        return <div className="page-placeholder">Remplacements - En développement</div>;
      case 'formations':
        return <div className="page-placeholder">Formations - En développement</div>;
      case 'rapports':
        return <div className="page-placeholder">Rapports - En développement</div>;
      case 'parametres':
        return <div className="page-placeholder">Paramètres - En développement</div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
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