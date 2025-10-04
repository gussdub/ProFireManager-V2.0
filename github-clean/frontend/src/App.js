import React, { useState, useEffect, Suspense, lazy } from "react";
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

// Lazy loading pour optimiser les performances
const Parametres = lazy(() => import("./components/Parametres"));

// Composant de chargement
const LoadingComponent = () => (
  <div className="loading-component">
    <div className="loading-spinner"></div>
    <p>Chargement du module...</p>
  </div>
);

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

// Login Component - VERSION PRODUCTION (sans boutons démo)
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
                  placeholder="votre.email@service-incendie.ca"
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
                  placeholder="Mot de passe sécurisé"
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
            
            <div className="production-info">
              <p>ProFireManager v2.0 - Système de gestion professionnel</p>
              <small>Pour assistance technique, contactez votre administrateur système</small>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Sidebar Navigation - VERSION PRODUCTION
const Sidebar = ({ currentPage, setCurrentPage }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    if (!item.roles.includes(user?.role)) return false;
    if (item.id === 'disponibilites' && user?.type_emploi !== 'temps_partiel') {
      return false;
    }
    return true;
  });

  return (
    <>
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        data-testid="mobile-menu-toggle"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="logo-flame">
              <div className="flame-container">
                <i className="fas fa-fire flame-icon"></i>
              </div>
            </div>
            <div>
              <h2>ProFireManager</h2>
              <p className="version">v2.0 Pro</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => {
                setCurrentPage(item.id);
                setIsMobileMenuOpen(false);
              }}
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
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="logout-btn"
            data-testid="logout-btn"
          >
            🚪 Déconnexion
          </Button>
        </div>
      </div>
    </>
  );
};

// Dashboard Component - VERSION PRODUCTION (sans section démo)
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
        <p>Bienvenue, {user?.prenom} {user?.nom} - {new Date().toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
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
          <div className="no-activity">
            <p>Aucune activité récente</p>
            <small>Les actions récentes apparaîtront ici au fur et à mesure de l'utilisation</small>
          </div>
        </div>
      </div>

      <div className="monthly-stats">
        <h2>Statistiques du Mois - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</h2>
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
            <span className="monthly-label">Taux d'activité</span>
            <span className="monthly-value" data-testid="monthly-activity">100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components - à développer avec données client
const Personnel = () => (
  <div className="empty-module">
    <div className="empty-state">
      <h1 data-testid="personnel-title">Gestion du personnel</h1>
      <div className="empty-icon">👥</div>
      <h3>Aucun personnel enregistré</h3>
      <p>Commencez par ajouter les membres de votre équipe</p>
      <Button className="add-btn" data-testid="add-personnel-btn">
        + Ajouter le premier pompier
      </Button>
    </div>
  </div>
);

const Planning = () => (
  <div className="empty-module">
    <div className="empty-state">
      <h1 data-testid="planning-title">Planning des gardes</h1>
      <div className="empty-icon">📅</div>
      <h3>Planning vide</h3>
      <p>Configurez d'abord vos types de garde dans Paramètres, puis ajoutez votre personnel</p>
      <div className="setup-steps">
        <div className="step">1. Paramètres → Types de garde</div>
        <div className="step">2. Personnel → Ajouter équipe</div>
        <div className="step">3. Planning → Attribution automatique</div>
      </div>
    </div>
  </div>
);

const MesDisponibilites = () => {
  const { user } = useAuth();
  
  if (user?.type_emploi !== 'temps_partiel') {
    return (
      <div className="access-denied">
        <h1>Module réservé aux employés temps partiel</h1>
        <p>Ce module permet aux employés à temps partiel de gérer leurs disponibilités.</p>
      </div>
    );
  }

  return (
    <div className="empty-module">
      <div className="empty-state">
        <h1 data-testid="disponibilites-title">Mes disponibilités</h1>
        <div className="empty-icon">📋</div>
        <h3>Aucune disponibilité configurée</h3>
        <p>Configurez vos créneaux de disponibilité pour faciliter la planification</p>
        <Button data-testid="configure-availability-btn">
          📅 Configurer mes disponibilités
        </Button>
      </div>
    </div>
  );
};

const Remplacements = () => (
  <div className="empty-module">
    <div className="empty-state">
      <h1 data-testid="replacements-title">Gestion des remplacements</h1>
      <div className="empty-icon">🔄</div>
      <h3>Aucune demande de remplacement</h3>
      <p>Les demandes de remplacement et congés apparaîtront ici</p>
      <div className="demo-actions">
        <Button data-testid="create-replacement-btn">🔄 Demande de remplacement</Button>
        <Button variant="outline" data-testid="create-conge-btn">🏖️ Demande de congé</Button>
      </div>
    </div>
  </div>
);

const Formations = () => (
  <div className="empty-module">
    <div className="empty-state">
      <h1 data-testid="formations-title">Planning des formations</h1>
      <div className="empty-icon">📚</div>
      <h3>Aucune formation planifiée</h3>
      <p>Programmez des sessions de formation pour votre équipe</p>
      <Button data-testid="create-session-btn">
        📚 Créer une formation
      </Button>
    </div>
  </div>
);

const Rapports = () => {
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
    <div className="empty-module">
      <div className="empty-state">
        <h1 data-testid="rapports-title">Rapports et analyses</h1>
        <div className="empty-icon">📈</div>
        <h3>Données insuffisantes</h3>
        <p>Les rapports seront disponibles une fois que vous aurez du personnel et des assignations</p>
        <div className="requirements">
          <div className="requirement">✅ Personnel ajouté</div>
          <div className="requirement">⏳ Assignations créées</div>
          <div className="requirement">⏳ Formations planifiées</div>
        </div>
      </div>
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
          telephone: response.data.telephone,
          contact_urgence: response.data.contact_urgence || '',
          heures_max_semaine: response.data.heures_max_semaine || 25
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
      const response = await axios.put(`${API}/users/mon-profil`, profileData);
      setUserProfile(response.data);
      
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

  if (loading) return <div className="loading" data-testid="profile-loading">Chargement...</div>;

  return (
    <div className="mon-profil">
      <div className="profile-header">
        <h1 data-testid="profile-title">Mon profil</h1>
        <p>Gérez vos informations personnelles</p>
      </div>

      <div className="profile-content">
        <div className="profile-main">
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

              {userProfile?.type_emploi === 'temps_partiel' && (
                <div className="form-field">
                  <Label>Heures maximum par semaine</Label>
                  <div className="heures-max-input">
                    <Input
                      type="number"
                      min="5"
                      max="168"
                      value={profileData.heures_max_semaine || 25}
                      onChange={(e) => setProfileData({...profileData, heures_max_semaine: parseInt(e.target.value)})}
                      disabled={!isEditing}
                      data-testid="profile-heures-max-input"
                    />
                    <span className="heures-max-unit">heures/semaine</span>
                  </div>
                  <small className="heures-max-help">
                    Cette limite sera respectée lors de l'attribution automatique.
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

          <div className="profile-section">
            <h2>Informations d'emploi</h2>
            <div className="locked-info">
              <div className="info-item">
                <span className="info-label">Numéro d'employé:</span>
                <span className="info-value locked">{userProfile?.numero_employe} 🔒</span>
              </div>
              <div className="info-item">
                <span className="info-label">Grade:</span>
                <span className="info-value locked">{userProfile?.grade} 🔒</span>
              </div>
              <div className="info-item">
                <span className="info-label">Type d'emploi:</span>
                <span className="info-value locked">
                  {userProfile?.type_emploi === 'temps_plein' ? 'Temps plein' : 'Temps partiel'} 🔒
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Date d'embauche:</span>
                <span className="info-value locked">{userProfile?.date_embauche} 🔒</span>
              </div>
            </div>
          </div>
        </div>
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
        return <Planning />;
      case 'disponibilites':
        return <MesDisponibilites />;
      case 'remplacements':
        return <Remplacements />;
      case 'formations':
        return <Formations />;
      case 'rapports':
        return <Rapports />;
      case 'parametres':
        return (
          <Suspense fallback={<LoadingComponent />}>
            <Parametres user={user} />
          </Suspense>
        );
      case 'monprofil':
        return <MonProfil />;
      default:
        return <Dashboard />;
    }
  };

  const { user } = useAuth();

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
    return <div className="loading-app" data-testid="auth-loading">Chargement de ProFireManager...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return children;
};

export default App;