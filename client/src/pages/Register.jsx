import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [year, setYear] = useState('1st Year');
  const [bio, setBio] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.toLowerCase().endsWith('@campus.edu')) {
      setError('Please use your official college email ending with @campus.edu');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    const result = await register({
      name,
      email,
      password,
      department,
      year,
      bio,
    });
    setSubmitting(false);

    if (result.success) {
      navigate('/feed');
    } else {
      setError(result.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div
      style={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1.25rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              color: '#fff',
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
            }}
          >
            <Layers size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Student Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Join the verified Apex Institute of Technology campus network
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid #fecaca',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Aman Sharma"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">College Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g. aman@campus.edu"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="form-hint">
              Registration is restricted to college students with <code>@campus.edu</code> domain.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-control"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="Computer Science & Engineering">Computer Science & Eng</option>
                <option value="Electronics & Communication">Electronics & Comm</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Biotechnology">Biotechnology</option>
                <option value="Management Studies">Management Studies</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select
                className="form-control"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Short Bio (Optional)</label>
            <textarea
              rows="2"
              placeholder="e.g. Hostel 3 resident, interested in robotics & web development."
              className="form-control"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {submitting ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.75rem' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Log In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
