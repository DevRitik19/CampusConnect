import React from 'react';

export const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid-cards">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            height: '360px',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            animation: 'shimmer 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ height: '185px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
          <div style={{ height: '14px', width: '35%', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '0.75rem' }} />
          <div style={{ height: '22px', width: '80%', background: 'var(--bg-secondary)', borderRadius: '4px', marginBottom: '0.5rem' }} />
          <div style={{ height: '14px', width: '90%', background: '#ede8db', borderRadius: '4px', marginTop: 'auto' }} />
        </div>
      ))}
    </div>
  );
};
