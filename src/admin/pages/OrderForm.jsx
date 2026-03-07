import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function OrderForm() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const toast = useToast();

    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [customerId, setCustomerId] = useState(searchParams.get('customer') || '');
    const [orderNumber, setOrderNumber] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));
    const [status, setStatus] = useState('pending');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ product_id: '', description: '', quantity: 1, price: '' }]);

    // If coming from quotation, pre-fill items
    const fromQuotation = searchParams.get('quotation');
    const quotationProducts = searchParams.get('products');

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        const [custRes, prodRes] = await Promise.all([
            supabase.from('customers').select('id, name, business_name'),
            supabase.from('products').select('id, name, price').eq('status', 'active'),
        ]);
        setCustomers(custRes.data || []);
        setProducts(prodRes.data || []);

        if (isEdit) {
            const { data: ord } = await supabase.from('orders').select('*').eq('id', id).single();
            const { data: ordItems } = await supabase.from('order_items').select('*').eq('order_id', id);
            if (ord) {
                setCustomerId(ord.customer_id || '');
                setOrderNumber(ord.order_number);
                setOrderDate(ord.order_date);
                setStatus(ord.status);
                setNotes(ord.notes || '');
            }
            if (ordItems && ordItems.length > 0) {
                setItems(ordItems.map(it => ({
                    product_id: it.product_id || '',
                    description: it.description || '',
                    quantity: it.quantity,
                    price: it.price,
                })));
            }
        } else {
            // Generate order number
            const { count } = await supabase.from('orders').select('id', { count: 'exact', head: true });
            const num = String((count || 0) + 1).padStart(4, '0');
            setOrderNumber(`ORD-${new Date().getFullYear()}-${num}`);

            // If from quotation, pre-fill product names
            if (quotationProducts) {
                const prods = quotationProducts.split(',').map(p => p.trim()).filter(Boolean);
                if (prods.length > 0) {
                    setItems(prods.map(pName => {
                        // Try to match product by name
                        const matched = (prodRes.data || []).find(p => p.name.toLowerCase().includes(pName.toLowerCase()));
                        return {
                            product_id: matched ? matched.id : '',
                            description: pName,
                            quantity: 1,
                            price: matched ? matched.price : '',
                        };
                    }));
                }
            }
        }
        setLoading(false);
    }

    function updateItem(index, field, value) {
        setItems(prev => prev.map((item, i) => {
            if (i !== index) return item;
            const updated = { ...item, [field]: value };
            if (field === 'product_id' && value) {
                const prod = products.find(p => p.id === value);
                if (prod) {
                    updated.description = prod.name;
                    if (!item.price) updated.price = prod.price;
                }
            }
            return updated;
        }));
    }

    function addItem() { setItems(prev => [...prev, { product_id: '', description: '', quantity: 1, price: '' }]); }
    function removeItem(index) { if (items.length === 1) return; setItems(prev => prev.filter((_, i) => i !== index)); }

    const totalAmount = items.reduce((s, it) => s + (parseFloat(it.quantity) || 0) * (parseFloat(it.price) || 0), 0);
    const fmt = n => `₹${Number(n).toFixed(2)}`;

    async function handleSave() {
        if (!customerId) { toast('Please select a customer', 'error'); return; }
        if (items.every(it => !it.description && !it.product_id)) { toast('Add at least one item', 'error'); return; }
        setSaving(true);

        const orderPayload = {
            order_number: orderNumber,
            customer_id: customerId,
            quotation_id: fromQuotation || null,
            order_date: orderDate,
            status,
            total_amount: totalAmount.toFixed(2),
            notes: notes || null,
        };

        try {
            let orderId;
            if (isEdit) {
                const { error } = await supabase.from('orders').update(orderPayload).eq('id', id);
                if (error) throw error;
                orderId = id;
                await supabase.from('order_items').delete().eq('order_id', id);
            } else {
                const { data, error } = await supabase.from('orders').insert(orderPayload).select('id').single();
                if (error) throw error;
                orderId = data.id;
            }

            const itemsPayload = items
                .filter(it => it.description || it.product_id)
                .map(it => ({
                    order_id: orderId,
                    product_id: it.product_id || null,
                    description: it.description,
                    quantity: parseInt(it.quantity) || 1,
                    price: parseFloat(it.price) || 0,
                }));
            if (itemsPayload.length > 0) {
                const { error } = await supabase.from('order_items').insert(itemsPayload);
                if (error) throw error;
            }

            toast(isEdit ? 'Order updated' : 'Order created');
            navigate(`/admin/orders/${orderId}`);
        } catch (err) {
            toast(err.message, 'error');
        }
        setSaving(false);
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;

    return (
        <>
            <button className="btn-admin btn-admin--ghost" onClick={() => navigate('/admin/orders')} style={{ marginBottom: 16 }}>
                <ArrowLeft size={16} /> Back to Orders
            </button>

            <div className="page-header">
                <div className="page-header__info">
                    <h1>{isEdit ? 'Edit Order' : 'Create Order'}</h1>
                    <p>{orderNumber}{fromQuotation ? ' — Created from Quotation' : ''}</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 900 }}>
                <div className="card__body">
                    <div className="form-grid" style={{ marginBottom: 24 }}>
                        <div className="form-field">
                            <label>Order Number</label>
                            <input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} />
                        </div>
                        <div className="form-field">
                            <label>Customer *</label>
                            <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
                                <option value="">Select customer...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.business_name ? ` (${c.business_name})` : ''}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Order Date</label>
                            <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
                        </div>
                        <div className="form-field">
                            <label>Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)}>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Order Items</h3>
                    <div className="data-table-wrap" style={{ marginBottom: 12 }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '30%' }}>Product</th>
                                    <th>Description</th>
                                    <th style={{ width: 80 }}>Qty</th>
                                    <th style={{ width: 120 }}>Price (₹)</th>
                                    <th style={{ width: 100 }}>Amount</th>
                                    <th style={{ width: 40 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={i}>
                                        <td>
                                            <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}
                                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }}>
                                                <option value="">Select product</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)}
                                                placeholder="Description"
                                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }} />
                                        </td>
                                        <td>
                                            <input type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)}
                                                min="1" style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }} />
                                        </td>
                                        <td>
                                            <input type="number" value={item.price} onChange={e => updateItem(i, 'price', e.target.value)}
                                                min="0" step="0.01" style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }} />
                                        </td>
                                        <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                            {fmt((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0))}
                                        </td>
                                        <td>
                                            <button className="data-table__action-btn data-table__action-btn--danger" onClick={() => removeItem(i)} disabled={items.length === 1}>
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="btn-admin btn-admin--secondary btn-admin--sm" onClick={addItem} style={{ marginBottom: 24 }}>
                        <Plus size={14} /> Add Item
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: 280, display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '1.05rem', fontWeight: 700, borderTop: '2px solid #e5e7eb' }}>
                            <span>Total</span><span>{fmt(totalAmount)}</span>
                        </div>
                    </div>

                    <div className="form-field" style={{ marginTop: 20 }}>
                        <label>Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Order notes, special instructions..." />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                        <button className="btn-admin btn-admin--secondary" onClick={() => navigate('/admin/orders')}>Cancel</button>
                        <button className="btn-admin btn-admin--primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : isEdit ? 'Update Order' : 'Create Order'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
