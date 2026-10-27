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
    if (p === '/' || p === '/feed') return 'Overview';
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

  const accountBadgeText = user ? 'Campus Account' : null;

  return (
    <header className="devtrack-topbar">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="topbar-left">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="mobile-sidebar-toggle"
          aria-label="Toggle navigation menu"
          title="Toggle Navigation Menu"
        >
          <Ellipsis size={18} strokeWidth={1.8} aria-hidden="true" />
        </button>

        {/* Breadcrumb */}
        <div className="topbar-breadcrumb">
          <span className="topbar-workspace-prefix">workspace /</span>
          <span className="topbar-page-title">{getPageTitle()}</span>
          {accountBadgeText && (
            <span className="topbar-account-badge">
              {accountBadgeText}
            </span>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="topbar-right">
        {/* + Post Listing button in terracotta */}
        <Link
          to="/create-post"
          className="btn btn-primary btn-sm topbar-post-btn"
        >
          <Plus size={15} strokeWidth={2} aria-hidden="true" />
          <span className="topbar-post-text-full">Post Listing</span>
          <span className="topbar-post-text-short">Post</span>
        </Link>

        {/* Public Profile button - only shown when logged in */}
        {isAuthenticated && user && (
          <Link
            to={`/profile/${user._id}`}
            className="btn btn-secondary btn-sm topbar-profile-btn"
          >
            <UserRound size={14} strokeWidth={1.8} color="var(--forest)" aria-hidden="true" />
            <span className="topbar-profile-text">Profile</span>
            <ExternalLink size={12} strokeWidth={1.8} color="var(--text-muted)" aria-hidden="true" />
          </Link>
        )}

        {/* Exit / Logout Icon Button */}
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign out"
            className="topbar-logout-btn"
          >
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        ) : (
          <Link
            to="/login"
            className="btn btn-sm btn-secondary topbar-signin-btn"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
