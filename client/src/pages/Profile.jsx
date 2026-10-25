import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Calendar,
  Layers,
  MessageSquare,
  Edit3,
  AlertTriangle,
  GraduationCap,
  Building,
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
          background: 'linear-gradient(180deg, #ffffff 0%, var(--bg-subtle) 100%)',
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
              border: '3px solid #ffffff',
              boxShadow: 'var(--shadow-md)',
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{student.name}</h1>
              {student.role === 'ADMIN' && (
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  ADMIN
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {student.department && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Building size={15} color="var(--primary)" />
                  <span>{student.department}</span>
                </div>
              )}
              {student.year && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <GraduationCap size={15} color="var(--primary)" />
                  <span>{student.year}</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} />
                <span>Joined {new Date(student.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</span>
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
              <Edit3 size={16} />
              <span>Edit Profile</span>
            </Link>
          ) : (
            <>
              <button onClick={handleStartMessage} className="btn btn-primary">
                <MessageSquare size={16} />
                <span>Send Message</span>
              </button>
              <button onClick={() => setReportModalOpen(true)} className="btn btn-secondary" title="Report User">
                <AlertTriangle size={16} color="var(--danger)" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Student's Listings Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Layers size={20} color="var(--primary)" />
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
