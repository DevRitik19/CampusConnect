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
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            background: 'var(--bg-surface)'
          }}
        >
          <div style={{ height: '180px', background: '#e2e8f0', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
          <div style={{ height: '20px', width: '40%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '0.75rem' }} />
          <div style={{ height: '24px', width: '80%', background: '#e2e8f0', borderRadius: '4px', marginBottom: '0.5rem' }} />
          <div style={{ height: '16px', width: '90%', background: '#f1f5f9', borderRadius: '4px', marginTop: 'auto' }} />
        </div>
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
