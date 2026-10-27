import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PackageSearch,
  ShoppingBag,
  Users,
  CalendarDays,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { EventCard } from '../components/EventCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const Landing = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsRes, eventsRes] = await Promise.all([
          api.get('/posts?limit=6'),
          api.get('/events?limit=3&upcoming=true'),
        ]);

        if (postsRes.success) setRecentPosts(postsRes.data || []);
        if (eventsRes.success) setUpcomingEvents(eventsRes.data || []);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, #ede8db 0%, #F4F0E6 100%)',
          padding: '4.5rem 0 3.5rem',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container" style={{ textAlign: 'center', maxWidth: '820px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              padding: '0.35rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--primary)',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>Dedicated Campus Utility — Scaler School of Technology</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.1rem, 5vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--forest)',
              marginBottom: '1.25rem',
            }}
          >
            Everything happening around your campus, <span style={{ color: 'var(--primary)' }}>in one place.</span>
          </h1>

          <p
            style={{
              fontSize: '1.15rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '2.25rem',
              maxWidth: '680px',
              margin: '0 auto 2.25rem',
            }}
          >
            Say goodbye to cluttered WhatsApp groups and lost notices. Connect with batchmates, recover lost belongings, exchange textbooks, find hackathon teammates, and never miss an event.
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '0.5rem 0.6rem 0.5rem 1.25rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
              border: '1px solid var(--border)',
              maxWidth: '640px',
              margin: '0 auto 2.5rem',
            }}
          >
            <Search size={20} strokeWidth={1.8} color="var(--text-muted)" style={{ marginRight: '0.75rem', flexShrink: 0 }} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search for lost items, books, hackathons, or study groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '1rem',
                color: 'var(--text-main)',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              Search
            </button>
          </form>

          {/* Category Shortcut Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem',
              textAlign: 'left',
            }}
          >
            <Link
              to="/lost-found"
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PackageSearch size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.975rem', fontWeight: 700 }}>Lost & Found</h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Report or claim lost belongings</p>
              </div>
            </Link>

            <Link
              to="/marketplace"
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--warning-light)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.975rem', fontWeight: 700 }}>Marketplace</h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Used books, calculators & desks</p>
              </div>
            </Link>

            <Link
              to="/collaborate"
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--forest-light)',
                  color: 'var(--forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.975rem', fontWeight: 700 }}>Collaborate</h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Hackathon partners & study pods</p>
              </div>
            </Link>

            <Link
              to="/events"
              className="card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarDays size={20} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.975rem', fontWeight: 700 }}>Campus Events</h4>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Workshops, clubs & hackathons</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Listings Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <span className="section-label">Latest Updates</span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Recent Campus Listings</h2>
            </div>
            <Link to="/feed" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>View All Listings</span>
              <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : recentPosts.length > 0 ? (
            <div className="grid-cards">
              {recentPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No campus listings yet. Be the first to publish one!
            </p>
          )}
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <span className="section-label">Official Campus Calendar</span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Upcoming Events & Notices</h2>
            </div>
            <Link to="/events" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Browse All Events</span>
              <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : upcomingEvents.length > 0 ? (
            <div className="grid-cards">
              {upcomingEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No upcoming events scheduled right now. Check back soon.
            </p>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            How CampusConnect Works
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 3rem', fontSize: '1rem' }}>
            A streamlined 3-step community workflow built strictly for college students.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid #e8c8bc',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Verify College Identity
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Sign up with your email. All bona fide campus members can publish listings, collaborate on projects, and send messages.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: 'var(--warning-light)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid #e8d5a0',
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Post or Discover Items
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Report a lost ID card, list your used engineering textbook for ₹300, or recruit a React coder for the campus hackathon.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid #b8d5c4',
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Chat & Meet on Campus
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Exchange direct messages without sharing personal phone numbers. Meet safely in the student center or central library.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Moderation CTA Banner */}
      <section style={{ padding: '3.5rem 0 5rem' }}>
        <div className="container">
          <div
            style={{
              background: 'var(--forest)',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 2.5rem',
              color: '#ffffff',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                <ShieldCheck size={16} strokeWidth={1.8} style={{ color: 'var(--primary)' }} aria-hidden="true" />
                <span>Safety-First Community</span>
              </div>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25, color: '#ffffff' }}>
                Ready to join your campus hub?
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', lineHeight: 1.65 }}>
                Sign in with your student credentials or register your college account in less than 60 seconds.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
