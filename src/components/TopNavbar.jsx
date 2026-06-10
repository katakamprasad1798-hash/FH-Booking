import { Search, Bell } from 'lucide-react';

export default function TopNavbar({ title, headerAction }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <nav className="top-navbar">
      <div className="nav-brand">
        <span className="top-navbar-title">{title}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Search Input */}
        <div className="navbar-search-container">
          <Search size={16} className="navbar-search-icon" />
          <input 
            type="text" 
            className="navbar-search-input" 
            placeholder="Search bookings..." 
          />
        </div>

        {/* Dynamic page-level actions (e.g. Create Booking, Import) */}
        {headerAction && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {headerAction}
          </div>
        )}

        {/* Notifications */}
        <button className="notification-btn" title="Notifications">
          <Bell size={20} />
        </button>

        {/* User Profile Info */}
        <div className="profile-menu">
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            color: '#ffffff',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {user.name ? user.name[0].toUpperCase() : 'A'}
          </div>
          <span className="profile-name">{user.name || 'Admin'}</span>
        </div>
      </div>
    </nav>
  );
}
