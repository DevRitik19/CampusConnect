import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, ExternalLink, LogOut, Ellipsis, UserRound } from 'lucide-react';

export const TopBar = ({ onToggleMobileSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Derive title from pathname or user
  const getPageTitle = () => {
    const p = location.pathname;
    if (p === '/' || p === '/feed') return user?.name || 'Alex Rivera';
    if (p.startsWith('/marketplace')) return 'Student Marketplace';
    if (p.startsWith('/collaborate')) return 'Study & Teams';
    if (p.startsWith('/lost-found')) return 'Lost & Found';
    if (p.startsWith('/events')) return 'Events & Announcements';
    if (p.startsWith('/messages')) return 'Messages';
    if (p.startsWith('/saved')) return 'Saved Bookmarks';
    if (p.startsWith('/my-posts')) return 'My Listings';
    if (p.startsWith('/admin')) return 'Admin Moderation';
    if (p.startsWith('/create-post')) return 'Create Listing';
    if (p.startsWith('/profile')) return 'Student Profile';
    if (p.startsWith('/login')) return 'Student Login';
    if (p.startsWith('/register')) return 'Campus Registration';
    return 'Campus Hub';
  };

  const accountBadgeText = user ? 'Campus Account' : 'Demo Account';

  return (
    <header
      style={{
        height: '56px',
        background: 'var(--bg-page)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(8px)',
      }}
      className="devtrack-topbar"
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        {/* Mobile menu toggle (Ellipsis matching reference design) */}
        <button
          onClick={onToggleMobileSidebar}
          className="mobile-sidebar-toggle"
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            color: 'var(--forest)',
            padding: '0.35rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
          }}
          title="Toggle Navigation Menu"
        >
          <Ellipsis size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>

        {/* Breadcrumb matching DevTrack screenshot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.88rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>workspace /</span>
          <span style={{ color: 'var(--forest)', fontWeight: 700 }}>{getPageTitle()}</span>
          <span
            style={{
              background: '#EAE2D3',
              color: '#8a6245',
              border: '1px solid var(--border)',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              marginLeft: '0.35rem',
              letterSpacing: '0.02em',
            }}
          >
            {accountBadgeText}
          </span>
        </div>
      </div>

      {/* Right Actions matching DevTrack screenshot */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* + Log Activity / + Post Listing button in terracotta */}
        <Link
          to="/create-post"
          className="btn btn-primary btn-sm"
          style={{
            padding: '0.45rem 1rem',
            borderRadius: '6px',
            fontSize: '0.84rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 1px 3px rgba(182, 95, 59, 0.25)',
          }}
        >
          <Plus size={15} strokeWidth={2} aria-hidden="true" />
          <span>Post Listing</span>
        </Link>

        {/* Public Profile button */}
        <Link
          to={user ? `/profile/${user._id}` : '/login'}
          className="btn btn-secondary btn-sm"
          style={{
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
          }}
        >
          <UserRound size={14} strokeWidth={1.8} color="var(--forest)" aria-hidden="true" />
          <span>Public Profile</span>
          <ExternalLink size={12} strokeWidth={1.8} color="var(--text-muted)" aria-hidden="true" />
        </Link>

        {/* Exit / Logout Icon Button */}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign out"
            style={{
              color: 'var(--text-muted)',
              padding: '0.45rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid transparent',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--danger)';
              e.currentTarget.style.background = 'var(--danger-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ) : (
          <Link
            to="/login"
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
