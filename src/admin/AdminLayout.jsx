import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { ToastProvider } from './components/Toast';
import AdminLogin from '../components/AdminLogin';
import './admin.css';

const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/quotations': 'Quotations',
    '/admin/orders': 'Orders',
    '/admin/customers': 'Customers',
    '/admin/products': 'Products',
    '/admin/product-images': 'Product Images',
    '/admin/invoices': 'Invoices',
    '/admin/analytics': 'Analytics',
    '/admin/blogs': 'Blogs',
    '/admin/uploads': 'Uploads',
    '/admin/settings': 'Settings',
};

export default function AdminLayout() {
    const [session, setSession] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setAuthLoading(false);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    if (authLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7280' }}>
                Checking authentication...
            </div>
        );
    }

    if (!session) {
        return <AdminLogin onLogin={setSession} />;
    }

    const currentTitle = Object.entries(pageTitles).reduce((found, [path, title]) => {
        if (location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path))) {
            return title;
        }
        return found;
    }, 'Dashboard');

    return (
        <ToastProvider>
            <div className={`admin-shell ${collapsed ? 'admin-shell--collapsed' : ''}`}>
                {/* Mobile overlay */}
                {mobileOpen && (
                    <div className="sidebar-overlay sidebar-overlay--visible" onClick={() => setMobileOpen(false)} />
                )}

                <Sidebar
                    collapsed={collapsed}
                    mobileOpen={mobileOpen}
                    onNavigate={() => setMobileOpen(false)}
                    onToggle={() => setCollapsed(!collapsed)}
                />

                <div className="admin-shell__main">
                    <TopHeader title={currentTitle} onMobileToggle={() => setMobileOpen(!mobileOpen)} />
                    <div className="admin-shell__content">
                        <Outlet />
                    </div>
                </div>
            </div>
        </ToastProvider>
    );
}
