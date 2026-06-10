import { useState, useEffect } from 'react';
import { fetchBookings } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { Users, IndianRupee, CreditCard, Clock, TrendingUp } from 'lucide-react';

import DataTable from '../components/DataTable';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    advanceCollected: 0,
    pendingBalance: 0,
    recentBookings: [],
    allBookings: []
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
          recentBookings: bookings.slice(0, 5), // Keep for legacy if needed
          allBookings: bookings
        });
      } catch (err) {
        console.error("Error loading dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const columns = [
    { header: 'Customer', accessor: 'user_name' },
    { header: 'Hall', accessor: 'hall_type' },
    { header: 'Date', cell: (row) => new Date(row.function_date).toLocaleDateString() },
    { header: 'Amount', cell: (row) => `₹${row.total_amount.toLocaleString()}` },
  ];

  const statCards = [
    { title: 'Total Bookings', value: stats.totalBookings, icon: Users, color: '#4f46e5', trend: '+ 12% Higher', trendColor: 'var(--success)' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: '#10b981', trend: '+ 8% Higher', trendColor: 'var(--success)' },
    { title: 'Advance Collected', value: `₹${stats.advanceCollected.toLocaleString()}`, icon: CreditCard, color: '#3b82f6', trend: '+ 15% Higher', trendColor: 'var(--success)' },
    { title: 'Pending Balance', value: `₹${stats.pendingBalance.toLocaleString()}`, icon: Clock, color: '#f59e0b', trend: '- 5% Lower', trendColor: 'var(--danger)' },
  ];

  return (
    <DashboardLayout title="Dashboard Overview">
      {loading ? (
        <p>Loading stats...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.25rem' 
          }}>
            {statCards.map((card, index) => (
              <div key={index} className="surface" style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1.25rem'
              }}>
                <div style={{ 
                  backgroundColor: `${card.color}15`, 
                  color: card.color, 
                  width: '52px',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  flexShrink: 0
                }}>
                  <card.icon size={24} />
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>{card.title}</p>
                  <h2 style={{ fontSize: '1.625rem', fontWeight: '700', marginTop: '0.25rem', color: 'var(--text-main)' }}>{card.value}</h2>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: card.trendColor, marginTop: '0.25rem' }}>
                    {card.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '1.25rem' }}>
            {/* Recent Bookings */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <DataTable columns={columns} data={stats.allBookings} initialPageSize={5} title="Recent Bookings" />
            </div>

            {/* Quick Actions / Tips */}
            <div className="surface" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Hall Availability</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1.125rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>Mini Function Hall</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Available for next weekend</p>
                </div>
                <div style={{ padding: '1.125rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>Big Function Hall</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Fully booked this month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
