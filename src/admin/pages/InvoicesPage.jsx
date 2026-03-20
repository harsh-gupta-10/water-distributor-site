import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import ExportButtons from '../components/ExportButtons';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState(null);
    const perPage = 15;
    const navigate = useNavigate();
    const toast = useToast();

    async function fetchAll() {
        setLoading(true);
        const [invRes, custRes] = await Promise.all([
            supabase.from('invoices').select('*').order('created_at', { ascending: false }),
            supabase.from('customers').select('id, name, business_name'),
        ]);
        setInvoices(invRes.data || []);
        setCustomers(custRes.data || []);
        setLoading(false);
    }

    useEffect(() => { fetchAll(); }, []);

    async function deleteInvoice() {
        if (!deleteId) return;
        const { error } = await supabase.from('invoices').delete().eq('id', deleteId);
        if (error) { toast(error.message, 'error'); } else { toast('Invoice deleted'); }
        setDeleteId(null);
        fetchAll();
    }

    const customerById = useMemo(() => {
        const map = {};
        customers.forEach((customer) => {
            map[customer.id] = customer;
        });
        return map;
    }, [customers]);

    const normalizedSearch = search.trim().toLowerCase();

    const filtered = useMemo(() => invoices.filter((inv) => {
        const matchStatus = statusFilter === 'all' || inv.payment_status === statusFilter;
        const customer = customerById[inv.customer_id];
        const customerName = customer ? `${customer.name} ${customer.business_name || ''}` : '';
        const matchSearch = !normalizedSearch ||
            inv.invoice_number.toLowerCase().includes(normalizedSearch) ||
            customerName.toLowerCase().includes(normalizedSearch);
        return matchStatus && matchSearch;
    }), [invoices, statusFilter, normalizedSearch, customerById]);

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const exportCols = [
        { label: 'Invoice #', accessor: i => i.invoice_number },
        { label: 'Customer', accessor: i => customerById[i.customer_id]?.name || '' },
        { label: 'Date', accessor: i => i.invoice_date },
        { label: 'Due Date', accessor: i => i.due_date || '' },
        { label: 'Total', accessor: i => i.total_amount },
        { label: 'Paid', accessor: i => i.amount_paid },
        { label: 'Balance', accessor: i => (parseFloat(i.total_amount) - parseFloat(i.amount_paid)).toFixed(2) },
        { label: 'Status', accessor: i => i.payment_status },
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Invoices</h1>
                    <p>{invoices.length} total invoices</p>
                </div>
                <div className="page-header__actions">
                    <ExportButtons data={filtered} filename="invoices" columns={exportCols} />
                    <button className="btn-admin btn-admin--primary" onClick={() => navigate('/admin/invoices/new')}>
                        <Plus size={16} /> Create Invoice
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-bar__search">
                    <Search size={16} className="filter-bar__search-icon" />
                    <input placeholder="Search invoice #, customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                </select>
            </div>

            <div className="card">
                <div className="card__body--flush">
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Due Date</th>
                                    <th>Total</th>
                                    <th>Paid</th>
                                    <th>Balance</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No invoices found</td></tr>
                                ) : paginated.map(inv => {
                                    const cust = customerById[inv.customer_id];
                                    const balance = parseFloat(inv.total_amount) - parseFloat(inv.amount_paid);
                                    return (
                                        <tr key={inv.id}>
                                            <td><strong style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate(`/admin/invoices/${inv.id}`)}>{inv.invoice_number}</strong></td>
                                            <td>{cust ? cust.name : '—'}</td>
                                            <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                                            <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-IN') : '—'}</td>
                                            <td>{fmt(inv.total_amount)}</td>
                                            <td>{fmt(inv.amount_paid)}</td>
                                            <td style={{ color: balance > 0 ? '#ea580c' : '#16a34a', fontWeight: 600 }}>{fmt(balance)}</td>
                                            <td><span className={`badge badge--${inv.payment_status}`}>{inv.payment_status.replace('_', ' ')}</span></td>
                                            <td>
                                                <div className="data-table__actions">
                                                    <button className="data-table__action-btn" title="View" onClick={() => navigate(`/admin/invoices/${inv.id}`)}><Eye size={15} /></button>
                                                    <button className="data-table__action-btn" title="Edit" onClick={() => navigate(`/admin/invoices/${inv.id}/edit`)}><Edit2 size={15} /></button>
                                                    <button className="data-table__action-btn data-table__action-btn--danger" title="Delete" onClick={() => setDeleteId(inv.id)}><Trash2 size={15} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Invoice" footer={
                <>
                    <button className="btn-admin btn-admin--secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                    <button className="btn-admin btn-admin--danger" onClick={deleteInvoice}>Delete</button>
                </>
            }>
                <p className="confirm-text">Are you sure you want to delete this invoice? Related items and payments will also be deleted.</p>
            </Modal>
        </>
    );
}
