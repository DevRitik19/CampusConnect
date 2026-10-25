import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Tag } from 'lucide-react';
import { Badge } from './Badge';

export const PostCard = ({ post }) => {
  const {
    _id,
    type,
    title,
    category,
    images,
    location,
    status,
    details,
    author,
    createdAt,
  } = post;

  // Placeholder images according to category
  const defaultImage =
    type === 'LOST_FOUND'
      ? 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600'
      : type === 'MARKETPLACE'
      ? 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'
      : 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600';

  const imageUrl = images && images.length > 0 ? images[0] : defaultImage;

  // Time formatter
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Thumbnail */}
      <Link to={`/posts/${_id}`} style={{ position: 'relative', display: 'block', height: '190px', overflow: 'hidden', background: '#f1f5f9' }}>
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        />

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem', zIndex: 2 }}>
          {type === 'LOST_FOUND' && (
            <Badge type="LOST_FOUND" itemState={details?.itemState} status={status} />
          )}

          {type === 'MARKETPLACE' && (
            <>
              <span className="badge" style={{ background: '#10b981', color: '#fff', border: 'none', fontWeight: 800 }}>
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

        {/* Category tag */}
        <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
          {category}
        </div>
      </Link>

      {/* Body */}
      <div style={{ padding: '1.15rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Link to={`/posts/${_id}`}>
          <h3
            style={{
              fontSize: '1.05rem',
              fontWeight: 700,
              lineHeight: 1.35,
              marginBottom: '0.625rem',
              color: 'var(--text-main)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.7rem',
            }}
          >
            {title}
          </h3>
        </Link>

        {/* Location & Time info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
          {location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <MapPin size={13} color="var(--primary)" />
              <span>{location}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
            <Clock size={13} />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>

        {/* Author Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src={author?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
              alt={author?.name || 'Student'}
              style={{ width: '1.75rem', height: '1.75rem', borderRadius: '9999px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {author?.name || 'Anonymous Student'}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {author?.department ? author.department.split('&')[0] : 'Campus Student'}
              </div>
            </div>
          </div>

          <Link
            to={`/posts/${_id}`}
            style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
};
