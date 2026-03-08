import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Receipt, TrendingUp, FileText, Package, Clock, MapPin, DollarSign, LineChart, Calendar, Star, Percent } from 'lucide-react';

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    async function fetchData() {
        setLoading(true);
        const [custRes, invRes, quotRes, prodRes, payRes, invItemsRes] = await Promise.all([
            supabase.from('customers').select('id, name, created_at, location'),
            supabase.from('invoices').select('*'),
            supabase.from('quotations').select('created_at, status, products, location'),
            supabase.from('products').select('id, name, status, price'),
            supabase.from('payments').select('amount, payment_method, payment_date'),
            supabase.from('invoice_items').select('quantity, price, invoice_id, product_id, description'),
        ]);

        const customers = custRes.data || [];
        const invoices = invRes.data || [];
        const quotations = quotRes.data || [];
        const products = prodRes.data || [];
        const payments = payRes.data || [];
        const invoiceItems = invItemsRes.data || [];

        const totalRevenue = invoices.reduce((s, i) => s + parseFloat(i.total_amount || 0), 0);
        const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

        // Profit margin calculation (assuming average cost is 65% of revenue)
        const estimatedCost = totalRevenue * 0.65;
        const estimatedProfit = totalRevenue - estimatedCost;
        const profitMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue * 100) : 0;

        // Status breakdown
        const quotStatus = { new: 0, contacted: 0, completed: 0 };
        quotations.forEach(q => { quotStatus[q.status] = (quotStatus[q.status] || 0) + 1; });

        const invStatus = { pending: 0, partially_paid: 0, paid: 0 };
        invoices.forEach(i => { invStatus[i.payment_status] = (invStatus[i.payment_status] || 0) + 1; });

        // Payment methods
        const methods = {};
        payments.forEach(p => { methods[p.payment_method] = (methods[p.payment_method] || 0) + parseFloat(p.amount || 0); });

        // Monthly revenue & profit
        const monthlyRev = {};
        const monthlyProfit = {};
        invoices.forEach(inv => {
            const d = new Date(inv.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const rev = parseFloat(inv.total_amount || 0);
            monthlyRev[key] = (monthlyRev[key] || 0) + rev;
            monthlyProfit[key] = (monthlyProfit[key] || 0) + (rev * 0.35); // 35% profit margin
        });
        const sortedMonthlyRev = Object.entries(monthlyRev).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
        const sortedMonthlyProfit = Object.entries(monthlyProfit).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);

        // Product demand from quotations
        const prodDemand = {};
        quotations.forEach(q => {
            (q.products || []).forEach(p => { prodDemand[p] = (prodDemand[p] || 0) + 1; });
        });
        const sortedProdDemand = Object.entries(prodDemand).sort((a, b) => b[1] - a[1]).slice(0, 8);

        // Demand forecasting (next 3 months based on trend)
        const forecast = calculateForecast(sortedMonthlyRev);

        // Area-wise sales (extract from customer locations and quotations)
        const areaSales = {};
        invoices.forEach(inv => {
            const cust = customers.find(c => c.id === inv.customer_id);
            if (cust && cust.location) {
                const area = extractArea(cust.location);
                areaSales[area] = (areaSales[area] || 0) + parseFloat(inv.total_amount || 0);
            }
        });
        quotations.forEach(q => {
            if (q.location) {
                const area = extractArea(q.location);
                areaSales[area] = (areaSales[area] || 0) + 1; // Count as potential sales
            }
        });
        const sortedAreaSales = Object.entries(areaSales).sort((a, b) => b[1] - a[1]).slice(0, 10);

        // Seasonal demand (group by month of year across all years)
        const seasonalDemand = {};
        quotations.forEach(q => {
            const month = new Date(q.created_at).getMonth();
            const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
            seasonalDemand[monthName] = (seasonalDemand[monthName] || 0) + 1;
        });
        const seasonalPattern = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            .map(m => [m, seasonalDemand[m] || 0]);

        // Customer Lifetime Value (CLV)
        const customerCLV = {};
        invoices.forEach(inv => {
            if (inv.customer_id) {
                customerCLV[inv.customer_id] = (customerCLV[inv.customer_id] || 0) + parseFloat(inv.total_amount || 0);
            }
        });
        const topCLV = Object.entries(customerCLV)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([custId, value]) => {
                const cust = customers.find(c => c.id === custId);
                return { name: cust?.name || 'Unknown', value };
            });

        // Average order value
        const avgOrderValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

        setData({
            customers: customers.length,
            invoices: invoices.length,
            quotations: quotations.length,
            products: products.filter(p => p.status === 'active').length,
            totalRevenue,
            totalPaid,
            pending: totalRevenue - totalPaid,
            estimatedProfit,
            profitMargin,
            avgOrderValue,
            quotStatus,
            invStatus,
            methods: Object.entries(methods).sort((a, b) => b[1] - a[1]),
            monthlyRev: sortedMonthlyRev,
            monthlyProfit: sortedMonthlyProfit,
            prodDemand: sortedProdDemand,
            forecast,
            areaSales: sortedAreaSales,
            seasonalPattern,
            topCLV,
        });
        setLoading(false);
    }

    function extractArea(location) {
        if (!location) return 'Unknown';
        const areas = ['BKC', 'Andheri', 'Thane', 'Navi Mumbai', 'Chembur', 'Kurla', 'Vashi', 'Sion', 'Mankhurd', 'Deonar', 'Govandi', 'Tilak Nagar', 'Panjarapole'];
        for (const area of areas) {
            if (location.toLowerCase().includes(area.toLowerCase())) {
                return area;
            }
        }
        // Extract first word as area
        return location.split(',')[0].trim() || 'Other';
    }

    function calculateForecast(monthlyData) {
        if (monthlyData.length < 3) return [];
        
        // Simple linear regression for forecasting
        const last6 = monthlyData.slice(-6);
        const values = last6.map(m => m[1]);
        const avgGrowth = values.length > 1 
            ? (values[values.length - 1] - values[0]) / values.length 
            : 0;
        
        const lastMonth = last6[last6.length - 1][0];
        const [year, month] = lastMonth.split('-').map(Number);
        
        const forecast = [];
        let lastValue = values[values.length - 1];
        
        for (let i = 1; i <= 3; i++) {
            let nextMonth = month + i;
            let nextYear = year;
            if (nextMonth > 12) {
                nextMonth = nextMonth - 12;
                nextYear++;
            }
            const key = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
            lastValue = Math.max(0, lastValue + avgGrowth);
            forecast.push([key, Math.round(lastValue)]);
        }
        
        return forecast;
    }

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading analytics...</div>;
    if (!data) return null;

    const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
    const fmtMonth = key => {
        const [y, m] = key.split('-');
        return new Date(y, parseInt(m) - 1).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    };

    const maxMonthRev = data.monthlyRev.length > 0 ? Math.max(...data.monthlyRev.map(m => m[1])) : 1;
    const maxMonthProfit = data.monthlyProfit.length > 0 ? Math.max(...data.monthlyProfit.map(m => m[1])) : 1;
    const maxProdDemand = data.prodDemand.length > 0 ? Math.max(...data.prodDemand.map(p => p[1])) : 1;
    const maxMethod = data.methods.length > 0 ? Math.max(...data.methods.map(m => m[1])) : 1;
    const maxAreaSales = data.areaSales.length > 0 ? Math.max(...data.areaSales.map(a => a[1])) : 1;
    const maxSeasonal = data.seasonalPattern.length > 0 ? Math.max(...data.seasonalPattern.map(s => s[1])) : 1;
    const maxCLV = data.topCLV.length > 0 ? Math.max(...data.topCLV.map(c => c.value)) : 1;

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Smart Analytics & Business Intelligence</h1>
                    <p>Advanced insights, forecasting, and performance metrics</p>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="stats-grid">
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--blue"><Users size={22} /></div><div><span className="stat-card__value">{data.customers}</span><span className="stat-card__label">Customers</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--green"><TrendingUp size={22} /></div><div><span className="stat-card__value">{fmt(data.totalRevenue)}</span><span className="stat-card__label">Total Revenue</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--purple"><DollarSign size={22} /></div><div><span className="stat-card__value">{fmt(data.estimatedProfit)}</span><span className="stat-card__label">Est. Profit</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--teal"><Percent size={22} /></div><div><span className="stat-card__value">{data.profitMargin.toFixed(1)}%</span><span className="stat-card__label">Profit Margin</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--orange"><Receipt size={22} /></div><div><span className="stat-card__value">{fmt(data.avgOrderValue)}</span><span className="stat-card__label">Avg Order Value</span></div></div>
                <div className="stat-card"><div className="stat-card__icon stat-card__icon--red"><Clock size={22} /></div><div><span className="stat-card__value">{fmt(data.pending)}</span><span className="stat-card__label">Pending</span></div></div>
            </div>

            {/* Profit Margin Analytics */}
            <div style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Percent size={18} style={{ color: '#16a34a' }} />
                            Profit Margin Analytics
                        </h3>
                    </div>
                    <div className="card__body">
                        <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="chart-card" style={{ border: 'none', boxShadow: 'none', padding: 0 }}>
                                <div className="chart-card__title">Monthly Profit (Last 6 months)</div>
                                {data.monthlyProfit.length === 0 ? <p className="empty-state__text">No data</p> : (
                                    <div className="chart-bars">
                                        {data.monthlyProfit.map(([m, v]) => (
                                            <div key={m} className="chart-bar">
                                                <span className="chart-bar__label">{fmtMonth(m)}</span>
                                                <div className="chart-bar__track"><div className="chart-bar__fill chart-bar__fill--green" style={{ width: `${(v / maxMonthProfit) * 100}%` }} /></div>
                                                <span className="chart-bar__count">{fmt(v)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600, marginBottom: 4 }}>ESTIMATED TOTAL PROFIT</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#16a34a' }}>{fmt(data.estimatedProfit)}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#4ade80', marginTop: 4 }}>Based on 35% average margin</div>
                                </div>
                                <div style={{ padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600, marginBottom: 4 }}>PROFIT MARGIN</div>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#2563eb' }}>{data.profitMargin.toFixed(1)}%</div>
                                    <div style={{ fontSize: '0.8rem', color: '#60a5fa', marginTop: 4 }}>Industry standard: 30-40%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue & Demand Forecasting */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <LineChart size={16} style={{ color: '#8b5cf6' }} />
                        Revenue Forecast (Next 3 months)
                    </div>
                    {data.forecast.length === 0 ? <p className="empty-state__text">Insufficient data for forecasting</p> : (
                        <div className="chart-bars">
                            {data.forecast.map(([m, v]) => (
                                <div key={m} className="chart-bar">
                                    <span className="chart-bar__label">{fmtMonth(m)}</span>
                                    <div className="chart-bar__track"><div className="chart-bar__fill chart-bar__fill--purple" style={{ width: `${(v / maxMonthRev) * 100}%` }} /></div>
                                    <span className="chart-bar__count">{fmt(v)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ marginTop: 12, padding: 10, background: '#faf5ff', borderRadius: 6, fontSize: '0.75rem', color: '#7c3aed' }}>
                        📈 Projection based on last 6 months trend analysis
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-card__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Package size={16} style={{ color: '#ea580c' }} />
                        Most Requested Products
                    </div>
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

            {/* Area-wise Sales Heatmap */}
            <div style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <MapPin size={18} style={{ color: '#dc2626' }} />
                            Area-wise Sales Heatmap
                        </h3>
                    </div>
                    <div className="card__body">
                        {data.areaSales.length === 0 ? <p className="empty-state__text">No location data available</p> : (
                            <div className="chart-bars">
                                {data.areaSales.map(([area, value]) => (
                                    <div key={area} className="chart-bar">
                                        <span className="chart-bar__label" style={{ width: 140 }}>{area}</span>
                                        <div className="chart-bar__track">
                                            <div 
                                                className="chart-bar__fill" 
                                                style={{ 
                                                    width: `${(value / maxAreaSales) * 100}%`,
                                                    background: `linear-gradient(90deg, #dc2626, #f87171)`
                                                }} 
                                            />
                                        </div>
                                        <span className="chart-bar__count">{typeof value === 'number' && value > 100 ? fmt(value) : value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ marginTop: 16, padding: 12, background: '#fef2f2', borderRadius: 6, fontSize: '0.8rem', color: '#991b1b' }}>
                            🗺️ Top performing areas based on invoice amounts and quotation requests
                        </div>
                    </div>
                </div>
            </div>

            {/* Seasonal Demand & Customer Lifetime Value */}
            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={16} style={{ color: '#0891b2' }} />
                        Seasonal Demand Prediction
                    </div>
                    {data.seasonalPattern.length === 0 ? <p className="empty-state__text">No data</p> : (
                        <div className="chart-bars">
                            {data.seasonalPattern.map(([month, count]) => (
                                <div key={month} className="chart-bar">
                                    <span className="chart-bar__label">{month}</span>
                                    <div className="chart-bar__track">
                                        <div 
                                            className="chart-bar__fill" 
                                            style={{ 
                                                width: `${(count / maxSeasonal) * 100}%`,
                                                background: `linear-gradient(90deg, #0891b2, #06b6d4)`
                                            }} 
                                        />
                                    </div>
                                    <span className="chart-bar__count">{count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ marginTop: 12, padding: 10, background: '#ecfeff', borderRadius: 6, fontSize: '0.75rem', color: '#0e7490' }}>
                        📅 Historical demand pattern across all months - helps predict peak seasons
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-card__title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Star size={16} style={{ color: '#d97706' }} />
                        Top Customers by Lifetime Value (CLV)
                    </div>
                    {data.topCLV.length === 0 ? <p className="empty-state__text">No data</p> : (
                        <div className="chart-bars">
                            {data.topCLV.map((cust, idx) => (
                                <div key={idx} className="chart-bar">
                                    <span className="chart-bar__label" style={{ width: 140 }}>{cust.name}</span>
                                    <div className="chart-bar__track">
                                        <div 
                                            className="chart-bar__fill" 
                                            style={{ 
                                                width: `${(cust.value / maxCLV) * 100}%`,
                                                background: `linear-gradient(90deg, #d97706, #f59e0b)`
                                            }} 
                                        />
                                    </div>
                                    <span className="chart-bar__count">{fmt(cust.value)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div style={{ marginTop: 12, padding: 10, background: '#fefce8', borderRadius: 6, fontSize: '0.75rem', color: '#a16207' }}>
                        ⭐ Total revenue generated per customer - focus on high-value relationships
                    </div>
                </div>
            </div>

            {/* Monthly Revenue Trend */}
            <div style={{ marginBottom: 24 }}>
                <div className="card">
                    <div className="card__header">
                        <h3 className="card__title" style={{ fontSize: '1.1rem' }}>Monthly Revenue Trend (Last 12 months)</h3>
                    </div>
                    <div className="card__body">
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
