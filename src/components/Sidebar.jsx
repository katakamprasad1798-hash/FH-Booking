import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, FileBadge, Calendar, LogOut } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="./src/assets/logo.png" alt="Logo" className="sidebar-logo" />
        <span className="sidebar-brand">LuxeHalls</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink 
          to="/bookings" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Calendar size={20} />
          Booking Hall
        </NavLink>
        <NavLink 
          to="/billing" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <Receipt size={20} />
          Billing
        </NavLink>
        <NavLink 
          to="/certificate" 
          className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <FileBadge size={20} />
          Certificate
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
