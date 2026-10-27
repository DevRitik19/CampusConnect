import React, { useState, useEffect } from 'react';
import { Bookmark, Layers, CalendarDays, Trash2 } from 'lucide-react';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { EventCard } from '../components/EventCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const SavedItems = () => {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'events'
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/saved');
      if (res.success && res.data) {
        setSavedPosts((res.data.posts || []).filter(Boolean));
        setSavedEvents((res.data.events || []).filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching saved items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsavePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}/save`);
      setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error('Failed to unsave post:', err);
    }
  };

  const handleEventSaveChange = (eventId, isSaved) => {
    if (!isSaved) {
      setSavedEvents((prev) => prev.filter((e) => e._id !== eventId));
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Saved Bookmarks
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Quick access to campus listings and university events you have bookmarked.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('posts')}
          className={`btn ${activeTab === 'posts' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>Saved Posts ({savedPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <CalendarDays size={16} strokeWidth={1.8} aria-hidden="true" />
          <span>Saved Events ({savedEvents.length})</span>
        </button>
      </div>

      {loading ? (
        <LoadingSkeleton count={3} />
      ) : activeTab === 'posts' ? (
        savedPosts.length > 0 ? (
          <div className="grid-cards">
            {savedPosts.map((post) => (
              <div key={post._id} style={{ position: 'relative' }}>
                <PostCard post={post} />
                <button
                  onClick={() => handleUnsavePost(post._id)}
                  title="Remove from saved"
                  aria-label="Remove from saved bookmarks"
                  className="btn btn-secondary btn-sm"
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    zIndex: 10,
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '0.35rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.8} color="var(--danger)" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bookmark}
            title="No saved listings"
            description="Bookmark items from the Lost & Found, Marketplace, or Collaboration sections to view them here later."
            actionText="Explore Campus Feed"
            actionLink="/feed"
          />
        )
      ) : (
        savedEvents.length > 0 ? (
          <div className="grid-cards">
            {savedEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                initialSaved={true}
                onSaveChange={handleEventSaveChange}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={CalendarDays}
            title="No saved events"
            description="You have not saved any upcoming workshops, club events, or hackathons."
            actionText="Browse Campus Events"
            actionLink="/events"
          />
        )
      )}
    </div>
  );
};
