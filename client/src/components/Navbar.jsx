import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Search,
  ShoppingBag,
  Users,
  Calendar,
  MessageSquare,
  Bookmark,
  ShieldAlert,
  User as UserIcon,
  LogOut,
  PlusCircle,
  Menu,
  X,
  Layers,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-sticky">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.25rem' }}>
        {/* Logo */}
        <Link to={isAuthenticated ? '/feed' : '/'} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
            color: '#fff',
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
          }}>
            <Layers size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Campus<span style={{ color: 'var(--primary)' }}>Connect</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '-3px' }}>
              Apex Institute Hub
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          <Link
            to={isAuthenticated ? '/feed' : '/'}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/feed') || isActive('/') ? 'var(--primary)' : 'var(--text-main)',
              background: (isActive('/feed') || isActive('/')) ? 'var(--primary-light)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Compass size={17} />
            Explore
          </Link>

          <Link
            to="/lost-found"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/lost-found') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/lost-found') ? 'var(--primary-light)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Search size={17} />
            Lost & Found
          </Link>

          <Link
            to="/marketplace"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/marketplace') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/marketplace') ? 'var(--primary-light)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <ShoppingBag size={17} />
            Marketplace
          </Link>

          <Link
            to="/collaborate"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/collaborate') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/collaborate') ? 'var(--primary-light)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Users size={17} />
            Collaborate
          </Link>

          <Link
            to="/events"
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive('/events') ? 'var(--primary)' : 'var(--text-main)',
              background: isActive('/events') ? 'var(--primary-light)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Calendar size={17} />
            Events
          </Link>
        </nav>

        {/* Action Controls & Auth State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated ? (
            <>
              <Link
                to="/create-post"
                className="btn btn-primary btn-sm"
                style={{ padding: '0.5rem 1rem' }}
              >
                <PlusCircle size={16} />
                <span>Post Listing</span>
              </Link>

              <Link
                to="/messages"
                title="Messages"
                style={{
                  position: 'relative',
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive('/messages') ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  color: isActive('/messages') ? 'var(--primary)' : 'var(--text-main)',
                  border: '1px solid var(--border)'
                }}
              >
                <MessageSquare size={19} />
              </Link>

              {/* User Dropdown Trigger */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)'
                  }}
                >
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    style={{ width: '2rem', height: '2rem', borderRadius: '9999px', objectFit: 'cover' }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '115%',
                      width: '230px',
                      background: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-xl)',
                      border: '1px solid var(--border)',
                      padding: '0.5rem',
                      zIndex: 100
                    }}
                  >
                    <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                      {isAdmin && (
                        <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.65rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          ADMINISTRATOR
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/profile/${user._id}`}
                      onClick={() => setUserDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <UserIcon size={16} color="var(--text-muted)" />
                      My Profile
                    </Link>

                    <Link
                      to="/my-posts"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Layers size={16} color="var(--text-muted)" />
                      My Listings
                    </Link>

                    <Link
                      to="/saved"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-main)', borderRadius: 'var(--radius-sm)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Bookmark size={16} color="var(--text-muted)" />
                      Saved Items
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: '#b91c1c', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <ShieldAlert size={16} color="#b91c1c" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div style={{ height: '1px', background: 'var(--border)', margin: '0.35rem 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--danger-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} color="var(--danger)" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            style={{ padding: '0.5rem', color: 'var(--text-main)', display: 'none' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/feed" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Explore Feed</Link>
          <Link to="/lost-found" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Lost & Found</Link>
          <Link to="/marketplace" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Marketplace</Link>
          <Link to="/collaborate" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Collaborate</Link>
          <Link to="/events" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Campus Events</Link>
          {isAuthenticated && (
            <>
              <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />
              <Link to="/messages" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Messages</Link>
              <Link to="/saved" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>Saved Bookmarks</Link>
              <Link to="/my-posts" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600 }}>My Listings</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ padding: '0.5rem 0', fontWeight: 600, color: 'var(--danger)' }}>Admin Dashboard</Link>}
              <button onClick={handleLogout} style={{ textAlign: 'left', padding: '0.5rem 0', color: 'var(--danger)', fontWeight: 600 }}>Sign Out</button>
            </>
          )}
        </div>
      )}
      <style>{`
        @media (max-width: 880px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};
