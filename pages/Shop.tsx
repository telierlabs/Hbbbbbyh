import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ─────────────────────────────────────────────
//  TIPE DATA
// ─────────────────────────────────────────────
export interface ShopProduct {
  id:         string;
  name:       string;
  price:      string;          // contoh: "Rp29.600"
  priceNum:   number;          // angka asli untuk sort
  commission: string;          // contoh: "5.5%"
  image:      string;          // URL gambar
  affiliateUrl: string;        // link affiliate Shopee
  categories: string[];        // ['Tech', 'AI'] — cocok dengan kategori artikel
  badge?:     string;          // "FLASH SALE" | "TERLARIS" | "BARU" dll
  store:      string;          // nama toko
  rating:     number;          // 1–5
  sold:       string;          // "10rb+ terjual"
  platform:   'shopee' | 'tokopedia' | 'lazada' | 'other';
}

// ─────────────────────────────────────────────
//  DATA PRODUK — GANTI DENGAN LINK AFFILIATE ASLI
// ─────────────────────────────────────────────
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'tws-1',
    name: 'TWS Bluetooth 5.3 LED Display Noise Cancelling',
    price: 'Rp29.600',
    priceNum: 29600,
    commission: '5.5%',
    image: 'https://down-id.img.susercontent.com/file/sg-11134201-7rd5o-m0b2qk4z3lhz62',
    affiliateUrl: 'https://s.shopee.co.id/2qRzG7QEYw',
    categories: ['Tech'],
    badge: 'FLASH SALE',
    store: 'FLIESTRONIC Official',
    rating: 4.8,
    sold: '10rb+',
    platform: 'shopee',
  },
  // ── Tambahkan produk lain di sini ──
  // Copy blok di atas, ganti datanya, paste di bawah
];

// ─────────────────────────────────────────────
//  MAPPING: kategori artikel → produk relevan
//  (dipakai di komponen AffiliateSection bawah)
// ─────────────────────────────────────────────
export const getProductsByCategory = (articleCategory: string): ShopProduct[] => {
  const cat = articleCategory.toLowerCase();
  return SHOP_PRODUCTS.filter(p =>
    p.categories.some(c => c.toLowerCase() === cat ||
      // AI / Artificial Intelligence → sama
      (cat === 'ai' && c.toLowerCase() === 'artificial intelligence') ||
      (cat === 'artificial intelligence' && c.toLowerCase() === 'ai')
    )
  ).slice(0, 4); // max 4 di artikel
};

// ─────────────────────────────────────────────
//  KOMPONEN: kartu produk
// ─────────────────────────────────────────────
const C = {
  bg:     '#000',
  s1:     '#0f0f0f',
  s2:     '#161616',
  border: '#222',
  text:   '#fff',
  sub:    '#888',
  dim:    '#444',
  red:    '#ff3b30',
};

const sans: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#facc15' : 'none'} stroke="#facc15" strokeWidth={2}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

export const ProductCard: React.FC<{ product: ShopProduct; compact?: boolean }> = ({ product, compact }) => {
  const platformColor = {
    shopee:   '#ee4d2d',
    tokopedia:'#03ac0e',
    lazada:   '#f57224',
    other:    '#555',
  }[product.platform];

  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block', textDecoration: 'none',
        background: C.s1, borderRadius: '16px',
        border: `1px solid ${C.border}`,
        overflow: 'hidden', transition: 'transform 0.18s, border-color 0.18s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = '#333';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border;
      }}
    >
      {/* Gambar */}
      <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', background: C.s2 }}>
        <img
          src={product.image} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/300x300/111/333?text=Produk'; }}
        />
        {product.badge && (
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            padding: '3px 8px', borderRadius: '6px',
            background: C.red, color: '#fff',
            ...sans, fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em',
          }}>
            {product.badge}
          </span>
        )}
        {/* Platform badge */}
        <span style={{
          position: 'absolute', bottom: '8px', right: '8px',
          padding: '3px 8px', borderRadius: '6px',
          background: platformColor, color: '#fff',
          ...sans, fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>
          {product.platform}
        </span>
      </div>

      {/* Info */}
      <div style={{ padding: compact ? '12px' : '14px' }}>
        <p style={{
          ...sans, fontSize: compact ? '12px' : '13px', fontWeight: 600,
          color: C.text, lineHeight: 1.4,
          marginBottom: '8px',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.name}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <StarRating rating={product.rating} />
          <span style={{ ...sans, fontSize: '10px', color: C.sub }}>{product.sold} terjual</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ ...sans, fontSize: compact ? '15px' : '17px', fontWeight: 800, color: C.text }}>
            {product.price}
          </span>
          <span style={{
            padding: '3px 8px', borderRadius: '6px',
            background: 'rgba(74,222,128,0.12)', color: '#4ade80',
            ...sans, fontSize: '11px', fontWeight: 700,
          }}>
            +{product.commission}
          </span>
        </div>

        {/* Tombol Beli */}
        <div style={{
          marginTop: '12px', padding: '11px',
          background: C.text, borderRadius: '10px',
          textAlign: 'center',
          ...sans, fontSize: '13px', fontWeight: 800, color: '#000',
          letterSpacing: '0.02em',
        }}>
          Beli Sekarang
        </div>
      </div>
    </a>
  );
};

// ─────────────────────────────────────────────
//  KOMPONEN: section affiliate di dalam artikel
//  Pakai ini di halaman detail artikel
//  <AffiliateSection category={article.category} />
// ─────────────────────────────────────────────
export const AffiliateSection: React.FC<{ category: string }> = ({ category }) => {
  const products = getProductsByCategory(category);
  if (products.length === 0) return null;

  return (
    <div style={{
      margin: '40px 0', padding: '24px 20px',
      background: C.s1, borderRadius: '20px',
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ ...sans, fontSize: '14px', fontWeight: 800, color: C.text, marginBottom: '3px' }}>
            Produk Terkait
          </div>
          <div style={{ ...sans, fontSize: '12px', color: C.sub }}>
            Pilihan produk untuk topik {category}
          </div>
        </div>
        <a href="/shop" style={{
          ...sans, fontSize: '12px', fontWeight: 700,
          color: C.sub, textDecoration: 'none',
          padding: '7px 14px', border: `1px solid ${C.border}`,
          borderRadius: '8px',
        }}>
          Lihat Semua →
        </a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {products.map(p => <ProductCard key={p.id} product={p} compact />)}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  HALAMAN SHOP UTAMA — /shop
// ─────────────────────────────────────────────
const ALL_CATEGORIES = ['Semua', 'Tech', 'AI', 'Economy', 'Geopolitics', 'Science', 'Space', 'Cyber', 'Defense'];

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [search, setSearch] = useState('');

  const filtered = SHOP_PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'Semua' ||
      p.categories.some(c =>
        c.toLowerCase() === activeCategory.toLowerCase() ||
        (activeCategory === 'AI' && c.toLowerCase() === 'artificial intelligence')
      );
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.store.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.38s ease both; }
        .cat-btn { transition: all 0.15s ease !important; }
        .cat-btn:active { transform: scale(0.94) !important; }
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
      `}</style>

      <div style={{ minHeight: '100vh', background: C.bg, ...sans, color: C.text, paddingBottom: '100px' }}>

        {/* ── HERO HEADER ── */}
        <div style={{
          background: C.bg, paddingTop: '88px', paddingBottom: '28px',
          paddingLeft: '20px', paddingRight: '20px',
          borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ maxWidth: '480px', margin: '0 auto' }}>

            {/* Judul */}
            <div className="fade-up" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <svg width="24" height="24" fill="none" stroke={C.text} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line strokeLinecap="round" x1="3" y1="6" x2="21" y2="6" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 01-8 0" />
                </svg>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: C.text, letterSpacing: '-0.02em', margin: 0 }}>
                  TelierShop
                </h1>
              </div>
              <p style={{ fontSize: '14px', color: C.sub, margin: 0, lineHeight: 1.5 }}>
                Produk pilihan dari artikel TelierNews. Beli lewat sini = support kami!
              </p>
            </div>

            {/* Search bar */}
            <div className="fade-up" style={{ animationDelay: '0.05s', position: 'relative', marginBottom: '16px' }}>
              <svg width="16" height="16" fill="none" stroke={C.dim} viewBox="0 0 24 24" strokeWidth={2}
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari produk..."
                style={{
                  width: '100%', padding: '13px 16px 13px 42px',
                  background: C.s1, border: `1px solid ${C.border}`,
                  borderRadius: '12px', color: C.text,
                  ...sans, fontSize: '14px', outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#444')}
                onBlur={e  => (e.currentTarget.style.borderColor = C.border)}
              />
            </div>

            {/* Category filter */}
            <div className="fade-up" style={{ animationDelay: '0.1s', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className="cat-btn"
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '9px 18px', borderRadius: '100px',
                    border: `1.5px solid ${activeCategory === cat ? C.text : C.border}`,
                    background: activeCategory === cat ? C.text : 'transparent',
                    ...sans, fontSize: '12px', fontWeight: 700,
                    color: activeCategory === cat ? '#000' : C.sub,
                    whiteSpace: 'nowrap', cursor: 'pointer',
                    letterSpacing: '0.05em',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRODUCT GRID ── */}
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '24px 20px' }}>

          {/* Info count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontSize: '13px', color: C.sub }}>
              {filtered.length} produk {activeCategory !== 'Semua' ? `· ${activeCategory}` : ''}
            </span>
            {search && (
              <button onClick={() => setSearch('')}
                style={{ ...sans, fontSize: '12px', color: C.sub, background: 'none', border: 'none', cursor: 'pointer' }}>
                Reset ✕
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <svg width="48" height="48" fill="none" stroke={C.dim} viewBox="0 0 24 24" strokeWidth={1.5} style={{ margin: '0 auto 16px', display: 'block' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line strokeLinecap="round" x1="3" y1="6" x2="21" y2="6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p style={{ fontSize: '15px', fontWeight: 700, color: C.sub, marginBottom: '6px' }}>Produk belum tersedia</p>
              <p style={{ fontSize: '13px', color: C.dim }}>Coba kategori lain atau reset pencarian</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {filtered.map((p, i) => (
                <div key={p.id} className="fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}

          {/* Cara kerja */}
          <div style={{
            marginTop: '40px', padding: '20px',
            background: C.s1, borderRadius: '16px',
            border: `1px solid ${C.border}`,
          }}>
            <p style={{ fontSize: '13px', fontWeight: 800, color: C.text, marginBottom: '12px' }}>
              Cara kerjanya?
            </p>
            {[
              { n: '1', t: 'Klik produk', d: 'Kamu diarahkan ke Shopee/Tokopedia' },
              { n: '2', t: 'Beli seperti biasa', d: 'Harga sama, tidak ada biaya tambahan' },
              { n: '3', t: 'TelierNews dapat komisi', d: 'Kami dapat komisi kecil dari toko — kamu support kami gratis!' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: '14px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: C.text, color: '#000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 900, flexShrink: 0,
                }}>
                  {s.n}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, margin: '0 0 2px' }}>{s.t}</p>
                  <p style={{ fontSize: '12px', color: C.sub, margin: 0 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default Shop;
