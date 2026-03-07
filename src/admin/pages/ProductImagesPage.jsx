import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Edit2, ImageOff } from 'lucide-react';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';

export default function ProductImagesPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [imageFilter, setImageFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [editing, setEditing] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ image_path: '' });
    const perPage = 24;
    const toast = useToast();

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setProducts(data || []);
        setLoading(false);
    }

    function openEdit(product) {
        setEditing(product);
        setForm({ image_path: product.image_path || '' });
        setModalOpen(true);
    }

    async function saveImage() {
        if (!editing) return;

        const { error } = await supabase
            .from('products')
            .update({ image_path: form.image_path })
            .eq('id', editing.id);

        if (error) {
            toast(error.message, 'error');
            return;
        }

        toast('Product image updated');
        setModalOpen(false);
        fetchProducts();
    }

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    const filtered = products.filter(p => {
        const matchSearch = !search ||
            (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.sku || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
        const hasImage = Boolean(p.image_path && p.image_path.trim() !== '');
        const matchImage = imageFilter === 'all' ||
            (imageFilter === 'with-image' && hasImage) ||
            (imageFilter === 'no-image' && !hasImage);
        return matchSearch && matchCat && matchImage;
    });

    const withImages = products.filter(p => p.image_path && p.image_path.trim() !== '').length;
    const withoutImages = products.length - withImages;

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const fmt = n => `INR ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;
    }

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Product Images</h1>
                    <p>{products.length} products | {withImages} with images | {withoutImages} without images</p>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-bar__search">
                    <Search size={16} className="filter-bar__search-icon" />
                    <input
                        placeholder="Search name, SKU..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={e => {
                        setCategoryFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                    value={imageFilter}
                    onChange={e => {
                        setImageFilter(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="all">All Products</option>
                    <option value="with-image">With Images</option>
                    <option value="no-image">No Images</option>
                </select>
            </div>

            <div className="card">
                <div className="card__body">
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: 20,
                        }}
                    >
                        {paginated.length === 0 ? (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                                No products found
                            </div>
                        ) : paginated.map(p => {
                            const hasImage = Boolean(p.image_path && p.image_path.trim() !== '');
                            return (
                                <div
                                    key={p.id}
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        background: 'white',
                                    }}
                                    onClick={() => openEdit(p)}
                                >
                                    <div
                                        style={{
                                            aspectRatio: '1',
                                            background: hasImage ? '#f9fafb' : '#f3f4f6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                        }}
                                    >
                                        {hasImage ? (
                                            <img
                                                src={p.image_path}
                                                alt={p.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={e => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div style={{ color: '#d1d5db', textAlign: 'center' }}>
                                                <ImageOff size={48} strokeWidth={1.5} />
                                                <div style={{ fontSize: '0.7rem', marginTop: 8 }}>No Image</div>
                                            </div>
                                        )}
                                        <button
                                            className="data-table__action-btn"
                                            style={{ position: 'absolute', top: 8, right: 8 }}
                                            onClick={e => {
                                                e.stopPropagation();
                                                openEdit(p);
                                            }}
                                            title="Edit Image"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                    <div style={{ padding: 12 }}>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                marginBottom: 4,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {p.name}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4 }}>
                                            {p.category || 'Uncategorized'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 500 }}>
                                            {fmt(p.price)}
                                        </div>
                                        {p.sku && (
                                            <div
                                                style={{
                                                    fontSize: '0.7rem',
                                                    color: '#9ca3af',
                                                    fontFamily: 'monospace',
                                                    marginTop: 4,
                                                }}
                                            >
                                                SKU: {p.sku}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination" style={{ marginTop: 24 }}>
                            <span className="pagination__info">
                                Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
                            </span>
                            <div className="pagination__btns">
                                <button className="pagination__btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
                                    Prev
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const pageNum = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                                    if (pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`pagination__btn ${pageNum === page ? 'pagination__btn--active' : ''}`}
                                            onClick={() => setPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button className="pagination__btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Edit Product Image"
                footer={
                    <>
                        <button className="btn-admin btn-admin--secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn-admin btn-admin--primary" onClick={saveImage}>
                            Update
                        </button>
                    </>
                }
            >
                {editing && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>{editing.name}</strong>
                            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                {editing.category} | {editing.sku || 'No SKU'}
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Image URL</label>
                            <input
                                value={form.image_path}
                                onChange={e => setForm({ image_path: e.target.value })}
                                placeholder="/imgs/products/product.webp or https://..."
                            />
                        </div>

                        {form.image_path && (
                            <div style={{ marginTop: 16 }}>
                                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.85rem', fontWeight: 500 }}>
                                    Preview
                                </label>
                                <div
                                    style={{
                                        border: '1px solid #e5e7eb',
                                        borderRadius: 8,
                                        padding: 16,
                                        background: '#f9fafb',
                                        textAlign: 'center',
                                    }}
                                >
                                    <img
                                        src={form.image_path}
                                        alt="Preview"
                                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 6 }}
                                        onError={e => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}
