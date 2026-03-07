import { Search, Menu } from 'lucide-react';

export default function TopHeader({ title, onMobileToggle }) {
    return (
        <header className="top-header">
            <div className="top-header__left">
                <button className="top-header__mobile-toggle" onClick={onMobileToggle}>
                    <Menu size={22} />
                </button>
                <h2 className="top-header__title">{title}</h2>
            </div>
            <div className="top-header__right">
                <div className="top-header__search">
                    <Search size={16} className="top-header__search-icon" />
                    <input placeholder="Search..." />
                </div>
                <div className="top-header__user">
                    <div className="top-header__avatar">AD</div>
                    <span className="top-header__user-name">Admin</span>
                </div>
            </div>
        </header>
    );
}
