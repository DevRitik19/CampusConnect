import React, { useState } from 'react';
import { CalendarDays, MapPin, ExternalLink, Bookmark, Share2, Volume2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EventCard = ({ event, onSaveChange, initialSaved = false }) => {
  const { user, isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(
    initialSaved || user?.savedEvents?.some((id) => (typeof id === 'string' ? id : id?._id) === event._id)
  );
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const isAudioEvent = ['Cultural', 'Club Activity', 'Seminar'].includes(category);

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

  const handleShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.origin + `/events#${_id}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      console.warn('Clipboard share failed', e);
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Event Banner */}
      <div style={{ position: 'relative', height: '170px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
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
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{month}</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--forest)', lineHeight: 1 }}>{day}</div>
        </div>

        {/* Top Right Action Buttons: Share & Save */}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.4rem', zIndex: 3 }}>
          <button
            onClick={handleShare}
            title={copied ? 'Link Copied!' : 'Share Event'}
            aria-label={copied ? 'Event link copied' : 'Share event link'}
            style={{
              background: copied ? 'var(--forest)' : 'rgba(255, 255, 255, 0.9)',
              color: copied ? '#fff' : 'var(--text-main)',
              width: '2rem',
              height: '2rem',
              borderRadius: '9999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Share2 size={13} strokeWidth={1.8} aria-hidden="true" />
          </button>

          <button
            onClick={handleToggleSave}
            disabled={saving}
            title={isSaved ? 'Remove from Saved' : 'Save Event'}
            aria-label={isSaved ? 'Remove from saved events' : 'Save event to bookmarks'}
            style={{
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
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Bookmark size={14} strokeWidth={1.8} fill={isSaved ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </div>

        {/* Category tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '0.75rem',
            right: '0.75rem',
            background: 'rgba(38, 53, 36, 0.75)',
            color: '#fff',
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '0.18rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          {isAudioEvent && <Volume2 size={12} strokeWidth={1.8} aria-hidden="true" />}
          <span>{category}</span>
        </div>
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
            <CalendarDays size={13} strokeWidth={1.8} color="var(--primary)" aria-hidden="true" />
            <span>
              {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {time}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={13} strokeWidth={1.8} color="var(--text-muted)" aria-hidden="true" />
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
              <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
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
