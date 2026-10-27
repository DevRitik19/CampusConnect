import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Plus, SlidersHorizontal, CircleAlert, X } from 'lucide-react';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const Marketplace = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');
  const [search, setSearch] = useState('');

  const fetchMarketplace = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', 'MARKETPLACE');
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (sortOrder) params.append('sort', sortOrder);
      if (search) params.append('search', search);

      const res = await api.get(`/posts?${params.toString()}`);
      if (res.success) {
        setPosts(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching marketplace posts:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, sortOrder, search]);

  useEffect(() => {
    fetchMarketplace();
  }, [fetchMarketplace]);

  const categories = [
    'All',
    'Books & Notes',
    'Electronics',
    'Hostel & Room',
    'Stationery & Tools',
    'Cycles & Mobility',
    'Sports Equipment',
    'Other',
  ];

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      {/* Header Banner */}
      <div className="page-hero">
        <div style={{ maxWidth: '640px' }}>
          <div className="page-hero-label">Student Exchange</div>
          <h1>Student Marketplace</h1>
          <p>
            Buy and sell pre-loved course textbooks, lab equipment, hostel desks, and calculators at student-friendly prices in Indian Rupees (₹).
          </p>
        </div>

        <Link
          to="/create-post?type=MARKETPLACE"
          className="btn btn-primary btn-lg"
        >
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
          <span>Sell an Item</span>
        </Link>
      </div>

      {/* Safety Notice Callout */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <CircleAlert size={18} strokeWidth={1.8} color="var(--primary)" style={{ flexShrink: 0 }} aria-hidden="true" />
        <span>
          <strong>Campus Exchange Policy:</strong> Transactions take place peer-to-peer. CampusConnect does not process online payments or take commissions. Always inspect items in person.
        </span>
      </div>

      {/* Filters and search */}
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
          {/* Categories */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginRight: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <SlidersHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>Category:</span>
            </div>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem', border: '1px solid var(--border)', gap: '0.35rem' }}>
              <Search size={16} strokeWidth={1.8} color="var(--text-muted)" style={{ flexShrink: 0 }} aria-hidden="true" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '150px' }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
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
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-control"
              aria-label="Sort marketplace items"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High (₹)</option>
              <option value="price_desc">Price: High to Low (₹)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Listings */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : posts.length > 0 ? (
        <div className="grid-cards">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingBag}
          title="No marketplace items listed"
          description="Be the first to list a used textbook, calculator, or hostel item for your campus peers."
          actionText="List an Item for Sale"
          actionLink="/create-post?type=MARKETPLACE"
        />
      )}
    </div>
  );
};
