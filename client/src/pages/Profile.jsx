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
    <div className="container profile-container">
      {/* Responsive Profile Header Card */}
      <div className="card profile-card">
        <div className="profile-main-info">
          <div className="profile-avatar-wrap">
            {student.avatarUrl ? (
              <img
                src={student.avatarUrl}
                alt={student.name}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-initials">
                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
              </div>
            )}
          </div>

          <div className="profile-details">
            <div className="profile-title-row">
              <h1 className="profile-name">{student.name}</h1>
              {student.role === 'ADMIN' ? (
                <span className="badge" style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid #e8b8b4' }}>
                  ADMIN
                </span>
              ) : (
                <span className="badge" style={{ background: 'rgba(52, 74, 50, 0.12)', color: 'var(--forest)', border: '1px solid rgba(52, 74, 50, 0.25)' }}>
                  STUDENT
                </span>
              )}
            </div>

            <div className="profile-meta-grid">
              {student.department && (
                <div className="profile-meta-item">
                  <Building size={15} strokeWidth={1.8} color="var(--primary)" aria-hidden="true" />
                  <span>{student.department}</span>
                </div>
              )}
              {student.year && (
                <div className="profile-meta-item">
                  <GraduationCap size={15} strokeWidth={1.8} color="var(--primary)" aria-hidden="true" />
                  <span>{student.year}</span>
                </div>
              )}
              <div className="profile-meta-item">
                <CalendarDays size={15} strokeWidth={1.8} aria-hidden="true" />
                <span>Joined {new Date(student.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="profile-meta-item">
                <Smartphone size={15} strokeWidth={1.8} color="var(--forest)" aria-hidden="true" />
                <span>Campus Verified</span>
              </div>
            </div>

            {student.bio && (
              <p className="profile-bio">
                {student.bio}
              </p>
            )}

            {/* Profile Quick Stats */}
            <div className="profile-stats-row">
              <div className="profile-stat-box">
                <span className="profile-stat-value">{posts?.length || 0}</span>
                <span className="profile-stat-label">Active Listings</span>
              </div>
              <div className="profile-stat-box">
                <span className="profile-stat-value">
                  {new Date(student.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                </span>
                <span className="profile-stat-label">Member Since</span>
              </div>
              <div className="profile-stat-box">
                <span className="profile-stat-value" style={{ fontSize: '1rem', paddingTop: '0.2rem' }}>
                  Active
                </span>
                <span className="profile-stat-label">Community Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Action Buttons */}
        <div className="profile-actions">
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
