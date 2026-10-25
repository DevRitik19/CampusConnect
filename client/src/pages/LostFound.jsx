import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, PlusCircle, Filter } from 'lucide-react';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const LostFound = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemStateFilter, setItemStateFilter] = useState(''); // '' = all, 'LOST', 'FOUND'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [locationSearch, setLocationSearch] = useState('');
  const [search, setSearch] = useState('');

  const fetchLostFound = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', 'LOST_FOUND');
      if (itemStateFilter) params.append('itemState', itemStateFilter);
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (locationSearch) params.append('location', locationSearch);
      if (search) params.append('search', search);

      const res = await api.get(`/posts?${params.toString()}`);
      if (res.success) {
        setPosts(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching lost & found posts:', err);
    } finally {
      setLoading(false);
    }
  }, [itemStateFilter, categoryFilter, locationSearch, search]);

  useEffect(() => {
    fetchLostFound();
  }, [fetchLostFound]);

  const categories = [
    'All',
    'Electronics',
    'Keys & ID',
    'Books & Notes',
    'Bags & Wallets',
    'Bottles & Flasks',
    'Clothing & Accessories',
    'Other',
  ];

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
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
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#fecaca', letterSpacing: '0.05em' }}>
            Campus Desk
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            Lost & Found Hub
          </h1>
          <p style={{ color: '#fee2e2', fontSize: '0.95rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
            Lost your calculator, ID card, or hostel keys? Or found something on a bench? Post notices and help batchmates recover their belongings safely.
          </p>
        </div>

        <Link
          to="/create-post?type=LOST_FOUND"
          className="btn btn-lg"
          style={{ background: '#ffffff', color: '#b91c1c', fontWeight: 700 }}
        >
          <PlusCircle size={20} />
          <span>Report Lost/Found Item</span>
        </Link>
      </div>

      {/* Control Filters */}
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
          {/* Lost vs Found switch */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setItemStateFilter('')}
              className={`btn btn-sm ${itemStateFilter === '' ? 'btn-primary' : 'btn-secondary'}`}
            >
              All Notices
            </button>
            <button
              onClick={() => setItemStateFilter('LOST')}
              className={`btn btn-sm ${itemStateFilter === 'LOST' ? 'btn-danger' : 'btn-secondary'}`}
            >
              Lost Notices
            </button>
            <button
              onClick={() => setItemStateFilter('FOUND')}
              className={`btn btn-sm ${itemStateFilter === 'FOUND' ? 'btn-primary' : 'btn-secondary'}`}
              style={itemStateFilter === 'FOUND' ? { background: '#10b981', borderColor: '#10b981' } : {}}
            >
              Found Items
            </button>
          </div>

          {/* Search inputs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem', border: '1px solid var(--border)' }}>
              <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '150px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem', border: '1px solid var(--border)' }}>
              <MapPin size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input
                type="text"
                placeholder="Filter by location (e.g. Library)..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '160px' }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
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
          title="No lost or found items recorded"
          description="Everything seems to be right where it belongs! If you found an item or lost something, publish a notice."
          actionText="Publish Lost/Found Notice"
          actionLink="/create-post?type=LOST_FOUND"
        />
      )}
    </div>
  );
};
