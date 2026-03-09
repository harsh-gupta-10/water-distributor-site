import { useState, useEffect } from 'react';
import { Plus, Edit2, Eye, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { saveBlogsToCache } from '../../lib/blogFallback';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

export default function BlogsPage() {
    const toast = useToast();
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featured_image: '',
        author: 'A3 Distributors',
        category: 'business',
        tags: '',
        status: 'draft',
        published_at: new Date().toISOString().slice(0, 10),
        meta_description: '',
        meta_keywords: '',
    });

    useEffect(() => {
        fetchBlogs();
    }, []);

    useEffect(() => {
        const filtered = blogs.filter(blog =>
            blog.title.toLowerCase().includes(search.toLowerCase()) ||
            blog.slug.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredBlogs(filtered);
    }, [search, blogs]);

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

    function openNew() {
        resetForm();
        setEditingId(null);
        setShowModal(true);
    }

    function openEdit(blog) {
        setForm(blog);
        setEditingId(blog.id);
        setShowModal(true);
    }

    function resetForm() {
        setForm({
            title: '',
            slug: '',
            excerpt: '',
            content: '',
            featured_image: '',
            author: 'A3 Distributors',
            category: 'business',
            tags: '',
            status: 'draft',
            published_at: new Date().toISOString().slice(0, 10),
            meta_description: '',
            meta_keywords: '',
        });
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
            <div className="page-header">
                <div className="page-header__info">
                    <h1>Blog Posts</h1>
                    <p>{blogs.length} total blog posts</p>
                </div>
                <div className="page-header__actions">
                    <button className="btn-admin btn-admin--secondary" onClick={exportFallbackFile}>
                        Export Fallback File
                    </button>
                    <button className="btn-admin btn-admin--primary" onClick={openNew}>
                        <Plus size={16} /> New Blog Post
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search blogs..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: 36, padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 6 }}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                {filteredBlogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        <p>No blogs found. {search ? 'Try a different search.' : 'Create your first blog post!'}</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Category</th>
                                <th>Author</th>
                                <th>Status</th>
                                <th>Published</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBlogs.map(blog => (
                                <tr key={blog.id}>
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
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

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
                        <small style={{ color: '#6b7280', marginTop: 4, display: 'block' }}>Characters: {form.meta_description.length}/160</small>
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
