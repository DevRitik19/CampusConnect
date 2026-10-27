import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const HomeFeed = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalPosts: 0 });

  // Filters from URL or default
  const selectedType = searchParams.get('type') || '';
  const searchInput = searchParams.get('search') || '';
  const selectedSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [localSearch, setLocalSearch] = useState(searchInput);

  // Keep local search synchronized with URL search parameter
  useEffect(() => {
    setLocalSearch(searchInput);
  }, [searchInput]);

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (searchInput) params.append('search', searchInput);
      if (selectedSort) params.append('sort', selectedSort);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const res = await api.get(`/posts?${params.toString()}`);
      if (res.success) {
        setPosts(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load campus feed. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [selectedType, searchInput, selectedSort, currentPage]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setLocalSearch(val);
    // If user deleted all characters or cleared the field, immediately reset search filter
    if (!val.trim()) {
      updateFilter('search', '');
    }
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    updateFilter('search', '');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilter('search', localSearch.trim());
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      {/* Top Banner & Greetings */}
      <div className="page-hero">
        <div>
          <div className="page-hero-label">Campus Live Feed</div>
          <h1>{user ? `Welcome back, ${user.name.split(' ')[0]}!` : 'CampusConnect Community Feed'}</h1>
          <p>Check out what students at Scaler School of Technology are sharing, searching for, and collaborating on right now.</p>
        </div>
        <Link to="/create-post" className="btn btn-primary btn-lg">
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
          <span>Publish New Listing</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Post Type Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginRight: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <SlidersHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>Filter:</span>
            </div>
            <button
              onClick={() => updateFilter('type', '')}
              className={`btn btn-sm ${!selectedType ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Listings
            </button>
            <button
              onClick={() => updateFilter('type', 'LOST_FOUND')}
              className={`btn btn-sm ${selectedType === 'LOST_FOUND' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Lost & Found
            </button>
            <button
              onClick={() => updateFilter('type', 'MARKETPLACE')}
              className={`btn btn-sm ${selectedType === 'MARKETPLACE' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Marketplace
            </button>
            <button
              onClick={() => updateFilter('type', 'COLLABORATION')}
              className={`btn btn-sm ${selectedType === 'COLLABORATION' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Collaboration
            </button>
          </div>

          {/* Search Input & Sort Dropdown */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem', border: '1px solid var(--border)', gap: '0.35rem' }}>
              <Search size={16} strokeWidth={1.8} color="var(--text-muted)" style={{ flexShrink: 0 }} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search listings..."
                value={localSearch}
                onChange={handleSearchChange}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '150px' }}
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  title="Clear search"
                  aria-label="Clear search"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '0 0.15rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
            </form>

            <select
              value={selectedSort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="form-control"
              aria-label="Sort listings"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <button
              onClick={fetchFeed}
              title="Refresh Feed"
              aria-label="Refresh Feed"
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem' }}
            >
              <RefreshCw size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #fecaca' }}>
          <span>{error}</span>
          <button onClick={fetchFeed} className="btn btn-danger btn-sm">Retry</button>
        </div>
      )}

      {/* Grid of Listings */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : posts.length > 0 ? (
        <>
          <div className="grid-cards">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '3rem' }}>
              <button
                disabled={!pagination.hasPrevPage}
                onClick={() => updateFilter('page', (currentPage - 1).toString())}
                className="btn btn-secondary btn-sm"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />
                Previous
              </button>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={!pagination.hasNextPage}
                onClick={() => updateFilter('page', (currentPage + 1).toString())}
                className="btn btn-secondary btn-sm"
                aria-label="Next page"
              >
                Next
                <ChevronRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="No posts found matching your criteria"
          description="Try clearing your search query or switching to another category tab."
          actionText="Create New Listing"
          actionLink="/create-post"
        />
      )}
    </div>
  );
};
