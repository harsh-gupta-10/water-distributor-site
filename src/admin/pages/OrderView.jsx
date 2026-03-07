import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Edit2 } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function OrderView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [order, setOrder] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); }, [id]);

    async function fetchAll() {
        setLoading(true);
        const { data: ord } = await supabase.from('orders').select('*').eq('id', id).single();
        if (!ord) { setLoading(false); return; }
        setOrder(ord);

        const [custRes, itemsRes] = await Promise.all([
            ord.customer_id ? supabase.from('customers').select('*').eq('id', ord.customer_id).single() : { data: null },
            supabase.from('order_items').select('*').eq('order_id', id),
        ]);
        setCustomer(custRes.data);
        setItems(itemsRes.data || []);
        setLoading(false);
    }

    async function updateStatus(newStatus) {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setOrder(prev => ({ ...prev, status: newStatus }));
            toast('Status updated');
        }
    }

    const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;
    if (!order) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Order not found</div>;

    return (
        <>
            <button className="btn-admin btn-admin--ghost" onClick={() => navigate('/admin/orders')} style={{ marginBottom: 16 }}>
                <ArrowLeft size={16} /> Back to Orders
            </button>

            <div className="page-header">
                <div className="page-header__info">
                    <h1>{order.order_number}</h1>
                    <p>
                        <select
                            value={order.status}
                            onChange={e => updateStatus(e.target.value)}
                            style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '0.82rem', fontWeight: 600 }}
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </p>
                </div>
                <div className="page-header__actions">
                    <button className="btn-admin btn-admin--secondary" onClick={() => navigate(`/admin/orders/${id}/edit`)}>
                        <Edit2 size={15} /> Edit Order
                    </button>
                    {/* Create invoice from this order */}
                    <button className="btn-admin btn-admin--primary" onClick={() => navigate(`/admin/invoices/new?customer=${order.customer_id || ''}&order=${id}`)}>
                        Create Invoice
                    </button>
                </div>
            </div>

            <div className="profile-grid">
                {/* Customer Info */}
                <div className="profile-card">
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', marginBottom: 12 }}>Customer Details</h3>
                    {customer ? (
                        <>
                            <div className="profile-card__name">{customer.name}</div>
                            {customer.business_name && <div className="profile-card__business">{customer.business_name}</div>}
                            {customer.phone && <div className="profile-card__detail" style={{ fontSize: '0.85rem' }}>📞 {customer.phone}</div>}
                            {customer.email && <div className="profile-card__detail" style={{ fontSize: '0.85rem' }}>✉️ {customer.email}</div>}
                            {customer.location && <div className="profile-card__detail" style={{ fontSize: '0.85rem' }}>📍 {customer.location}</div>}
                        </>
                    ) : (
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No customer linked</p>
                    )}

                    <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Order Date</div>
                        <div style={{ fontSize: '0.9rem' }}>{new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>

                    {order.notes && (
                        <div style={{ marginTop: 12, padding: '10px 12px', background: '#f9fafb', borderRadius: 8, fontSize: '0.85rem', color: '#4b5563' }}>
                            <strong>Notes:</strong> {order.notes}
                        </div>
                    )}
                </div>

                {/* Order Items */}
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title">Order Items</h3>
                    </div>
                    <div className="card__body--flush">
                        <div className="data-table-wrap">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 40 }}>#</th>
                                        <th>Description</th>
                                        <th style={{ textAlign: 'center' }}>Qty</th>
                                        <th style={{ textAlign: 'right' }}>Price</th>
                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, i) => (
                                        <tr key={item.id || i}>
                                            <td>{i + 1}</td>
                                            <td>{item.description}</td>
                                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ textAlign: 'right' }}>{fmt(item.price)}</td>
                                            <td style={{ textAlign: 'right' }}>{fmt(item.quantity * parseFloat(item.price))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px', borderTop: '2px solid #e5e7eb' }}>
                            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                Total: {fmt(order.total_amount)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
