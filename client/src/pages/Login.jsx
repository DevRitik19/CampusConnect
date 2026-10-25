import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      navigate('/feed');
    } else {
      setError(result.message || 'Login failed. Please verify your credentials.');
    }
  };

  // Quick fill demo accounts
  const fillDemoStudent = () => {
    setEmail('arjun@campus.edu');
    setPassword('Campus@123');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@campus.edu');
    setPassword('Campus@123');
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Log in to your verified Apex Institute account
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

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">College Email</label>
            <input
              type="email"
              required
              placeholder="e.g. yourname@campus.edu"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Fill Demo Credentials Buttons */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            <Sparkles size={14} color="var(--primary)" />
            <span>Quick-Fill Demonstration Accounts</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <button
              type="button"
              onClick={fillDemoStudent}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Student: Arjun
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              Admin: Dean Office
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.75rem' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
};
