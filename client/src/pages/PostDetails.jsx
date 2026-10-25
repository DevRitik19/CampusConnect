import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Clock,
  MessageSquare,
  Bookmark,
  Share2,
  AlertTriangle,
  Edit,
  Trash2,
  CheckCircle,
  Tag,
  ChevronLeft,
  User as UserIcon,
  PhoneCall,
} from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/Badge';
import { ReportModal } from '../components/ReportModal';

export const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/posts/${id}`);
        if (res.success && res.data) {
          setPost(res.data);
          // Check if saved
          if (user?.savedPosts?.some((savedId) => (typeof savedId === 'string' ? savedId : savedId?._id) === res.data._id)) {
            setIsSaved(true);
          }
        }
      } catch (err) {
        setError(err.message || 'Listing could not be loaded or was removed.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  const isOwner = user && post && post.author && post.author._id === user._id;

  // Contact author / Start conversation
  const handleContactAuthor = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isOwner) {
      alert("This is your own listing!");
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post('/conversations', {
        recipientId: post.author._id,
        postId: post._id,
      });

      if (res.success && res.data) {
        navigate(`/messages?conversationId=${res.data._id}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to initiate conversation.');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle bookmark save
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSaving(true);
      if (isSaved) {
        await api.delete(`/posts/${post._id}/save`);
        setIsSaved(false);
      } else {
        await api.post(`/posts/${post._id}/save`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    } finally {
      setSaving(false);
    }
  };

  // Update status (Owner / Admin)
  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this listing as ${newStatus}?`)) return;

    try {
      setActionLoading(true);
      const res = await api.patch(`/posts/${post._id}/status`, { status: newStatus });
      if (res.success) {
        setPost({ ...post, status: newStatus });
      }
    } catch (err) {
      alert(err.message || 'Failed to update listing status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete post
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;

    try {
      setActionLoading(true);
      const res = await api.delete(`/posts/${post._id}`);
      if (res.success) {
        navigate('/feed');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete listing.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading listing details...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Listing Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || 'The requested listing does not exist.'}</p>
        <Link to="/feed" className="btn btn-primary">Back to Feed</Link>
      </div>
    );
  }

  const {
    type,
    title,
    description,
    category,
    images,
    location,
    status,
    details,
    author,
    tags,
    createdAt,
  } = post;

  const defaultImage =
    type === 'LOST_FOUND'
      ? 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800'
      : type === 'MARKETPLACE'
      ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'
      : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800';

  const mainImage = images && images.length > 0 ? images[0] : defaultImage;

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '2rem' }} className="post-detail-layout">
        {/* Left Column: Post Details */}
        <div>
          {/* Main Photo Banner */}
          <div style={{ position: 'relative', height: '380px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: '#e2e8f0', marginBottom: '1.75rem', boxShadow: 'var(--shadow-md)' }}>
            <img
              src={mainImage}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Badges */}
            <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', display: 'flex', gap: '0.625rem' }}>
              {type === 'LOST_FOUND' && (
                <Badge type="LOST_FOUND" itemState={details?.itemState} status={status} />
              )}
              {type === 'MARKETPLACE' && (
                <>
                  <span className="badge" style={{ background: '#10b981', color: '#fff', fontSize: '0.9rem', padding: '0.4rem 0.85rem', fontWeight: 800 }}>
                    ₹{details?.price !== undefined ? details.price : 'Free'}
                  </span>
                  {status !== 'ACTIVE' && <Badge status={status} />}
                </>
              )}
              {type === 'COLLABORATION' && (
                <>
                  <Badge type="COLLABORATION">
                    {details?.collaborationType ? details.collaborationType.replace('_', ' ') : 'COLLAB'}
                  </Badge>
                  {status !== 'ACTIVE' && <Badge status={status} />}
                </>
              )}
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{category}</span>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} />
                <span>Posted {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {location && (
                <>
                  <span>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} color="var(--primary)" />
                    <span>{location}</span>
                  </div>
                </>
              )}
            </div>

            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '1.25rem', lineHeight: 1.3 }}>
              {title}
            </h1>

            {/* Category-Specific Highlight Box */}
            {type === 'MARKETPLACE' && (
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>PRICE</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>₹{details?.price}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONDITION</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{details?.condition || 'GOOD'}</div>
                </div>
                {details?.itemType && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ITEM TYPE</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{details.itemType}</div>
                  </div>
                )}
              </div>
            )}

            {type === 'LOST_FOUND' && (
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: details?.itemState === 'LOST' ? 'var(--danger)' : 'var(--success)' }}>
                    {details?.itemState === 'LOST' ? 'Item Was Lost' : 'Item Was Found'}
                  </div>
                </div>
                {details?.dateOccurred && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DATE OCCURRED</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{new Date(details.dateOccurred).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            )}

            {type === 'COLLABORATION' && (
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                  {details?.subject && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DOMAIN / SUBJECT</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{details.subject}</div>
                    </div>
                  )}
                  {details?.availability && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVAILABILITY</div>
                      <div style={{ fontSize: '1rem', fontWeight: 700 }}>{details.availability}</div>
                    </div>
                  )}
                </div>

                {details?.skills && details.skills.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.35rem' }}>SKILLS NEEDED</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {details.skills.map((skill, i) => (
                        <span key={i} style={{ background: '#e0e7ff', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: 600 }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Description</h3>
              <p style={{ color: 'var(--text-main)', lineHeight: 1.7, fontSize: '0.975rem', whiteSpace: 'pre-line' }}>
                {description}
              </p>
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <Tag size={15} color="var(--text-muted)" />
                {tags.map((tag, idx) => (
                  <span key={idx} style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.775rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Author Card & Action Buttons */}
        <div>
          {/* Action Card */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            {isOwner ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Manage Your Listing
                </h4>

                {type === 'LOST_FOUND' && status === 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange('RESOLVED')}
                    className="btn btn-primary"
                    disabled={actionLoading}
                    style={{ width: '100%', background: '#10b981' }}
                  >
                    <CheckCircle size={16} />
                    <span>Mark as Recovered / Resolved</span>
                  </button>
                )}

                {type === 'MARKETPLACE' && status === 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange('SOLD')}
                    className="btn btn-primary"
                    disabled={actionLoading}
                    style={{ width: '100%', background: '#10b981' }}
                  >
                    <CheckCircle size={16} />
                    <span>Mark as Sold</span>
                  </button>
                )}

                {status === 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange('CLOSED')}
                    className="btn btn-secondary"
                    disabled={actionLoading}
                    style={{ width: '100%' }}
                  >
                    Close Listing
                  </button>
                )}

                {status !== 'ACTIVE' && (
                  <button
                    onClick={() => handleStatusChange('ACTIVE')}
                    className="btn btn-secondary"
                    disabled={actionLoading}
                    style={{ width: '100%' }}
                  >
                    Re-open Listing
                  </button>
                )}

                <Link
                  to={`/edit-post/${post._id}`}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Edit size={16} />
                  <span>Edit Details</span>
                </Link>

                <button
                  onClick={handleDeletePost}
                  className="btn btn-danger"
                  disabled={actionLoading}
                  style={{ width: '100%' }}
                >
                  <Trash2 size={16} />
                  <span>Delete Listing</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <button
                  onClick={handleContactAuthor}
                  disabled={actionLoading || status !== 'ACTIVE'}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  <MessageSquare size={18} />
                  <span>Message Author</span>
                </button>

                <button
                  onClick={handleToggleSave}
                  disabled={saving}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
                  <span>{isSaved ? 'Saved in Bookmarks' : 'Save to Bookmarks'}</span>
                </button>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="btn btn-sm"
                  style={{ color: 'var(--text-muted)', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  <AlertTriangle size={14} color="var(--danger)" />
                  <span>Report this listing</span>
                </button>
              </div>
            )}
          </div>

          {/* Author Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Listing Author
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <img
                src={author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={author?.name}
                style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{author?.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {author?.department || 'Apex Institute Student'}
                </div>
                {author?.year && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                    {author.year}
                  </div>
                )}
              </div>
            </div>

            <Link
              to={`/profile/${author?._id}`}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <UserIcon size={14} />
              <span>View Public Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="POST"
        targetId={post._id}
        targetTitle={post.title}
      />

      <style>{`
        @media (max-width: 860px) {
          .post-detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
