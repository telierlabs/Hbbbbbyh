import React, { useState } from 'react';
import { ContentBlock } from '../types';
import { splitParagraphs, suggestBlocks, Para, SuggestResult, Suggestion } from '../services/structureService';
import { BLOCK_LABEL, DataBlockView } from './DataBlocks';

/*
  Tombol "Susun otomatis" di Admin.
  Alur: baca semua blok Teks di halaman aktif -> usulkan blok visual -> admin centang yang dipakai
        -> teks dipecah per paragraf dan blok visual disisipkan di titik yang pas.
  Tidak ada yang terbit otomatis, semua lewat persetujuan admin.
*/

const f: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const mono: React.CSSProperties = { fontFamily: "'Share Tech Mono', monospace" };

interface Props {
  blocks: ContentBlock[];
  title: string;
  onApply: (blocks: ContentBlock[]) => void;
}

const AutoStructure: React.FC<Props> = ({ blocks, title, onApply }) => {
  const [state, setState] = useState<'idle' | 'loading' | 'review'>('idle');
  const [res, setRes] = useState<SuggestResult | null>(null);
  const [paras, setParas] = useState<Para[]>([]);
  const [sel, setSel] = useState<Record<string, boolean>>({});

  const run = async () => {
    const list: Para[] = [];
    blocks.forEach(b => { if (b.type === 'text') list.push(...splitParagraphs(b.content)); });
    if (list.filter(p => !p.heading).length < 3) { alert('Tempel artikelnya dulu di blok Teks (minimal 3 paragraf), baru klik Susun otomatis.'); return; }
    setState('loading'); setParas(list);
    const r = await suggestBlocks(title, list);
    setRes(r);
    setSel(Object.fromEntries(r.items.map(i => [i.id, true])));
    setState('review');
  };

  const close = () => { setState('idle'); setRes(null); };

  const apply = () => {
    const chosen = (res?.items || []).filter(i => sel[i.id]);
    if (!chosen.length) { close(); return; }
    const byAfter = new Map<number, Suggestion[]>();
    chosen.forEach(s => byAfter.set(s.after, [...(byAfter.get(s.after) || []), s]));
    const out: ContentBlock[] = [];
    let g = 0; // nomor paragraf global
    blocks.forEach(b => {
      if (b.type !== 'text') { out.push(b); return; }
      const ps = splitParagraphs(b.content);
      if (!ps.length) { out.push(b); return; }
      let buf: string[] = [];
      const flush = () => { if (buf.length) { out.push({ type: 'text', content: buf.join(''), caption: b.caption || '' }); buf = []; } };
      ps.forEach(p => {
        buf.push(p.html);
        const ins = byAfter.get(g);
        if (ins && ins.length) { flush(); ins.forEach(s => out.push({ type: s.type, content: '', caption: '', data: s.data })); }
        g++;
      });
      flush();
    });
    onApply(out);
    close();
  };

  if (state === 'idle') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '10px 12px', background: '#f7f7f8', border: '1px solid #ececec', borderRadius: '12px' }}>
        <button type="button" onClick={run} style={{ ...f, padding: '9px 16px', borderRadius: '10px', border: 'none', background: '#111', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>✨ Susun otomatis</button>
        <span style={{ ...f, fontSize: '11px', color: '#888', lineHeight: 1.45, flex: 1, minWidth: '180px' }}>Tempel artikel di blok Teks, lalu klik ini. Sistem usul tabel, garis waktu, kutipan, dll. Lu tinggal centang.</span>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div style={{ ...f, padding: '16px', textAlign: 'center', fontSize: '12px', color: '#666', background: '#f7f7f8', border: '1px solid #ececec', borderRadius: '12px' }}>
        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #ccc', borderTopColor: '#111', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '8px', verticalAlign: '-2px' }} />
        Membaca artikel dan menyusun usulan…
      </div>
    );
  }

  const items = res?.items || [];
  const nSel = items.filter(i => sel[i.id]).length;
  return (
    <div style={{ border: '1px solid #e0e0e3', borderRadius: '14px', overflow: 'hidden', background: '#fff' }}>
      <div style={{ padding: '10px 14px', background: res?.mode === 'ai' ? '#eefbf3' : '#fff7e8', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ ...mono, fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: res?.mode === 'ai' ? '#2a9d5c' : '#b97a00', marginBottom: '3px' }}>{res?.mode === 'ai' ? '✓ Mode AI' : '⚠ Mode aturan'} · {items.length} usulan</div>
        <div style={{ ...f, fontSize: '11px', color: '#555', lineHeight: 1.5 }}>{res?.note}</div>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.length === 0 && <div style={{ ...f, fontSize: '12px', color: '#888', textAlign: 'center', padding: '14px 0' }}>Tidak ada blok yang layak untuk artikel ini. Bisa jadi artikelnya memang cukup berupa teks.</div>}

        {items.map(s => (
          <div key={s.id} style={{ border: `1px solid ${sel[s.id] ? '#111' : '#ececec'}`, borderRadius: '12px', overflow: 'hidden', opacity: sel[s.id] ? 1 : 0.55 }}>
            <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px', background: '#fafafa', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!sel[s.id]} onChange={e => setSel(p => ({ ...p, [s.id]: e.target.checked }))} style={{ marginTop: '3px', width: '16px', height: '16px', accentColor: '#111' }} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ ...f, fontSize: '12.5px', fontWeight: 700, color: '#111' }}>{BLOCK_LABEL[s.type]}</span>
                <span style={{ ...f, display: 'block', fontSize: '11px', color: '#777', marginTop: '2px', lineHeight: 1.45 }}>{s.reason}</span>
                <span style={{ ...mono, display: 'block', fontSize: '9px', letterSpacing: '0.06em', color: '#aaa', marginTop: '4px' }}>SETELAH: “{(paras[s.after]?.text || '').slice(0, 56)}…”</span>
              </span>
            </label>
            <div style={{ padding: '0 12px', background: '#fff', overflow: 'hidden' }}>
              <div style={{ margin: '-6px 0' }}><DataBlockView block={{ type: s.type, content: '', data: s.data }} /></div>
            </div>
          </div>
        ))}

        {res && res.rejected.length > 0 && (
          <div style={{ ...f, fontSize: '10.5px', color: '#b97a00', background: '#fff7e8', borderRadius: '8px', padding: '8px 10px', lineHeight: 1.5 }}>
            {res.rejected.length} usulan dibuang karena datanya tidak ada di artikel: {res.rejected.join('; ')}.
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={apply} style={{ ...f, flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: '#111', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            {nSel ? `Terapkan ${nSel} blok` : 'Tutup'}
          </button>
          <button type="button" onClick={close} style={{ ...f, padding: '11px 16px', borderRadius: '10px', border: '1px solid #e0e0e0', background: '#fff', color: '#666', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
        </div>
        <div style={{ ...f, fontSize: '10px', color: '#aaa', lineHeight: 1.5 }}>Saat diterapkan, teks dirapikan jadi paragraf terpisah. Semua blok tetap bisa diedit, digeser, atau dihapus setelahnya.</div>
      </div>
    </div>
  );
};

export default AutoStructure;
