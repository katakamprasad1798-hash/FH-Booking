import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BookingHall from './pages/BookingHall';
import Billing from './pages/Billing';
import Certificate from './pages/Certificate';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import './index.css';

// Simple Auth Wrapper
const PrivateRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  const location = useLocation();
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Navigate to="/bookings" replace />} />
        <Route path="/bookings" element={<PrivateRoute><BookingHall /></PrivateRoute>} />
        <Route path="/billing" element={<PrivateRoute><Billing /></PrivateRoute>} />
        <Route path="/certificate" element={<PrivateRoute><Certificate /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
