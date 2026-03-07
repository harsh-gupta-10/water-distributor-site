import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Mail, Phone, MapPin, Hash, Edit2, Receipt, FileText, Plus } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

export default function CustomerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [customer, setCustomer] = useState(null);
    const [quotations, setQuotations] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [tab, setTab] = useState('quotations');
    const [editOpen, setEditOpen] = useState(false);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); }, [id]);

    async function fetchAll() {
        setLoading(true);
        const [custRes, quotRes, invRes] = await Promise.all([
            supabase.from('customers').select('*').eq('id', id).single(),
            supabase.from('quotations').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
            supabase.from('invoices').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
        ]);
        if (custRes.data) {
            setCustomer(custRes.data);
            setForm(custRes.data);
        }
        setQuotations(quotRes.data || []);
        setInvoices(invRes.data || []);
        setLoading(false);
    }

    async function updateCustomer() {
        const { error } = await supabase.from('customers').update({
            name: form.name, business_name: form.business_name, email: form.email,
            phone: form.phone, location: form.location, gst_number: form.gst_number, notes: form.notes,
        }).eq('id', id);
        if (error) { toast(error.message, 'error'); return; }
        toast('Customer updated');
        setEditOpen(false);
        fetchAll();
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;
    if (!customer) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Customer not found</div>;

    const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
    const totalPaid = invoices.reduce((s, i) => s + parseFloat(i.amount_paid || 0), 0);
    const outstanding = totalRevenue - totalPaid;
    const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

    return (
        <>
            <button className="btn-admin btn-admin--ghost" onClick={() => navigate('/admin/customers')} style={{ marginBottom: 16 }}>
                <ArrowLeft size={16} /> Back to Customers
            </button>

            <div className="profile-grid">
                {/* Left Profile Card */}
                <div className="profile-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                            <div className="profile-card__name">{customer.name}</div>
                            {customer.business_name && <div className="profile-card__business">{customer.business_name}</div>}
                        </div>
                        <button className="btn-admin btn-admin--secondary btn-admin--sm" onClick={() => setEditOpen(true)}>
                            <Edit2 size={14} /> Edit
                        </button>
                    </div>

                    {customer.phone && <div className="profile-card__detail"><Phone size={15} className="profile-card__detail-icon" /> {customer.phone}</div>}
                    {customer.email && <div className="profile-card__detail"><Mail size={15} className="profile-card__detail-icon" /> {customer.email}</div>}
                    {customer.location && <div className="profile-card__detail"><MapPin size={15} className="profile-card__detail-icon" /> {customer.location}</div>}
                    {customer.gst_number && <div className="profile-card__detail"><Hash size={15} className="profile-card__detail-icon" /> {customer.gst_number}</div>}
                    {customer.notes && <div style={{ marginTop: 12, padding: '10px 12px', background: '#f9fafb', borderRadius: 8, fontSize: '0.85rem', color: '#4b5563' }}>{customer.notes}</div>}

                    <div className="profile-card__stats">
                        <div className="profile-stat">
                            <span className="profile-stat__value">{fmt(totalRevenue)}</span>
                            <span className="profile-stat__label">Total Revenue</span>
                        </div>
                        <div className="profile-stat">
                            <span className="profile-stat__value" style={{ color: outstanding > 0 ? '#ea580c' : '#16a34a' }}>{fmt(outstanding)}</span>
                            <span className="profile-stat__label">Outstanding</span>
                        </div>
                        <div className="profile-stat">
                            <span className="profile-stat__value">{invoices.length}</span>
                            <span className="profile-stat__label">Invoices</span>
                        </div>
                        <div className="profile-stat">
                            <span className="profile-stat__value">{quotations.length}</span>
                            <span className="profile-stat__label">Quotations</span>
                        </div>
                    </div>

                    <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                        <button className="btn-admin btn-admin--primary btn-admin--sm" onClick={() => navigate(`/admin/invoices/new?customer=${id}`)}>
                            <Plus size={14} /> New Invoice
                        </button>
                    </div>
                </div>

                {/* Right Content */}
                <div>
                    <div className="tabs">
                        <button className={`tab-btn ${tab === 'quotations' ? 'tab-btn--active' : ''}`} onClick={() => setTab('quotations')}>
                            <FileText size={14} style={{ marginRight: 4 }} /> Quotations ({quotations.length})
                        </button>
                        <button className={`tab-btn ${tab === 'invoices' ? 'tab-btn--active' : ''}`} onClick={() => setTab('invoices')}>
                            <Receipt size={14} style={{ marginRight: 4 }} /> Invoices ({invoices.length})
                        </button>
                    </div>

                    <div className="card">
                        <div className="card__body--flush">
                            {tab === 'quotations' && (
                                <div className="data-table-wrap">
                                    <table className="data-table">
                                        <thead><tr><th>Date</th><th>Products</th><th>Location</th><th>Status</th></tr></thead>
                                        <tbody>
                                            {quotations.length === 0 ? (
                                                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No quotations</td></tr>
                                            ) : quotations.map(q => (
                                                <tr key={q.id}>
                                                    <td style={{ fontSize: '0.8rem' }}>{new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                    <td>{(q.products || []).join(', ')}</td>
                                                    <td>{q.location}</td>
                                                    <td><span className={`badge badge--${q.status}`}>{q.status}</span></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {tab === 'invoices' && (
                                <div className="data-table-wrap">
                                    <table className="data-table">
                                        <thead><tr><th>Invoice #</th><th>Date</th><th>Total</th><th>Paid</th><th>Status</th><th></th></tr></thead>
                                        <tbody>
                                            {invoices.length === 0 ? (
                                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No invoices</td></tr>
                                            ) : invoices.map(inv => (
                                                <tr key={inv.id}>
                                                    <td><strong>{inv.invoice_number}</strong></td>
                                                    <td style={{ fontSize: '0.8rem' }}>{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                                                    <td>{fmt(inv.total_amount)}</td>
                                                    <td>{fmt(inv.amount_paid)}</td>
                                                    <td><span className={`badge badge--${inv.payment_status}`}>{inv.payment_status.replace('_', ' ')}</span></td>
                                                    <td>
                                                        <button className="btn-admin btn-admin--ghost btn-admin--sm" onClick={() => navigate(`/admin/invoices/${inv.id}`)}>View</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Customer" footer={
                <>
                    <button className="btn-admin btn-admin--secondary" onClick={() => setEditOpen(false)}>Cancel</button>
                    <button className="btn-admin btn-admin--primary" onClick={updateCustomer}>Update</button>
                </>
            }>
                <div className="form-grid">
                    <div className="form-field"><label>Name *</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div className="form-field"><label>Phone *</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                    <div className="form-field"><label>Business</label><input value={form.business_name || ''} onChange={e => setForm({ ...form, business_name: e.target.value })} /></div>
                    <div className="form-field"><label>Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                    <div className="form-field"><label>Location</label><input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                    <div className="form-field"><label>GST</label><input value={form.gst_number || ''} onChange={e => setForm({ ...form, gst_number: e.target.value })} /></div>
                    <div className="form-field form-field--full"><label>Notes</label><textarea value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
                </div>
            </Modal>
        </>
    );
}
