import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, PlusCircle, AlertCircle } from 'lucide-react';
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
      <div
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#fef3c7', letterSpacing: '0.05em' }}>
            Student Exchange
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            Student Marketplace
          </h1>
          <p style={{ color: '#fffbeb', fontSize: '0.95rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
            Buy and sell pre-loved course textbooks, lab equipment, hostel desks, and calculators at student-friendly prices in Indian Rupees (₹).
          </p>
        </div>

        <Link
          to="/create-post?type=MARKETPLACE"
          className="btn btn-lg"
          style={{ background: '#ffffff', color: '#b45309', fontWeight: 700 }}
        >
          <PlusCircle size={20} />
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
        <AlertCircle size={18} color="var(--accent)" style={{ flexShrink: 0 }} />
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem', border: '1px solid var(--border)' }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '160px' }}
              />
            </div>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-control"
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
          title="No marketplace items listed"
          description="Be the first to list a used textbook, calculator, or hostel item for your campus peers."
          actionText="List an Item for Sale"
          actionLink="/create-post?type=MARKETPLACE"
        />
      )}
    </div>
  );
};
