import { Link } from 'react-router-dom';
import { Users, IndianRupee } from 'lucide-react';

export default function HallCard({ hall }) {
  return (
    <Link to={`/hall/${hall.id}`} className="hall-card animate-fade-in">
      <img src={hall.image_url} alt={hall.name} className="hall-card-img" />
      <div className="hall-card-content">
        <h3 className="hall-card-title">{hall.name}</h3>
        <p className="hall-card-price">
          <IndianRupee size={16} style={{display: 'inline', verticalAlign: 'text-bottom'}}/> 
          {hall.price_per_day.toLocaleString('en-IN')} / day
        </p>
        
        <div className="hall-card-features">
          <div className="feature-item">
            <Users size={16} />
            <span>Up to {hall.capacity}</span>
          </div>
        </div>

        <div className="hall-card-footer">
          <span className="btn btn-primary" style={{width: '100%'}}>View Details</span>
        </div>
      </div>
    </Link>
  );
}
