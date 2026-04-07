import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Eye, Search, Upload, FileUp, Trash2, Copy, ArrowUpDown, Filter, CheckSquare, Square, MoreVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { saveBlogsToCache } from '../../lib/blogFallback';
import { parseFallbackBlogsImport } from '../../lib/blogFallbackImport';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const BLOG_IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_MEDIA_BUCKET || import.meta.env.VITE_SUPABASE_BLOG_BUCKET || 'media';
const MAX_BLOG_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;

function createEmptyForm() {
    return {
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        author: 'A3Distributor',
        category: 'business',
        tags: '',
        status: 'draft',
        published_at: new Date().toISOString().slice(0, 10),
        meta_description: '',
        meta_keywords: '',
    };
}

function normalizeFileName(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export default function BlogsPage() {
    const toast = useToast();
    const fallbackFileInputRef = useRef(null);
    const singleBlogFileInputRef = useRef(null);
    const featuredImageFileInputRef = useRef(null);
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(createEmptyForm);
    
    // New state for enhanced features
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [selectedBlogs, setSelectedBlogs] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [blogToDelete, setBlogToDelete] = useState(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    useEffect(() => {
        let filtered = blogs.filter(blog =>
            blog.title.toLowerCase().includes(search.toLowerCase()) ||
            blog.slug.toLowerCase().includes(search.toLowerCase())
        );
        
        // Apply status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(blog => blog.status === filterStatus);
        }
        
        // Apply category filter
        if (filterCategory !== 'all') {
            filtered = filtered.filter(blog => blog.category === filterCategory);
        }
        
        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (sortBy === 'title') {
                aVal = (aVal || '').toLowerCase();
                bVal = (bVal || '').toLowerCase();
            } else if (sortBy === 'created_at' || sortBy === 'published_at' || sortBy === 'updated_at') {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }
            
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            }
            return aVal < bVal ? 1 : -1;
        });
        
        setFilteredBlogs(filtered);
    }, [search, blogs, filterStatus, filterCategory, sortBy, sortOrder]);

    async function fetchBlogs() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blogs')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            const rows = data || [];
            setBlogs(rows);
            saveBlogsToCache(rows);
        } catch (error) {
            toast('Error loading blogs: ' + error.message, 'error');
        }
        setLoading(false);
    }

    async function saveBlog() {
        if (!form.title || !form.slug || !form.content) {
            toast('Title, slug, and content are required', 'error');
            return;
        }

        // Validate slug format
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
            toast('Slug must be lowercase letters, numbers, and hyphens only', 'error');
            return;
        }

        try {
            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('blogs')
                    .update({
                        ...form,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingId);
                
                if (error) throw error;
                toast('Blog updated successfully', 'success');
            } else {
                // Insert
                const { error } = await supabase
                    .from('blogs')
                    .insert([{
                        ...form,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }]);
                
                if (error) throw error;
                toast('Blog created successfully', 'success');
            }
            
            setShowModal(false);
            setEditingId(null);
            resetForm();
            fetchBlogs();
        } catch (error) {
            toast('Error saving blog: ' + error.message, 'error');
        }
    }

    // Delete single blog
    async function deleteBlog(blog) {
        setBlogToDelete(blog);
        setShowDeleteConfirm(true);
    }

    async function confirmDelete() {
        if (!blogToDelete) return;
        
        try {
            const { error } = await supabase
                .from('blogs')
                .delete()
                .eq('id', blogToDelete.id);
            
            if (error) throw error;
            toast('Blog deleted successfully', 'success');
            setShowDeleteConfirm(false);
            setBlogToDelete(null);
            fetchBlogs();
        } catch (error) {
            toast('Error deleting blog: ' + error.message, 'error');
        }
    }

    // Duplicate blog
    async function duplicateBlog(blog) {
        try {
            const newBlog = {
                title: `${blog.title} (Copy)`,
                slug: `${blog.slug}-copy-${Date.now()}`,
                excerpt: blog.excerpt,
                content: blog.content,
                featured_image: blog.featured_image,
                author: blog.author,
                category: blog.category,
                tags: blog.tags,
                status: 'draft',
                published_at: new Date().toISOString().slice(0, 10),
                meta_description: blog.meta_description,
                meta_keywords: blog.meta_keywords,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('blogs').insert([newBlog]);
            if (error) throw error;
            
            toast('Blog duplicated successfully', 'success');
            fetchBlogs();
        } catch (error) {
            toast('Error duplicating blog: ' + error.message, 'error');
        }
    }

    // Toggle blog selection
    function toggleBlogSelection(blogId) {
        setSelectedBlogs(prev => 
            prev.includes(blogId) 
                ? prev.filter(id => id !== blogId)
                : [...prev, blogId]
        );
    }

    // Select/deselect all
    function toggleSelectAll() {
        if (selectedBlogs.length === filteredBlogs.length) {
            setSelectedBlogs([]);
        } else {
            setSelectedBlogs(filteredBlogs.map(b => b.id));
        }
    }

    // Bulk delete
    async function bulkDelete() {
        if (selectedBlogs.length === 0) return;
        
        if (!window.confirm(`Are you sure you want to delete ${selectedBlogs.length} blog(s)?`)) {
            return;
        }

        try {
            const { error } = await supabase
                .from('blogs')
                .delete()
                .in('id', selectedBlogs);
            
            if (error) throw error;
            toast(`${selectedBlogs.length} blog(s) deleted successfully`, 'success');
            setSelectedBlogs([]);
            fetchBlogs();
        } catch (error) {
            toast('Error deleting blogs: ' + error.message, 'error');
        }
    }

    // Bulk update status
    async function bulkUpdateStatus(newStatus) {
        if (selectedBlogs.length === 0) return;

        try {
            const { error } = await supabase
                .from('blogs')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .in('id', selectedBlogs);
            
            if (error) throw error;
            toast(`${selectedBlogs.length} blog(s) updated to ${newStatus}`, 'success');
            setSelectedBlogs([]);
            fetchBlogs();
        } catch (error) {
            toast('Error updating blogs: ' + error.message, 'error');
        }
    }

    // Toggle sort
    function handleSort(field) {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    }

    // Get unique categories from blogs
    const categories = [...new Set(blogs.map(b => b.category).filter(Boolean))];

    function exportFallbackFile() {
        try {
            const safeBlogs = (blogs || []).map((blog) => ({
                id: blog.id,
                title: blog.title,
                slug: blog.slug,
                excerpt: blog.excerpt,
                content: blog.content,
                featured_image: blog.featured_image,
                author: blog.author,
                category: blog.category,
                tags: blog.tags,
                status: blog.status,
                published_at: blog.published_at,
                created_at: blog.created_at,
                updated_at: blog.updated_at,
                meta_description: blog.meta_description,
                meta_keywords: blog.meta_keywords,
            }));

            const moduleContent = `// Auto-exported blog fallback data\nconst blogsFallback = ${JSON.stringify(safeBlogs, null, 2)};\n\nexport default blogsFallback;\n`;
            const blob = new Blob([moduleContent], { type: 'text/javascript;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'blogsFallback.js';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast('Fallback file exported. Replace src/data/blogsFallback.js with this file.', 'success');
        } catch (error) {
            toast('Failed to export fallback file: ' + error.message, 'error');
        }
    }

    function handleImportFallbackFile() {
        fallbackFileInputRef.current?.click();
    }

    async function processFallbackFileImport(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const blogsData = parseFallbackBlogsImport(text);

            // Import all blogs to database
            let successCount = 0;
            let errorCount = 0;

            for (const blog of blogsData) {
                try {
                    // Remove id to let database generate new one
                    const { id: _id, ...blogWithoutId } = blog;
                    
                    // Check if blog with this slug already exists
                    const { data: existing } = await supabase
                        .from('blogs')
                        .select('id')
                        .eq('slug', blog.slug)
                        .single();

                    if (existing) {
                        // Update existing
                        const { error } = await supabase
                            .from('blogs')
                            .update({
                                ...blogWithoutId,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', existing.id);
                        
                        if (error) throw error;
                        successCount++;
                    } else {
                        // Insert new
                        const { error } = await supabase
                            .from('blogs')
                            .insert([{
                                ...blogWithoutId,
                                created_at: blog.created_at || new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            }]);
                        
                        if (error) throw error;
                        successCount++;
                    }
                } catch (err) {
                    console.error('Error importing blog:', blog.title, err);
                    errorCount++;
                }
            }

            await fetchBlogs();
            toast(`Import complete: ${successCount} blogs imported${errorCount > 0 ? `, ${errorCount} failed` : ''}`, 'success');
        } catch (error) {
            toast('Failed to import fallback file: ' + error.message, 'error');
        }

        // Reset file input
        event.target.value = '';
    }

    function handleImportSingleBlog() {
        singleBlogFileInputRef.current?.click();
    }

    function handleFeaturedImageUploadClick() {
        featuredImageFileInputRef.current?.click();
    }

    async function processFeaturedImageUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const lowerName = file.name.toLowerCase();
        const isWebp = file.type === 'image/webp' && lowerName.endsWith('.webp');
        if (!isWebp) {
            toast('Only .webp images are allowed', 'error');
            event.target.value = '';
            return;
        }

        if (file.size > MAX_BLOG_IMAGE_SIZE_BYTES) {
            toast('Image too large. Maximum allowed size is 50MB.', 'error');
            event.target.value = '';
            return;
        }

        setUploadingImage(true);
        try {
            const fileExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
            const baseName = normalizeFileName(file.name.replace(/\.[^.]+$/, '')) || 'blog-image';
            const slugPart = form.slug ? normalizeFileName(form.slug) : 'unslugged';
            const filePath = `blogs/${slugPart}-${Date.now()}-${baseName}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(BLOG_IMAGE_BUCKET)
                .upload(filePath, file, {
                    cacheControl: '31536000',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: publicData } = supabase.storage
                .from(BLOG_IMAGE_BUCKET)
                .getPublicUrl(filePath);

            if (!publicData?.publicUrl) {
                throw new Error('Upload succeeded but public URL could not be generated.');
            }

            setForm((prev) => ({ ...prev, featured_image: publicData.publicUrl }));
            toast('Featured image uploaded successfully', 'success');
        } catch (error) {
            toast('Image upload failed: ' + error.message, 'error');
        } finally {
            setUploadingImage(false);
            event.target.value = '';
        }
    }

    async function processSingleBlogImport(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const blogData = JSON.parse(text);

            // Validate required fields
            if (!blogData.title || !blogData.slug || !blogData.content) {
                throw new Error('Blog must have title, slug, and content');
            }

            setEditingId(null);
            setForm(mapBlogToForm(blogData));
            setShowModal(true);
            toast(`Loaded "${blogData.title}" into the form. Review and save when ready.`, 'success');
        } catch (error) {
            toast('Failed to import blog: ' + error.message, 'error');
        }

        // Reset file input
        event.target.value = '';
    }

    function openNew() {
        resetForm();
        setEditingId(null);
        setShowModal(true);
    }

    function openEdit(blog) {
        setForm(mapBlogToForm(blog));
        setEditingId(blog.id);
        setShowModal(true);
    }

    function resetForm() {
        setForm(createEmptyForm());
    }

    function mapBlogToForm(blog = {}) {
        return {
            ...createEmptyForm(),
            title: blog.title || '',
            slug: blog.slug || '',
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            featured_image: blog.featured_image || '',
            author: blog.author || 'A3Distributor',
            category: blog.category || 'business',
            tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
            status: blog.status || 'draft',
            published_at: String(blog.published_at || new Date().toISOString().slice(0, 10)).slice(0, 10),
            meta_description: blog.meta_description || '',
            meta_keywords: Array.isArray(blog.meta_keywords) ? blog.meta_keywords.join(', ') : (blog.meta_keywords || ''),
        };
    }

    function generateSlug(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    function handleTitleChange(title) {
        setForm({ ...form, title });
        if (!editingId) {
            setForm(prev => ({ ...prev, slug: generateSlug(title) }));
        }
    }

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af' }}>Loading blogs...</div>;
    }

    return (
        <>
            {/* Hidden file inputs */}
            <input
                ref={fallbackFileInputRef}
                type="file"
                accept=".js,.json"
                style={{ display: 'none' }}
                onChange={processFallbackFileImport}
            />
            <input
                ref={singleBlogFileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={processSingleBlogImport}
            />
            <input
                ref={featuredImageFileInputRef}
                type="file"
                accept="image/webp,.webp"
                style={{ display: 'none' }}
                onChange={processFeaturedImageUpload}
            />

            <div className="page-header">
                <div className="page-header__info">
                    <h1>Blog Posts</h1>
                    <p>{blogs.length} total blog posts</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn-admin btn-admin--secondary" onClick={handleImportFallbackFile} title="Import multiple blogs from fallback file">
                        <Upload size={16} /> Import Fallback
                    </button>
                    <button className="btn-admin btn-admin--secondary" onClick={handleImportSingleBlog} title="Import a single blog from JSON">
                        <FileUp size={16} /> Import Blog JSON
                    </button>
                    <button className="btn-admin btn-admin--secondary" onClick={exportFallbackFile}>
                        Export Fallback File
                    </button>
                    <button className="btn-admin btn-admin--primary" onClick={openNew}>
                        <Plus size={16} /> New Blog Post
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Search */}
                    <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: 36, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }}
                        />
                    </div>
                    
                    {/* Status Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Filter size={14} style={{ color: '#6b7280' }} />
                        <select 
                            value={filterStatus} 
                            onChange={e => setFilterStatus(e.target.value)}
                            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}
                        >
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    
                    {/* Category Filter */}
                    <select 
                        value={filterCategory} 
                        onChange={e => setFilterCategory(e.target.value)}
                        style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    
                    {/* Sort */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ArrowUpDown size={14} style={{ color: '#6b7280' }} />
                        <select 
                            value={`${sortBy}-${sortOrder}`} 
                            onChange={e => {
                                const [field, order] = e.target.value.split('-');
                                setSortBy(field);
                                setSortOrder(order);
                            }}
                            style={{ padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff' }}
                        >
                            <option value="created_at-desc">Newest First</option>
                            <option value="created_at-asc">Oldest First</option>
                            <option value="title-asc">Title A-Z</option>
                            <option value="title-desc">Title Z-A</option>
                            <option value="published_at-desc">Recently Published</option>
                            <option value="updated_at-desc">Recently Updated</option>
                        </select>
                    </div>
                </div>
                
                {/* Bulk Actions Bar */}
                {selectedBlogs.length > 0 && (
                    <div style={{ 
                        marginTop: 12, 
                        padding: '10px 14px', 
                        background: '#eff6ff', 
                        borderRadius: 6, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        border: '1px solid #bfdbfe'
                    }}>
                        <span style={{ fontWeight: 500, color: '#1d4ed8' }}>
                            {selectedBlogs.length} blog(s) selected
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                                className="btn-admin btn-admin--secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                onClick={() => bulkUpdateStatus('published')}
                            >
                                Publish
                            </button>
                            <button 
                                className="btn-admin btn-admin--secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                onClick={() => bulkUpdateStatus('draft')}
                            >
                                Unpublish
                            </button>
                            <button 
                                className="btn-admin btn-admin--secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.85rem', color: '#dc2626', borderColor: '#fecaca' }}
                                onClick={bulkDelete}
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                            <button 
                                className="btn-admin btn-admin--secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                onClick={() => setSelectedBlogs([])}
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                {filteredBlogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        <p>No blogs found. {search || filterStatus !== 'all' || filterCategory !== 'all' ? 'Try different filters.' : 'Create your first blog post!'}</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: 40 }}>
                                    <button 
                                        onClick={toggleSelectAll}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                        title={selectedBlogs.length === filteredBlogs.length ? 'Deselect all' : 'Select all'}
                                    >
                                        {selectedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0 
                                            ? <CheckSquare size={16} style={{ color: '#2563eb' }} />
                                            : <Square size={16} style={{ color: '#9ca3af' }} />
                                        }
                                    </button>
                                </th>
                                <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                                    Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Slug</th>
                                <th>Category</th>
                                <th>Author</th>
                                <th>Status</th>
                                <th onClick={() => handleSort('published_at')} style={{ cursor: 'pointer' }}>
                                    Published {sortBy === 'published_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBlogs.map(blog => (
                                <tr key={blog.id} style={{ background: selectedBlogs.includes(blog.id) ? '#eff6ff' : undefined }}>
                                    <td>
                                        <button 
                                            onClick={() => toggleBlogSelection(blog.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                                        >
                                            {selectedBlogs.includes(blog.id) 
                                                ? <CheckSquare size={16} style={{ color: '#2563eb' }} />
                                                : <Square size={16} style={{ color: '#d1d5db' }} />
                                            }
                                        </button>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{blog.title}</td>
                                    <td style={{ fontSize: '0.85rem', color: '#6b7280', fontFamily: 'monospace' }}>/{blog.slug}</td>
                                    <td><span style={{ fontSize: '0.85rem', background: '#f3f4f6', padding: '4px 8px', borderRadius: 4 }}>{blog.category}</span></td>
                                    <td style={{ fontSize: '0.85rem' }}>{blog.author}</td>
                                    <td><span className={`badge badge--${blog.status === 'published' ? 'active' : 'inactive'}`}>{blog.status}</span></td>
                                    <td style={{ fontSize: '0.85rem' }}>{new Date(blog.published_at).toLocaleDateString('en-IN')}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="data-table__action-btn" title="Edit" onClick={() => openEdit(blog)}><Edit2 size={15} /></button>
                                            <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" className="data-table__action-btn" title="View"><Eye size={15} style={{ cursor: 'pointer' }} /></a>
                                            <button className="data-table__action-btn" title="Duplicate" onClick={() => duplicateBlog(blog)}><Copy size={15} /></button>
                                            <button className="data-table__action-btn" title="Delete" onClick={() => deleteBlog(blog)} style={{ color: '#dc2626' }}><Trash2 size={15} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal 
                isOpen={showDeleteConfirm} 
                onClose={() => { setShowDeleteConfirm(false); setBlogToDelete(null); }} 
                title="Delete Blog Post"
                footer={
                    <>
                        <button className="btn-admin btn-admin--secondary" onClick={() => { setShowDeleteConfirm(false); setBlogToDelete(null); }}>Cancel</button>
                        <button className="btn-admin" style={{ background: '#dc2626', color: '#fff' }} onClick={confirmDelete}>Delete</button>
                    </>
                }
            >
                <p>Are you sure you want to delete <strong>{blogToDelete?.title}</strong>?</p>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 8 }}>This action cannot be undone.</p>
            </Modal>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Blog Post' : 'New Blog Post'} footer={
                <>
                    <button className="btn-admin btn-admin--secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button className="btn-admin btn-admin--primary" onClick={saveBlog}>Save Blog</button>
                </>
            }>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '70vh', overflow: 'auto', paddingRight: 8 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-field">
                            <label>Title *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={e => handleTitleChange(e.target.value)}
                                placeholder="Blog post title"
                            />
                        </div>
                        <div className="form-field">
                            <label>Slug *</label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={e => setForm({ ...form, slug: e.target.value })}
                                placeholder="url-friendly-slug"
                                disabled={!!editingId}
                            />
                            <small style={{ color: '#6b7280', marginTop: 4, display: 'block' }}>URL: /blog/{form.slug}</small>
                        </div>
                    </div>

                    <div className="form-field form-field--full">
                        <label>Excerpt (Summary)</label>
                        <textarea
                            value={form.excerpt}
                            onChange={e => setForm({ ...form, excerpt: e.target.value })}
                            placeholder="Short summary for preview and SEO"
                            rows={2}
                        />
                    </div>

                    <div className="form-field form-field--full">
                        <label>Content *</label>
                        <textarea
                            value={form.content}
                            onChange={e => setForm({ ...form, content: e.target.value })}
                            placeholder="Full blog post content (supports HTML)"
                            rows={8}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-field">
                            <label>Featured Image URL</label>
                            <input
                                type="text"
                                value={form.featured_image}
                                onChange={e => setForm({ ...form, featured_image: e.target.value })}
                                placeholder="/imgs/blog/post.webp"
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    className="btn-admin btn-admin--secondary"
                                    onClick={handleFeaturedImageUploadClick}
                                    disabled={uploadingImage}
                                >
                                    {uploadingImage ? 'Uploading...' : 'Upload to Supabase'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-admin btn-admin--secondary"
                                    onClick={() => setForm({ ...form, featured_image: '' })}
                                    disabled={!form.featured_image || uploadingImage}
                                >
                                    Clear
                                </button>
                            </div>
                            <small style={{ color: '#6b7280', marginTop: 6, display: 'block' }}>
                                Upload limit: 50MB. Bucket: {BLOG_IMAGE_BUCKET}
                            </small>
                        </div>
                        <div className="form-field">
                            <label>Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                <option value="business">Business</option>
                                <option value="product">Product</option>
                                <option value="tips">Tips & Tricks</option>
                                <option value="industry">Industry News</option>
                                <option value="case-study">Case Study</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-field">
                            <label>Author</label>
                            <input
                                type="text"
                                value={form.author}
                                onChange={e => setForm({ ...form, author: e.target.value })}
                                placeholder="Author name"
                            />
                        </div>
                        <div className="form-field">
                            <label>Status</label>
                            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-field">
                            <label>Tags (comma-separated)</label>
                            <input
                                type="text"
                                value={form.tags}
                                onChange={e => setForm({ ...form, tags: e.target.value })}
                                placeholder="water, business, wholesale"
                            />
                        </div>
                        <div className="form-field">
                            <label>Published Date</label>
                            <input
                                type="date"
                                value={form.published_at}
                                onChange={e => setForm({ ...form, published_at: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-field form-field--full">
                        <label>Meta Description (SEO)</label>
                        <textarea
                            value={form.meta_description}
                            onChange={e => setForm({ ...form, meta_description: e.target.value })}
                            placeholder="Search engine description (max 160 chars)"
                            rows={2}
                        />
                        <small style={{ color: '#6b7280', marginTop: 4, display: 'block' }}>
                            Characters: {form.meta_description.length}/160{form.meta_description.length > 160 ? ' (too long)' : ''}
                        </small>
                    </div>

                    <div className="form-field form-field--full">
                        <label>Meta Keywords (SEO)</label>
                        <input
                            type="text"
                            value={form.meta_keywords}
                            onChange={e => setForm({ ...form, meta_keywords: e.target.value })}
                            placeholder="keyword1, keyword2, keyword3"
                        />
                    </div>
                </div>
            </Modal>
        </>
    );
}
