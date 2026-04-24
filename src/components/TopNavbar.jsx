import { UserCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopNavbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="top-navbar">
      <div className="nav-brand">
        <img src="./src/assets/logo.png" alt="Logo" className="nav-logo" />
        <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>Sri Lakshmi Srungara Vallabha Function Hall</span>
      </div>

      <div className="nav-actions">
        <div className="profile-menu">
          <UserCircle size={24} color="var(--text-muted)" />
          <span className="profile-name">{user.name || 'Admin'}</span>
          <button className="btn-icon" onClick={handleLogout} title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
