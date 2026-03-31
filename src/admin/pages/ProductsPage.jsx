import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Edit2, GripVertical, Upload } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import * as XLSX from 'xlsx';
import Modal from '../components/Modal';
import ExportButtons from '../components/ExportButtons';
import { useToast } from '../components/Toast';

const PRODUCT_IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET || 'media';
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

function createEmptyProductForm() {
    return { name: '', image_path: '', category: '', sku: '', price: '', stock: '', description: '', status: 'active' };
}

function sanitizeBaseName(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\.webp$/i, '')
        .replace(/[^a-z0-9-_.]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function ensureWebp(file) {
    if (!file) return false;
    const lowerName = file.name.toLowerCase();
    return file.type === 'image/webp' && lowerName.endsWith('.webp');
}

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [importing, setImporting] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadName, setUploadName] = useState('');
    const [form, setForm] = useState(createEmptyProductForm());
    const perPage = 15;
    const toast = useToast();
    const fileInputRef = useRef(null);
    const uploadFileInputRef = useRef(null);

    useEffect(() => { fetchProducts(); }, []);

    async function fetchProducts() {
        setLoading(true);
        const { data } = await supabase.from('products').select('*').order('position', { ascending: true }).order('created_at', { ascending: false });
        setProducts(data || []);
        setLoading(false);
    }

    function openAdd() {
        setEditing(null);
        setForm(createEmptyProductForm());
        setModalOpen(true);
    }

    function openEdit(p) {
        setEditing(p);
        setForm({
            name: p.name, image_path: p.image_path || '', category: p.category || '', sku: p.sku || '',
            price: p.price || '', stock: p.stock ?? '', description: p.description || '', status: p.status || 'active',
        });
        setModalOpen(true);
    }

    function openUploadModal() {
        setUploadModalOpen(true);
    }

    function closeUploadModal() {
        setUploadModalOpen(false);
        setUploadFile(null);
        setUploadName('');
        if (uploadFileInputRef.current) {
            uploadFileInputRef.current.value = '';
        }
    }

    async function uploadProductImage() {
        if (!uploadFile) {
            toast('Choose a .webp image to upload', 'error');
            return;
        }

        if (!ensureWebp(uploadFile)) {
            toast('Only .webp images are allowed', 'error');
            return;
        }

        if (uploadFile.size > MAX_UPLOAD_BYTES) {
            toast('Image too large. Maximum allowed size is 50MB.', 'error');
            return;
        }

        const fallbackName = form.name || editing?.name || uploadFile.name;
        const baseName = sanitizeBaseName(uploadName || fallbackName) || `product-${Date.now()}`;
        const targetPath = `products/${baseName}.webp`;

        setUploadingImage(true);
        try {
            const { error } = await supabase.storage
                .from(PRODUCT_IMAGE_BUCKET)
                .upload(targetPath, uploadFile, {
                    cacheControl: '31536000',
                    upsert: true,
                    contentType: 'image/webp',
                });

            if (error) throw error;

            const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(targetPath);
            const publicUrl = data?.publicUrl || '';

            if (publicUrl) {
                setForm(prev => ({ ...prev, image_path: publicUrl }));
            }

            toast('Product image uploaded and added to the form', 'success');
            closeUploadModal();
        } catch (error) {
            toast(error.message || 'Image upload failed', 'error');
        } finally {
            setUploadingImage(false);
        }
    }

    async function saveProduct() {
        if (!form.name) { toast('Product name is required', 'error'); return; }
        const payload = { ...form, price: parseFloat(form.price) || 0, stock: form.stock === '' ? null : parseInt(form.stock) };
        if (editing) {
            const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
            if (error) { toast(error.message, 'error'); return; }
            toast('Product updated');
        } else {
            const { error } = await supabase.from('products').insert(payload);
            if (error) { toast(error.message, 'error'); return; }
            toast('Product added');
        }
        setModalOpen(false);
        fetchProducts();
    }

      // async function deleteProduct() {
  //         if (!deleteId) return;
  //         const { error } = await supabase.from('products').delete().eq('id', deleteId);
  //         if (error) { toast(error.message, 'error'); } else { toast('Product deleted'); }
  //         setDeleteId(null);
  //         fetchProducts();
  //     }

    function parseNumber(value, fallback = 0) {
        if (value === null || value === undefined || value === '') return fallback;
        const parsed = Number(String(value).replace(/,/g, ''));
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function parseIntegerOrNull(value) {
        if (value === null || value === undefined || value === '') return null;
        const parsed = parseInt(String(value), 10);
        return Number.isFinite(parsed) ? parsed : null;
    }

    function findValue(row, keys) {
        const entries = Object.entries(row || {});
        const normalized = entries.map(([k, v]) => [String(k).trim().toLowerCase(), v]);
        for (const key of keys) {
            const hit = normalized.find(([k]) => k === key.toLowerCase());
            if (hit) return hit[1];
        }
        return undefined;
    }

    function normalizeProductRow(row) {
        const name = findValue(row, ['name', 'product', 'product name']);
        if (!name || String(name).trim() === '') return null;

        return {
            name: String(name).trim(),
            category: String(findValue(row, ['category']) || '').trim(),
            sku: String(findValue(row, ['sku']) || '').trim(),
            price: parseNumber(findValue(row, ['price', 'mrp', 'rate']), 0),
            stock: parseIntegerOrNull(findValue(row, ['stock', 'quantity', 'qty'])),
            status: String(findValue(row, ['status']) || 'active').trim().toLowerCase() === 'inactive' ? 'inactive' : 'active',
            image_path: String(findValue(row, ['image path', 'image_path', 'image', 'image url']) || '').trim(),
            description: String(findValue(row, ['description', 'desc']) || '').trim(),
        };
    }

    async function parseImportFile(file) {
        const lower = file.name.toLowerCase();

        if (lower.endsWith('.json')) {
            const text = await file.text();
            const parsed = JSON.parse(text);
            const rows = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.data) ? parsed.data : []);
            if (!Array.isArray(rows)) throw new Error('Invalid JSON format. Expected an array of products.');
            return rows;
        }

        if (lower.endsWith('.csv')) {
            const buffer = await file.arrayBuffer();
            const wb = XLSX.read(buffer, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            return XLSX.utils.sheet_to_json(ws, { defval: '' });
        }

        throw new Error('Unsupported file type. Please use JSON or CSV.');
    }

    async function handleImportFileChange(event) {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        try {
            setImporting(true);
            const rows = await parseImportFile(file);
            if (!rows.length) {
                toast('Selected file has no rows to import', 'error');
                return;
            }

            const normalized = rows.map(normalizeProductRow).filter(Boolean);
            const skipped = rows.length - normalized.length;

            if (!normalized.length) {
                toast('No valid products found. Ensure each row has a product name.', 'error');
                return;
            }

            const { error: deleteError } = await supabase
                .from('products')
                .delete()
                .not('id', 'is', null);
            if (deleteError) throw deleteError;

            const withPosition = normalized.map((item, idx) => ({
                ...item,
                position: idx,
            }));

            const chunkSize = 200;
            for (let i = 0; i < withPosition.length; i += chunkSize) {
                const chunk = withPosition.slice(i, i + chunkSize);
                const { error } = await supabase.from('products').insert(chunk);
                if (error) throw error;
            }

            if (skipped > 0) {
                toast(`Replaced product list with ${withPosition.length} imported rows. Skipped ${skipped} invalid rows.`, 'info');
            } else {
                toast(`Replaced product list with ${withPosition.length} imported rows`);
            }

            fetchProducts();
        } catch (error) {
            toast(error.message || 'Import failed', 'error');
        } finally {
            setImporting(false);
        }
    }

    async function handleDragEnd(result) {
        if (!result.destination) return;

        if (search || statusFilter !== 'all') {
            toast('Please clear search and status filters to reorder products. Category filter is allowed.', 'info');
            return;
        }

        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        if (sourceIndex === destinationIndex) return;

        const newFiltered = Array.from(filtered);
        const [movedItem] = newFiltered.splice(sourceIndex, 1);
        newFiltered.splice(destinationIndex, 0, movedItem);

        const indicesInProducts = filtered.map(fItem => products.findIndex(p => p.id === fItem.id));

        const newProducts = [...products];
        indicesInProducts.forEach((globalIndex, i) => {
            newProducts[globalIndex] = newFiltered[i];
        });

        const updates = [];
        newProducts.forEach((p, idx) => {
            if (p.position !== idx) {
                p.position = idx;
                updates.push({ id: p.id, position: idx });
            }
        });

        setProducts(newProducts);

        try {
            await Promise.all(updates.map(update =>
                supabase.from('products').update({ position: update.position }).eq('id', update.id)
            ));
            toast('Product order updated');
        } catch {
            toast('Failed to update order', 'error');
            fetchProducts();
        }
    }

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    const filtered = products.filter(p => {
        const matchSearch = !search || (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchSearch && matchCat && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);
    const fmt = n => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const exportCols = [
        { label: 'Name', accessor: p => p.name },
        { label: 'Category', accessor: p => p.category || '' },
        { label: 'SKU', accessor: p => p.sku || '' },
        { label: 'Price', accessor: p => p.price },
        { label: 'Stock', accessor: p => p.stock },
        { label: 'Status', accessor: p => p.status },
        { label: 'Image Path', accessor: p => p.image_path || '' },
        { label: 'Description', accessor: p => p.description || '' },
    ];

    if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading...</div>;

    return (
        <>
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Products</h1>
                    <p>{products.length} total products</p>
                </div>
                <div className="page-header__actions">
                    <ExportButtons data={filtered} filename="products" columns={exportCols} includeJson />
                    <button className="btn-admin btn-admin--secondary" onClick={() => fileInputRef.current?.click()} disabled={importing}>
                        <Upload size={16} /> {importing ? 'Importing...' : 'Import'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,.csv,application/json,text/csv"
                        style={{ display: 'none' }}
                        onChange={handleImportFileChange}
                    />
                    <button className="btn-admin btn-admin--secondary" onClick={openUploadModal}>
                        <Upload size={16} /> Upload to Supabase
                    </button>
                    <button className="btn-admin btn-admin--primary" onClick={openAdd}>
                        <Plus size={16} /> Add Product
                    </button>
                </div>
            </div>

            <div className="filter-bar">
                <div className="filter-bar__search">
                    <Search size={16} className="filter-bar__search-icon" />
                    <input placeholder="Search name, SKU..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div className="card">
                <div className="card__body--flush">
                    <div className="data-table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}></th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>SKU</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="products-list" direction="vertical">
                                    {(provided) => (
                                        <tbody {...provided.droppableProps} ref={provided.innerRef}>
                                            {paginated.length === 0 ? (
                                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>No products found</td></tr>
                                            ) : paginated.map((p, index) => (
                                                <Draggable key={p.id} draggableId={p.id} index={(page - 1) * perPage + index}>
                                                    {(provided, snapshot) => (
                                                        <tr
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                background: snapshot.isDragging ? '#f3f4f6' : 'white',
                                                                boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : 'none',
                                                                display: snapshot.isDragging ? 'table' : ''
                                                            }}
                                                        >
                                                            <td {...provided.dragHandleProps} style={{ cursor: 'grab', color: '#9ca3af' }}>
                                                                <GripVertical size={16} />
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                    {p.image_path && (
                                                                        <img src={p.image_path} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                                                                    )}
                                                                    <div>
                                                                        <strong>{p.name}</strong>
                                                                        {p.description && <div style={{ fontSize: '0.75rem', color: '#9ca3af', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{p.category || '—'}</td>
                                                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{p.sku || '—'}</td>
                                                            <td>{fmt(p.price)}</td>
                                                            <td>{p.stock !== null ? p.stock : '—'}</td>
                                                            <td><span className={`badge badge--${p.status}`}>{p.status}</span></td>
                                                            <td>
                                                                <div className="data-table__actions">
                                                                    <button className="data-table__action-btn" title="Edit" onClick={() => openEdit(p)}><Edit2 size={15} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </tbody>
                                    )}
                                </Droppable>
                            </DragDropContext>
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

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'} footer={
                <>
                    <button className="btn-admin btn-admin--secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                    <button className="btn-admin btn-admin--primary" onClick={saveProduct}>{editing ? 'Update' : 'Add'}</button>
                </>
            }>
                <div className="form-grid">
                    <div className="form-field"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" /></div>
                    <div className="form-field"><label>Category</label><input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Water, Softdrinks" /></div>
                    <div className="form-field"><label>SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU code" /></div>
                    <div className="form-field"><label>Price (₹)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" min="0" /></div>
                    <div className="form-field"><label>Stock</label><input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="Optional" min="0" /></div>
                    <div className="form-field">
                        <label>Status</label>
                        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="form-field form-field--full">
                        <label>Image Path</label>
                        <input value={form.image_path} onChange={e => setForm({ ...form, image_path: e.target.value })} placeholder="/imgs/product.webp" />
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            <button type="button" className="btn-admin btn-admin--secondary" onClick={openUploadModal}>
                                <Upload size={16} /> Upload to Supabase
                            </button>
                            <button type="button" className="btn-admin btn-admin--secondary" onClick={() => setForm(prev => ({ ...prev, image_path: '' }))} disabled={!form.image_path}>
                                Clear
                            </button>
                        </div>
                        <small style={{ color: '#6b7280', marginTop: 6, display: 'block' }}>
                            Uploads go to bucket: {PRODUCT_IMAGE_BUCKET} / folder: products
                        </small>
                    </div>
                    <div className="form-field form-field--full"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." /></div>
                </div>
            </Modal>

            <Modal
                isOpen={uploadModalOpen}
                onClose={closeUploadModal}
                title="Upload Product Image"
                footer={
                    <>
                        <button className="btn-admin btn-admin--secondary" onClick={closeUploadModal}>Cancel</button>
                        <button className="btn-admin btn-admin--primary" onClick={uploadProductImage} disabled={uploadingImage}>
                            <Upload size={16} /> {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'grid', gap: 16 }}>
                    <div className="form-field">
                        <label>Choose .webp file</label>
                        <input
                            ref={uploadFileInputRef}
                            type="file"
                            accept="image/webp,.webp"
                            onChange={e => setUploadFile(e.target.files?.[0] || null)}
                        />
                    </div>
                    <div className="form-field">
                        <label>File name (optional)</label>
                        <input
                            value={uploadName}
                            onChange={e => setUploadName(e.target.value)}
                            placeholder="product-name"
                        />
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                        The public URL will be inserted into the product form automatically after upload.
                    </div>
                </div>
            </Modal>
        </>
    );
}
