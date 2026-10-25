import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../services/api';

export const ReportModal = ({ isOpen, onClose, targetType, targetId, targetTitle }) => {
  const [reason, setReason] = useState('INAPPROPRIATE_CONTENT');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post('/reports', {
        targetType,
        targetId,
        reason,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Report Content
            </h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        {success ? (
          <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
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
                margin: '0 auto 1rem',
              }}
            >
              <ShieldCheck size={30} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Report Received
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Thank you for keeping our college community safe. Our moderation team will review this promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            {error && (
              <div
                style={{
                  background: 'var(--danger-light)',
                  color: 'var(--danger)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  border: '1px solid #fecaca',
                }}
              >
                {error}
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Reporting item: <strong>{targetTitle || targetType}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Reason for reporting</label>
              <select
                className="form-control"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="INAPPROPRIATE_CONTENT">Inappropriate or offensive content</option>
                <option value="SPAM">Spam or commercial promotion</option>
                <option value="FRAUD_SCAM">Suspected scam, fake item, or impersonation</option>
                <option value="HARASSMENT">Harassment or abusive behavior</option>
                <option value="DUPLICATE">Duplicate or outdated post</option>
                <option value="OTHER">Other issue</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Additional details (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Help us understand the issue by providing context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-danger btn-sm"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
