import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  UserRound,
  CalendarDays,
  Layers,
  Send,
  Pencil,
  Flag,
  GraduationCap,
  Building,
  GitCommit,
  Smartphone,
} from 'lucide-react';
import api from '../services/api';
import { PostCard } from '../components/PostCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ReportModal } from '../components/ReportModal';

export const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/${id}`);
        if (res.success && res.data) {
          setProfileData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Student profile not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const isSelf = currentUser && profileData && currentUser._id === profileData.user._id;

  const handleStartMessage = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post('/conversations', {
        recipientId: profileData.user._id,
      });
      if (res.success && res.data) {
        navigate(`/messages?conversationId=${res.data._id}`);
      }
    } catch (err) {
      alert(err.message || 'Failed to start conversation.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading student profile...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Profile Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>{error}</p>
        <Link to="/feed" className="btn btn-primary">Return to Feed</Link>
      </div>
    );
  }

  const { user: student, posts } = profileData;

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Profile Header Card */}
      <div
        className="card"
        style={{
          padding: '2.5rem',
          marginBottom: '2.5rem',
          background: 'var(--bg-surface)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem', flexWrap: 'wrap' }}>
          <img
            src={student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt={student.name}
            style={{
              width: '5.5rem',
              height: '5.5rem',
              borderRadius: '9999px',
              objectFit: 'cover',
              border: '2px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{student.name}</h1>
              {student.role === 'ADMIN' && (
                <span className="badge" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #e8b8b4' }}>
                  ADMIN
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {student.department && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building size={15} strokeWidth={1.8} color="var(--primary)" aria-hidden="true" />
                  <span>{student.department}</span>
                </div>
              )}
              {student.year && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <GraduationCap size={15} strokeWidth={1.8} color="var(--primary)" aria-hidden="true" />
                  <span>{student.year}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CalendarDays size={15} strokeWidth={1.8} aria-hidden="true" />
                <span>Joined {new Date(student.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Smartphone size={15} strokeWidth={1.8} color="var(--forest)" aria-hidden="true" />
                <span>Campus Verified</span>
              </div>
            </div>

            {student.bio && (
              <p style={{ fontSize: '0.925rem', color: 'var(--text-main)', maxWidth: '580px', lineHeight: 1.5 }}>
                {student.bio}
              </p>
            )}
          </div>
        </div>

        {/* Profile Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {isSelf ? (
            <Link to="/profile/edit" className="btn btn-secondary">
              <Pencil size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>Edit Profile</span>
            </Link>
          ) : (
            <>
              <button onClick={handleStartMessage} className="btn btn-primary">
                <Send size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>Send Message</span>
              </button>
              <button
                onClick={() => setReportModalOpen(true)}
                className="btn btn-secondary"
                aria-label="Report student profile"
                title="Report User"
              >
                <Flag size={16} strokeWidth={1.8} color="var(--danger)" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* GitHub & Campus Contribution Heatmap Card */}
      <div
        className="card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <GitCommit size={14} strokeWidth={1.8} aria-hidden="true" />
              Activity & Contribution Matrix
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '0.2rem' }}>
              Campus Activity & Open-Source Commits
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Year Total: </span>
              <span className="stat-value">284 contributions</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Longest Streak: </span>
              <span className="stat-value">22 days</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Current Streak: </span>
              <span className="stat-value">5 days</span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid Container */}
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '4px', minWidth: '720px' }}>
            {Array.from({ length: 44 }).map((_, colIdx) => (
              <div key={colIdx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Array.from({ length: 7 }).map((_, rowIdx) => {
                  // Deterministic pseudo-pattern based on index
                  const pseudoVal = (colIdx * 7 + rowIdx * 13 + (student.name?.length || 5) * 17) % 19;
                  let level = 0;
                  if (pseudoVal > 15) level = 5;
                  else if (pseudoVal > 11) level = 4;
                  else if (pseudoVal > 7) level = 3;
                  else if (pseudoVal > 4) level = 2;
                  else if (pseudoVal > 2) level = 1;

                  return (
                    <div
                      key={rowIdx}
                      className={`heatmap-${level}`}
                      title={`${level > 0 ? level * 2 : 0} activities on week ${colIdx + 1}, day ${rowIdx + 1}`}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '3px',
                        border: '1px solid var(--border)',
                        transition: 'transform 0.15s ease',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ fontFamily: 'var(--font-mono)' }}>Academic Term 2026</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>Less</span>
            <div className="heatmap-0" style={{ width: '10px', height: '10px', borderRadius: '2px', border: '1px solid var(--border)' }} />
            <div className="heatmap-1" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
            <div className="heatmap-2" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
            <div className="heatmap-3" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
            <div className="heatmap-4" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
            <div className="heatmap-5" style={{ width: '10px', height: '10px', borderRadius: '2px' }} />
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Student's Listings Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Layers size={20} strokeWidth={1.8} color="var(--primary)" aria-hidden="true" />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Active Listings by {student.name.split(' ')[0]}
          </h2>
        </div>

        {posts && posts.length > 0 ? (
          <div className="grid-cards">
            {posts.map((post) => (
              <PostCard key={post._id} post={{ ...post, author: student }} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>This student currently has no active listings.</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="USER"
        targetId={student._id}
        targetTitle={student.name}
      />
    </div>
  );
};
