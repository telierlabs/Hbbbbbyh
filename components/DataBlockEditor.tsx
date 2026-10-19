import React, { useState } from 'react';
import { ContentBlock } from '../types';
import { DataBlockView, resolvePlace, PLACE_OPTIONS } from './DataBlocks';

/* Form isi blok visual di Admin. Tema terang, sama seperti editor admin lainnya. */

const f: React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" };
const inp: React.CSSProperties = { ...f, width: '100%', padding: '9px 11px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', outline: 'none', color: '#111', background: '#fff', boxSizing: 'border-box' };
const lbl: React.CSSProperties = { display: 'block', fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#999', marginBottom: '4px' };
const addBtn: React.CSSProperties = { ...f, padding: '6px 11px', border: '1px dashed #d8d8dc', borderRadius: '8px', background: 'transparent', fontSize: '11px', fontWeight: 600, color: '#888', cursor: 'pointer' };
const xBtn: React.CSSProperties = { width: '26px', height: '26px', flexShrink: 0, borderRadius: '7px', border: 'none', background: '#fee', color: '#f55', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const box: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };

// Pisahkan hasil tempel dari spreadsheet / CSV
const splitLines = (raw: string): string[][] => {
  const lines = raw.replace(/\r/g, '').split('\n').filter(l => l.trim());
  const sep = raw.includes('\t') ? '\t' : raw.includes(';') ? ';' : ',';
  return lines.map(l => l.split(sep).map(c => c.trim()));
};

// mode 'lines' = satu baris tetap satu sel (tidak dipecah koma)
const Paste: React.FC<{ hint: string; onApply: (rows: string[][]) => void; mode?: 'cells' | 'lines' }> = ({ hint, onApply, mode = 'cells' }) => {
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState('');
  if (!open) return <button type="button" style={addBtn} onClick={() => setOpen(true)}>⇪ Tempel dari Excel / Sheets</button>;
  return (
    <div style={{ ...box, padding: '10px', background: '#fafafa', border: '1px solid #eee', borderRadius: '8px' }}>
      <span style={lbl}>{hint}</span>
      <textarea style={{ ...inp, minHeight: '90px', resize: 'vertical' }} value={txt} onChange={e => setTxt(e.target.value)} placeholder="Tempel di sini…" />
      <div style={{ display: 'flex', gap: '6px' }}>
        <button type="button" style={{ ...addBtn, background: '#111', color: '#fff', border: 'none' }} onClick={() => { const r = mode === 'lines' ? txt.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean).map(l => [l]) : splitLines(txt); if (r.length) onApply(r); setTxt(''); setOpen(false); }}>Terapkan</button>
        <button type="button" style={addBtn} onClick={() => { setTxt(''); setOpen(false); }}>Batal</button>
      </div>
    </div>
  );
};

interface Props { block: ContentBlock; onChange: (data: any) => void }

const DataBlockEditor: React.FC<Props> = ({ block, onChange }) => {
  const d = block.data || {};
  const set = (patch: any) => onChange({ ...d, ...patch });
  const upd = <T,>(arr: T[], i: number, patch: Partial<T>) => arr.map((x, xi) => (xi === i ? { ...x, ...patch } : x));

  let body: React.ReactNode = null;

  /* ── KARTU ANGKA ── */
  if (block.type === 'stats') {
    const items: any[] = d.items || [];
    body = (
      <div style={box}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '8px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <input style={inp} placeholder="Angka (7,7)" value={it.value} onChange={e => set({ items: upd(items, i, { value: e.target.value }) })} />
              <input style={inp} placeholder="Satuan (km)" value={it.unit} onChange={e => set({ items: upd(items, i, { unit: e.target.value }) })} />
              <input style={inp} placeholder="Label (Magnitudo)" value={it.label} onChange={e => set({ items: upd(items, i, { label: e.target.value }) })} />
              <input style={inp} placeholder="Keterangan (Flores)" value={it.note} onChange={e => set({ items: upd(items, i, { note: e.target.value }) })} />
            </div>
            <button type="button" style={xBtn} onClick={() => set({ items: items.filter((_, xi) => xi !== i) })}>×</button>
          </div>
        ))}
        {items.length < 6 && <div><button type="button" style={addBtn} onClick={() => set({ items: [...items, { value: '', unit: '', label: '', note: '' }] })}>+ Kartu</button></div>}
      </div>
    );
  }

  /* ── TABEL ── */
  if (block.type === 'table') {
    const cols: string[] = d.cols || [];
    const rows: { c: string[] }[] = d.rows || [];
    const nc = cols.length;
    const setCell = (ri: number, ci: number, v: string) => set({ rows: rows.map((r, i) => i !== ri ? r : { c: cols.map((_, k) => (k === ci ? v : r.c[k] || '')) }) });
    body = (
      <div style={box}>
        <div><span style={lbl}>Judul tabel</span><input style={inp} value={d.title || ''} onChange={e => set({ title: e.target.value })} placeholder="Data Gempa: Perbandingan Flores vs Kolombia" /></div>
        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${nc}, 130px) 28px`, gap: '5px', width: 'max-content' }}>
            {cols.map((c, ci) => (
              <div key={ci} style={{ display: 'flex', gap: '3px' }}>
                <input style={{ ...inp, fontWeight: 700, background: '#f4f4f5' }} value={c} placeholder={`Kolom ${ci + 1}`} onChange={e => set({ cols: cols.map((x, k) => (k === ci ? e.target.value : x)) })} />
                {nc > 2 && <button type="button" title="Hapus kolom" style={{ ...xBtn, width: '20px', height: 'auto', fontSize: '11px' }} onClick={() => set({ cols: cols.filter((_, k) => k !== ci), rows: rows.map(r => ({ c: r.c.filter((_, k) => k !== ci) })) })}>×</button>}
              </div>
            ))}
            <span />
            {rows.map((r, ri) => (
              <React.Fragment key={ri}>
                {cols.map((_, ci) => <input key={ci} style={inp} value={r.c[ci] || ''} onChange={e => setCell(ri, ci, e.target.value)} />)}
                <button type="button" title="Hapus baris" style={xBtn} onClick={() => set({ rows: rows.filter((_, k) => k !== ri) })}>×</button>
              </React.Fragment>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button type="button" style={addBtn} onClick={() => set({ rows: [...rows, { c: cols.map(() => '') }] })}>+ Baris</button>
          {nc < 6 && <button type="button" style={addBtn} onClick={() => set({ cols: [...cols, ''], rows: rows.map(r => ({ c: [...r.c, ''] })) })}>+ Kolom</button>}
        </div>
        <Paste hint="Baris pertama = judul kolom. Pisahkan kolom dengan Tab (dari Excel/Sheets), titik koma, atau koma." onApply={r => {
          const w = Math.min(6, Math.max(...r.map(x => x.length)));
          const pad = (x: string[]) => Array.from({ length: w }, (_, k) => x[k] || '');
          set({ cols: pad(r[0]), rows: r.slice(1).map(x => ({ c: pad(x) })) });
        }} />
        <div><span style={lbl}>Sumber (opsional)</span><input style={inp} value={d.source || ''} onChange={e => set({ source: e.target.value })} placeholder="BMKG" /></div>
      </div>
    );
  }

  /* ── GRAFIK ── */
  if (block.type === 'chart') {
    const pts: any[] = d.points || [];
    body = (
      <div style={box}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['line', 'bar'] as const).map(k => (
            <button key={k} type="button" onClick={() => set({ kind: k })}
              style={{ ...addBtn, flex: 1, borderStyle: 'solid', borderColor: (d.kind || 'line') === k ? '#111' : '#e0e0e0', background: (d.kind || 'line') === k ? '#111' : '#fff', color: (d.kind || 'line') === k ? '#fff' : '#888' }}>
              {k === 'line' ? 'Garis' : 'Batang'}
            </button>
          ))}
        </div>
        <div><span style={lbl}>Judul grafik</span><input style={inp} value={d.title || ''} onChange={e => set({ title: e.target.value })} placeholder="Jumlah Gempa Susulan" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <div><span style={lbl}>Satuan (opsional)</span><input style={inp} value={d.unit || ''} onChange={e => set({ unit: e.target.value })} placeholder="kali / Rp miliar" /></div>
          <div><span style={lbl}>Sumber (opsional)</span><input style={inp} value={d.source || ''} onChange={e => set({ source: e.target.value })} placeholder="BMKG" /></div>
        </div>
        <span style={lbl}>Data · label dan angka</span>
        {pts.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px' }}>
            <input style={{ ...inp, flex: 1.4 }} placeholder="Label (6 Agu)" value={p.label} onChange={e => set({ points: upd(pts, i, { label: e.target.value }) })} />
            <input style={{ ...inp, flex: 1 }} inputMode="decimal" placeholder="Angka" value={p.value} onChange={e => set({ points: upd(pts, i, { value: e.target.value }) })} />
            <button type="button" style={xBtn} onClick={() => set({ points: pts.filter((_, k) => k !== i) })}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button type="button" style={addBtn} onClick={() => set({ points: [...pts, { label: '', value: '' }] })}>+ Titik data</button>
        </div>
        <Paste hint="Satu baris = satu titik: label, angka (pisah dengan Tab, titik koma, atau koma)." onApply={r => set({ points: r.map(x => ({ label: x[0] || '', value: x[1] || '' })) })} />
      </div>
    );
  }

  /* ── GARIS WAKTU ── */
  if (block.type === 'timeline') {
    const items: any[] = d.items || [];
    body = (
      <div style={box}>
        <div><span style={lbl}>Judul</span><input style={inp} value={d.title || ''} onChange={e => set({ title: e.target.value })} placeholder="Timeline Kejadian Utama" /></div>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px' }}>
            <input style={{ ...inp, flex: 1 }} placeholder="Tanggal (5 Agu 2026)" value={it.date} onChange={e => set({ items: upd(items, i, { date: e.target.value }) })} />
            <input style={{ ...inp, flex: 1.6 }} placeholder="Kejadian" value={it.text} onChange={e => set({ items: upd(items, i, { text: e.target.value }) })} />
            <button type="button" style={xBtn} onClick={() => set({ items: items.filter((_, k) => k !== i) })}>×</button>
          </div>
        ))}
        <div><button type="button" style={addBtn} onClick={() => set({ items: [...items, { date: '', text: '' }] })}>+ Kejadian</button></div>
        <Paste hint="Satu baris = satu kejadian: tanggal, kejadian (pisah dengan Tab, titik koma, atau koma pertama)." onApply={r => set({ items: r.map(x => ({ date: x[0] || '', text: x.slice(1).join(', ') })) })} />
      </div>
    );
  }

  /* ── KUTIPAN ── */
  if (block.type === 'quote') {
    body = (
      <div style={box}>
        <div><span style={lbl}>Kutipan</span><textarea style={{ ...inp, minHeight: '70px', resize: 'vertical' }} value={d.text || ''} onChange={e => set({ text: e.target.value })} placeholder="Gempa M7,7 di Flores tergolong kuat…" /></div>
        <div><span style={lbl}>Sumber</span><input style={inp} value={d.source || ''} onChange={e => set({ source: e.target.value })} placeholder="BMKG, 5 Agustus 2026" /></div>
      </div>
    );
  }

  /* ── SEBAB → AKIBAT ── */
  if (block.type === 'cause') {
    const steps: any[] = d.steps || [];
    const swap = (i: number, j: number) => { if (j < 0 || j >= steps.length) return; const a = [...steps]; [a[i], a[j]] = [a[j], a[i]]; set({ steps: a }); };
    body = (
      <div style={box}>
        <div><span style={lbl}>Judul (opsional)</span><input style={inp} value={d.title || ''} onChange={e => set({ title: e.target.value })} placeholder="Bagaimana ini bisa terjadi" /></div>
        <span style={lbl}>Urutan dari sebab (atas) sampai akibat (bawah)</span>
        {steps.map((st, i) => (
          <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '8px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
            <span style={{ ...f, width: '20px', height: '20px', flexShrink: 0, borderRadius: '50%', background: '#111', color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '6px' }}>{i + 1}</span>
            <div style={{ flex: 1, ...box, gap: '5px' }}>
              <input style={inp} placeholder="Label kecil (opsional) — Pemicu / Reaksi pasar / Dampak" value={st.tag || ''} onChange={e => set({ steps: upd(steps, i, { tag: e.target.value }) })} />
              <input style={{ ...inp, fontWeight: 700 }} placeholder="Apa yang terjadi" value={st.text || ''} onChange={e => set({ steps: upd(steps, i, { text: e.target.value }) })} />
              <input style={inp} placeholder="Catatan singkat (opsional)" value={st.note || ''} onChange={e => set({ steps: upd(steps, i, { note: e.target.value }) })} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <button type="button" style={{ ...xBtn, background: '#f0f0f0', color: '#666', fontSize: '11px' }} onClick={() => swap(i, i - 1)}>↑</button>
              <button type="button" style={{ ...xBtn, background: '#f0f0f0', color: '#666', fontSize: '11px' }} onClick={() => swap(i, i + 1)}>↓</button>
              <button type="button" style={xBtn} onClick={() => set({ steps: steps.filter((_, k) => k !== i) })}>×</button>
            </div>
          </div>
        ))}
        <div><button type="button" style={addBtn} onClick={() => set({ steps: [...steps, { tag: '', text: '', note: '' }] })}>+ Langkah</button></div>
        <Paste mode="lines" hint="Satu baris = satu langkah. Boleh ditulis 'label; teks' atau teks saja." onApply={r => set({ steps: r.map(x => { const line = x[0]; const k = line.indexOf(';'); return k > 0 ? { tag: line.slice(0, k).trim(), text: line.slice(k + 1).trim(), note: '' } : { tag: '', text: line, note: '' }; }) })} />
      </div>
    );
  }

  /* ── PETA LOKASI ── */
  if (block.type === 'map') {
    const places: any[] = d.places || [];
    body = (
      <div style={box}>
        <div><span style={lbl}>Judul (opsional)</span><input style={inp} value={d.title || ''} onChange={e => set({ title: e.target.value })} placeholder="Peta Lokasi Kejadian" /></div>
        {places.map((p, i) => {
          const ok = !!resolvePlace(p);
          return (
            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', padding: '8px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
              <div style={{ flex: 1, ...box, gap: '5px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                  <input style={{ ...inp, fontWeight: 700 }} placeholder="Nama (Flores)" value={p.label || ''} onChange={e => set({ places: upd(places, i, { label: e.target.value }) })} />
                  <input style={inp} placeholder="Keterangan (Gempa M7,7)" value={p.note || ''} onChange={e => set({ places: upd(places, i, { note: e.target.value }) })} />
                </div>
                <select style={inp} value={p.country || ''} onChange={e => set({ places: upd(places, i, { country: e.target.value }) })}>
                  <option value="">Pilih negara (titik di tengah negara)</option>
                  {PLACE_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                <input style={inp} placeholder="atau koordinat tepat: -8.5, 121.7 (tahan lokasi di Google Maps lalu salin)" value={p.coord || ''} onChange={e => set({ places: upd(places, i, { coord: e.target.value }) })} />
                <span style={{ ...lbl, marginBottom: 0, color: ok ? '#2a9d5c' : '#d98a00' }}>{ok ? '✓ Lokasi dikenali' : p.label ? '⚠ Pilih negara atau isi koordinat, kalau tidak titiknya tidak tampil' : ''}</span>
              </div>
              <button type="button" style={xBtn} onClick={() => set({ places: places.filter((_, k) => k !== i) })}>×</button>
            </div>
          );
        })}
        <div><button type="button" style={addBtn} onClick={() => set({ places: [...places, { label: '', note: '', country: '', coord: '' }] })}>+ Lokasi</button></div>
        <div><span style={lbl}>Sumber (opsional)</span><input style={inp} value={d.source || ''} onChange={e => set({ source: e.target.value })} placeholder="BMKG" /></div>
      </div>
    );
  }

  return (
    <div style={box}>
      {body}
      <div style={{ borderTop: '1px dashed #e5e5e5', paddingTop: '8px' }}>
        <span style={lbl}>Pratinjau · seperti tampil di artikel</span>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '0 2px' }}>
          <div style={{ margin: '-14px 0' }}><DataBlockView block={block} /></div>
        </div>
      </div>
    </div>
  );
};

export default DataBlockEditor;
