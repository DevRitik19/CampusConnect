import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const MyListings = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/posts');
      if (res.success && res.data) {
        setPosts(res.data);
      }
    } catch (err) {
      console.error('Error fetching my posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPosts();
  }, []);

  const handleStatusChange = async (postId, newStatus) => {
    try {
      const res = await api.patch(`/posts/${postId}/status`, { status: newStatus });
      if (res.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, status: newStatus } : p))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      const res = await api.delete(`/posts/${postId}`);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            My Published Listings
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage notices you have created, update availability, or mark items as sold and resolved.
          </p>
        </div>

        <Link to="/create-post" className="btn btn-primary">
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
          <span>Publish New Listing</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : posts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {posts.map((post) => (
            <div
              key={post._id}
              className="card my-listing-row"
              style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '140px 1fr auto',
                gap: '1.5rem',
                alignItems: 'center',
              }}
            >
              {/* Thumbnail */}
              <div style={{ height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                <img
                  src={
                    post.images && post.images.length > 0
                      ? post.images[0]
                      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400'
                  }
                  alt={post.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Information */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
                  <Badge type={post.type} itemState={post.details?.itemState} status={post.status}>
                    {post.type}
                  </Badge>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {post.category}
                  </span>
                </div>

                <Link to={`/posts/${post._id}`}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                    {post.title}
                  </h3>
                </Link>

                <div style={{ display: 'flex', flexWrap: 'gap', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {post.details?.price !== undefined && (
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--forest)' }}>₹{post.details.price}</span>
                  )}
                  {post.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} strokeWidth={1.8} aria-hidden="true" />
                      <span>{post.location}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={13} strokeWidth={1.8} aria-hidden="true" />
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                {post.status === 'ACTIVE' ? (
                  <>
                    {post.type === 'LOST_FOUND' && (
                      <button
                        onClick={() => handleStatusChange(post._id, 'RESOLVED')}
                        className="btn btn-sm btn-forest"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <CheckCircle2 size={14} strokeWidth={1.8} aria-hidden="true" />
                        <span>Mark Recovered</span>
                      </button>
                    )}

                    {post.type === 'MARKETPLACE' && (
                      <button
                        onClick={() => handleStatusChange(post._id, 'SOLD')}
                        className="btn btn-sm btn-forest"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <CheckCircle2 size={14} strokeWidth={1.8} aria-hidden="true" />
                        <span>Mark as Sold</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleStatusChange(post._id, 'CLOSED')}
                      className="btn btn-secondary btn-sm"
                    >
                      Close Listing
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleStatusChange(post._id, 'ACTIVE')}
                    className="btn btn-secondary btn-sm"
                  >
                    Re-open Listing
                  </button>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/edit-post/${post._id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Pencil size={14} strokeWidth={1.8} aria-hidden="true" />
                    <span>Edit</span>
                  </Link>

                  <button
                    onClick={() => handleDelete(post._id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.4rem 0.6rem' }}
                    aria-label="Delete listing"
                    title="Delete post"
                  >
                    <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Layers}
          title="You haven't posted any listings yet"
          description="Have books to sell, a lost item to report, or need hackathon teammates? Publish your first notice."
          actionText="Create Listing"
          actionLink="/create-post"
        />
      )}
      <style>{`
        @media (max-width: 768px) {
          .my-listing-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
