import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import Modal from '../components/Modal';
import ExportButtons from '../components/ExportButtons';
import { useToast } from '../components/Toast';

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [form, setForm] = useState({ name: '', business_name: '', email: '', phone: '', location: '', gst_number: '', notes: '' });
    const perPage = 15;
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => { fetchCustomers(); }, []);

    async function fetchCustomers() {
        setLoading(true);
        const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        setCustomers(data || []);
        setLoading(false);
    }

    function openAdd() {
        setEditing(null);
        setForm({ name: '', business_name: '', email: '', phone: '', location: '', gst_number: '', notes: '' });
        setModalOpen(true);
    }

    function openEdit(c) {
        setEditing(c);
        setForm({ name: c.name, business_name: c.business_name || '', email: c.email || '', phone: c.phone, location: c.location || '', gst_number: c.gst_number || '', notes: c.notes || '' });
        setModalOpen(true);
    }

    async function saveCustomer() {
        if (!form.name || !form.phone) { toast('Name and Phone are required', 'error'); return; }
        if (editing) {
            const { error } = await supabase.from('customers').update(form).eq('id', editing.id);
            if (error) { toast(error.message, 'error'); return; }
            toast('Customer updated');
        } else {
            const { error } = await supabase.from('customers').insert(form);
            if (error) { toast(error.message, 'error'); return; }
            toast('Customer added');
        }
        setModalOpen(false);
        fetchCustomers();
    }

    async function deleteCustomer() {
        if (!deleteId) return;
        const { error } = await supabase.from('customers').delete().eq('id', deleteId);
        if (error) { toast(error.message, 'error'); } else { toast('Customer deleted'); }
        setDeleteId(null);
        fetchCustomers();
    }

    const filtered = customers.filter(c => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (c.name || '').toLowerCase().includes(s) ||
            (c.phone || '').includes(s) ||
            (c.business_name || '').toLowerCase().includes(s) ||
            (c.email || '').toLowerCase().includes(s);
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const exportCols = [
        { label: 'Name', accessor: c => c.name },
        { label: 'Business', accessor: c => c.business_name || '' },
        { label: 'Email', accessor: c => c.email || '' },
        { label: 'Phone', accessor: c => c.phone },
        { label: 'Location', accessor: c => c.location || '' },
        { label: 'GST', accessor: c => c.gst_number || '' },
        { label: 'Created', accessor: c => new Date(c.created_at).toLocaleDateString('en-IN') },
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Customers</h1>
                    <p>{customers.length} total customers</p>
                </div>
                <div className="page-header__actions">
                    <ExportButtons data={filtered} filename="customers" columns={exportCols} />
                    <button className="btn-admin btn-admin--primary" onClick={openAdd}>
                        <Plus size={16} /> Add Customer
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-bar__search">
                    <Search size={16} className="filter-bar__search-icon" />
                    <input placeholder="Search name, phone, email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
            </div>

            <div className="card">
                <div className="card__body--flush">
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Business</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Location</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No customers found</td></tr>
                                ) : paginated.map(c => (
                                    <tr key={c.id}>
                                        <td><strong style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={() => navigate(`/admin/customers/${c.id}`)}>{c.name}</strong></td>
                                        <td>{c.business_name || '—'}</td>
                                        <td><a href={`tel:${c.phone}`} style={{ color: '#3b82f6' }}>{c.phone}</a></td>
                                        <td>{c.email || '—'}</td>
                                        <td>{c.location || '—'}</td>
                                        <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                        <td>
                                            <div className="data-table__actions">
                                                <button className="data-table__action-btn" title="View" onClick={() => navigate(`/admin/customers/${c.id}`)}><Eye size={15} /></button>
                                                <button className="data-table__action-btn" title="Edit" onClick={() => openEdit(c)}><Edit2 size={15} /></button>
                                                <button className="data-table__action-btn data-table__action-btn--danger" title="Delete" onClick={() => setDeleteId(c.id)}><Trash2 size={15} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="pagination">
                            <span className="pagination__info">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</span>
                            <div className="pagination__btns">
                                <button className="pagination__btn" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                    <button key={p} className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                                ))}
                                <button className="pagination__btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'} footer={
                <>
                    <button className="btn-admin btn-admin--secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                    <button className="btn-admin btn-admin--primary" onClick={saveCustomer}>{editing ? 'Update' : 'Add'}</button>
                </>
            }>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Name *</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
                    </div>
                    <div className="form-field">
                        <label>Phone *</label>
                        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
                    </div>
                    <div className="form-field">
                        <label>Business Name</label>
                        <input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} placeholder="Business / company" />
                    </div>
                    <div className="form-field">
                        <label>Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" />
                    </div>
                    <div className="form-field">
                        <label>Location</label>
                        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City / Area" />
                    </div>
                    <div className="form-field">
                        <label>GST Number</label>
                        <input value={form.gst_number} onChange={e => setForm({ ...form, gst_number: e.target.value })} placeholder="GST Number (optional)" />
                    </div>
                    <div className="form-field form-field--full">
                        <label>Notes</label>
                        <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Internal notes..." />
                    </div>
                </div>
            </Modal>

            {/* Delete Confirm */}
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Customer" footer={
                <>
                    <button className="btn-admin btn-admin--secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                    <button className="btn-admin btn-admin--danger" onClick={deleteCustomer}>Delete</button>
                </>
            }>
                <p className="confirm-text">Are you sure you want to delete this customer? This action cannot be undone.</p>
            </Modal>
        </>
    );
}
