import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchHallById, createBooking } from '../api';
import { Users, IndianRupee, CheckCircle } from 'lucide-react';

export default function HallDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    booking_date: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchHallById(id)
      .then(data => {
        setHall(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setMsg(null);
    try {
      await createBooking({
        hall_id: id,
        ...formData
      });
      setMsg({ type: 'success', text: 'Booking confirmed successfully!' });
      setFormData({ user_name: '', user_email: '', booking_date: '' });
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '4rem'}}>Loading details...</div>;
  if (error) return <div className="container msg-box msg-error" style={{marginTop: '2rem'}}>Error: {error}</div>;
  if (!hall) return null;

  return (
    <div className="container animate-fade-in" style={{paddingTop: '2rem', paddingBottom: '4rem'}}>
      <div className="details-hero">
        <img src={hall.image_url} alt={hall.name} />
        <div className="details-hero-overlay"></div>
      </div>

      <div className="details-content">
        <div>
          <h1 className="page-title" style={{textAlign: 'left', marginBottom: '0.5rem'}}>{hall.name}</h1>
          <p className="hall-card-price" style={{fontSize: '1.5rem', marginBottom: '2rem'}}>
            <IndianRupee size={24} style={{display: 'inline', verticalAlign: 'text-bottom'}}/> 
            {hall.price_per_day.toLocaleString('en-IN')} / day
          </p>

          <div className="details-box" style={{marginBottom: '2rem'}}>
            <h2 style={{marginBottom: '1rem'}}>About the Hall</h2>
            <p style={{color: 'var(--text-muted)'}}>{hall.description}</p>
          </div>

          <div className="details-box">
            <h2 style={{marginBottom: '1rem'}}>Amenities & Details</h2>
            <div className="feature-item" style={{marginBottom: '1rem', fontSize: '1.1rem'}}>
              <Users size={20} /> Capacity: Up to {hall.capacity} Guests
            </div>
            <div className="amenities-list">
              {hall.amenities.map((item, i) => (
                <span key={i} className="badge">
                  <CheckCircle size={12} style={{display: 'inline', marginRight: '4px', verticalAlign: 'middle'}}/>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="details-box" style={{position: 'sticky', top: '100px'}}>
            <h2 style={{marginBottom: '1.5rem'}}>Reserve This Hall</h2>
            
            {msg && (
              <div className={`msg-box ${msg.type === 'success' ? 'msg-success' : 'msg-error'}`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="user_name"
                  className="form-input" 
                  value={formData.user_name}
                  onChange={handleInputChange}
                  required 
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  name="user_email"
                  className="form-input" 
                  value={formData.user_email}
                  onChange={handleInputChange}
                  required 
                  placeholder="john@example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Event Date</label>
                <input 
                  type="date" 
                  name="booking_date"
                  className="form-input" 
                  value={formData.booking_date}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{width: '100%'}}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Processing...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
