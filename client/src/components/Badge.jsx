import React from 'react';

export const Badge = ({ type, itemState, status, children }) => {
  if (status && status !== 'ACTIVE') {
    return <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;
  }

  if (type === 'LOST_FOUND') {
    if (itemState === 'LOST') {
      return <span className="badge badge-lost">LOST ITEM</span>;
    }
    return <span className="badge badge-found">FOUND ITEM</span>;
  }

  if (type === 'MARKETPLACE') {
    return <span className="badge badge-marketplace">{children || 'MARKET'}</span>;
  }

  if (type === 'COLLABORATION') {
    return <span className="badge badge-collab">{children || 'COLLAB'}</span>;
  }

  return <span className="badge badge-collab">{children}</span>;
};
