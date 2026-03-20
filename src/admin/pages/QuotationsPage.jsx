import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { RefreshCw, Search, FileText, ShoppingCart } from 'lucide-react';
import ExportButtons from '../components/ExportButtons';

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const perPage = 15;
    const navigate = useNavigate();

    useEffect(() => { fetchQuotations(); }, []);

    async function fetchQuotations() {
        setLoading(true);
        const { data } = await supabase.from('quotations').select('*').order('created_at', { ascending: false });
        setQuotations(data || []);
        setLoading(false);
    }

    async function updateStatus(id, newStatus) {
        const { error } = await supabase.from('quotations').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
            window.dispatchEvent(new Event('quotation-status-changed'));
        }
    }

    async function moveToOrder(q) {
        if (!q.phone) { alert('This quotation has no phone number'); return; }
        try {
            // 1. Find or create customer by unique phone number
            let customerId = q.customer_id;
            if (!customerId) {
                // Check if customer already exists with this phone
                const { data: existing } = await supabase
                    .from('customers').select('id').eq('phone', q.phone).maybeSingle();

                if (existing) {
                    customerId = existing.id;
                } else {
                    // Create new customer from quotation data
                    const { data: newCust, error: insertErr } = await supabase
                        .from('customers').insert({
                            name: q.full_name || 'Unknown',
                            business_name: q.business_name || null,
                            email: q.email || null,
                            phone: q.phone,
                            location: q.location || null,
                        }).select('id').single();
                    if (insertErr) throw insertErr;
                    customerId = newCust.id;
                }
                // 2. Link quotation to this customer
                await supabase.from('quotations').update({ customer_id: customerId }).eq('id', q.id);
            }
            // 3. Navigate to create order with customer + products pre-filled
            navigate(`/admin/orders/new?quotation=${q.id}&customer=${customerId}&products=${encodeURIComponent((q.products || []).join(','))}`);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }

    const filtered = quotations.filter(q => {
        const matchStatus = statusFilter === 'all' || q.status === statusFilter;
        const matchSearch = !searchTerm ||
            (q.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.phone || '').includes(searchTerm) ||
            (q.business_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    function formatDate(d) {
        return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    const exportCols = [
        { label: 'Date', accessor: q => formatDate(q.created_at) },
        { label: 'Name', accessor: q => q.full_name },
        { label: 'Business', accessor: q => q.business_name || '' },
        { label: 'Phone', accessor: q => q.phone },
        { label: 'Email', accessor: q => q.email || '' },
        { label: 'Products', accessor: q => (q.products || []).join(', ') },
        { label: 'Location', accessor: q => q.location },
        { label: 'Source', accessor: q => q.source },
        { label: 'Status', accessor: q => q.status },
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Quotations</h1>
                    <p>{quotations.length} total submissions</p>
                </div>
                <div className="page-header__actions">
                    <ExportButtons data={filtered} filename="quotations" columns={exportCols} />
                    <button className="btn-admin btn-admin--secondary" onClick={fetchQuotations}>
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="filter-bar">
                <div className="filter-bar__search">
                    <Search size={16} className="filter-bar__search-icon" />
                    <input placeholder="Search name, phone, business..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />
                </div>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Status</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div className="card">
                <div className="card__body--flush">
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Name</th>
                                    <th>Business</th>
                                    <th>Phone</th>
                                    <th>Products</th>
                                    <th>Location</th>
                                    <th>Source</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.length === 0 ? (
                                    <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No quotations found</td></tr>
                                ) : paginated.map(q => (
                                    <tr key={q.id}>
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem' }}>{formatDate(q.created_at)}</td>
                                        <td>
                                            <strong>{q.full_name}</strong>
                                            {q.email && <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{q.email}</div>}
                                        </td>
                                        <td>{q.business_name || '—'}</td>
                                        <td><a href={`tel:${q.phone}`} style={{ color: '#3b82f6' }}>{q.phone}</a></td>
                                        <td>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                {(q.products || []).map(p => (
                                                    <span key={p} className="badge badge--active" style={{ fontSize: '0.68rem' }}>{p}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>{q.location}</td>
                                        <td><span className="badge badge--contacted">{q.source}</span></td>
                                        <td>
                                            <select
                                                className="form-field"
                                                value={q.status}
                                                onChange={e => updateStatus(q.id, e.target.value)}
                                                style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: '0.8rem' }}
                                            >
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-admin btn-admin--primary btn-admin--sm"
                                                title="Move to Order"
                                                onClick={() => moveToOrder(q)}
                                                style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', padding: '4px 8px' }}
                                            >
                                                <ShoppingCart size={13} /> Order
                                            </button>
                                        </td>
                                    </tr>
                                ))}
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
        </>
    );
}
