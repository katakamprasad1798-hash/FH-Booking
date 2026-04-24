import { useState, useEffect } from 'react';
import { fetchHalls } from '../api';
import HallCard from '../components/HallCard';

export default function Home() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHalls()
      .then(data => {
        setHalls(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Find Your Perfect Venue</h1>
        <p className="page-subtitle">
          Discover and book the most elegant function halls for your weddings, corporate events, and parties.
        </p>
      </div>

      {loading && <div style={{textAlign: 'center', padding: '4rem'}}>Loading exclusive halls...</div>}
      
      {error && (
        <div className="msg-box msg-error">
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-3">
          {halls.map(hall => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      )}
    </div>
  );
}
