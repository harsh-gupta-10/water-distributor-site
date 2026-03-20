import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function InvoiceForm() {
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
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
    const [dueDate, setDueDate] = useState('');
    const [taxRate, setTaxRate] = useState(0);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([{ product_id: '', description: '', quantity: 1, price: '' }]);
    const productsById = useMemo(() => {
        const map = {};
        products.forEach((product) => {
            map[product.id] = product;
        });
        return map;
    }, [products]);

    async function fetchData() {
        setLoading(true);
        const [custRes, prodRes] = await Promise.all([
            supabase.from('customers').select('id, name, business_name'),
            supabase.from('products').select('id, name, price').eq('status', 'active'),
        ]);
        setCustomers(custRes.data || []);
        setProducts(prodRes.data || []);

        if (isEdit) {
            const { data: inv } = await supabase.from('invoices').select('*').eq('id', id).single();
            const { data: invItems } = await supabase.from('invoice_items').select('*').eq('invoice_id', id);
            if (inv) {
                setCustomerId(inv.customer_id || '');
                setInvoiceNumber(inv.invoice_number);
                setInvoiceDate(inv.invoice_date);
                setDueDate(inv.due_date || '');
                setTaxRate(parseFloat(inv.tax_rate) || 0);
                setNotes(inv.notes || '');
            }
            if (invItems && invItems.length > 0) {
                setItems(invItems.map(it => ({
                    product_id: it.product_id || '',
                    description: it.description || '',
                    quantity: it.quantity,
                    price: it.price,
                })));
            }
        } else {
            const orderFromQuery = searchParams.get('order');
            if (orderFromQuery) {
                const { data: ordItems } = await supabase.from('order_items').select('*').eq('order_id', orderFromQuery);
                if (ordItems && ordItems.length > 0) {
                    setItems(ordItems.map(it => ({
                        product_id: it.product_id || '',
                        description: it.description || '',
                        quantity: it.quantity,
                        price: it.price,
                    })));
                }
            }

            // Generate invoice number
            const { count } = await supabase.from('invoices').select('id', { count: 'exact', head: true });
            const num = String((count || 0) + 1).padStart(4, '0');
            setInvoiceNumber(`INV-${new Date().getFullYear()}-${num}`);
        }
        setLoading(false);
    }

    useEffect(() => { fetchData(); }, []);

    function updateItem(index, field, value) {
        setItems(prev => prev.map((item, i) => {
            if (i !== index) return item;
            const updated = { ...item, [field]: value };
            // Auto-fill price and description when product selected
            if (field === 'product_id' && value) {
                const prod = productsById[value];
                if (prod) {
                    updated.description = prod.name;
                    if (!item.price) updated.price = prod.price;
                }
            }
            return updated;
        }));
    }

    function addItem() {
        setItems(prev => [...prev, { product_id: '', description: '', quantity: 1, price: '' }]);
    }

    function removeItem(index) {
        if (items.length === 1) return;
        setItems(prev => prev.filter((_, i) => i !== index));
    }

    const subtotal = items.reduce((s, it) => s + (parseFloat(it.quantity) || 0) * (parseFloat(it.price) || 0), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxAmount;
    const fmt = n => `₹${Number(n).toFixed(2)}`;

    async function handleSave() {
        if (!customerId) { toast('Please select a customer', 'error'); return; }
        if (items.every(it => !it.description && !it.product_id)) { toast('Please add at least one item', 'error'); return; }
        setSaving(true);

        const invoicePayload = {
            invoice_number: invoiceNumber,
            customer_id: customerId,
            invoice_date: invoiceDate,
            due_date: dueDate || null,
            subtotal: subtotal.toFixed(2),
            tax_rate: taxRate,
            tax_amount: taxAmount.toFixed(2),
            total_amount: totalAmount.toFixed(2),
            notes: notes || null,
        };

        try {
            let invoiceId;
            if (isEdit) {
                const { error } = await supabase.from('invoices').update(invoicePayload).eq('id', id);
                if (error) throw error;
                invoiceId = id;
                // Delete old items
                await supabase.from('invoice_items').delete().eq('invoice_id', id);
            } else {
                const { data, error } = await supabase.from('invoices').insert(invoicePayload).select('id').single();
                if (error) throw error;
                invoiceId = data.id;
            }

            // Insert items
            const itemsPayload = items
                .filter(it => it.description || it.product_id)
                .map(it => ({
                    invoice_id: invoiceId,
                    product_id: it.product_id || null,
                    description: it.description,
                    quantity: parseInt(it.quantity) || 1,
                    price: parseFloat(it.price) || 0,
                }));
            if (itemsPayload.length > 0) {
                const { error } = await supabase.from('invoice_items').insert(itemsPayload);
                if (error) throw error;
            }

            toast(isEdit ? 'Invoice updated' : 'Invoice created');
            navigate(`/admin/invoices/${invoiceId}`);
        } catch (err) {
            toast(err.message, 'error');
        }
        setSaving(false);
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;

    return (
        <>
            <button className="btn-admin btn-admin--ghost" onClick={() => navigate('/admin/invoices')} style={{ marginBottom: 16 }}>
                <ArrowLeft size={16} /> Back to Invoices
            </button>

            <div className="page-header">
                <div className="page-header__info">
                    <h1>{isEdit ? 'Edit Invoice' : 'Create Invoice'}</h1>
                    <p>{invoiceNumber}</p>
                </div>
            </div>

            <div className="card" style={{ maxWidth: 900 }}>
                <div className="card__body">
                    {/* Invoice Meta */}
                    <div className="form-grid" style={{ marginBottom: 24 }}>
                        <div className="form-field">
                            <label>Invoice Number</label>
                            <input value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                        </div>
                        <div className="form-field">
                            <label>Customer *</label>
                            <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
                                <option value="">Select customer...</option>
                                {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.business_name ? ` (${c.business_name})` : ''}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label>Invoice Date</label>
                            <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                        </div>
                        <div className="form-field">
                            <label>Due Date</label>
                            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>
                    </div>

                    {/* Line Items */}
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Line Items</h3>
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
                                            <select
                                                value={item.product_id}
                                                onChange={e => updateItem(i, 'product_id', e.target.value)}
                                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }}
                                            >
                                                <option value="">Select product</option>
                                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                value={item.description}
                                                onChange={e => updateItem(i, 'description', e.target.value)}
                                                placeholder="Description"
                                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={e => updateItem(i, 'quantity', e.target.value)}
                                                min="1"
                                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.price}
                                                onChange={e => updateItem(i, 'price', e.target.value)}
                                                min="0"
                                                step="0.01"
                                                style={{ width: '100%', padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem' }}
                                            />
                                        </td>
                                        <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                                            {fmt((parseFloat(item.quantity) || 0) * (parseFloat(item.price) || 0))}
                                        </td>
                                        <td>
                                            <button
                                                className="data-table__action-btn data-table__action-btn--danger"
                                                onClick={() => removeItem(i)}
                                                disabled={items.length === 1}
                                            >
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

                    {/* Tax + Totals */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: 300 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.88rem' }}>
                                <span>Subtotal</span><span>{fmt(subtotal)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.88rem' }}>
                                <span>Tax Rate (%)</span>
                                <input
                                    type="number"
                                    value={taxRate}
                                    onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                                    min="0"
                                    max="100"
                                    style={{ width: 70, padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: 6, fontSize: '0.85rem', textAlign: 'right' }}
                                />
                            </div>
                            {taxRate > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.88rem' }}>
                                    <span>Tax ({taxRate}%)</span><span>{fmt(taxAmount)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: '1.05rem', fontWeight: 700, borderTop: '2px solid #e5e7eb' }}>
                                <span>Total</span><span>{fmt(totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-field" style={{ marginTop: 20 }}>
                        <label>Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Payment terms, additional instructions..." />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
                        <button className="btn-admin btn-admin--secondary" onClick={() => navigate('/admin/invoices')}>Cancel</button>
                        <button className="btn-admin btn-admin--primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : isEdit ? 'Update Invoice' : 'Create Invoice'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
