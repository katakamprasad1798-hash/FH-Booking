import { useState, useEffect } from 'react';
import { fetchBillings, createBilling, updateBilling, deleteBilling, fetchBookings } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { mapImportRows, BILLING_FIELD_ALIASES } from '../utils/importUtils';

const initialFormData = { booking_id: '', amount: '', status: 'Pending', date: '' };

export default function Billing() {
  const [billings, setBillings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [billingsData, bookingsData] = await Promise.all([fetchBillings(), fetchBookings()]);
      setBillings(billingsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      
      const newBills = mapImportRows(jsonData, {
        defaults: initialFormData,
        aliases: BILLING_FIELD_ALIASES,
        requiredFields: ['amount'],
      }).map((bill) => {
        if (!bill.booking_id && bill.booking_name) {
          const match = bookings.find(
            (b) =>
              (b.user_name || '').toLowerCase() === String(bill.booking_name).toLowerCase() ||
              `${b.user_name} - ${b.function_date}`.toLowerCase() === String(bill.booking_name).toLowerCase()
          );
          if (match) bill.booking_id = match.id;
        }
        return bill;
      }).filter((bill) => bill.booking_id);

      if (newBills.length === 0) {
        alert('No valid billing records found. Ensure amount and booking reference columns are filled.');
        return;
      }

      if (window.confirm(`Import ${newBills.length} records from ${file.name}?`)) {
        try {
          setLoading(true);
          for (let bill of newBills) {
            await createBilling(bill);
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
    e.target.value = '';
  };

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setFormData({ 
      booking_id: row.booking_id, 
      amount: row.amount, 
      status: row.status, 
      date: row.date 
    });
    setEditingId(row.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        await deleteBilling(id);
        loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateBilling(editingId, formData);
      } else {
        await createBilling(formData);
      }
      setIsModalOpen(false);
      setFormData(initialFormData);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const columns = [
    { header: 'Booking Ref', accessor: 'booking_name' },
    { header: 'Booking ID', accessor: 'booking_id', exportOnly: true },
    { header: 'Amount', accessor: 'amount', cell: (row) => row.amount != null && row.amount !== '' ? `₹${Number(row.amount).toLocaleString()}` : '-' },
    { header: 'Date', accessor: 'date', cell: (row) => row.date ? new Date(row.date).toLocaleDateString() : '-' },
    { 
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        let badgeClass = 'badge-neutral';
        if (row.status === 'Paid') badgeClass = 'badge-paid';
        if (row.status === 'Pending') badgeClass = 'badge-inprogress';
        return <span className={`badge ${badgeClass}`}>{row.status}</span>;
      }
    },
    {
      header: 'Action',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
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

  const headerAction = (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <input type="file" id="import-billing-file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleImportFile} />
      <label htmlFor="import-billing-file" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Download size={16} style={{ transform: 'rotate(180deg)' }} /> Import (CSV/Excel)
      </label>
      <button className="btn btn-primary" onClick={handleOpenCreate}>
        <Plus size={16} /> Create Bill
      </button>
    </div>
  );

  return (
    <DashboardLayout title="Billing Management" headerAction={headerAction}>
      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={billings} />}
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Bill" : "New Bill"}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Booking</label>
            <select 
              className="form-control" 
              value={formData.booking_id} 
              onChange={e => setFormData({...formData, booking_id: e.target.value})}
              required
            >
              <option value="">-- Choose Booking --</option>
              {bookings.map(b => (
                <option key={b.id} value={b.id}>
                  {b.user_name} ({b.function_type} - {b.function_date ? new Date(b.function_date).toLocaleDateString() : 'No Date'})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input 
              type="number" className="form-control" 
              value={formData.amount} 
              onChange={e => setFormData({...formData, amount: e.target.value})} required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select 
              className="form-control" 
              value={formData.status} 
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input 
              type="date" className="form-control" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} required 
            />
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem'}}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingId ? "Update Bill" : "Save Bill"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
