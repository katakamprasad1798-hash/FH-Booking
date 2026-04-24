import { useState } from 'react';
import { fetchUserBookings } from '../api';
import { Calendar, Mail } from 'lucide-react';

export default function MyBookings() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setError(null);
    setSearched(true);
    
    try {
      const data = await fetchUserBookings(email);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{paddingBottom: '4rem'}}>
      <div className="page-header" style={{paddingBottom: '2rem'}}>
        <h1 className="page-title">My Bookings</h1>
        <p className="page-subtitle">Enter your email address to view your upcoming events.</p>
      </div>

      <div style={{maxWidth: '600px', margin: '0 auto 3rem'}}>
        <form onSubmit={handleSearch} style={{display: 'flex', gap: '1rem'}}>
          <div style={{position: 'relative', flexGrow: 1}}>
            <Mail style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}} size={20} />
            <input 
              type="email" 
              className="form-input" 
              style={{paddingLeft: '3rem'}}
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Find Bookings'}
          </button>
        </form>
      </div>

      {error && (
        <div className="msg-box msg-error" style={{maxWidth: '800px', margin: '0 auto'}}>
          Error: {error}
        </div>
      )}

      {searched && !loading && !error && (
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <h2 style={{marginBottom: '1.5rem'}}>Results for {email}</h2>
          
          {bookings.length === 0 ? (
            <div className="details-box" style={{textAlign: 'center', color: 'var(--text-muted)'}}>
              No bookings found for this email address.
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
              {bookings.map(booking => (
                <div key={booking.id} className="booking-card animate-fade-in">
                  <img src={booking.image_url} alt={booking.hall_name} />
                  <div className="booking-info" style={{flexGrow: 1}}>
                    <h3>{booking.hall_name}</h3>
                    <p>Booking ID: #{booking.id.toString().padStart(4, '0')}</p>
                    <p>Name: {booking.user_name}</p>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--primary-color)', fontWeight: '600'}}>
                      <Calendar size={20} />
                      {new Date(booking.booking_date).toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
