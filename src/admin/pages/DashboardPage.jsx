import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Receipt, TrendingUp, Clock, FileText, Package } from 'lucide-react';

export default function DashboardPage() {
    const [stats, setStats] = useState({ customers: 0, invoices: 0, revenue: 0, pending: 0, quotations: 0, products: 0 });
    const [topCustomers, setTopCustomers] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [monthlyQuotations, setMonthlyQuotations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchAll(); }, []);

    async function fetchAll() {
        setLoading(true);
        const [custRes, invRes, payRes, quotRes, prodRes, invItemsRes] = await Promise.all([
            supabase.from('customers').select('id', { count: 'exact', head: true }),
            supabase.from('invoices').select('*'),
            supabase.from('payments').select('amount'),
            supabase.from('quotations').select('created_at'),
            supabase.from('products').select('id', { count: 'exact', head: true }),
            supabase.from('invoice_items').select('quantity, price, invoice_id, product_id, description'),
        ]);

        const invoices = invRes.data || [];
        const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
        const totalPaid = invoices.reduce((s, i) => s + parseFloat(i.amount_paid || 0), 0);
        const pendingPayments = totalRevenue - totalPaid;

        setStats({
            customers: custRes.count || 0,
            invoices: invoices.length,
            revenue: totalRevenue,
            pending: pendingPayments,
            quotations: (quotRes.data || []).length,
            products: prodRes.count || 0,
        });

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
        (quotRes.data || []).forEach(q => {
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

        setLoading(false);
    }

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

    return (
        <>
            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--blue"><Users size={22} /></div>
                    <div>
                        <span className="stat-card__value">{stats.customers}</span>
                        <span className="stat-card__label">Total Customers</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--purple"><Receipt size={22} /></div>
                    <div>
                        <span className="stat-card__value">{stats.invoices}</span>
                        <span className="stat-card__label">Total Invoices</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--green"><TrendingUp size={22} /></div>
                    <div>
                        <span className="stat-card__value">{fmt(stats.revenue)}</span>
                        <span className="stat-card__label">Total Revenue</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--orange"><Clock size={22} /></div>
                    <div>
                        <span className="stat-card__value">{fmt(stats.pending)}</span>
                        <span className="stat-card__label">Pending Payments</span>
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

            {/* Charts Row 2 */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card__title">Top Customers</div>
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
                                    <span className="chart-bar__count">{qty}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick stats row */}
            <div className="charts-grid">
                <div className="stat-card" style={{ gap: 12 }}>
                    <div className="stat-card__icon stat-card__icon--blue"><FileText size={22} /></div>
                    <div>
                        <span className="stat-card__value">{stats.quotations}</span>
                        <span className="stat-card__label">Total Quotations</span>
                    </div>
                </div>
                <div className="stat-card" style={{ gap: 12 }}>
                    <div className="stat-card__icon stat-card__icon--teal"><Package size={22} /></div>
                    <div>
                        <span className="stat-card__value">{stats.products}</span>
                        <span className="stat-card__label">Active Products</span>
                    </div>
                </div>
            </div>
        </>
    );
}
