import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Plus, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import { EventCard } from '../components/EventCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const Events = () => {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Event Form State (Admin only)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    venue: '',
    startsAt: '',
    endsAt: '',
    registrationUrl: '',
    imageUrl: '',
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);

      const res = await api.get(`/events?${params.toString()}`);
      if (res.success) {
        setEvents(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const categories = [
    'All',
    'Workshop',
    'Hackathon',
    'Cultural',
    'Sports',
    'Club Activity',
    'Official Notice',
    'Seminar',
  ];

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    try {
      const res = await api.post('/events', formData);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          category: 'Workshop',
          venue: '',
          startsAt: '',
          endsAt: '',
          registrationUrl: '',
          imageUrl: '',
        });
        fetchEvents();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to publish event. Please verify all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      {/* Header Banner */}
      <div className="page-hero">
        <div style={{ maxWidth: '640px' }}>
          <div className="page-hero-label">Campus Calendar</div>
          <h1>Campus Events & Announcements</h1>
          <p>
            Discover workshops, hackathons, sports tournaments, and official administrative notices from Scaler School of Technology.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary btn-lg"
          >
            <Plus size={18} strokeWidth={2} aria-hidden="true" />
            <span>Publish Official Event</span>
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginRight: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <SlidersHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>Categories:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Events */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : events.length > 0 ? (
        <div className="grid-cards">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          title="No events scheduled in this category"
          description="Check back soon for upcoming campus notices, workshops, or club inductions."
        />
      )}

      {/* Admin Publish Event Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Publish Official Event</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close publish event modal"
                style={{ color: 'var(--text-muted)', border: 'none', background: 'transparent', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ padding: '1.5rem' }}>
              {formError && (
                <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  {formError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HackApex 2026: 36hr Hackathon"
                  className="form-control"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Sports">Sports</option>
                    <option value="Club Activity">Club Activity</option>
                    <option value="Official Notice">Official Notice</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Venue / Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditorium Hall A"
                    className="form-control"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Starts At *</label>
                  <input
                    type="datetime-local"
                    required
                    className="form-control"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ends At (Optional)</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Details about prizes, rules, registration deadlines, and schedule..."
                  className="form-control"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Registration URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://forms.google.com/..."
                  className="form-control"
                  value={formData.registrationUrl}
                  onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Poster Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  className="form-control"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? 'Publishing...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
