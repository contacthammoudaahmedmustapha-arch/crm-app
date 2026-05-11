// src/components/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">◈ CRM Pro</div>
      <nav className="sidebar-nav">
        {user?.role === 'admin' && (
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">▦</span> Dashboard
          </NavLink>
        )}
        <NavLink to="/contacts" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
          <span className="nav-icon">◉</span> Contacts
        </NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/users" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="nav-icon">◈</span> Utilisateurs
          </NavLink>
        )}
      </nav>
      <div className="sidebar-user">
        <div className="sidebar-user-name">{user?.prenom} {user?.nom}</div>
        <div className="sidebar-user-role">{user?.role}</div>
        <button className="btn-logout" onClick={handleLogout}>Se déconnecter</button>
      </div>
    </aside>
  );
}
