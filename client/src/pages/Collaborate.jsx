import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Plus, SlidersHorizontal } from 'lucide-react';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

export const Collaborate = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collabType, setCollabType] = useState('');
  const [search, setSearch] = useState('');

  const fetchCollabPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('type', 'COLLABORATION');
      if (collabType) params.append('collaborationType', collabType);
      if (search) params.append('search', search);

      const res = await api.get(`/posts?${params.toString()}`);
      if (res.success) {
        setPosts(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching collaboration listings:', err);
    } finally {
      setLoading(false);
    }
  }, [collabType, search]);

  useEffect(() => {
    fetchCollabPosts();
  }, [fetchCollabPosts]);

  const collabTypes = [
    { id: '', label: 'All Opportunities' },
    { id: 'HACKATHON_TEAM', label: 'Hackathon Teams' },
    { id: 'STUDY_PARTNER', label: 'Study Partners' },
    { id: 'PERSONAL_PROJECT', label: 'Personal Projects' },
    { id: 'ASSIGNMENT_GROUP', label: 'Course Assignments' },
    { id: 'RESEARCH_GROUP', label: 'Research & Papers' },
  ];

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '3.5rem' }}>
      {/* Header Banner */}
      <div className="page-hero">
        <div style={{ maxWidth: '640px' }}>
          <div className="page-hero-label">Team Finder</div>
          <h1>Study & Project Collaboration</h1>
          <p>Need a frontend developer for the upcoming HackApex? Or looking for a study buddy for semester exams? Find talented peers across all campus departments.</p>
        </div>
        <Link
          to="/create-post?type=COLLABORATION"
          className="btn btn-primary btn-lg"
        >
          <Plus size={18} strokeWidth={2} aria-hidden="true" />
          <span>Post Opportunity</span>
        </Link>
      </div>

      {/* Filter and search */}
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, marginRight: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <SlidersHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
              <span>Type:</span>
            </div>
            {collabTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setCollabType(type.id)}
                className={`btn btn-sm ${collabType === type.id ? 'btn-primary' : 'btn-secondary'}`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.35rem 0.75rem', border: '1px solid var(--border)' }}>
            <Search size={16} strokeWidth={1.8} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} aria-hidden="true" />
            <input
              type="text"
              placeholder="Search skill (e.g. React, Python) or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', width: '260px' }}
            />
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
          icon={Users}
          title="No collaboration posts found"
          description="Looking for teammates or study buddies? Create the first team notice to find like-minded peers."
          actionText="Create Collaboration Post"
          actionLink="/create-post?type=COLLABORATION"
        />
      )}
    </div>
  );
};
