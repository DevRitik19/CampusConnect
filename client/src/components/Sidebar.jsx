import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  House,
  PackageSearch,
  ShoppingBag,
  Users,
  CalendarDays,
  MessageCircle,
  Bookmark,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  LogOut,
  UserRound,
  Plus,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (path === '/feed') {
      return location.pathname === '/feed' || location.pathname === '/';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navItems = [
    {
      label: 'Overview',
      to: isAuthenticated ? '/feed' : '/',
      icon: House,
    },
    {
      label: 'Marketplace',
      to: '/marketplace',
      icon: ShoppingBag,
    },
    {
      label: 'Study & Teams',
      to: '/collaborate',
      icon: Users,
    },
    {
      label: 'Lost & Found',
      to: '/lost-found',
      icon: PackageSearch,
    },
    {
      label: 'Events & Calendar',
      to: '/events',
      icon: CalendarDays,
    },
    {
      label: 'Messages',
      to: '/messages',
      icon: MessageCircle,
      requiresAuth: true,
    },
    {
      label: 'Saved Bookmarks',
      to: '/saved',
      icon: Bookmark,
      requiresAuth: true,
    },
    {
      label: 'My Listings',
      to: '/my-posts',
      icon: Layers,
      requiresAuth: true,
    },
  ];

  if (isAdmin) {
    navItems.push({
      label: 'Admin Desk',
      to: '/admin',
      icon: ShieldCheck,
    });
  }

  // Display user info (only for authenticated user)
  const displayName = user?.name || '';
  const displayHandle = user?.name
    ? `@${user.name.toLowerCase().replace(/\s+/g, '_')}`
    : '';
  const displayAvatar = user?.avatarUrl || '';
  const displayBadge = isAdmin ? 'ADMIN' : 'STUDENT';
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            zIndex: 90,
          }}
          className="sidebar-backdrop"
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`devtrack-sidebar ${isOpen ? 'sidebar-open' : ''} ${
          collapsed ? 'sidebar-collapsed' : ''
        }`}
        style={{
          width: collapsed ? '72px' : '250px',
          background: '#263524',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          flexShrink: 0,
          transition: 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.22s ease',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '2px 0 12px rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Header / Brand */}
        <div
          style={{
            padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            minHeight: '64px',
          }}
        >
          <Link
            to={isAuthenticated ? '/feed' : '/'}
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textDecoration: 'none',
              overflow: 'hidden',
            }}
          >
            {/* >_ Terminal Prompt Logo badge from DevTrack */}
            <div
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.9rem',
                fontFamily: 'var(--font-mono)',
                flexShrink: 0,
                letterSpacing: '-0.05em',
                boxShadow: '0 2px 6px rgba(182, 95, 59, 0.35)',
              }}
            >
              &gt;_
            </div>

            {!collapsed && (
              <div style={{ lineHeight: 1.15 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span
                    style={{
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#ffffff',
                      letterSpacing: '-0.02em',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    CampusConnect
                  </span>
                  <span
                    style={{
                      background: 'rgba(182, 95, 59, 0.25)',
                      color: '#e08a65',
                      border: '1px solid rgba(182, 95, 59, 0.4)',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.35rem',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    MVP
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                  }}
                >
                  Progress Hub
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Arrow */}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
            className="collapse-toggle-btn"
            style={{
              color: 'rgba(255, 255, 255, 0.5)',
              padding: '0.25rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
          >
            {collapsed ? <ChevronRight size={16} strokeWidth={1.8} aria-hidden="true" /> : <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="mobile-close-btn"
            style={{
              display: 'none',
              color: 'rgba(255, 255, 255, 0.7)',
              padding: '0.25rem',
            }}
          >
            <X size={20} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: collapsed ? '1rem 0.4rem' : '1rem 0.6rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
          }}
        >
          {navItems.map((item) => {
            const active = isActive(item.to);
            const IconComponent = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.7rem 0' : '0.65rem 0.85rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: active ? 600 : 500,
                  color: active ? '#ffffff' : '#9caaa0',
                  background: active ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  borderLeft: active ? '3px solid var(--primary)' : '3px solid transparent',
                  transition: 'all 0.18s ease',
                  letterSpacing: '0.005em',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#ffffff';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = '#9caaa0';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <IconComponent
                  size={18}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  style={{
                    color: active ? 'var(--primary)' : 'inherit',
                    flexShrink: 0,
                  }}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {isAuthenticated && (
            <>
              <div
                style={{
                  margin: '0.75rem 0.5rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              />

              {/* Public Profile Link */}
              <Link
                to={`/profile/${user?._id}`}
                onClick={onClose}
                title={collapsed ? 'Public Profile' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.7rem 0' : '0.65rem 0.85rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  color: '#9caaa0',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9caaa0';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <UserRound size={18} strokeWidth={1.8} aria-hidden="true" style={{ flexShrink: 0 }} />
                {!collapsed && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                    Public Profile
                    <ExternalLink size={12} strokeWidth={1.8} aria-hidden="true" style={{ opacity: 0.65, marginLeft: 'auto' }} />
                  </span>
                )}
              </Link>

              {/* Settings */}
              <Link
                to="/profile/edit"
                onClick={onClose}
                title={collapsed ? 'Settings' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: collapsed ? '0.7rem 0' : '0.65rem 0.85rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  color: '#9caaa0',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9caaa0';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Settings size={18} strokeWidth={1.8} aria-hidden="true" style={{ flexShrink: 0 }} />
                {!collapsed && <span>Settings</span>}
              </Link>
            </>
          )}
        </nav>

        {/* User Profile / Guest Footer Widget */}
        <div
          style={{
            padding: collapsed ? '1rem 0.5rem' : '1rem 1.15rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            background: 'rgba(0, 0, 0, 0.12)',
          }}
        >
          {isAuthenticated && user ? (
            <>
              <Link
                to={`/profile/${user._id}`}
                onClick={onClose}
                title={collapsed ? user.name : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  textDecoration: 'none',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9999px',
                      objectFit: 'cover',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '9999px',
                      background: 'rgba(182, 95, 59, 0.85)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      flexShrink: 0,
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {userInitial}
                  </div>
                )}

                {!collapsed && (
                  <div style={{ minWidth: 0, lineHeight: 1.25 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {displayName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {displayHandle}
                      </span>
                      <span
                        style={{
                          background: 'rgba(182, 95, 59, 0.25)',
                          color: '#e08a65',
                          fontSize: '0.58rem',
                          fontWeight: 800,
                          padding: '0.05rem 0.25rem',
                          borderRadius: '3px',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {displayBadge}
                      </span>
                    </div>
                  </div>
                )}
              </Link>

              {!collapsed && (
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign out"
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    padding: '0.35rem',
                    borderRadius: '4px',
                    transition: 'color 0.15s',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')
                  }
                >
                  <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
                </button>
              )}
            </>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              title={collapsed ? 'Sign In' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                textDecoration: 'none',
                width: '100%',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '0.2rem' : '0.35rem 0.5rem',
                borderRadius: '6px',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: '1.5px dashed rgba(255, 255, 255, 0.25)',
                }}
              >
                <UserRound size={16} strokeWidth={1.8} />
              </div>

              {!collapsed && (
                <div style={{ minWidth: 0, lineHeight: 1.25 }}>
                  <div
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#ffffff',
                    }}
                  >
                    Guest Visitor
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#e08a65',
                      fontWeight: 600,
                    }}
                  >
                    Sign In / Register &rarr;
                  </div>
                </div>
              )}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
};
