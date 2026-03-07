import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Eye, Edit2, Trash2 } from 'lucide-react';
import ExportButtons from '../components/ExportButtons';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

const STATUS_COLORS = {
    pending: 'pending',
    confirmed: 'contacted',
    processing: 'partially_paid',
    shipped: 'contacted',
    delivered: 'paid',
    cancelled: 'inactive',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState(null);
    const perPage = 15;
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(() => { fetchAll(); }, []);

    async function fetchAll() {
        setLoading(true);
        const [ordRes, custRes] = await Promise.all([
            supabase.from('orders').select('*').order('created_at', { ascending: false }),
            supabase.from('customers').select('id, name, business_name'),
        ]);
        setOrders(ordRes.data || []);
        setCustomers(custRes.data || []);
        setLoading(false);
    }

    async function updateStatus(id, newStatus) {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            toast('Status updated');
        }
    }

    async function deleteOrder() {
        if (!deleteId) return;
        const { error } = await supabase.from('orders').delete().eq('id', deleteId);
        if (error) { toast(error.message, 'error'); } else { toast('Order deleted'); }
        setDeleteId(null);
        fetchAll();
    }

    const custMap = {};
    customers.forEach(c => { custMap[c.id] = c; });

    const filtered = orders.filter(ord => {
        const matchStatus = statusFilter === 'all' || ord.status === statusFilter;
        const cust = custMap[ord.customer_id];
        const custName = cust ? `${cust.name} ${cust.business_name || ''}` : '';
        const matchSearch = !search ||
            ord.order_number.toLowerCase().includes(search.toLowerCase()) ||
            custName.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const exportCols = [
        { label: 'Order #', accessor: o => o.order_number },
        { label: 'Customer', accessor: o => custMap[o.customer_id]?.name || '' },
        { label: 'Date', accessor: o => o.order_date },
        { label: 'Total', accessor: o => o.total_amount },
        { label: 'Status', accessor: o => o.status },
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Orders</h1>
                    <p>{orders.length} total orders</p>
                </div>
                <div className="page-header__actions">
                    <ExportButtons data={filtered} filename="orders" columns={exportCols} />
                    <button className="btn-admin btn-admin--primary" onClick={() => navigate('/admin/orders/new')}>
                        <Plus size={16} /> Create Order
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-bar__search">
                    <Search size={16} className="filter-bar__search-icon" />
                    <input placeholder="Search order #, customer..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="card">
                <div className="card__body--flush">
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No orders found</td></tr>
                                ) : paginated.map(ord => {
                                    const cust = custMap[ord.customer_id];
                                    return (
                                        <tr key={ord.id}>
                                            <td>
                                                <strong style={{ color: '#3b82f6', cursor: 'pointer' }} onClick={() => navigate(`/admin/orders/${ord.id}`)}>
                                                    {ord.order_number}
                                                </strong>
                                            </td>
                                            <td>{cust ? cust.name : '—'}</td>
                                            <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                {new Date(ord.order_date).toLocaleDateString('en-IN')}
                                            </td>
                                            <td>{fmt(ord.total_amount)}</td>
                                            <td>
                                                <select
                                                    value={ord.status}
                                                    onChange={e => updateStatus(ord.id, e.target.value)}
                                                    style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '0.78rem', fontWeight: 600 }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className="data-table__actions">
                                                    <button className="data-table__action-btn" title="View" onClick={() => navigate(`/admin/orders/${ord.id}`)}><Eye size={15} /></button>
                                                    <button className="data-table__action-btn" title="Edit" onClick={() => navigate(`/admin/orders/${ord.id}/edit`)}><Edit2 size={15} /></button>
                                                    <button className="data-table__action-btn data-table__action-btn--danger" title="Delete" onClick={() => setDeleteId(ord.id)}><Trash2 size={15} /></button>
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

            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Order" footer={
                <>
                    <button className="btn-admin btn-admin--secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                    <button className="btn-admin btn-admin--danger" onClick={deleteOrder}>Delete</button>
                </>
            }>
                <p className="confirm-text">Are you sure you want to delete this order? Related items will also be removed.</p>
            </Modal>
        </>
    );
}
