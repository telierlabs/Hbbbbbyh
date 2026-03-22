import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Subscribe: React.FC = () => {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);

  const prices = {
    pro:  { m: { p: 'Rp29K', n: '/bulan', b: 'Rp29.000 / bulan' }, y: { p: 'Rp17K', n: '/bulan', w: 'Rp29K/bln', b: 'Rp204.000 / tahun' } },
    elite: { m: { p: 'Rp79K', n: '/bulan' }, y: { p: 'Rp47K', n: '/bulan', w: 'Rp79K/bln' } },
  };
  const k = yearly ? 'y' : 'm';

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: 'Bisa batal kapan saja?', a: 'Ya, batalkan kapan saja tanpa biaya. Akses tetap aktif sampai akhir periode berbayar.' },
    { q: 'Apa itu artikel eksklusif?', a: 'Konten investigasi, laporan mendalam, dan analisis yang hanya bisa diakses subscriber berbayar — tidak tersedia di beranda publik.' },
  ];

  const mono = { fontFamily: "'Share Tech Mono', monospace" };
  const sans = { fontFamily: "'Montserrat', sans-serif" };
  const serif = { fontFamily: "'DM Serif Display', serif" };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Share+Tech+Mono&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes sub-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .sub-page { animation: sub-fade 0.3s ease; }
      `}</style>

      <div className="sub-page" style={{ background: '#000', minHeight: '100vh', ...sans as any }}>

        {/* HEADER */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #141414' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '5px', ...mono as any, fontSize: '9px', color: '#333', letterSpacing: '0.1em', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            Kembali
          </button>
          <span style={{ fontSize: '12px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff' }}>TelierNews</span>
          <div style={{ width: '60px' }} />
        </div>

        {/* HERO */}
        <div style={{ paddingTop: '110px', paddingBottom: '52px', padding: '110px 24px 52px', maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', ...mono as any, fontSize: '8px', letterSpacing: '0.3em', color: '#333', textTransform: 'uppercase', marginBottom: '24px' }}>
            <span style={{ display: 'inline-block', width: '16px', height: '1px', background: '#1e1e1e' }} />
            Membership
            <span style={{ display: 'inline-block', width: '16px', height: '1px', background: '#1e1e1e' }} />
          </div>
          <h1 style={{ ...serif as any, fontSize: 'clamp(34px,8vw,52px)', fontWeight: 400, lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: '18px', color: '#fff' }}>
            Baca Lebih Dalam.<br /><em style={{ fontStyle: 'italic', color: '#444' }}>Pahami Lebih Jauh.</em>
          </h1>
          <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.8, fontWeight: 300, maxWidth: '300px', margin: '0 auto' }}>
            Informasi adalah investasi. Akses analisis dan laporan yang membantu kamu selalu selangkah lebih depan.
          </p>
        </div>

        {/* BILLING TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '0 24px 16px' }}>
          <span onClick={() => setYearly(false)} style={{ ...mono as any, fontSize: '9px', letterSpacing: '0.15em', color: !yearly ? '#fff' : '#333', cursor: 'pointer', userSelect: 'none' }}>BULANAN</span>
          <div onClick={() => setYearly(!yearly)} style={{ width: '40px', height: '22px', borderRadius: '11px', border: `1px solid ${yearly ? '#2a2a2a' : '#1e1e1e'}`, background: '#080808', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: '3px', left: yearly ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1)' }} />
          </div>
          <span onClick={() => setYearly(true)} style={{ ...mono as any, fontSize: '9px', letterSpacing: '0.15em', color: yearly ? '#fff' : '#333', cursor: 'pointer', userSelect: 'none' }}>TAHUNAN</span>
          <span style={{ ...mono as any, fontSize: '7px', letterSpacing: '0.1em', color: '#444', border: '1px solid #1e1e1e', padding: '2px 8px', borderRadius: '3px' }}>HEMAT 40%</span>
        </div>

        {/* PLANS */}
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

          {/* FREE */}
          <div style={{ border: '1px solid #141414', borderRadius: '16px', background: '#080808', overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#3a3a3a', marginBottom: '4px' }}>Gratis</div>
                <div style={{ fontSize: '11px', color: '#2a2a2a', lineHeight: 1.5 }}>Untuk pembaca umum.</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', color: '#2a2a2a', display: 'block', lineHeight: 1 }}>Rp0</span>
                <span style={{ ...mono as any, fontSize: '8px', color: '#2a2a2a', letterSpacing: '0.1em', display: 'block', marginTop: '3px' }}>selamanya</span>
              </div>
            </div>
            <div style={{ height: '1px', background: '#141414', margin: '0 20px' }} />
            <div style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Akses berita umum', 'Komentar & diskusi'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12px', color: '#aaa' }}>
                  <svg width="10" height="10" fill="none" stroke="#444" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  {f}
                </div>
              ))}
              {['Artikel eksklusif', 'Cylen AI tanpa batas'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12px', color: '#222', textDecoration: 'line-through' }}>
                  <svg width="8" height="8" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="#222" strokeWidth="2" strokeLinecap="round"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <button style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'transparent', color: '#2a2a2a', border: '1px solid #141414', fontSize: '12px', fontWeight: 700, cursor: 'pointer', ...sans as any }}>
                Paket Saat Ini
              </button>
            </div>
          </div>

          {/* SEP */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#141414' }} />
            <span style={{ ...mono as any, fontSize: '7px', color: '#2a2a2a', letterSpacing: '0.2em' }}>pilih paket</span>
            <div style={{ flex: 1, height: '1px', background: '#141414' }} />
          </div>

          {/* PRO */}
          <div style={{ border: '1px solid #222', borderRadius: '16px', background: '#090909', overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Pro</div>
                <div style={{ fontSize: '11px', color: '#333', lineHeight: 1.5, maxWidth: '180px' }}>Untuk pembaca yang ingin lebih.</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', display: 'block', lineHeight: 1 }}>{prices.pro[k].p}</span>
                <span style={{ ...mono as any, fontSize: '8px', color: '#333', letterSpacing: '0.1em', display: 'block', marginTop: '3px' }}>{prices.pro[k].n}</span>
                {yearly && <span style={{ ...mono as any, fontSize: '8px', color: '#222', textDecoration: 'line-through', display: 'block', marginTop: '1px' }}>{prices.pro.y.w}</span>}
              </div>
            </div>
            <div style={{ height: '1px', background: '#141414', margin: '0 20px' }} />
            <div style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Semua konten tanpa batas', 'Artikel investigasi & eksklusif', 'Cylen AI tanya jawab tanpa batas', 'Breaking news prioritas'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12px', color: '#aaa' }}>
                  <svg width="10" height="10" fill="none" stroke="#666" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <button style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#fff', color: '#000', border: '1px solid #fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', ...sans as any, transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e0e0e0')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                Berlangganan Pro
              </button>
            </div>
          </div>

          {/* ELITE */}
          <div style={{ border: '1px solid #141414', borderRadius: '16px', background: '#080808', overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>Elite</div>
                <div style={{ fontSize: '11px', color: '#333', lineHeight: 1.5, maxWidth: '180px' }}>Untuk pembaca serius & profesional.</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', color: '#fff', display: 'block', lineHeight: 1 }}>{prices.elite[k].p}</span>
                <span style={{ ...mono as any, fontSize: '8px', color: '#333', letterSpacing: '0.1em', display: 'block', marginTop: '3px' }}>{prices.elite[k].n}</span>
                {yearly && <span style={{ ...mono as any, fontSize: '8px', color: '#222', textDecoration: 'line-through', display: 'block', marginTop: '1px' }}>{prices.elite.y.w}</span>}
              </div>
            </div>
            <div style={{ height: '1px', background: '#141414', margin: '0 20px' }} />
            <div style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Semua fitur Pro', 'Badge Elite di profil & komentar', 'Support prioritas langsung'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '12px', color: '#aaa' }}>
                  <svg width="10" height="10" fill="none" stroke="#666" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <button style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'transparent', color: '#666', border: '1px solid #1e1e1e', fontSize: '12px', fontWeight: 700, cursor: 'pointer', ...sans as any, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#aaa'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.color = '#666'; }}>
                Berlangganan Elite
              </button>
            </div>
          </div>

        </div>

        {/* GUARANTEE */}
        <div style={{ maxWidth: '480px', margin: '20px auto 0', padding: '0 20px' }}>
          <div style={{ border: '1px solid #141414', borderRadius: '12px', padding: '16px 18px', display: 'flex', gap: '12px', alignItems: 'flex-start', background: '#080808' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#0a0a0a', border: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="13" height="13" fill="none" stroke="#333" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '3px' }}>Garansi 7 Hari</div>
              <div style={{ fontSize: '11px', color: '#333', lineHeight: 1.6 }}>Tidak puas dalam 7 hari pertama? Kami kembalikan 100% pembayaran kamu, tanpa pertanyaan.</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '480px', margin: '32px auto 0', padding: '0 20px 120px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ ...mono as any, fontSize: '8px', color: '#2a2a2a', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Pertanyaan</span>
            <div style={{ flex: 1, height: '1px', background: '#141414' }} />
          </div>
          {faqs.map((f, i) => (
            <div key={i} style={{ borderBottom: '1px solid #0f0f0f' }}>
              <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '15px 0', cursor: 'pointer', fontSize: '12px', fontWeight: 500, color: openFaq === i ? '#888' : '#444' }}>
                {f.q}
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{ flexShrink: 0, color: '#2a2a2a', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              {openFaq === i && <div style={{ fontSize: '11px', color: '#333', lineHeight: 1.7, paddingBottom: '14px' }}>{f.a}</div>}
            </div>
          ))}
        </div>

        {/* STICKY */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, padding: '11px 20px', background: 'rgba(0,0,0,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid #141414', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#888' }}>TelierNews Pro</div>
            <div style={{ ...mono as any, fontSize: '9px', color: '#333', marginTop: '1px' }}>{prices.pro[k].b}</div>
          </div>
          <button style={{ padding: '11px 22px', background: '#fff', color: '#000', border: 'none', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', ...sans as any, flexShrink: 0, transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#ddd')}
            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
            Berlangganan
          </button>
        </div>

      </div>
    </>
  );
};

export default Subscribe;
