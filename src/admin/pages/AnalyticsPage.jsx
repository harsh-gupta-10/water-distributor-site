import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Receipt, TrendingUp, FileText, Package, Clock } from 'lucide-react';

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        const [custRes, invRes, quotRes, prodRes, payRes] = await Promise.all([
            supabase.from('customers').select('id, name, created_at'),
            supabase.from('invoices').select('*'),
            supabase.from('quotations').select('created_at, status, products'),
            supabase.from('products').select('id, name, status'),
            supabase.from('payments').select('amount, payment_method, payment_date'),
        ]);

        const customers = custRes.data || [];
        const invoices = invRes.data || [];
        const quotations = quotRes.data || [];
        const products = prodRes.data || [];
        const payments = payRes.data || [];

        const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
        const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

        // Status breakdown
        const quotStatus = { new: 0, contacted: 0, completed: 0 };
        quotations.forEach(q => { quotStatus[q.status] = (quotStatus[q.status] || 0) + 1; });

        const invStatus = { pending: 0, partially_paid: 0, paid: 0 };
        invoices.forEach(i => { invStatus[i.payment_status] = (invStatus[i.payment_status] || 0) + 1; });

        // Payment methods
        const methods = {};
        payments.forEach(p => { methods[p.payment_method] = (methods[p.payment_method] || 0) + parseFloat(p.amount || 0); });

        // Monthly revenue
        const monthlyRev = {};
        invoices.forEach(inv => {
            const d = new Date(inv.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyRev[key] = (monthlyRev[key] || 0) + parseFloat(inv.total_amount || 0);
        });
        const sortedMonthlyRev = Object.entries(monthlyRev).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);

        // Product demand
        const prodDemand = {};
        quotations.forEach(q => {
            (q.products || []).forEach(p => { prodDemand[p] = (prodDemand[p] || 0) + 1; });
        });
        const sortedProdDemand = Object.entries(prodDemand).sort((a, b) => b[1] - a[1]).slice(0, 8);

        setData({
            customers: customers.length,
            invoices: invoices.length,
            quotations: quotations.length,
            products: products.filter(p => p.status === 'active').length,
            totalRevenue,
            totalPaid,
            pending: totalRevenue - totalPaid,
            quotStatus,
            invStatus,
            methods: Object.entries(methods).sort((a, b) => b[1] - a[1]),
            monthlyRev: sortedMonthlyRev,
            prodDemand: sortedProdDemand,
        });
        setLoading(false);
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading analytics...</div>;
    if (!data) return null;

    const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
    const fmtMonth = key => {
        const [y, m] = key.split('-');
        return new Date(y, parseInt(m) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    };

    const maxMonthRev = data.monthlyRev.length > 0 ? Math.max(...data.monthlyRev.map(m => m[1])) : 1;
    const maxProdDemand = data.prodDemand.length > 0 ? Math.max(...data.prodDemand.map(p => p[1])) : 1;
    const maxMethod = data.methods.length > 0 ? Math.max(...data.methods.map(m => m[1])) : 1;

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Analytics</h1>
                    <p>Business insights and performance metrics</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="stats-grid">
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--blue"><Users size={22} /></div><div><span className="stat-card__value">{data.customers}</span><span className="stat-card__label">Customers</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--green"><TrendingUp size={22} /></div><div><span className="stat-card__value">{fmt(data.totalRevenue)}</span><span className="stat-card__label">Total Revenue</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--purple"><Receipt size={22} /></div><div><span className="stat-card__value">{data.invoices}</span><span className="stat-card__label">Invoices</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--orange"><Clock size={22} /></div><div><span className="stat-card__value">{fmt(data.pending)}</span><span className="stat-card__label">Pending</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--teal"><FileText size={22} /></div><div><span className="stat-card__value">{data.quotations}</span><span className="stat-card__label">Quotations</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--red"><Package size={22} /></div><div><span className="stat-card__value">{data.products}</span><span className="stat-card__label">Active Products</span></div></div>
            </div>

            <div className="charts-grid">
                {/* Monthly Revenue */}
                <div className="chart-card">
                    <div className="chart-card__title">Monthly Revenue (Last 12 months)</div>
                    {data.monthlyRev.length === 0 ? <p className="empty-state__text">No data</p> : (
                        <div className="chart-bars">
                            {data.monthlyRev.map(([m, v]) => (
                                <div key={m} className="chart-bar">
                                    <span className="chart-bar__label">{fmtMonth(m)}</span>
                                    <div className="chart-bar__track"><div className="chart-bar__fill" style={{ width: `${(v / maxMonthRev) * 100}%` }} /></div>
                                    <span className="chart-bar__count">{fmt(v)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Demand */}
                <div className="chart-card">
                    <div className="chart-card__title">Most Requested Products</div>
                    {data.prodDemand.length === 0 ? <p className="empty-state__text">No data</p> : (
                        <div className="chart-bars">
                            {data.prodDemand.map(([name, count]) => (
                                <div key={name} className="chart-bar">
                                    <span className="chart-bar__label">{name}</span>
                                    <div className="chart-bar__track"><div className="chart-bar__fill chart-bar__fill--orange" style={{ width: `${(count / maxProdDemand) * 100}%` }} /></div>
                                    <span className="chart-bar__count">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="charts-grid">
                {/* Payment Methods */}
                <div className="chart-card">
                    <div className="chart-card__title">Payment Methods</div>
                    {data.methods.length === 0 ? <p className="empty-state__text">No data</p> : (
                        <div className="chart-bars">
                            {data.methods.map(([method, val]) => (
                                <div key={method} className="chart-bar">
                                    <span className="chart-bar__label" style={{ textTransform: 'uppercase' }}>{method}</span>
                                    <div className="chart-bar__track"><div className="chart-bar__fill chart-bar__fill--purple" style={{ width: `${(val / maxMethod) * 100}%` }} /></div>
                                    <span className="chart-bar__count">{fmt(val)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status Breakdown */}
                <div className="chart-card">
                    <div className="chart-card__title">Status Breakdown</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <h4 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Quotations</h4>
                            {Object.entries(data.quotStatus).map(([status, count]) => (
                                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                    <span className={`badge badge--${status}`}>{status}</span>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h4 style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>Invoices</h4>
                            {Object.entries(data.invStatus).map(([status, count]) => (
                                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                    <span className={`badge badge--${status}`}>{status.replace('_', ' ')}</span>
                                    <strong>{count}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
