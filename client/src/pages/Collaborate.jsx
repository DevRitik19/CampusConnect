import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, PlusCircle, Code, BookOpen } from 'lucide-react';
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
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#c7d2fe', letterSpacing: '0.05em' }}>
            Team Finder
          </span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            Study & Project Collaboration
          </h1>
          <p style={{ color: '#e0e7ff', fontSize: '0.95rem', marginTop: '0.4rem', lineHeight: 1.5 }}>
            Need a frontend developer for the upcoming HackApex? Or looking for a study buddy for semester exams? Find talented peers across all campus departments.
          </p>
        </div>

        <Link
          to="/create-post?type=COLLABORATION"
          className="btn btn-lg"
          style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: 700 }}
        >
          <PlusCircle size={20} />
          <span>Find Teammates</span>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
            <Search size={16} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
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
          title="No collaboration posts found"
          description="Looking for teammates or study buddies? Create the first team notice to find like-minded peers."
          actionText="Create Collaboration Post"
          actionLink="/create-post?type=COLLABORATION"
        />
      )}
    </div>
  );
};
