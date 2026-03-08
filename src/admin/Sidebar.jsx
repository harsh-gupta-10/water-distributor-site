import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    LayoutDashboard, FileText, Users, Package, Receipt,
    CreditCard, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Droplets, ShoppingCart, Image
} from 'lucide-react';

const navItems = [
    {
        group: 'Main', items: [
            { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
            { to: '/admin/quotations', icon: FileText, label: 'Quotations' },
            { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
            { to: '/admin/customers', icon: Users, label: 'Customers' },
            { to: '/admin/products', icon: Package, label: 'Products' },
            { to: '/admin/product-images', icon: Image, label: 'Product Images' },
        ]
    },
    {
        group: 'Billing', items: [
            { to: '/admin/invoices', icon: Receipt, label: 'Invoices' },
        ]
    },
    {
        group: 'Reports', items: [
            { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
            { to: '/admin/settings', icon: Settings, label: 'Settings' },
        ]
    },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen = false, onNavigate }) {
    const navigate = useNavigate();

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate('/admin');
    }

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
            <div className="sidebar__brand">
                <img src="/imgs/logo-footer.png" alt="ZURICA" style={{ height: 60, width: 'auto' }} />

            </div>

            <nav className="sidebar__nav">
                {navItems.map(group => (
                    <div key={group.group} className="sidebar__nav-group">
                        <div className="sidebar__nav-group-label">{group.group}</div>
                        {group.items.map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={onNavigate}
                                className={({ isActive }) =>
                                    `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                                }
                            >
                                <item.icon size={20} className="sidebar__link-icon" />
                                <span className="sidebar__link-text">{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar__footer">
                <button className="sidebar__link" onClick={handleLogout}>
                    <LogOut size={20} className="sidebar__link-icon" />
                    <span className="sidebar__link-text">Logout</span>
                </button>
                <button className="sidebar__collapse-btn" onClick={onToggle}>
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    <span>Collapse</span>
                </button>
            </div>
        </aside>
    );
}
