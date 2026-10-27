import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      background: 'var(--forest)',
      color: 'rgba(255,255,255,0.62)',
      paddingTop: '3.5rem',
      paddingBottom: '2.5rem',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'var(--primary)',
                color: '#fff',
                width: '2rem',
                height: '2rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Layers size={17} strokeWidth={1.8} aria-hidden="true" />
              </div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                Campus<span style={{ color: '#d4906e' }}>Connect</span>
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.58)', marginBottom: '1.25rem' }}>
              The single-college utility and community hub for students of Scaler School of Technology. Find lost items, exchange books, discover study partners, and explore campus events.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-mono)' }}>
              <ShieldCheck size={14} strokeWidth={1.8} style={{ color: 'var(--primary)' }} aria-hidden="true" />
              <span>Verified Scaler School of Technology Student Network</span>
            </div>
          </div>

          {/* Quick modules */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              Campus Modules
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              {[
                { to: '/lost-found', label: 'Lost & Found Desk' },
                { to: '/marketplace', label: 'Student Marketplace' },
                { to: '/collaborate', label: 'Study & Project Teams' },
                { to: '/events', label: 'Workshops & Hackathons' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    style={{ color: 'rgba(255,255,255,0.52)', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.52)'}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guidelines & Safety */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
              Student Safety
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.52)', marginBottom: '0.75rem' }}>
              Always meet in public campus zones like the Central Library, Cafeteria, or Student Center for marketplace handovers.
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'rgba(255,255,255,0.52)' }}>
              Inappropriate content or fraud? Use the built-in report flag on any listing.
            </p>
          </div>
        </div>

        <div style={{ paddingTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.78rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-mono)' }}>
            © {new Date().getFullYear()} CampusConnect — Built for college student utility.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'rgba(255,255,255,0.38)' }}>
            Built with MERN Stack <Heart size={13} strokeWidth={1.8} color="var(--primary)" fill="var(--primary)" aria-hidden="true" />
          </div>
        </div>
      </div>
    </footer>
  );
};
