import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import siteConfig from '../../data/siteConfig';
import { ArrowLeft, Download, Printer, Plus, CreditCard } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InvoiceView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [invoice, setInvoice] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [items, setItems] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [payForm, setPayForm] = useState({ amount: '', payment_method: 'cash', payment_date: new Date().toISOString().slice(0, 10), notes: '' });

    async function fetchAll() {
        setLoading(true);
        const { data: inv } = await supabase.from('invoices').select('*').eq('id', id).single();
        if (!inv) { setLoading(false); return; }
        setInvoice(inv);

        const [custRes, itemsRes, payRes] = await Promise.all([
            inv.customer_id ? supabase.from('customers').select('*').eq('id', inv.customer_id).single() : { data: null },
            supabase.from('invoice_items').select('*').eq('invoice_id', id),
            supabase.from('payments').select('*').eq('invoice_id', id).order('payment_date', { ascending: false }),
        ]);
        setCustomer(custRes.data);
        setItems(itemsRes.data || []);
        setPayments(payRes.data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function addPayment() {
        const amt = parseFloat(payForm.amount);
        if (!amt || amt <= 0) { toast('Enter a valid amount', 'error'); return; }
        const { error } = await supabase.from('payments').insert({
            invoice_id: id, amount: amt, payment_method: payForm.payment_method,
            payment_date: payForm.payment_date, notes: payForm.notes || null,
        });
        if (error) { toast(error.message, 'error'); return; }

        // Update invoice amount_paid and payment_status
        const newPaid = parseFloat(invoice.amount_paid || 0) + amt;
        const total = parseFloat(invoice.total_amount);
        const newStatus = newPaid >= total ? 'paid' : newPaid > 0 ? 'partially_paid' : 'pending';
        await supabase.from('invoices').update({ amount_paid: newPaid.toFixed(2), payment_status: newStatus }).eq('id', id);

        toast('Payment recorded');
        setPaymentOpen(false);
        setPayForm({ amount: '', payment_method: 'cash', payment_date: new Date().toISOString().slice(0, 10), notes: '' });
        fetchAll();
    }

    async function generatePDF() {
        const doc = new jsPDF();

        // Load logo for PDF
        const imgParams = await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = '/imgs/logo-main.png';
        });

        if (imgParams) {
            // Add image (x, y, width, height). Assuming generic wide logo aspect ratio.
            doc.addImage(imgParams, 'PNG', 14, 15, 45, 12);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(siteConfig.addressFull, 14, 32);
            doc.text(`${siteConfig.phoneDisplay} | ${siteConfig.email}`, 14, 37);
        } else {
            // Fallback to text
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(`${siteConfig.businessName}${siteConfig.businessNameHighlight}`, 14, 22);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(siteConfig.addressFull, 14, 28);
            doc.text(`${siteConfig.phoneDisplay} | ${siteConfig.email}`, 14, 33);
        }

        // Invoice title
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(59, 130, 246);
        doc.text('INVOICE', 196, 22, { align: 'right' });
        doc.setTextColor(0, 0, 0);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Invoice #: ${invoice.invoice_number}`, 196, 30, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 196, 36, { align: 'right' });
        if (invoice.due_date) {
            doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 196, 42, { align: 'right' });
        }

        // Line
        doc.setDrawColor(200);
        doc.line(14, 48, 196, 48);

        // Bill To
        let billY = 56;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO', 14, billY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        if (customer) {
            billY += 6;
            doc.text(customer.name, 14, billY);
            if (customer.business_name) { billY += 5; doc.text(customer.business_name, 14, billY); }
            if (customer.phone) { billY += 5; doc.setFontSize(9); doc.text(customer.phone, 14, billY); }
            if (customer.email) { billY += 5; doc.text(customer.email, 14, billY); }
            if (customer.location) { billY += 5; doc.text(customer.location, 14, billY); }
        }

        // Items table
        const tableBody = items.map((item, i) => [
            i + 1,
            item.description || '',
            item.quantity,
            `Rs. ${parseFloat(item.price).toFixed(2)}`,
            `Rs. ${(item.quantity * parseFloat(item.price)).toFixed(2)}`,
        ]);

        autoTable(doc, {
            startY: billY + 12,
            head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
            styles: { fontSize: 9 },
            columnStyles: { 0: { cellWidth: 12 }, 2: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' } },
        });

        let finalY = doc.lastAutoTable.finalY + 10;
        const rightX = 196;

        // Totals
        doc.setFontSize(10);
        doc.text('Subtotal:', rightX - 50, finalY);
        doc.text(`Rs. ${parseFloat(invoice.subtotal).toFixed(2)}`, rightX, finalY, { align: 'right' });

        if (parseFloat(invoice.tax_rate) > 0) {
            finalY += 6;
            doc.text(`Tax (${invoice.tax_rate}%):`, rightX - 50, finalY);
            doc.text(`Rs. ${parseFloat(invoice.tax_amount).toFixed(2)}`, rightX, finalY, { align: 'right' });
        }

        finalY += 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Total:', rightX - 50, finalY);
        doc.text(`Rs. ${parseFloat(invoice.total_amount).toFixed(2)}`, rightX, finalY, { align: 'right' });

        finalY += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Paid:', rightX - 50, finalY);
        doc.text(`Rs. ${parseFloat(invoice.amount_paid).toFixed(2)}`, rightX, finalY, { align: 'right' });

        const balance = parseFloat(invoice.total_amount) - parseFloat(invoice.amount_paid);
        finalY += 6;
        doc.setFont('helvetica', 'bold');
        doc.text('Balance Due:', rightX - 50, finalY);
        doc.text(`Rs. ${balance.toFixed(2)}`, rightX, finalY, { align: 'right' });

        // Notes
        if (invoice.notes) {
            finalY += 14;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text('Notes:', 14, finalY);
            doc.setFont('helvetica', 'normal');
            finalY += 5;
            doc.text(invoice.notes, 14, finalY);
        }

        // Footer
        finalY += 16;
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text('Thank you for your business!', 105, finalY, { align: 'center' });
        doc.text(`For queries, contact us at ${siteConfig.phoneDisplay} or ${siteConfig.email}`, 105, finalY + 5, { align: 'center' });

        doc.save(`${invoice.invoice_number}.pdf`);
        toast('PDF downloaded');
    }

    const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;
    if (!invoice) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Invoice not found</div>;

    const balance = parseFloat(invoice.total_amount) - parseFloat(invoice.amount_paid);

    return (
        <>
            <button className="btn-admin btn-admin--ghost" onClick={() => navigate('/admin/invoices')} style={{ marginBottom: 16 }}>
                <ArrowLeft size={16} /> Back to Invoices
            </button>

            <div className="page-header">
                <div className="page-header__info">
                    <h1>{invoice.invoice_number}</h1>
                    <p><span className={`badge badge--${invoice.payment_status}`}>{invoice.payment_status.replace('_', ' ')}</span></p>
                </div>
                <div className="page-header__actions">
                    <button className="btn-admin btn-admin--secondary" onClick={() => window.print()}><Printer size={15} /> Print</button>
                    <button className="btn-admin btn-admin--primary" onClick={generatePDF}><Download size={15} /> Download PDF</button>
                    <button className="btn-admin btn-admin--success" onClick={() => { setPayForm(prev => ({ ...prev, amount: balance > 0 ? balance.toFixed(2) : '' })); setPaymentOpen(true); }}><CreditCard size={15} /> Add Payment</button>
                </div>
            </div>

            {/* Invoice Preview */}
            <div className="invoice-preview">
                <div className="invoice-preview__header">
                    <div>
                        <div className="invoice-preview__company-name" style={{ marginBottom: 8 }}>
                            <img src="/imgs/logo-main.png" alt={siteConfig.businessName} style={{ height: 36, width: 'auto' }} />
                        </div>
                        <div className="invoice-preview__company-detail">{siteConfig.addressFull}</div>
                        <div className="invoice-preview__company-detail">{siteConfig.phoneDisplay} | {siteConfig.email}</div>
                    </div>
                    <div>
                        <div className="invoice-preview__meta-title">INVOICE</div>
                        <div className="invoice-preview__meta-item"><span>Invoice #:</span> <strong>{invoice.invoice_number}</strong></div>
                        <div className="invoice-preview__meta-item"><span>Date:</span> <strong>{new Date(invoice.invoice_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                        {invoice.due_date && <div className="invoice-preview__meta-item"><span>Due:</span> <strong>{new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>}
                    </div>
                </div>

                <hr className="invoice-preview__divider" />

                {customer && (
                    <div className="invoice-preview__bill" style={{ marginBottom: 24 }}>
                        <div className="invoice-preview__bill-label">Bill To</div>
                        <div className="invoice-preview__bill-name">{customer.name}</div>
                        {customer.business_name && <div>{customer.business_name}</div>}
                        {customer.phone && <div>{customer.phone}</div>}
                        {customer.email && <div>{customer.email}</div>}
                        {customer.location && <div>{customer.location}</div>}
                    </div>
                )}

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

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                    <div style={{ width: 280 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.88rem' }}>
                            <span>Subtotal</span><span>{fmt(invoice.subtotal)}</span>
                        </div>
                        {parseFloat(invoice.tax_rate) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.88rem' }}>
                                <span>Tax ({invoice.tax_rate}%)</span><span>{fmt(invoice.tax_amount)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '1.05rem', fontWeight: 700, borderTop: '2px solid #e5e7eb' }}>
                            <span>Total</span><span>{fmt(invoice.total_amount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.88rem', color: '#16a34a' }}>
                            <span>Amount Paid</span><span>{fmt(invoice.amount_paid)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '0.95rem', fontWeight: 700, color: balance > 0 ? '#ea580c' : '#16a34a', borderTop: '1px solid #e5e7eb' }}>
                            <span>Balance Due</span><span>{fmt(balance)}</span>
                        </div>
                    </div>
                </div>

                {invoice.notes && (
                    <div style={{ marginTop: 20, padding: '12px 16px', background: '#f9fafb', borderRadius: 8, fontSize: '0.85rem' }}>
                        <strong>Notes:</strong> {invoice.notes}
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="card" style={{ marginTop: 24 }}>
                <div className="card__header">
                    <h3 className="card__title">Payment History</h3>
                </div>
                <div className="card__body--flush">
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr><th>Date</th><th>Amount</th><th>Method</th><th>Notes</th></tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: 30, color: '#9ca3af' }}>No payments recorded</td></tr>
                                ) : payments.map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontSize: '0.8rem' }}>{new Date(p.payment_date).toLocaleDateString('en-IN')}</td>
                                        <td style={{ fontWeight: 600, color: '#16a34a' }}>{fmt(p.amount)}</td>
                                        <td><span className="badge badge--contacted" style={{ textTransform: 'uppercase' }}>{p.payment_method}</span></td>
                                        <td>{p.notes || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Payment Modal */}
            <Modal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} title="Add Payment" footer={
                <>
                    <button className="btn-admin btn-admin--secondary" onClick={() => setPaymentOpen(false)}>Cancel</button>
                    <button className="btn-admin btn-admin--success" onClick={addPayment}>Record Payment</button>
                </>
            }>
                <div style={{ marginBottom: 12, padding: '10px 14px', background: '#f0f9ff', borderRadius: 8, fontSize: '0.85rem' }}>
                    <strong>Balance Due:</strong> {fmt(balance)}
                </div>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Amount (₹) *</label>
                        <input type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} placeholder="0.00" min="0" step="0.01" />
                    </div>
                    <div className="form-field">
                        <label>Payment Method</label>
                        <select value={payForm.payment_method} onChange={e => setPayForm({ ...payForm, payment_method: e.target.value })}>
                            <option value="cash">Cash</option>
                            <option value="bank">Bank Transfer</option>
                            <option value="upi">UPI</option>
                            <option value="card">Card</option>
                        </select>
                    </div>
                    <div className="form-field">
                        <label>Payment Date</label>
                        <input type="date" value={payForm.payment_date} onChange={e => setPayForm({ ...payForm, payment_date: e.target.value })} />
                    </div>
                    <div className="form-field form-field--full">
                        <label>Notes</label>
                        <textarea value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Transaction reference, remarks..." />
                    </div>
                </div>
            </Modal>
        </>
    );
}
