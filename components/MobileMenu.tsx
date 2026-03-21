import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const categories = [
    { label: 'Technology', icon: '⬡' },
    { label: 'Artificial Intelligence', icon: '◈' },
    { label: 'Markets', icon: '◎' },
    { label: 'Business', icon: '◇' },
    { label: 'Politics', icon: '◉' },
    { label: 'Geopolitics', icon: '◈' },
    { label: 'Science', icon: '⬡' },
    { label: 'Wealth', icon: '◎' },
  ];

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Editorial', path: '/editorial' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <style>{`
        @keyframes menu-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes menu-slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .menu-item-hover:hover { background: rgba(255,255,255,0.04); }
        .cat-item-hover:hover { background: rgba(255,255,255,0.03); }
      `}</style>

      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 49,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          }}
        />
      )}

      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '320px',
          zIndex: 50,
          background: '#0a0a0a',
          borderLeft: '1px solid #1a1a1a',
          overflowY: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        {/* TOP BAR */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: '60px',
          borderBottom: '1px solid #111',
          position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 10,
        }}>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '9px', letterSpacing: '0.3em',
            textTransform: 'uppercase', color: '#333',
          }}>
            TelierNews
          </span>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              border: '1px solid #1e1e1e', background: 'transparent',
              color: '#555', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget).style.borderColor = '#fff'; (e.currentTarget).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget).style.borderColor = '#1e1e1e'; (e.currentTarget).style.color = '#555'; }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* MAIN NAV */}
        <div style={{ padding: '12px 12px 0' }}>
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className="menu-item-hover"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 12px', borderRadius: '10px',
                  textDecoration: 'none', marginBottom: '2px',
                  background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  transition: 'background 0.2s',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Active indicator */}
                {active && (
                  <div style={{
                    position: 'absolute', right: 0, top: '20%', bottom: '20%',
                    width: '3px', borderRadius: '2px',
                    background: 'linear-gradient(180deg, #fff 0%, #888 100%)',
                  }} />
                )}
                <span style={{
                  fontSize: '15px', fontWeight: active ? 600 : 400,
                  color: active ? '#fff' : '#888',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s',
                }}>
                  {item.label}
                </span>
                <svg width="14" height="14" fill="none" stroke={active ? '#fff' : '#333'} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>

        {/* DIVIDER */}
        <div style={{ height: '1px', background: '#111', margin: '16px 20px' }} />

        {/* CATEGORIES */}
        <div style={{ padding: '0 12px' }}>
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '8px', color: '#333',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            padding: '0 12px', marginBottom: '8px',
          }}>
            Categories
          </p>

          {categories.map((cat) => {
            const catPath = `/category/${cat.label}`;
            const active = location.pathname === catPath;
            return (
              <Link
                key={cat.label}
                to={catPath}
                onClick={onClose}
                className="cat-item-hover"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 12px', borderRadius: '8px',
                  textDecoration: 'none', marginBottom: '1px',
                  background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <span style={{
                  fontSize: '11px', color: active ? '#fff' : '#333',
                  lineHeight: 1, flexShrink: 0,
                }}>
                  {cat.icon}
                </span>
                <span style={{
                  fontSize: '13px', fontWeight: active ? 500 : 400,
                  color: active ? '#ddd' : '#666',
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s',
                }}>
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* BOTTOM */}
        <div style={{
          margin: '24px 20px 32px',
          paddingTop: '20px',
          borderTop: '1px solid #111',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '8px', color: '#222',
            letterSpacing: '0.15em', textTransform: 'uppercase',
          }}>
            © {new Date().getFullYear()} TelierNews
          </p>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '8px', color: '#1e1e1e',
            letterSpacing: '0.1em',
          }}>
            v2.0
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
