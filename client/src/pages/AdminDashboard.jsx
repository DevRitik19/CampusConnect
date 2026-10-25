import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  Trash2,
  UserX,
  UserCheck,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import api from '../services/api';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('OPEN'); // 'OPEN', 'REVIEWED', 'DISMISSED', 'ALL'
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/reports?status=${filterStatus}`);
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filterStatus]);

  // Update report review status
  const handleUpdateStatus = async (reportId, status) => {
    try {
      setActionLoading(true);
      const res = await api.patch(`/admin/reports/${reportId}`, { status });
      if (res.success) {
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status } : r))
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update report status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove offending post
  const handleRemovePost = async (reportId, postId) => {
    if (!window.confirm('Are you sure you want to delete this reported post from the database?')) return;
    try {
      setActionLoading(true);
      await api.delete(`/admin/posts/${postId}`);
      await api.patch(`/admin/reports/${reportId}`, { status: 'REVIEWED' });
      fetchReports();
    } catch (err) {
      alert(err.message || 'Failed to remove post.');
    } finally {
      setActionLoading(false);
    }
  };

  // Suspend/Reactivate user
  const handleToggleUserStatus = async (reportId, userId, newStatus) => {
    const actionName = newStatus ? 'reactivate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${actionName} this user account?`)) return;

    try {
      setActionLoading(true);
      await api.patch(`/admin/users/${userId}/status`, { isActive: newStatus });
      fetchReports();
    } catch (err) {
      alert(err.message || `Failed to ${actionName} user.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', fontWeight: 800, fontSize: '0.85rem' }}>
            <ShieldAlert size={20} />
            <span>MODERATION HEADQUARTERS</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
            Admin Moderation Dashboard
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            Review student reports, take down inappropriate content, and enforce campus safety standards.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setFilterStatus('OPEN')}
          className={`btn btn-sm ${filterStatus === 'OPEN' ? 'btn-danger' : 'btn-secondary'}`}
        >
          Pending Open Reports
        </button>
        <button
          onClick={() => setFilterStatus('REVIEWED')}
          className={`btn btn-sm ${filterStatus === 'REVIEWED' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Resolved / Reviewed
        </button>
        <button
          onClick={() => setFilterStatus('DISMISSED')}
          className={`btn btn-sm ${filterStatus === 'DISMISSED' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Dismissed Reports
        </button>
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`btn btn-sm ${filterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Reports
        </button>
      </div>

      {/* Report items */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : reports.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {reports.map((report) => (
            <div
              key={report._id}
              className="card"
              style={{
                padding: '1.75rem',
                borderLeft: `5px solid ${
                  report.status === 'OPEN'
                    ? 'var(--danger)'
                    : report.status === 'REVIEWED'
                    ? 'var(--success)'
                    : '#94a3b8'
                }`,
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        background: '#fee2e2',
                        color: 'var(--danger)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                      }}
                    >
                      {report.reason}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Reported on {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Target: {report.targetType} ({report.targetId})
                  </h3>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {report.status === 'OPEN' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(report._id, 'REVIEWED')}
                        disabled={actionLoading}
                        className="btn btn-sm"
                        style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                      >
                        <CheckCircle size={14} />
                        <span>Mark Reviewed</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(report._id, 'DISMISSED')}
                        disabled={actionLoading}
                        className="btn btn-secondary btn-sm"
                      >
                        <XCircle size={14} />
                        <span>Dismiss</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {report.description && (
                <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  <strong>Reporter Note:</strong> "{report.description}"
                </div>
              )}

              {/* Target Details Preview */}
              {report.targetData && (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1rem', background: '#fafafa' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    CONTENT PREVIEW
                  </div>
                  {report.targetType === 'POST' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{report.targetData.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Author: {report.targetData.author?.name} ({report.targetData.author?.email})
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleRemovePost(report._id, report.targetId)}
                          disabled={actionLoading}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={14} />
                          <span>Delete Post</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {report.targetType === 'USER' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{report.targetData.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {report.targetData.email} • Status: {report.targetData.isActive ? 'Active' : 'Suspended'}
                        </div>
                      </div>

                      <div>
                        {report.targetData.isActive ? (
                          <button
                            onClick={() => handleToggleUserStatus(report._id, report.targetId, false)}
                            disabled={actionLoading}
                            className="btn btn-danger btn-sm"
                          >
                            <UserX size={14} />
                            <span>Suspend User</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleUserStatus(report._id, report.targetId, true)}
                            disabled={actionLoading}
                            className="btn btn-primary btn-sm"
                          >
                            <UserCheck size={14} />
                            <span>Reactivate User</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Reporter details */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Reported by student: <strong>{report.reporter?.name || 'Anonymous'}</strong> ({report.reporter?.email})
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle size={40} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No reports in this category
          </h3>
          <p style={{ fontSize: '0.9rem' }}>
            All reports have been reviewed and resolved. The campus community is safe and clean.
          </p>
        </div>
      )}
    </div>
  );
};
