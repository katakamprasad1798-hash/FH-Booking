import { Link, useLocation } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <CalendarDays color="var(--gold)" />
          LuxeHalls
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Halls
          </Link>
          <Link 
            to="/bookings" 
            className={`nav-link ${location.pathname === '/bookings' ? 'active' : ''}`}
          >
            My Bookings
          </Link>
        </div>
      </div>
    </nav>
  );
}
