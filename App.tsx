import React, { useState, useEffect, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { User, UserRole } from './types';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelection } from './pages/LanguageSelection';

// Pages
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { GlobalEvents } from './pages/GlobalEvents';
import { PrayerRoom } from './pages/PrayerRoom';
import { Admin } from './pages/Admin';
import { Testimony } from './pages/Testimony';
import { Registration } from './pages/Registration';
import { TeamManagement } from './pages/TeamManagement';
import { Training } from './pages/Training';

// --- MOCK AUTH CONTEXT ---
interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, login: () => {}, logout: () => {} });

export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

// --- PLACEHOLDER COMPONENT ---
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-100 py-20">
    <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-500">Este módulo está em desenvolvimento.</p>
  </div>
);

function AppContent() {
  const [currentPage, setCurrentPage] = useState('Home');
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const { user, logout } = useAuth();

  // Route protection logic
  const renderPage = () => {
    // Public routes
    if (!user) {
      if (currentPage === 'Registration') return <Registration setPage={setCurrentPage} />;
      return <Home setPage={setCurrentPage} />;
    }

    // Authenticated routes
    switch (currentPage) {
      case 'Home': return <Home setPage={setCurrentPage} />;
      case 'Dashboard': return <Dashboard setPage={setCurrentPage} />;
      case 'Events': return <Events />;
      case 'GlobalEvents': return <GlobalEvents />;
      case 'PrayerRoom': return <PrayerRoom />;
      case 'Admin': return <Admin />;
      case 'TeamManagement': return <TeamManagement />;
      case 'Testimony': return <Testimony />;
      case 'Training': return <Training />;
      case 'MyAgenda': return <PlaceholderPage title="Minha Agenda" />;
      case 'Registration': return <Registration setPage={setCurrentPage} />;
      default: return <Home setPage={setCurrentPage} />;
    }
  };

  if (!hasSelectedLanguage) {
    return <LanguageSelection onSelect={() => setHasSelectedLanguage(true)} onBack={() => window.location.href = '/'} />;
  }

  return (
    <Layout currentPage={currentPage} setPage={setCurrentPage} user={user} logout={logout}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    let nameRole = role.charAt(0).toUpperCase() + role.slice(1);
    if (role === 'admin') nameRole = 'Administrador';
    if (role === 'leader') nameRole = 'Líder';
    if (role === 'evangelist') nameRole = 'Evangelista';
    if (role === 'intercessor') nameRole = 'Intercessor';

    setUser({
      uid: 'demo-user-123',
      email: `${role}@outreach.demo`,
      full_name: `Demo ${nameRole}`,
      role: role
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthContext.Provider value={{ user, login, logout }}>
          <AppContent />
        </AuthContext.Provider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}