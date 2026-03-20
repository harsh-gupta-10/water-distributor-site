import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Receipt, TrendingUp, Clock, FileText, Package, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

function isPendingQuotation(quotation) {
    return !quotation?.converted_to_invoice && (quotation?.status || 'new') !== 'completed';
}

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
        pendingQuotationsThisMonth: 0,
        quotationsThisMonth: 0,
        resolvedQuotationsThisMonth: 0,
        completionRateThisMonth: 0,
    });
    const [topCustomers, setTopCustomers] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [monthlyRevenue, setMonthlyRevenue] = useState([]);
    const [monthlyQuotations, setMonthlyQuotations] = useState([]);
    const [recentInvoices, setRecentInvoices] = useState([]);
    const [outstandingCustomers, setOutstandingCustomers] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState({ pending: 0, partial: 0, paid: 0 });
    const [trends, setTrends] = useState({ revenueGrowth: 0, customerGrowth: 0 });
    const [loading, setLoading] = useState(true);

    async function fetchAll() {
        setLoading(true);
        const [custRes, invRes, quotRes, prodRes, invItemsRes] = await Promise.all([
            supabase.from('customers').select('id, name, created_at', { count: 'exact' }),
            supabase.from('invoices').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('quotations').select('*').order('created_at', { ascending: false }).limit(100),
            supabase.from('products').select('id', { count: 'exact', head: true }),
            supabase.from('invoice_items').select('quantity, price, invoice_id, product_id, description'),
        ]);

        const customers = custRes.data || [];
        const invoices = invRes.data || [];
        const quotations = quotRes.data || [];
        const totalRevenue = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.total_amount || 0), 0);
        const totalPaid = invoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount_paid || 0), 0);
        const pendingPayments = totalRevenue - totalPaid;
        const avgOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;
        const conversionRate = quotations.length > 0 ? (invoices.length / quotations.length) * 100 : 0;

        let payPending = 0;
        let payPartial = 0;
        let payPaid = 0;
        invoices.forEach((invoice) => {
            const paidAmount = parseFloat(invoice.amount_paid || 0);
            const totalAmount = parseFloat(invoice.total_amount || 0);
            if (paidAmount === 0) payPending += 1;
            else if (paidAmount < totalAmount) payPartial += 1;
            else payPaid += 1;
        });

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        let thisMonthRev = 0;
        let lastMonthRev = 0;
        invoices.forEach((invoice) => {
            const invoiceDate = new Date(invoice.created_at);
            if (invoiceDate >= thisMonthStart) thisMonthRev += parseFloat(invoice.total_amount || 0);
            else if (invoiceDate >= lastMonthStart && invoiceDate <= lastMonthEnd) lastMonthRev += parseFloat(invoice.total_amount || 0);
        });
        const revenueGrowth = lastMonthRev > 0 ? ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100 : 0;

        const thisMonthCustomers = customers.filter((customer) => new Date(customer.created_at) >= thisMonthStart).length;
        const lastMonthCustomers = customers.filter((customer) => {
            const createdAt = new Date(customer.created_at);
            return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
        }).length;
        const customerGrowth = lastMonthCustomers > 0 ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0;

        const quotationsThisMonth = quotations.filter((quotation) => new Date(quotation.created_at) >= thisMonthStart);
        const pendingQuotationsOverall = quotations.filter(isPendingQuotation).length;
        const pendingQuotationsThisMonth = quotationsThisMonth.filter(isPendingQuotation).length;
        const resolvedQuotationsThisMonth = quotationsThisMonth.length - pendingQuotationsThisMonth;
        const completionRateThisMonth = quotationsThisMonth.length > 0
            ? Math.round((resolvedQuotationsThisMonth / quotationsThisMonth.length) * 100)
            : 0;

        const customerOutstanding = {};
        invoices.forEach((invoice) => {
            const outstanding = parseFloat(invoice.total_amount || 0) - parseFloat(invoice.amount_paid || 0);
            if (outstanding > 0 && invoice.customer_id) {
                customerOutstanding[invoice.customer_id] = (customerOutstanding[invoice.customer_id] || 0) + outstanding;
            }
        });

        const topOutstanding = Object.entries(customerOutstanding)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        if (topOutstanding.length > 0) {
            const { data: outstandingCustomerRows } = await supabase
                .from('customers')
                .select('id, name')
                .in('id', topOutstanding.map(([id]) => id));
            const customerMap = {};
            (outstandingCustomerRows || []).forEach((customer) => {
                customerMap[customer.id] = customer.name;
            });
            setOutstandingCustomers(topOutstanding.map(([id, amount]) => ({ name: customerMap[id] || 'Unknown', outstanding: amount })));
        } else {
            setOutstandingCustomers([]);
        }

        setStats({
            customers: custRes.count || customers.length,
            invoices: invoices.length,
            revenue: totalPaid,
            pending: pendingPayments,
            quotations: quotations.length,
            products: prodRes.count || 0,
            avgOrderValue,
            conversionRate: Math.round(conversionRate),
            pendingQuotations: pendingQuotationsOverall,
            pendingQuotationsThisMonth,
            quotationsThisMonth: quotationsThisMonth.length,
            resolvedQuotationsThisMonth,
            completionRateThisMonth,
        });

        setPaymentStatus({ pending: payPending, partial: payPartial, paid: payPaid });
        setTrends({ revenueGrowth, customerGrowth });

        const monthlyRevenueMap = {};
        invoices.forEach((invoice) => {
            const date = new Date(invoice.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + parseFloat(invoice.total_amount || 0);
        });
        setMonthlyRevenue(Object.entries(monthlyRevenueMap).sort((a, b) => a[0].localeCompare(b[0])).slice(-6));

        const monthlyQuotationMap = {};
        quotations.forEach((quotation) => {
            const date = new Date(quotation.created_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyQuotationMap[key] = (monthlyQuotationMap[key] || 0) + 1;
        });
        setMonthlyQuotations(Object.entries(monthlyQuotationMap).sort((a, b) => a[0].localeCompare(b[0])).slice(-6));

        const customerRevenue = {};
        invoices.forEach((invoice) => {
            if (invoice.customer_id) {
                customerRevenue[invoice.customer_id] = (customerRevenue[invoice.customer_id] || 0) + parseFloat(invoice.total_amount || 0);
            }
        });
        const topCustomerIds = Object.entries(customerRevenue)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        if (topCustomerIds.length > 0) {
            const { data: topCustomerRows } = await supabase
                .from('customers')
                .select('id, name')
                .in('id', topCustomerIds.map(([id]) => id));
            const customerMap = {};
            (topCustomerRows || []).forEach((customer) => {
                customerMap[customer.id] = customer.name;
            });
            setTopCustomers(topCustomerIds.map(([id, revenueValue]) => ({ name: customerMap[id] || 'Unknown', revenue: revenueValue })));
        } else {
            setTopCustomers([]);
        }

        const productCount = {};
        (invItemsRes.data || []).forEach((item) => {
            const label = item.description || item.product_id || 'Unknown';
            productCount[label] = (productCount[label] || 0) + (item.quantity || 1);
        });
        setTopProducts(Object.entries(productCount).sort((a, b) => b[1] - a[1]).slice(0, 5));
        setRecentInvoices(invoices.slice(0, 5));
        setLoading(false);
    }

    useEffect(() => {
        fetchAll();
        const handleFocus = () => fetchAll();
        const handleQuotationStatusChange = () => fetchAll();
        window.addEventListener('focus', handleFocus);
        window.addEventListener('quotation-status-changed', handleQuotationStatusChange);
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('quotation-status-changed', handleQuotationStatusChange);
        };
    }, []);

    function fmt(value) {
        return `₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
    }

    function fmtMonth(key) {
        const [year, month] = key.split('-');
        return new Date(year, parseInt(month, 10) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    }

    function fmtDate(dateStr) {
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading dashboard...</div>;
    }

    const maxRevMonth = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map((item) => item[1])) : 1;
    const maxQuotMonth = monthlyQuotations.length > 0 ? Math.max(...monthlyQuotations.map((item) => item[1])) : 1;
    const maxCustRev = topCustomers.length > 0 ? Math.max(...topCustomers.map((customer) => customer.revenue)) : 1;
    const maxProdQty = topProducts.length > 0 ? Math.max(...topProducts.map((product) => product[1])) : 1;
    const maxOutstanding = outstandingCustomers.length > 0 ? Math.max(...outstandingCustomers.map((customer) => customer.outstanding)) : 1;

    return (
        <>
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
                        <span className="stat-card__value">{stats.pendingQuotationsThisMonth}/{stats.quotationsThisMonth}</span>
                        <span className="stat-card__label">Pending Quotations</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                            pending/total this month • {stats.pendingQuotations} pending overall • {stats.quotations} total quotations
                        </span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__icon stat-card__icon--green"><CheckCircle size={22} /></div>
                    <div>
                        <span className="stat-card__value">{stats.resolvedQuotationsThisMonth}</span>
                        <span className="stat-card__label">Completed Quotations</span>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
                            {stats.completionRateThisMonth}% completed this month
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

            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card__title">Monthly Revenue</div>
                    {monthlyRevenue.length === 0 ? <p className="empty-state__text">No data yet</p> : (
                        <div className="chart-bars">
                            {monthlyRevenue.map(([month, value]) => (
                                <div key={month} className="chart-bar">
                                    <span className="chart-bar__label">{fmtMonth(month)}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill" style={{ width: `${(value / maxRevMonth) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{fmt(value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="chart-card">
                    <div className="chart-card__title">Monthly Quotations</div>
                    {monthlyQuotations.length === 0 ? <p className="empty-state__text">No data yet</p> : (
                        <div className="chart-bars">
                            {monthlyQuotations.map(([month, value]) => (
                                <div key={month} className="chart-bar">
                                    <span className="chart-bar__label">{fmtMonth(month)}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill chart-bar__fill--green" style={{ width: `${(value / maxQuotMonth) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card__title">Top Customers (by Revenue)</div>
                    {topCustomers.length === 0 ? <p className="empty-state__text">No data yet</p> : (
                        <div className="chart-bars">
                            {topCustomers.map((customer) => (
                                <div key={customer.name} className="chart-bar">
                                    <span className="chart-bar__label">{customer.name}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill chart-bar__fill--purple" style={{ width: `${(customer.revenue / maxCustRev) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{fmt(customer.revenue)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="chart-card">
                    <div className="chart-card__title">Top Products Sold</div>
                    {topProducts.length === 0 ? <p className="empty-state__text">No data yet</p> : (
                        <div className="chart-bars">
                            {topProducts.map(([name, quantity]) => (
                                <div key={name} className="chart-bar">
                                    <span className="chart-bar__label">{name}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill chart-bar__fill--orange" style={{ width: `${(quantity / maxProdQty) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{quantity} units</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card__title">Outstanding Receivables</div>
                    {outstandingCustomers.length === 0 ? <p className="empty-state__text">All paid up!</p> : (
                        <div className="chart-bars">
                            {outstandingCustomers.map((customer) => (
                                <div key={customer.name} className="chart-bar">
                                    <span className="chart-bar__label">{customer.name}</span>
                                    <div className="chart-bar__track">
                                        <div className="chart-bar__fill" style={{ background: '#ef4444', width: `${(customer.outstanding / maxOutstanding) * 100}%` }} />
                                    </div>
                                    <span className="chart-bar__count">{fmt(customer.outstanding)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="chart-card">
                    <div className="chart-card__title">Recent Invoices</div>
                    {recentInvoices.length === 0 ? <p className="empty-state__text">No invoices yet</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {recentInvoices.map((invoice) => (
                                <div key={invoice.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '8px', background: '#f9fafb', borderRadius: 6 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1f2937' }}>{invoice.customer_id?.substring(0, 20) || 'Unknown'}</div>
                                        <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{fmtDate(invoice.created_at)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600 }}>{fmt(invoice.total_amount || 0)}</div>
                                        <div style={{ color: parseFloat(invoice.amount_paid || 0) === parseFloat(invoice.total_amount || 0) ? '#10b981' : '#ef4444', fontSize: '0.75rem' }}>
                                            {parseFloat(invoice.amount_paid || 0) === parseFloat(invoice.total_amount || 0) ? '✓ Paid' : 'Pending'}
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
