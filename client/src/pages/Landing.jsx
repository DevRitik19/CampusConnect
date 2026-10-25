import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Compass,
  ShoppingBag,
  Users,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  HelpCircle,
  MessageSquare,
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
          background: 'linear-gradient(180deg, #eef2ff 0%, #f8fafc 100%)',
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
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 700,
              color: 'var(--primary)',
              marginBottom: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <Sparkles size={16} />
            <span>Dedicated Campus Utility for Apex Institute of Technology</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--text-main)',
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
            <Search size={22} color="var(--primary)" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
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
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Search size={20} />
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
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={20} />
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
                  background: '#eef2ff',
                  color: '#4f46e5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={20} />
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
                  background: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Calendar size={20} />
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
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Latest Updates
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Recent Campus Listings</h2>
            </div>
            <Link to="/feed" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>View All Listings</span>
              <ArrowRight size={15} />
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
      <section style={{ padding: '4rem 0', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official Campus Calendar
              </span>
              <h2 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Upcoming Events & Notices</h2>
            </div>
            <Link to="/events" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Browse All Events</span>
              <ArrowRight size={15} />
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
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '9999px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Verify College Identity
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Sign up with your verified <code>@campus.edu</code> email. Only bona fide campus members can publish listings or send messages.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '9999px',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.25rem',
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
                  width: '3.5rem',
                  height: '3.5rem',
                  borderRadius: '9999px',
                  background: 'var(--success-light)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                  fontWeight: 800,
                  fontSize: '1.25rem',
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
              background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 2.5rem',
              color: '#ffffff',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2rem',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: '#a5b4fc', fontWeight: 700, fontSize: '0.85rem' }}>
                <ShieldCheck size={20} />
                <span>SAFETY FIRST COMMUNITY</span>
              </div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.25 }}>
                Ready to join your campus hub?
              </h3>
              <p style={{ color: '#c7d2fe', fontSize: '1rem', lineHeight: 1.6 }}>
                Sign in with your student credentials or register your college account in less than 60 seconds.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-lg" style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: 700 }}>
                Get Started
              </Link>
              <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
