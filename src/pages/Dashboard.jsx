import { useState, useEffect } from 'react';
import { fetchBookings } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { Users, IndianRupee, CreditCard, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    advanceCollected: 0,
    pendingBalance: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const bookings = await fetchBookings();
        
        const summary = bookings.reduce((acc, curr) => {
          const total = parseFloat(curr.total_amount) || 0;
          const advance = parseFloat(curr.advance_amount) || 0;
          const balance = parseFloat(curr.balance_amount) || 0;
          
          acc.totalRevenue += total;
          acc.advanceCollected += advance;
          acc.pendingBalance += balance;
          return acc;
        }, { totalRevenue: 0, advanceCollected: 0, pendingBalance: 0 });

        setStats({
          totalBookings: bookings.length,
          ...summary,
          recentBookings: bookings.slice(0, 5) // Last 5 bookings
        });
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    { title: 'Total Bookings', value: stats.totalBookings, icon: Users, color: '#4f46e5' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: '#10b981' },
    { title: 'Advance Collected', value: `₹${stats.advanceCollected.toLocaleString()}`, icon: CreditCard, color: '#3b82f6' },
    { title: 'Pending Balance', value: `₹${stats.pendingBalance.toLocaleString()}`, icon: Clock, color: '#f59e0b' },
  ];

  return (
    <DashboardLayout title="Dashboard Overview">
      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {statCards.map((card, index) => (
              <div key={index} className="surface" style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1.25rem',
                borderLeft: `4px solid ${card.color}`
              }}>
                <div style={{ 
                  backgroundColor: `${card.color}15`, 
                  color: card.color, 
                  padding: '0.75rem', 
                  borderRadius: '0.75rem' 
                }}>
                  <card.icon size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500' }}>{card.title}</p>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: '0.25rem' }}>{card.value}</h2>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
            {/* Recent Bookings */}
            <div className="surface" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Recent Bookings</h3>
                <TrendingUp size={18} color="var(--text-muted)" />
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Hall</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td style={{ fontWeight: '500' }}>{booking.user_name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{booking.hall_type}</td>
                        <td>{new Date(booking.function_date).toLocaleDateString()}</td>
                        <td style={{ fontWeight: '600' }}>₹{booking.total_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions / Tips */}
            <div className="surface" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.25rem' }}>Hall Availability</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>Mini Function Hall</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Available for next weekend</p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>Big Function Hall</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Fully booked this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
