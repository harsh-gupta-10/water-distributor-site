import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Receipt, TrendingUp, Clock, FileText, Package, AlertCircle, CheckCircle, XCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({ 
        customers: 0, 
        invoices: 0, 
        revenue: 0, 
        pending: 0, 
        quotations: 0, 
        products: 0,
        avgOrderValue: 0,
        conversionRate: 0,
        pendingQuotations: 0,
        overdueDays: 0
    });
    const [topCustomers, setTopCustomers] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [monthlyQuotations, setMonthlyQuotations] = useState([]);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [recentQuotations, setRecentQuotations] = useState([]);
    const [outstandingCustomers, setOutstandingCustomers] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState({ pending: 0, partial: 0, paid: 0 });
    const [trends, setTrends] = useState({ revenueGrowth: 0, customerGrowth: 0 });
    const [loading, setLoading] = useState(true);

    async function fetchAll() {
        setLoading(true);
        const [custRes, invRes, quotRes, prodRes, invItemsRes] = await Promise.all([
            supabase.from('customers').select('id,created_at', { count: 'exact', head: true }),
            supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('quotations').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('products').select('id', { count: 'exact', head: true }),
            supabase.from('invoice_items').select('quantity, price, invoice_id, product_id, description'),
        ]);

        const invoices = invRes.data || [];
        const quotations = quotRes.data || [];
        const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
        const totalPaid = invoices.reduce((s, i) => s + parseFloat(i.amount_paid || 0), 0);
        const pendingPayments = totalRevenue - totalPaid;
        
        // Calculate metrics
        const avgOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;
        const conversionRate = quotations.length > 0 ? (invoices.length / quotations.length) * 100 : 0;
        
        // Payment status breakdown
        let payPending = 0, payPartial = 0, payPaid = 0;
        invoices.forEach(inv => {
            const paidAmt = parseFloat(inv.amount_paid || 0);
            const totalAmt = parseFloat(inv.total_amount || 0);
            if (paidAmt === 0) payPending++;
            else if (paidAmt < totalAmt) payPartial++;
            else payPaid++;
        });
        
        // Outstanding customers (customers with unpaid invoices)
        const custOutstanding = {};
        invoices.forEach(inv => {
            const owing = (parseFloat(inv.total_amount || 0) - parseFloat(inv.amount_paid || 0));
            if (owing > 0 && inv.customer_id) {
                custOutstanding[inv.customer_id] = (custOutstanding[inv.customer_id] || 0) + owing;
            }
        });
        const topOutstanding = Object.entries(custOutstanding).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (topOutstanding.length > 0) {
            const { data: custData } = await supabase.from('customers').select('id, name').in('id', topOutstanding.map(c => c[0]));
            const custMap = {};
            (custData || []).forEach(c => { custMap[c.id] = c.name; });
            setOutstandingCustomers(topOutstanding.map(([id, amt]) => ({ name: custMap[id] || 'Unknown', outstanding: amt })));
        }
        
        // Revenue growth trend (this month vs last month)
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        let thisMonthRev = 0, lastMonthRev = 0;
        invoices.forEach(inv => {
            const invDate = new Date(inv.created_at);
            if (invDate >= thisMonthStart) thisMonthRev += parseFloat(inv.total_amount || 0);
            else if (invDate >= lastMonthStart && invDate <= lastMonthEnd) lastMonthRev += parseFloat(inv.total_amount || 0);
        });
        const revenueGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;
        
        // Customer growth trend
        const thisMonthCusts = custRes.data?.filter(c => new Date(c.created_at) >= thisMonthStart).length || 0;
        const lastMonthCusts = custRes.data?.filter(c => {
            const d = new Date(c.created_at);
            return d >= lastMonthStart && d <= lastMonthEnd;
        }).length || 0;
        const customerGrowth = lastMonthCusts > 0 ? ((thisMonthCusts - lastMonthCusts) / lastMonthCusts) * 100 : 0;

        setStats({
            customers: custRes.count || 0,
            invoices: invoices.length,
            revenue: totalPaid,
            pending: pendingPayments,
            quotations: quotations.length,
            products: prodRes.count || 0,
            avgOrderValue,
            conversionRate: Math.round(conversionRate),
            pendingQuotations: quotations.filter(q => !q.converted_to_invoice).length,
            overdueDays: 0 // Can enhance later
        });
        
        setPaymentStatus({ pending: payPending, partial: payPartial, paid: payPaid });
        setTrends({ revenueGrowth, customerGrowth });

        // Monthly revenue from invoices
        const monthlyRev = {};
        invoices.forEach(inv => {
            const d = new Date(inv.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyRev[key] = (monthlyRev[key] || 0) + parseFloat(inv.total_amount || 0);
        });
        const sortedMonthlyRev = Object.entries(monthlyRev).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
        setMonthlyRevenue(sortedMonthlyRev);

        // Monthly quotations
        const monthlyQ = {};
        quotations.forEach(q => {
            const d = new Date(q.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            monthlyQ[key] = (monthlyQ[key] || 0) + 1;
        });
        const sortedMonthlyQ = Object.entries(monthlyQ).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
        setMonthlyQuotations(sortedMonthlyQ);

        // Top customers by invoice revenue
        const custRevenue = {};
        for (const inv of invoices) {
            if (inv.customer_id) {
                custRevenue[inv.customer_id] = (custRevenue[inv.customer_id] || 0) + parseFloat(inv.total_amount || 0);
            }
        }
        const topCustIds = Object.entries(custRevenue).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (topCustIds.length > 0) {
            const { data: custData } = await supabase.from('customers').select('id, name').in('id', topCustIds.map(c => c[0]));
            const custMap = {};
            (custData || []).forEach(c => { custMap[c.id] = c.name; });
            setTopCustomers(topCustIds.map(([id, rev]) => ({ name: custMap[id] || 'Unknown', revenue: rev })));
        }

        // Top products by quantity sold
        const prodCount = {};
        (invItemsRes.data || []).forEach(item => {
            const label = item.description || item.product_id || 'Unknown';
            prodCount[label] = (prodCount[label] || 0) + (item.quantity || 1);
        });
        setTopProducts(Object.entries(prodCount).sort((a, b) => b[1] - a[1]).slice(0, 5));
        
        // Recent invoices
        setRecentInvoices(invoices.slice(0, 5));
        
        // Recent quotations
        setRecentQuotations(quotations.slice(0, 5));

        setLoading(false);
    }

    useEffect(() => { fetchAll(); }, []);

    function fmt(n) { return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`; }
    function fmtMonth(key) {
        const [y, m] = key.split('-');
        return new Date(y, parseInt(m) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    }

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading dashboard...</div>;
    }

    const maxRevMonth = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map(m => m[1])) : 1;
    const maxQuotMonth = monthlyQuotations.length > 0 ? Math.max(...monthlyQuotations.map(m => m[1])) : 1;
    const maxCustRev = topCustomers.length > 0 ? Math.max(...topCustomers.map(c => c.revenue)) : 1;
    const maxProdQty = topProducts.length > 0 ? Math.max(...topProducts.map(p => p[1])) : 1;
    const maxOutstanding = outstandingCustomers.length > 0 ? Math.max(...outstandingCustomers.map(c => c.outstanding)) : 1;
    
    function fmt(n) { return `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`; }
    function fmtMonth(key) {
        const [y, m] = key.split('-');
        return new Date(y, parseInt(m) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    }
    function fmtDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

    return (
        <>
            {/* Key Performance Indicators */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--green"><TrendingUp size={22} /></div>
                    <div>
                        <span className="stat-card__value">{fmt(stats.revenue)}</span>
                        <span className="stat-card__label">Total Revenue (Paid)</span>
                        {trends.revenueGrowth !== 0 && (
                            <span style={{ fontSize: '0.75rem', color: trends.revenueGrowth > 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                {trends.revenueGrowth > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(trends.revenueGrowth).toFixed(1)}% vs last month
                            </span>
                        )}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--blue"><Users size={22} /></div>
                    <div>
                        <span className="stat-card__value">{stats.customers}</span>
                        <span className="stat-card__label">Total Customers</span>
                        {trends.customerGrowth !== 0 && (
                            <span style={{ fontSize: '0.75rem', color: trends.customerGrowth > 0 ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                {trends.customerGrowth > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(trends.customerGrowth).toFixed(1)}% new this month
                            </span>
                        )}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--purple"><Receipt size={22} /></div>
                    <div>
                        <span className="stat-card__value">{fmt(stats.avgOrderValue)}</span>
                        <span className="stat-card__label">Avg Order Value</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                            {stats.invoices} invoices total
                        </span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--orange"><Clock size={22} /></div>
                    <div>
                        <span className="stat-card__value">{fmt(stats.pending)}</span>
                        <span className="stat-card__label">Pending Payments</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                            {paymentStatus.pending} unpaid, {paymentStatus.partial} partial
                        </span>
                    </div>
                </div>
            </div>

            {/* Conversion & Key Metrics */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--teal"><FileText size={22} /></div>
                    <div>
                        <span className="stat-card__value">{stats.conversionRate}%</span>
                        <span className="stat-card__label">Quote → Invoice Conversion</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                            {stats.quotations} quotes, {stats.invoices} converted
                        </span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--blue"><AlertCircle size={22} /></div>
                    <div>
                        <span className="stat-card__value">{stats.pendingQuotations}</span>
                        <span className="stat-card__label">Pending Quotations</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                            Need follow-up
                        </span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--green"><CheckCircle size={22} /></div>
                    <div>
                        <span className="stat-card__value">{paymentStatus.paid}</span>
                        <span className="stat-card__label">Fully Paid Invoices</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                            {stats.invoices > 0 ? Math.round((paymentStatus.paid / stats.invoices) * 100) : 0}% of total
                        </span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--red"><Package size={22} /></div>
                    <div>
                        <span className="stat-card__value">{stats.products}</span>
                        <span className="stat-card__label">Active Products</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                            In catalog
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card__title">Monthly Revenue</div>
                    {monthlyRevenue.length === 0 ? <p className="empty-state__text">No data yet</p> : (
                        <div className="chart-bars">
                            {monthlyRevenue.map(([month, val]) => (
                                <div key={month} className="chart-bar">
                                    <span className="chart-bar__label">{fmtMonth(month)}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill" style={{ width: `${(val / maxRevMonth) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{fmt(val)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="chart-card">
                    <div className="chart-card__title">Monthly Quotations</div>
                    {monthlyQuotations.length === 0 ? <p className="empty-state__text">No data yet</p> : (
                        <div className="chart-bars">
                            {monthlyQuotations.map(([month, val]) => (
                                <div key={month} className="chart-bar">
                                    <span className="chart-bar__label">{fmtMonth(month)}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill chart-bar__fill--green" style={{ width: `${(val / maxQuotMonth) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{val}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Charts Row 2 - Top Performers */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card__title">Top Customers (by Revenue)</div>
                    {topCustomers.length === 0 ? <p className="empty-state__text">No data yet</p> : (
                        <div className="chart-bars">
                            {topCustomers.map(c => (
                                <div key={c.name} className="chart-bar">
                                    <span className="chart-bar__label">{c.name}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill chart-bar__fill--purple" style={{ width: `${(c.revenue / maxCustRev) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{fmt(c.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="chart-card">
                    <div className="chart-card__title">Top Products Sold</div>
                    {topProducts.length === 0 ? <p className="empty-state__text">No data yet</p> : (
                        <div className="chart-bars">
                            {topProducts.map(([name, qty]) => (
                                <div key={name} className="chart-bar">
                                    <span className="chart-bar__label">{name}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill chart-bar__fill--orange" style={{ width: `${(qty / maxProdQty) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{qty} units</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Outstanding & Recent Activity */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card__title">Outstanding Receivables</div>
                    {outstandingCustomers.length === 0 ? <p className="empty-state__text">All paid up!</p> : (
                        <div className="chart-bars">
                            {outstandingCustomers.map(c => (
                                <div key={c.name} className="chart-bar">
                                    <span className="chart-bar__label">{c.name}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill" style={{ background: '#ef4444', width: `${(c.outstanding / maxOutstanding) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{fmt(c.outstanding)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="chart-card">
                    <div className="chart-card__title">Recent Invoices</div>
                    {recentInvoices.length === 0 ? <p className="empty-state__text">No invoices yet</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {recentInvoices.map(inv => (
                                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '8px', background: '#f9fafb', borderRadius: 6 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1f2937' }}>{inv.customer_id?.substring(0, 20) || 'Unknown'}</div>
                                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{fmtDate(inv.created_at)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600 }}>{fmt(inv.total_amount || 0)}</div>
                                        <div style={{ color: parseFloat(inv.amount_paid || 0) === parseFloat(inv.total_amount || 0) ? '#10b981' : '#ef4444', fontSize: '0.75rem' }}>
                                            {parseFloat(inv.amount_paid || 0) === parseFloat(inv.total_amount || 0) ? '✓ Paid' : 'Pending'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
