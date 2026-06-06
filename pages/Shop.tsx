import React, { useState } from 'react';

export interface ShopProduct {
  id:           string;
  name:         string;
  price:        string;
  priceOri?:    string;       // harga coret
  priceNum:     number;
  commission:   string;
  image:        string;
  affiliateUrl: string;
  categories:   string[];     // kategori PRODUK: 'Gadget','Fashion','Lifestyle', dll
  articleTags:  string[];     // tag artikel: ['Tech','AI'] untuk auto-match di artikel
  badge?:       string;
  store:        string;
  rating:       number;
  sold:         string;
  platform:     'shopee' | 'tokopedia' | 'lazada' | 'other';
}

// ─── KATEGORI PRODUK (bukan kategori berita) ───
export const PRODUCT_CATEGORIES = ['Semua', 'Gadget', 'Fashion', 'Lifestyle', 'Buku', 'AI Tools', 'Sport'];

// ─── DATA PRODUK ───
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'tws-1',
    name: 'TWS Bluetooth 5.3 LED Display Noise Cancelling',
    price: 'Rp29.600',
    priceOri: 'Rp70.000',
    priceNum: 29600,
    commission: '5.5%',
    image: 'https://down-id.img.susercontent.com/file/sg-11134201-7rd5o-m0b2qk4z3lhz62',
    affiliateUrl: 'https://s.shopee.co.id/2qRzG7QEYw',
    categories: ['Gadget'],
    articleTags: ['Tech', 'AI'],
    badge: 'FLASH SALE',
    store: 'FLIESTRONIC Official',
    rating: 4.8,
    sold: '10rb+',
    platform: 'shopee',
  },
  // ── tambah produk di sini ──
];

// ─── auto-match produk untuk artikel ───
export const getProductsByArticleTag = (articleCategory: string): ShopProduct[] => {
  const cat = articleCategory.toLowerCase();
  return SHOP_PRODUCTS.filter(p =>
    p.articleTags.some(t =>
      t.toLowerCase() === cat ||
      (cat === 'ai' && t.toLowerCase() === 'artificial intelligence') ||
      (cat === 'artificial intelligence' && t.toLowerCase() === 'ai')
    )
  ).slice(0, 4);
};

// ─── warna ───
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

// ─── bintang ───
const Stars: React.FC<{ r: number }> = ({ r }) => (
  <span style={{ display: 'flex', gap: '1px' }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width="10" height="10" viewBox="0 0 24 24"
        fill={i <= Math.round(r) ? '#facc15' : 'none'} stroke="#facc15" strokeWidth={2}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </span>
);

// ─── kartu produk ───
export const ProductCard: React.FC<{ product: ShopProduct; compact?: boolean }> = ({ product, compact }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block', textDecoration: 'none',
        background: C.s1, borderRadius: '14px',
        border: `1px solid ${C.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Foto produk */}
      <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: C.s2, overflow: 'hidden' }}>
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImgError(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '8px',
          }}>
            <svg width="32" height="32" fill="none" stroke={C.dim} viewBox="0 0 24 24" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ ...sans, fontSize: '10px', color: C.dim }}>Foto tidak tersedia</span>
          </div>
        )}

        {/* Badge FLASH SALE / TERLARIS dll */}
        {product.badge && (
          <span style={{
            position: 'absolute', top: '8px', left: '8px',
            padding: '3px 8px', borderRadius: '6px',
            background: C.red, color: '#fff',
            ...sans, fontSize: '10px', fontWeight: 800, letterSpacing: '0.05em',
          }}>
            {product.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: compact ? '10px' : '12px' }}>
        <p style={{
          ...sans, fontSize: compact ? '12px' : '13px', fontWeight: 600,
          color: C.text, lineHeight: 1.4, marginBottom: '6px',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {product.name}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
          <Stars r={product.rating} />
          <span style={{ ...sans, fontSize: '10px', color: C.sub }}>{product.sold}</span>
        </div>

        {/* Harga */}
        <div style={{ marginBottom: '10px' }}>
          <span style={{ ...sans, fontSize: compact ? '15px' : '16px', fontWeight: 800, color: C.red }}>
            {product.price}
          </span>
          {product.priceOri && (
            <span style={{ ...sans, fontSize: '11px', color: C.dim, textDecoration: 'line-through', marginLeft: '6px' }}>
              {product.priceOri}
            </span>
          )}
        </div>

        {/* Tombol beli */}
        <div style={{
          padding: '10px',
          background: C.red,
          borderRadius: '8px',
          textAlign: 'center',
          ...sans, fontSize: '12px', fontWeight: 800, color: '#fff',
          letterSpacing: '0.02em',
        }}>
          Beli Sekarang
        </div>
      </div>
    </a>
  );
};

// ─── AffiliateSection untuk artikel ───
export const AffiliateSection: React.FC<{ category: string }> = ({ category }) => {
  const products = getProductsByArticleTag(category);
  if (products.length === 0) return null;
  return (
    <div style={{ margin: '40px 0', padding: '20px', background: C.s1, borderRadius: '16px', border: `1px solid ${C.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ ...sans, fontSize: '14px', fontWeight: 800, color: C.text }}>Produk Terkait</span>
        <a href="/shop" style={{ ...sans, fontSize: '12px', color: C.sub, textDecoration: 'none' }}>Lihat semua →</a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' }}>
        {products.map(p => <ProductCard key={p.id} product={p} compact />)}
      </div>
    </div>
  );
};

// ══════════════════════════════════════
//  HALAMAN SHOP
// ══════════════════════════════════════
const Shop: React.FC = () => {
  const [activeCat, setActiveCat] = useState('Semua');
  const [search,    setSearch]    = useState('');

  const filtered = SHOP_PRODUCTS.filter(p => {
    const matchCat    = activeCat === 'Semua' || p.categories.includes(activeCat);
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.store.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.35s ease both}
        .cat-pill{transition:all 0.15s ease;cursor:pointer}
        .cat-pill:active{transform:scale(0.93)}
        .prod-card{transition:opacity 0.15s}
        .prod-card:active{opacity:0.75}
        *{box-sizing:border-box;-webkit-font-smoothing:antialiased}
        ::-webkit-scrollbar{display:none}
      `}</style>

      <div style={{ minHeight: '100vh', background: C.bg, color: C.text, ...sans, paddingBottom: '80px' }}>

        {/* ── STICKY HEADER: search + kategori ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: C.bg,
          borderBottom: `1px solid ${C.border}`,
          paddingTop: '72px',
        }}>
          <div style={{ maxWidth: '480px', margin: '0 auto', padding: '12px 16px 0' }}>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <svg width="15" height="15" fill="none" stroke={C.dim} viewBox="0 0 24 24" strokeWidth={2}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari di store"
                style={{
                  width: '100%', padding: '11px 14px 11px 38px',
                  background: C.s1, border: `1px solid ${C.border}`,
                  borderRadius: '10px', color: C.text,
                  ...sans, fontSize: '14px', outline: 'none',
                }}
                onFocus={e  => (e.currentTarget.style.borderColor = '#444')}
                onBlur={e   => (e.currentTarget.style.borderColor = C.border)}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: C.sub, cursor: 'pointer', fontSize: '16px', lineHeight: 1,
                }}>×</button>
              )}
            </div>

            {/* Kategori pills — horizontal scroll */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px' }}>
              {PRODUCT_CATEGORIES.map(cat => {
                const active = activeCat === cat;
                return (
                  <button
                    key={cat}
                    className="cat-pill"
                    onClick={() => setActiveCat(cat)}
                    style={{
                      padding: '8px 18px', borderRadius: '100px', border: 'none',
                      background: active ? C.red : C.s2,
                      ...sans, fontSize: '13px', fontWeight: active ? 700 : 500,
                      color: active ? '#fff' : C.sub,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── GRID PRODUK ── */}
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '16px 16px 0' }}>

          {/* Jumlah */}
          <p style={{ fontSize: '12px', color: C.dim, marginBottom: '14px' }}>
            {filtered.length} produk{activeCat !== 'Semua' ? ` · ${activeCat}` : ''}
          </p>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <svg width="44" height="44" fill="none" stroke={C.dim} viewBox="0 0 24 24" strokeWidth={1.5}
                style={{ margin: '0 auto 14px', display: 'block' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line strokeLinecap="round" x1="3" y1="6" x2="21" y2="6" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p style={{ fontSize: '14px', fontWeight: 700, color: C.sub, marginBottom: '4px' }}>Belum ada produk</p>
              <p style={{ fontSize: '12px', color: C.dim }}>Coba kategori lain</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
              {filtered.map((p, i) => (
                <div key={p.id} className="fade-up prod-card" style={{ animationDelay: `${i * 0.04}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Shop;
