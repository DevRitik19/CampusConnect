import React from 'react';
import { FolderSearch, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  icon: Icon = FolderSearch,
  title = 'No listings found',
  description = 'Try adjusting your search filters or check back later for new campus posts.',
  actionText,
  actionLink,
  onAction,
}) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border)',
        maxWidth: '520px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '9999px',
          background: 'var(--primary-light)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}
      >
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
        {description}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          <Plus size={16} />
          {actionText}
        </Link>
      )}

      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-secondary btn-sm">
          {actionText}
        </button>
      )}
    </div>
  );
};
