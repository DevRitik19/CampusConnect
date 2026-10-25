import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', paddingTop: '3.5rem', paddingBottom: '2.5rem', borderTop: '1px solid #1e293b' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                color: '#fff',
                width: '2rem',
                height: '2rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Layers size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
                Campus<span style={{ color: '#818cf8' }}>Connect</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
              The single-college utility and community hub for students of Apex Institute of Technology. Find lost items, exchange books, discover study partners, and explore campus events.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#38bdf8' }}>
              <ShieldCheck size={16} />
              <span>Verified @campus.edu Student Network</span>
            </div>
          </div>

          {/* Quick modules */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Campus Modules
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li><Link to="/lost-found" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>Lost & Found Desk</Link></li>
              <li><Link to="/marketplace" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>Student Marketplace</Link></li>
              <li><Link to="/collaborate" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>Study & Project Teams</Link></li>
              <li><Link to="/events" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#94a3b8'}>Workshops & Hackathons</Link></li>
            </ul>
          </div>

          {/* Guidelines & Safety */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Student Safety
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '0.75rem' }}>
              Always meet in public campus zones like the Central Library, Cafeteria, or Student Center for marketplace handovers.
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94a3b8' }}>
              Inappropriate content or fraud? Use the built-in report flag on any listing.
            </p>
          </div>
        </div>

        <div style={{ paddingTop: '1.75rem', borderTop: '1px solid #1e293b', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.8rem' }}>
          <div>
            © {new Date().getFullYear()} CampusConnect. Built for college student utility.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#94a3b8' }}>
            Built with MERN Stack <Heart size={14} color="#f43f5e" fill="#f43f5e" />
          </div>
        </div>
      </div>
    </footer>
  );
};
