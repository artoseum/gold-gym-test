import { useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Dumbbell, LayoutDashboard, MapPin, CreditCard, Users,
  Activity, ShoppingBag, LogOut, ShoppingCart, Shield, X, Menu
} from 'lucide-react';
import { useAuthStore } from '../store/stores';
import { useMarketStore } from '../store/stores';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/gym', icon: MapPin, label: 'My Gym' },
  { to: '/membership', icon: CreditCard, label: 'Membership' },
  { to: '/social', icon: Users, label: 'Gold Club' },
  { to: '/health', icon: Activity, label: 'Health' },
  { to: '/marketplace', icon: ShoppingBag, label: 'Shop' },
];

export default function Sidebar({ onAdminTrigger }) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.currentUser);
  const cart = useMarketStore((s) => s.cart);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Long press detection for admin mode
  const pressTimer = useRef(null);
  const [pressing, setPressing] = useState(false);

  const startPress = () => {
    setPressing(true);
    pressTimer.current = setTimeout(() => {
      setPressing(false);
      onAdminTrigger?.();
    }, 2000);
  };

  const endPress = () => {
    setPressing(false);
    clearTimeout(pressTimer.current);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="sidebar-inner">
      {/* Logo – long press = admin */}
      <div
        className={`sidebar-logo ${pressing ? 'pressing' : ''}`}
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        title="Hold 2s for admin mode"
      >
        <div className="sidebar-logo-icon">
          <Dumbbell size={22} color="#0a0a0c" />
          {pressing && <div className="press-ring" />}
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">GOLD'S</span>
          <span className="sidebar-brand-sub">GYM</span>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.displayName}</div>
            <div className="sidebar-user-meta">
              {user.authMethod === 'google' ? user.email : user.phone}
            </div>
          </div>
        </div>
      )}

      <hr className="divider" />

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Shop' && cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Cart Quick Link */}
      <NavLink
        to="/cart"
        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        onClick={() => setMobileOpen(false)}
      >
        <ShoppingCart size={18} />
        <span>Cart</span>
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </NavLink>

      {/* Logout */}
      <button className="sidebar-logout" onClick={handleLogout}>
        <LogOut size={16} />
        <span>Log Out</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Desktop Sidebar */}
      <aside className="sidebar desktop-sidebar">{sidebarContent}</aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <aside className="sidebar mobile-sidebar animate-slide-right" onClick={(e) => e.stopPropagation()}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
