import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, FileBadge, Calendar } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
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
    </aside>
  );
}
