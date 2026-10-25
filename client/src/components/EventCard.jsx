import React, { useState } from 'react';
import { Calendar, MapPin, ExternalLink, Bookmark } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EventCard = ({ event, onSaveChange, initialSaved = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(
    initialSaved || user?.savedEvents?.some((id) => (typeof id === 'string' ? id : id?._id) === event._id)
  );
  const [saving, setSaving] = useState(false);

  const {
    _id,
    title,
    description,
    category,
    venue,
    startsAt,
    registrationUrl,
    imageUrl,
    status,
  } = event;

  const eventDate = new Date(startsAt);
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();
  const time = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      alert('Please log in to save events to your bookmarks.');
      return;
    }
    setSaving(true);
    try {
      if (isSaved) {
        await api.delete(`/events/${_id}/save`);
        setIsSaved(false);
      } else {
        await api.post(`/events/${_id}/save`);
        setIsSaved(true);
      }
      if (onSaveChange) onSaveChange(_id, !isSaved);
    } catch (err) {
      console.error('Failed to toggle save event:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Event Banner */}
      <div style={{ position: 'relative', height: '170px', overflow: 'hidden', background: '#e2e8f0' }}>
        <img
          src={
            imageUrl ||
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
          }
          alt={title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Date Stamp Tag */}
        <div
          style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            borderRadius: 'var(--radius-md)',
            padding: '0.35rem 0.65rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
            minWidth: '50px',
          }}
        >
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)' }}>{month}</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', lineHeight: 1 }}>{day}</div>
        </div>

        {/* Category tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            right: '0.75rem',
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {category}
        </div>

        {/* Save button */}
        <button
          onClick={handleToggleSave}
          disabled={saving}
          title={isSaved ? 'Remove from Saved' : 'Save Event'}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: isSaved ? 'var(--primary)' : 'rgba(255, 255, 255, 0.9)',
            color: isSaved ? '#fff' : 'var(--text-main)',
            width: '2rem',
            height: '2rem',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.2s',
          }}
        >
          <Bookmark size={15} fill={isSaved ? '#fff' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            marginBottom: '0.5rem',
            lineHeight: 1.35,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </p>

        {/* Meta details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} color="var(--primary)" />
            <span>
              {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {time}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="var(--accent)" />
            <span>{venue}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {registrationUrl ? (
            <a
              href={registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              <span>Register Now</span>
              <ExternalLink size={14} />
            </a>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Free Campus Entry / No Registration Required
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
