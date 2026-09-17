import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AudioPlayer } from './components/AudioPlayer';
import { LyricsModal } from './components/LyricsModal';

import { Home } from './pages/Home';
import { Browse } from './pages/Browse';
import { Search } from './pages/Search';
import { Favorites } from './pages/Favorites';
import { Playlist } from './pages/Playlist';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUpload } from './pages/AdminUpload';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  return user && isAdmin ? children : <Navigate to="/" replace />;
};

const AppShell = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f0f0f' }}>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0f0f0f' }}>
      {/* Fixed Left Sidebar */}
      <Sidebar onCreatePlaylist={() => setShowCreatePlaylist(true)} />

      {/* Main scrollable area */}
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{ marginLeft: '240px' }}
      >
        {/* Sticky top bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
          <Routes>
            <Route path="/"       element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/search" element={<Search />} />

            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/playlists" element={<ProtectedRoute><Playlist createOpen={showCreatePlaylist} onCreateClose={() => setShowCreatePlaylist(false)} /></ProtectedRoute>} />

            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/upload"    element={<AdminRoute><AdminUpload /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Bottom Player */}
      <AudioPlayer />
      <LyricsModal />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <PlayerProvider>
          <AuthProvider>
            <AppShell />
          </AuthProvider>
        </PlayerProvider>
      </ThemeProvider>
    </Router>
  );
}
