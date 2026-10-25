import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../services/api';

export const EditProfile = () => {
  const { user, updateUserState } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [year, setYear] = useState(user?.year || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await api.patch('/users/me', {
        name,
        department,
        year,
        bio,
        avatarUrl,
      });

      if (res.success && res.data) {
        updateUserState(res.data);
        setSuccess(true);
        setTimeout(() => {
          navigate(`/profile/${user._id}`);
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '640px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="card" style={{ padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Edit Student Profile
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Update how your peers see you on CampusConnect.
        </p>

        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Profile updated successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department / Branch</label>
              <input
                type="text"
                placeholder="e.g. Computer Science & Eng"
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <select
                className="form-control"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="PhD / Research">PhD / Research</option>
                <option value="Faculty/Staff">Faculty/Staff</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Photo URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or custom avatar URL"
              className="form-control"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Short Bio</label>
            <textarea
              rows="3"
              maxLength={500}
              placeholder="Tell batchmates about your interests, clubs, or hostel..."
              className="form-control"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <span className="form-hint">{bio.length} / 500 characters</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
