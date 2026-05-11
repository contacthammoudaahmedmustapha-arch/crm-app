// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Users from './pages/Users';

function PrivateRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/contacts" />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      {children}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute adminOnly>
              <AppLayout><Dashboard /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/contacts" element={
            <PrivateRoute>
              <AppLayout><Contacts /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute adminOnly>
              <AppLayout><Users /></AppLayout>
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/contacts" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
