import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { NewsArticle } from '../types';
import { fetchViews, formatViews } from '../services/articleService';

export type CardVariant = 'featured' | 'small' | 'horizontal' | 'default';
interface NewsCardProps { article: NewsArticle; variant?: CardVariant; }

const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };
const m: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

const getRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000), hours = Math.floor(mins / 60), days = Math.floor(hours / 24);
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

const getBookmarks = (): any[] => { try { return JSON.parse(localStorage.getItem('tn_bookmarks') || '[]'); } catch { return []; } };

const scanline: React.CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none',
  background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.04) 3px,rgba(0,0,0,0.04) 4px)',
};

const Badge: React.FC<{ cat: string }> = ({ cat }) => (
  <span style={{ ...mono, fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.65)' }}>
    {cat.toUpperCase()}
  </span>
);

const ViewsBadge: React.FC<{ articleId: string }> = ({ articleId }) => {
  const [views, setViews] = useState<number | null>(null);
  useEffect(() => { fetchViews(articleId).then(setViews); }, [articleId]);
  if (views === null) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <svg width="12" height="12" fill="none" stroke="#aaa" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      <span style={{ ...mono, fontSize: '10px', color: '#aaa' }}>{formatViews(views)}</span>
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
    <button onClick={toggle} style={{ width: '28px', height: '28px', borderRadius: '7px', border: saved ? '1px solid #fff' : '1px solid #2a2a2a', background: saved ? '#222' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: saved ? '#fff' : '#555', transition: 'all 0.2s', flexShrink: 0 }}>
      <svg width="12" height="12" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
    </button>
  );
};

const FeaturedCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '12px' }} className="group">
    <div style={{ background: '#080808', border: '1px solid #1e1e1e', borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.25s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
      <div style={{ position: 'relative', width: '100%', paddingTop: '56%', overflow: 'hidden' }}>
        <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65)', transition: 'transform 0.6s' }}
          className="group-hover:scale-[1.03]" />
        <div style={scanline} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,0.92) 0%,transparent 55%)' }} />
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}><Badge cat={article.category} /></div>
        <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px', ...m, fontSize: '18px', fontWeight: 700, color: '#fff', lineHeight: 1.25, letterSpacing: '-0.01em' }}>{article.title}</div>
      </div>
      <div style={{ padding: '10px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ ...mono, fontSize: '10px', color: '#aaa' }}>{formatDate(article.publishedAt)} · {getRelativeTime(article.publishedAt)}</span>
          <ViewsBadge articleId={article.id} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ ...mono, fontSize: '10px', color: '#666' }}>{article.author}</span>
          <BmBtn article={article} />
        </div>
      </div>
    </div>
  </Link>
);

const SmallCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }} className="group">
    <div style={{ background: '#080808', border: '1px solid #1e1e1e', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.25s', height: '100%' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
      <div style={{ position: 'relative', width: '100%', paddingTop: '68%', overflow: 'hidden' }}>
        <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)', transition: 'transform 0.5s' }}
          className="group-hover:scale-[1.05]" />
        <div style={scanline} />
        <div style={{ position: 'absolute', top: '8px', left: '8px' }}><Badge cat={article.category} /></div>
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ ...m, fontSize: '13px', fontWeight: 600, color: '#fff', lineHeight: 1.4, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...mono, fontSize: '10px', color: '#aaa' }}>{getRelativeTime(article.publishedAt)}</span>
            <ViewsBadge articleId={article.id} />
          </div>
          <BmBtn article={article} />
        </div>
      </div>
    </div>
  </Link>
);

const HorizontalCard: React.FC<{ article: NewsArticle }> = ({ article }) => (
  <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '10px' }} className="group">
    <div style={{ display: 'flex', background: '#080808', border: '1px solid #1e1e1e', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.25s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
      <div style={{ position: 'relative', width: '120px', flexShrink: 0, overflow: 'hidden', minHeight: '96px' }}>
        <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer"
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)', transition: 'transform 0.5s', display: 'block', position: 'absolute', inset: 0 }}
          className="group-hover:scale-[1.05]" />
        <div style={scanline} />
        <div style={{ position: 'absolute', top: '8px', left: '8px' }}><Badge cat={article.category} /></div>
      </div>
      <div style={{ flex: 1, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div style={{ ...m, fontSize: '14px', fontWeight: 600, color: '#fff', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...mono, fontSize: '10px', color: '#aaa' }}>{getRelativeTime(article.publishedAt)}</span>
            <ViewsBadge articleId={article.id} />
          </div>
          <BmBtn article={article} />
        </div>
      </div>
    </div>
  </Link>
);

const DefaultCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const bullets = getBullets(article.summary);
  return (
    <Link to={`/news/${article.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '12px' }} className="group">
      <div style={{ background: '#080808', border: '1px solid #1e1e1e', borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.25s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#333')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e1e1e')}>
        <div style={{ position: 'relative', width: '100%', paddingTop: '52%', overflow: 'hidden' }}>
          <img src={article.imageUrl} alt={article.title} referrerPolicy="no-referrer"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.75)', transition: 'transform 0.5s' }}
            className="group-hover:scale-[1.03]" />
          <div style={scanline} />
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}><Badge cat={article.category} /></div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ ...mono, fontSize: '10px', color: '#aaa' }}>{formatDate(article.publishedAt)}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ViewsBadge articleId={article.id} />
              <span style={{ ...mono, fontSize: '10px', color: '#aaa' }}>{getRelativeTime(article.publishedAt)}</span>
            </div>
          </div>
          <div style={{ ...m, fontSize: '15px', fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: '10px' }}>{article.title}</div>
          <ul style={{ listStyle: 'none', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {bullets.map((b, i) => (
              <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                <span style={{ color: '#555', fontSize: '13px', flexShrink: 0 }}>›</span>
                <span style={{ ...m, fontSize: '13px', color: '#aaa', lineHeight: 1.6 }}>{b}</span>
              </li>
            ))}
          </ul>
          <div style={{ height: '1px', background: '#1a1a1a', marginBottom: '10px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ ...mono, fontSize: '9px', color: '#555', letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid #222', padding: '2px 8px', borderRadius: '3px' }}>TelierNews</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ ...mono, fontSize: '10px', color: '#666' }}>{article.author}</span>
              <BmBtn article={article} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'default' }) => {
  if (variant === 'featured') return <FeaturedCard article={article} />;
  if (variant === 'small') return <SmallCard article={article} />;
  if (variant === 'horizontal') return <HorizontalCard article={article} />;
  return <DefaultCard article={article} />;
};

export default NewsCard;
