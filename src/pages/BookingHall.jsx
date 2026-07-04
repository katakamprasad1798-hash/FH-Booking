import { useState, useEffect } from 'react';
import { fetchBookings, createBooking, updateBooking, deleteBooking } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Eye, CheckCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { mapImportRows, BOOKING_FIELD_ALIASES } from '../utils/importUtils';

const initialFormData = { 
  function_type: '',
  hall_type: 'Mini Function Hall',
  guests: '',
  user_name: '', 
  booking_date: new Date().toISOString().split('T')[0],
  function_date: '',
  function_time: '',
  total_amount: '',
  advance_amount: '',
  balance_amount: '',
  address: '',
  phone: '',
  user_email: '',
  status: 'In Progress'
};

export default function BookingHall() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [viewData, setViewData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-calculate balance
  useEffect(() => {
    const total = parseFloat(formData.total_amount) || 0;
    const advance = parseFloat(formData.advance_amount) || 0;
    setFormData(prev => ({ ...prev, balance_amount: (total - advance).toString() }));
  }, [formData.total_amount, formData.advance_amount]);

  const loadData = async () => {
    try {
      const bookingsData = await fetchBookings();
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setFormData({ ...initialFormData, ...row });
    setEditingId(row.id);
    setIsModalOpen(true);
  };

  const handleOpenView = (row) => {
    setViewData(row);
    setIsViewOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await deleteBooking(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handlePaymentDone = async (row) => {
    if (window.confirm("Mark this booking's payment as completely done?")) {
      try {
        await updateBooking(row.id, { 
          ...row, 
          status: 'Paid', 
          advance_amount: row.total_amount, 
          balance_amount: '0' 
        });
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Manual validation
    const requiredFields = ['function_type', 'hall_type', 'user_name', 'guests', 'booking_date', 'function_date', 'function_time', 'total_amount', 'advance_amount', 'address', 'phone', 'user_email'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill out the ${field.replace('_', ' ')} field.`);
        return;
      }
    }

    try {
      if (editingId) {
        await updateBooking(editingId, formData);
      } else {
        await createBooking(formData);
      }
      setIsModalOpen(false);
      setFormData(initialFormData);
      loadData();
    } catch (err) {
      console.error("Error saving booking:", err);
      alert(err.message);
    }
  };

  const getStatus = (row) => {
    const today = new Date().toISOString().split('T')[0];
    const balance = parseFloat(row.balance_amount) || 0;
    const advance = parseFloat(row.advance_amount) || 0;
    const total = parseFloat(row.total_amount) || 0;

    if (row.function_date && row.function_date < today) {
      return { label: 'Completed', className: 'badge-completed' };
    }
    if (balance <= 0 && total > 0) {
      return { label: 'Paid', className: 'badge-paid' };
    }
    if (advance > 0) {
      return { label: 'Partially Paid', className: 'badge-partial' };
    }
    return { label: 'Pending', className: 'badge-pending' };
  };

  const columns = [
    { header: 'Function Date', accessor: 'function_date', cell: (row) => row.function_date ? new Date(row.function_date).toLocaleDateString() : '-' },
    { header: 'Customer', accessor: 'user_name' },
    { header: 'Hall Type', accessor: 'hall_type' },
    { header: 'Type', accessor: 'function_type' },
    { header: 'Balance (₹)', accessor: 'balance_amount', cell: (row) => row.balance_amount ? `₹${row.balance_amount}` : '-' },
    { 
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const { label, className } = getStatus(row);
        return <span className={`badge ${className}`}>{label}</span>;
      }
    },
    { 
      header: 'Action', 
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {row.status !== 'Paid' && (
            <button className="btn-icon" onClick={() => handlePaymentDone(row)} title="Payment Done" style={{ color: '#10b981' }}>
              <CheckCircle size={18} />
            </button>
          )}
          <button className="btn-icon" onClick={() => handleOpenView(row)} title="View" style={{ color: 'var(--primary)' }}>
            <Eye size={18} />
          </button>
          <button className="btn-icon" onClick={() => handleOpenEdit(row)} title="Edit" style={{ color: 'var(--text-main)' }}>
            <Edit size={18} />
          </button>
          <button className="btn-icon" onClick={() => handleDelete(row.id)} title="Delete" style={{ color: '#ef4444' }}>
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  const handleImportFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const bstr = event.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      
      const newBookings = mapImportRows(jsonData, {
        defaults: initialFormData,
        aliases: BOOKING_FIELD_ALIASES,
        requiredFields: ['user_name', 'function_date', 'hall_type'],
      });

      if (newBookings.length === 0) {
        alert('No valid records found in the file. Check column headers and required fields.');
        return;
      }

      if (window.confirm(`Import ${newBookings.length} records from ${file.name}?`)) {
        try {
          setLoading(true);
          for (let booking of newBookings) {
            await createBooking(booking);
          }
          alert('Import successful!');
          loadData();
        } catch (err) {
          alert('Error during import: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset for next use
  };

  const headerAction = (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <input 
        type="file" 
        id="import-file" 
        accept=".csv,.xlsx,.xls" 
        style={{ display: 'none' }} 
        onChange={handleImportFile} 
      />
      <label htmlFor="import-file" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Download size={16} style={{ transform: 'rotate(180deg)' }} /> Import (CSV/Excel)
      </label>
      <button className="btn btn-primary" onClick={handleOpenCreate}>
        <Plus size={16} /> Create Booking
      </button>
    </div>
  );

  return (
    <DashboardLayout title="Booking Hall" headerAction={headerAction}>
      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={bookings} />}
      
      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Booking" : "New Booking"}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section">
            <h3>1. Booking Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Function Type</label>
                <input type="text" className="form-control" placeholder="e.g. Wedding, Birthday" 
                  value={formData.function_type} onChange={e => setFormData({...formData, function_type: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Function Hall</label>
                <select className="form-control" value={formData.hall_type} onChange={e => setFormData({...formData, hall_type: e.target.value})} required>
                  <option value="Mini Function Hall">Mini Function Hall</option>
                  <option value="Big Function Hall">Big Function Hall</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-control" 
                  value={formData.user_name} onChange={e => setFormData({...formData, user_name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Guests</label>
                <input type="number" className="form-control" 
                  value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Booking Date</label>
                <input type="date" className="form-control" 
                  value={formData.booking_date} onChange={e => setFormData({...formData, booking_date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Function Date</label>
                <input type="date" className="form-control" 
                  value={formData.function_date} onChange={e => setFormData({...formData, function_date: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-control" 
                  value={formData.function_time} onChange={e => setFormData({...formData, function_time: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={formData.status || 'In Progress'} onChange={e => setFormData({...formData, status: e.target.value})} required>
                  <option value="In Progress">In Progress</option>
                  <option value="Paid">Paid</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>2. Payment</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Total Amount (₹)</label>
                <input type="number" className="form-control" 
                  value={formData.total_amount} onChange={e => setFormData({...formData, total_amount: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Advance Amount (₹)</label>
                <input type="number" className="form-control" 
                  value={formData.advance_amount} onChange={e => setFormData({...formData, advance_amount: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Balance Amount (₹)</label>
                <input type="number" className="form-control" style={{backgroundColor: '#f3f4f6'}}
                  value={formData.balance_amount} readOnly />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>3. Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" className="form-control" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
              </div>
              <div className="form-group" style={{gridColumn: '1 / -1'}}>
                <label className="form-label">Email</label>
                <input type="email" className="form-control" 
                  value={formData.user_email} onChange={e => setFormData({...formData, user_email: e.target.value})} required />
              </div>
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? "Update Booking" : "Save Booking"}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Booking Details">
        {viewData && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Function Info</h4>
              <p><strong>Type:</strong> {viewData.function_type}</p>
              <p><strong>Hall:</strong> {viewData.hall_type}</p>
              <p><strong>Date:</strong> {viewData.function_date} at {viewData.function_time}</p>
              <p><strong>Guests:</strong> {viewData.guests}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Customer Info</h4>
              <p><strong>Name:</strong> {viewData.user_name}</p>
              <p><strong>Phone:</strong> {viewData.phone}</p>
              <p><strong>Email:</strong> {viewData.user_email}</p>
              <p><strong>Address:</strong> {viewData.address}</p>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Payment Info</h4>
              <p><strong>Total:</strong> ₹{viewData.total_amount}</p>
              <p><strong>Advance:</strong> ₹{viewData.advance_amount}</p>
              <p><strong>Balance:</strong> ₹{viewData.balance_amount}</p>
              <p><strong>Status:</strong> {viewData.status}</p>
            </div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsViewOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

    </DashboardLayout>
  );
}
