import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NewsArticle } from '../types';
import { fetchViews, formatViews } from '../services/articleService';
import ImageViewer, { MediaItem } from '../components/ImageViewer';

export type CardVariant = 'featured' | 'small' | 'horizontal' | 'default';

interface NewsCardProps {
  article: NewsArticle;
  variant?: CardVariant;
}

const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };
const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

const getRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days === 1) return 'Kemarin';
  return `${days} hari lalu`;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGS','SEP','OKT','NOV','DES'];
  return `${d.getDate().toString().padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getBullets = (summary: string): string[] => {
  const sentences = summary.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
  if (sentences.length >= 2) return [sentences[0], sentences[1]];
  if (sentences.length === 1) {
    const half = Math.floor(sentences[0].length / 2);
    const cut = sentences[0].lastIndexOf(' ', half);
    return [sentences[0].slice(0, cut), sentences[0].slice(cut + 1)];
  }
  return [summary];
};

const getBookmarks = (): any[] => {
  try { return JSON.parse(localStorage.getItem('tn_bookmarks') || '[]'); } catch { return []; }
};

const scanline: React.CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none',
  background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)',
};

const Badge: React.FC<{ cat: string }> = ({ cat }) => (
  <span style={{ ...mono, fontSize: '7px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#e0e0e0', padding: '2px 8px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.6)' }}>
    {cat.toUpperCase()}
  </span>
);

const ViewsBadge: React.FC<{ articleId: string }> = ({ articleId }) => {
  const [views, setViews] = useState<number | null>(null);
  useEffect(() => { fetchViews(articleId).then(setViews); }, [articleId]);
  if (views === null) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ color: '#555' }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      <span style={{ ...mono, fontSize: '9px', color: '#555', letterSpacing: '0.05em' }}>{formatViews(views)}</span>
    </div>
  );
};

const BmBtn: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(getBookmarks().some((b: any) => b.id === article.id));
    const sync = () => setSaved(getBookmarks().some((b: any) => b.id === article.id));
    window.addEventListener('bookmarks-updated', sync);
    return () => window.removeEventListener('bookmarks-updated', sync);
  }, [article.id]);
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    let bms = getBookmarks();
    const idx = bms.findIndex((b: any) => b.id === article.id);
    if (idx > -1) { bms.splice(idx, 1); setSaved(false); }
    else { bms.unshift({ id: article.id, title: article.title, category: article.category, imageUrl: article.imageUrl, publishedAt: article.publishedAt, author: article.author, savedAt: Date.now() }); setSaved(true); }
    localStorage.setItem('tn_bookmarks', JSON.stringify(bms));
    window.dispatchEvent(new Event('bookmarks-updated'));
  };
  return (
    <button onClick={toggle} style={{ width: '26px', height: '26px', borderRadius: '6px', border: saved ? '1px solid #fff' : '1px solid #1e1e1e', background: saved ? '#111' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: saved ? '#fff' : '#444', transition: 'all 0.2s', flexShrink: 0 }}>
      <svg width="11" height="11" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
    </button>
  );
};

// FEATURED
const FeaturedCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const [viewer, setViewer] = useState(false);
  const mediaItems: MediaItem[] = [{ type: 'image', url: article.imageUrl }];
  return (
    <>
      {viewer && <ImageViewer items={mediaItems} onClose={() => setViewer(false)} />}
      <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '10px' }} className="group">
        <div style={{ background: '#080808', border: '1px solid #161616', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.25s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}>
          <div style={{ position: 'relative', width: '100%', paddingTop: '56%', overflow: 'hidden' }}>
            <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)', transition: 'transform 0.6s' }}
              className="group-hover:scale-[1.03]"
              onClick={e => { e.preventDefault(); setViewer(true); }}
            />
            <div style={scanline} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '12px', left: '12px' }}><Badge cat={article.category} /></div>
            {/* Expand hint */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '4px 7px', display: 'flex', alignItems: 'center', gap: '3px', pointerEvents: 'none' }}>
              <svg width="9" height="9" fill="none" stroke="rgba(255,255,255,0.6)" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
            </div>
            <div style={{ position: 'absolute', bottom: '14px', left: '14px', right: '14px', ...m, fontSize: '17px', fontWeight: 600, color: '#fff', lineHeight: 1.3, letterSpacing: '-0.01em', pointerEvents: 'none' }}>
              {article.title}
            </div>
          </div>
          <div style={{ padding: '10px 14px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ ...mono, fontSize: '9px', color: '#444' }}>{formatDate(article.publishedAt)} \u00b7 {getRelativeTime(article.publishedAt)}</span>
              <ViewsBadge articleId={article.id} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ ...mono, fontSize: '9px', color: '#333' }}>{article.author}</span>
              <BmBtn article={article} />
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

// SMALL
const SmallCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const [viewer, setViewer] = useState(false);
  const mediaItems: MediaItem[] = [{ type: 'image', url: article.imageUrl }];
  return (
    <>
      {viewer && <ImageViewer items={mediaItems} onClose={() => setViewer(false)} />}
      <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }} className="group">
        <div style={{ background: '#080808', border: '1px solid #161616', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.25s', height: '100%' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}>
          <div style={{ position: 'relative', width: '100%', paddingTop: '68%', overflow: 'hidden' }}>
            <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)', transition: 'transform 0.5s' }}
              className="group-hover:scale-[1.05]"
              onClick={e => { e.preventDefault(); setViewer(true); }}
            />
            <div style={scanline} />
            <div style={{ position: 'absolute', top: '8px', left: '8px' }}><Badge cat={article.category} /></div>
            <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '5px', padding: '3px 5px', pointerEvents: 'none' }}>
              <svg width="8" height="8" fill="none" stroke="rgba(255,255,255,0.6)" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
            </div>
          </div>
          <div style={{ padding: '10px 10px 12px' }}>
            <div style={{ ...m, fontSize: '12px', fontWeight: 500, color: '#ddd', lineHeight: 1.4, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...mono, fontSize: '8px', color: '#444' }}>{getRelativeTime(article.publishedAt)}</span>
                <ViewsBadge articleId={article.id} />
              </div>
              <BmBtn article={article} />
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

// HORIZONTAL
const HorizontalCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const [viewer, setViewer] = useState(false);
  const mediaItems: MediaItem[] = [{ type: 'image', url: article.imageUrl }];
  return (
    <>
      {viewer && <ImageViewer items={mediaItems} onClose={() => setViewer(false)} />}
      <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '10px' }} className="group">
        <div style={{ display: 'flex', background: '#080808', border: '1px solid #161616', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.25s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}>
          <div style={{ position: 'relative', width: '110px', flexShrink: 0, overflow: 'hidden', minHeight: '90px' }}>
            <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)', transition: 'transform 0.5s', display: 'block', position: 'absolute', inset: 0 }}
              className="group-hover:scale-[1.05]"
              onClick={e => { e.preventDefault(); setViewer(true); }}
            />
            <div style={scanline} />
            <div style={{ position: 'absolute', top: '8px', left: '6px' }}><Badge cat={article.category} /></div>
          </div>
          <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ ...m, fontSize: '13px', fontWeight: 500, color: '#ddd', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...mono, fontSize: '8px', color: '#444' }}>{getRelativeTime(article.publishedAt)}</span>
                <ViewsBadge articleId={article.id} />
              </div>
              <BmBtn article={article} />
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

// DEFAULT
const DefaultCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const [viewer, setViewer] = useState(false);
  const mediaItems: MediaItem[] = [{ type: 'image', url: article.imageUrl }];
  const bullets = getBullets(article.summary);
  return (
    <>
      {viewer && <ImageViewer items={mediaItems} onClose={() => setViewer(false)} />}
      <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '10px' }} className="group">
        <div style={{ background: '#080808', border: '1px solid #161616', borderRadius: '12px', overflow: 'hidden', transition: 'border-color 0.25s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#161616')}>
          <div style={{ position: 'relative', width: '100%', paddingTop: '52%', overflow: 'hidden' }}>
            <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.82)', transition: 'transform 0.5s' }}
              className="group-hover:scale-[1.03]"
              onClick={e => { e.preventDefault(); setViewer(true); }}
            />
            <div style={scanline} />
            <div style={{ position: 'absolute', top: '10px', left: '10px' }}><Badge cat={article.category} /></div>
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', borderRadius: '6px', padding: '4px 7px', display: 'flex', alignItems: 'center', gap: '3px', pointerEvents: 'none' }}>
              <svg width="9" height="9" fill="none" stroke="rgba(255,255,255,0.6)" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
            </div>
          </div>
          <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ ...mono, fontSize: '10px', color: '#555' }}>{formatDate(article.publishedAt)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ViewsBadge articleId={article.id} />
                <span style={{ ...mono, fontSize: '9px', color: '#444' }}>{getRelativeTime(article.publishedAt)}</span>
              </div>
            </div>
            <div style={{ ...m, fontSize: '14px', fontWeight: 500, color: '#e0e0e0', lineHeight: 1.4, marginBottom: '10px' }}>{article.title}</div>
            <ul style={{ listStyle: 'none', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {bullets.map((b, i) => (
                <li key={i} style={{ display: 'flex', gap: '7px', alignItems: 'baseline' }}>
                  <span style={{ color: '#555', fontSize: '12px', flexShrink: 0 }}>\u203a</span>
                  <span style={{ ...m, fontSize: '12px', color: '#888', lineHeight: 1.6 }}>{b}</span>
                </li>
              ))}
            </ul>
            <div style={{ height: '1px', background: '#111', marginBottom: '10px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ ...mono, fontSize: '8px', color: '#555', letterSpacing: '0.25em', textTransform: 'uppercase', border: '1px solid #1e1e1e', padding: '2px 7px', borderRadius: '2px' }}>TelierNews</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...mono, fontSize: '9px', color: '#444' }}>{article.author}</span>
                <BmBtn article={article} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
};

const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'default' }) => {
  if (variant === 'featured') return <FeaturedCard article={article} />;
  if (variant === 'small') return <SmallCard article={article} />;
  if (variant === 'horizontal') return <HorizontalCard article={article} />;
  return <DefaultCard article={article} />;
};

export default NewsCard;
