// Susun otomatis: baca artikel -> usulkan blok visual (tabel, grafik, garis waktu, kutipan, dll).
//
// Dua mode:
//  1) AI (Gemini)  : paham konteks. Hasilnya DIVERIFIKASI: angka/kutipan harus benar-benar ada di artikel,
//                    kalau tidak, blok itu dibuang (AI tidak boleh mengarang data).
//  2) Aturan biasa : tanpa AI. Hanya menangkap pola jelas: urutan tanggal, kutipan bertanda kutip, banyak lokasi.
//
// Memakai kunci Gemini yang sama dengan services/geminiService.ts (GEM_KEY, GEM_KEY2, GEM_KEY3) dan model gemini-2.5-flash.
// Kalau semua key gagal, otomatis pakai mode aturan dan memberi tahu alasannya.

import { GoogleGenAI } from '@google/genai';
import { PLACE_OPTIONS } from '../components/DataBlocks';

export type SuggestType = 'stats' | 'table' | 'chart' | 'timeline' | 'quote' | 'cause' | 'map';

export interface Suggestion {
  id: string;
  type: SuggestType;
  data: any;
  after: number; // sisipkan setelah paragraf nomor ini (0 = paragraf pertama)
  reason: string;
}

export interface Para { html: string; text: string; heading: boolean }

export interface SuggestResult {
  mode: 'ai' | 'rules';
  note: string; // info untuk ditampilkan (mis. kenapa jatuh ke mode aturan)
  items: Suggestion[];
  rejected: string[]; // alasan blok yang dibuang
}

/* ───────── pecah HTML jadi paragraf ───────── */
export const splitParagraphs = (html: string): Para[] => {
  const marked = html
    .replace(/<\/(p|div|h[1-6]|blockquote|ul|ol)>/gi, m => m + '\u0001')
    .replace(/<br\s*\/?>/gi, '\u0001');
  const tmp = document.createElement('div');
  const out: Para[] = [];
  marked.split('\u0001').forEach(piece => {
    tmp.innerHTML = piece;
    const text = (tmp.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
    if (!text) return;
    let inner = tmp.innerHTML.trim();
    const single = tmp.children.length === 1 && tmp.firstElementChild!.outerHTML === inner ? tmp.firstElementChild! : null;
    if (single && single.tagName === 'DIV') inner = `<p>${single.innerHTML}</p>`;
    else if (!/^<(p|h[1-6]|blockquote|ul|ol)[\s>]/i.test(inner)) inner = `<p>${inner}</p>`;
    out.push({ html: inner, text, heading: /^<h[1-6][\s>]/i.test(inner) });
  });
  return out;
};

/* ───────── util teks ───────── */
const norm = (t: string) => t.toLowerCase().replace(/[“”„‟"]/g, '"').replace(/[‘’']/g, "'").replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

const sentences = (t: string): string[] => {
  const out: string[] = [];
  let cur = '';
  for (let i = 0; i < t.length; i++) {
    cur += t[i];
    if ('.!?'.includes(t[i]) && (i === t.length - 1 || /\s/.test(t[i + 1]))) { out.push(cur.trim()); cur = ''; }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
};

const cut = (s: string, n: number) => {
  if (s.length <= n) return s;
  const c = s.slice(0, n);
  return c.slice(0, Math.max(c.lastIndexOf(' '), n - 20)).replace(/[,;:\s]+$/, '') + '…';
};

const MONTH_ABBR: Record<string, string> = { januari: 'Jan', jan: 'Jan', februari: 'Feb', feb: 'Feb', maret: 'Mar', mar: 'Mar', april: 'Apr', apr: 'Apr', mei: 'Mei', juni: 'Jun', jun: 'Jun', juli: 'Jul', jul: 'Jul', agustus: 'Agu', agu: 'Agu', agt: 'Agu', ags: 'Agu', september: 'Sep', sep: 'Sep', sept: 'Sep', oktober: 'Okt', okt: 'Okt', november: 'Nov', nov: 'Nov', desember: 'Des', des: 'Des' };
const MONTH_NUM: Record<string, number> = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, Mei: 5, Jun: 6, Jul: 7, Agu: 8, Sep: 9, Okt: 10, Nov: 11, Des: 12 };
const NUM_TO_ABBR = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS = 'Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|Jun|Jul|Agu|Agt|Ags|Sept|Sep|Okt|Nov|Des';

// Cari tanggal pertama dalam kalimat. Hasil: label rapi + kunci urut.
const findDate = (s: string): { label: string; key: number | null } | null => {
  const a = new RegExp(`\\b(\\d{1,2})(?:\\s?[–-]\\s?(\\d{1,2}))?\\s+(${MONTHS})\\b\\.?(?:\\s+(\\d{4}))?`, 'i').exec(s);
  const b = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/.exec(s);
  let hit: { idx: number; d: string; m: string; y?: string; d2?: string } | null = null;
  if (a) hit = { idx: a.index, d: a[1], d2: a[2], m: MONTH_ABBR[a[3].toLowerCase()], y: a[4] };
  if (b && Number(b[2]) >= 1 && Number(b[2]) <= 12 && (!hit || b.index < hit.idx)) hit = { idx: b.index, d: String(Number(b[1])), m: NUM_TO_ABBR[Number(b[2])], y: b[3] };
  if (!hit) return null;
  const label = `${hit.d}${hit.d2 ? '–' + hit.d2 : ''} ${hit.m}${hit.y ? ' ' + hit.y : ''}`;
  const key = hit.y ? Number(hit.y) * 10000 + MONTH_NUM[hit.m] * 100 + Number(hit.d) : null;
  return { label, key };
};

/* ───────── MODE ATURAN (tanpa AI) ───────── */
export const ruleSuggest = (paras: Para[]): Suggestion[] => {
  const out: Suggestion[] = [];
  let n = 0;
  const id = () => `r${++n}`;

  // 1) Garis waktu: beberapa kalimat bertanggal
  const entries: { label: string; key: number | null; text: string; para: number }[] = [];
  paras.forEach((p, pi) => {
    if (p.heading) return;
    let txt = p.text;
    if (pi === 0) txt = txt.replace(/^[^—–]{0,45}\s[—–]\s*/, ''); // buang dateline "Jakarta, 18 Oktober 2026 —"
    sentences(txt).forEach(sn => {
      const d = findDate(sn);
      if (!d || entries.some(e => e.label === d.label)) return;
      entries.push({ label: d.label, key: d.key, text: cut(sn.replace(/\s*\[\d+\]\s*/g, ' ').trim(), 120), para: pi });
    });
  });
  if (entries.length >= 3) {
    const sorted = entries.every(e => e.key !== null) ? [...entries].sort((a, b) => (a.key as number) - (b.key as number)) : entries;
    out.push({ id: id(), type: 'timeline', after: Math.max(...entries.map(e => e.para)), reason: `Ada ${entries.length} kejadian bertanggal`, data: { title: 'Linimasa Kejadian', items: sorted.map(e => ({ date: e.label, text: e.text })) } });
  }

  // 2) Kutipan: kalimat dalam tanda kutip + ada pembicaranya
  paras.forEach((p, pi) => {
    if (p.heading) return;
    const re = /[“"]([^”"]{25,320})[”"]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(p.text))) {
      const after = p.text.slice(m.index + m[0].length, m.index + m[0].length + 100);
      const before = p.text.slice(Math.max(0, m.index - 110), m.index);
      const a1 = /^[,.]?\s*[-–—]?\s*(?:kata|ujar|tutur|ungkap|ucap|menurut|jelas|tegas|papar)\s+([^.;:,“"]{2,70})/i.exec(after);
      const a2 = /(?:^|[.;]\s|,\s)([A-Z][^.;“"]{2,60}?)\s+(?:mengatakan|menyatakan|menegaskan|berkata|mengungkapkan|menjelaskan|kata|ujar|ungkap)\s*[:,]?\s*$/.exec(before);
      const who = (a1 ? a1[1] : a2 ? a2[1] : '').trim();
      if (!who) continue;
      out.push({ id: id(), type: 'quote', after: pi, reason: 'Kalimat langsung dari narasumber', data: { text: m[1].trim(), source: who } });
      break;
    }
  });

  // 3) Peta: banyak lokasi berbeda disebut
  const found: { code: string; name: string; para: number }[] = [];
  paras.forEach((p, pi) => {
    PLACE_OPTIONS.forEach(o => {
      if (found.some(f => f.code === o.code)) return;
      if (new RegExp(`(^|[^\\p{L}])${o.name.replace(/[()]/g, '\\$&')}($|[^\\p{L}])`, 'u').test(p.text)) found.push({ code: o.code, name: o.name, para: pi });
    });
  });
  if (found.length >= 2) {
    out.push({ id: id(), type: 'map', after: Math.min(...found.map(f => f.para)), reason: `Menyebut ${found.length} lokasi`, data: { title: 'Peta Lokasi', source: '', places: found.map(f => ({ label: f.name, note: '', country: f.code, coord: '' })) } });
  }
  return out;
};

/* ───────── MODE AI (Gemini) ───────── */
const GEMINI_KEYS = [
  import.meta.env.GEM_KEY || '',
  import.meta.env.GEM_KEY2 || '',
  import.meta.env.GEM_KEY3 || '',
].filter((k: string) => k !== '');

const callGemini = async (prompt: string): Promise<string> => {
  if (!GEMINI_KEYS.length) throw new Error('Key Gemini (GEM_KEY) tidak terbaca di sisi browser');
  let last: any = null;
  for (const key of GEMINI_KEYS) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response: any = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { temperature: 0.2, responseMimeType: 'application/json' },
      });
      const text = (response.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('');
      if (text) return text;
    } catch (e) { last = e; }
  }
  throw new Error(last?.message ? `Gemini error: ${String(last.message).slice(0, 80)}` : 'Gemini tidak menjawab');
};

const buildPrompt = (title: string, paras: Para[]) => {
  const list = paras.map((p, i) => `[${i}] ${p.heading ? '(SUBJUDUL) ' : ''}${p.text}`).join('\n');
  const places = PLACE_OPTIONS.map(o => `${o.code}=${o.name}`).join(', ');
  return `Kamu editor visual sebuah situs berita. Tugasmu: dari artikel di bawah, usulkan BLOK VISUAL yang membantu pembaca memahami alur sebab-akibat dan poin utama, lalu tentukan disisipkan setelah paragraf nomor berapa.

ATURAN KERAS:
- Hanya pakai fakta dan angka yang TERTULIS di artikel. Salin angka persis seperti di artikel. DILARANG menghitung, memperkirakan, atau mengarang data.
- Jangan membuat grafik kecuali artikel punya minimal 3 titik data untuk ukuran yang sama (misalnya angka per hari). Kalau tidak ada, jangan buat grafik.
- Kutipan harus kalimat langsung yang tertulis persis di artikel, lengkap dengan pembicaranya.
- Maksimal 6 blok. Lebih baik sedikit tapi tepat. Kalau tidak ada yang layak, kembalikan daftar kosong.
- "after" = nomor paragraf (angka di dalam [ ]) tempat blok disisipkan SETELAHNYA. Pilih paragraf isi, jangan subjudul. Jangan taruh dua blok di titik yang sama.
- Teks dalam blok singkat, Bahasa Indonesia.

JENIS BLOK dan bentuk "data":
- stats (2-4 kartu angka): {"items":[{"value":"11,57","unit":"%","label":"IHSG anjlok","note":"Jumat 16 Okt"}]}
- table (perbandingan, 2-5 kolom, kolom pertama = aspek): {"title":"","cols":["Aspek","A","B"],"rows":[{"c":["","",""]}],"source":""}
- chart (hanya jika ada deret data): {"title":"","kind":"line","unit":"","source":"","points":[{"label":"6 Agu","value":"12"}]}  (kind: line atau bar)
- timeline (urutan kejadian bertanggal): {"title":"","items":[{"date":"15 Okt 2026","text":"..."}]}
- quote: {"text":"kalimat persis","source":"nama pembicara"}
- cause (rantai sebab-akibat, 3-6 langkah, urut dari sebab ke akibat): {"title":"","steps":[{"tag":"Pemicu","text":"...","note":""}]}
- map (2+ lokasi): {"title":"","source":"","places":[{"label":"Flores","note":"Gempa M7,7","country":"kode negara","coord":"lat, lon bila lokasi spesifik, kosongkan jika tidak yakin"}]}
  Kode negara yang boleh dipakai: ${places}

FORMAT JAWABAN (JSON saja):
{"blocks":[{"type":"timeline","after":3,"reason":"alasan singkat","data":{...}}]}

JUDUL ARTIKEL: ${title || '(tanpa judul)'}

ARTIKEL (tiap paragraf bernomor):
${list}`;
};

const str = (v: any, max = 200) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

// Rapikan bentuk data dari AI supaya pasti sesuai yang dipahami renderer.
const shape = (type: SuggestType, d: any): any => {
  d = d || {};
  switch (type) {
    case 'stats': return { items: arr(d.items).slice(0, 4).map(i => ({ value: str(i.value, 20), unit: str(i.unit, 12), label: str(i.label, 40), note: str(i.note, 50) })).filter(i => i.value) };
    case 'table': {
      const cols = arr(d.cols).slice(0, 5).map(c => str(c, 40));
      return { title: str(d.title, 100), source: str(d.source, 80), cols, rows: arr(d.rows).slice(0, 10).map(r => ({ c: cols.map((_, k) => str(arr(r?.c)[k], 120)) })) };
    }
    case 'chart': return { title: str(d.title, 100), kind: d.kind === 'bar' ? 'bar' : 'line', unit: str(d.unit, 20), source: str(d.source, 80), points: arr(d.points).slice(0, 40).map(p => ({ label: str(p.label, 20), value: str(p.value, 20) })) };
    case 'timeline': return { title: str(d.title, 100), items: arr(d.items).slice(0, 10).map(i => ({ date: str(i.date, 30), text: str(i.text, 160) })).filter(i => i.text) };
    case 'quote': return { text: str(d.text, 400), source: str(d.source, 100) };
    case 'cause': return { title: str(d.title, 100), steps: arr(d.steps).slice(0, 6).map(s => ({ tag: str(s.tag, 24), text: str(s.text, 160), note: str(s.note, 120) })).filter(s => s.text) };
    case 'map': return { title: str(d.title, 100), source: str(d.source, 80), places: arr(d.places).slice(0, 8).map(p => ({ label: str(p.label, 40), note: str(p.note, 50), country: str(p.country, 4).toLowerCase(), coord: str(p.coord, 40) })).filter(p => p.label) };
  }
};

// Angka di blok harus ada di artikel. Mengembalikan alasan penolakan atau '' kalau lolos.
const verify = (type: SuggestType, d: any, full: string): string => {
  const nf = norm(full);
  const nums = (t: string) => (t.match(/\d[\d.,]*\d|\d/g) || []).map(x => x.replace(/[.,]$/, ''));
  const missing = (t: string) => nums(t).find(x => !nf.includes(x.toLowerCase()));
  if (type === 'stats') {
    d.items = d.items.filter((i: any) => !missing(i.value));
    return d.items.length < 2 ? 'kartu angka: angkanya tidak ada di artikel' : '';
  }
  if (type === 'table') {
    if (d.cols.length < 2 || d.rows.length < 1) return 'tabel: terlalu kecil';
    const bad = d.rows.some((r: any) => r.c.some((c: string) => missing(c)));
    return bad ? 'tabel: ada angka yang tidak ada di artikel' : '';
  }
  if (type === 'chart') {
    if (d.points.length < 3) return 'grafik: titik data kurang dari 3';
    return d.points.some((p: any) => missing(p.value)) ? 'grafik: ada angka yang tidak ada di artikel' : '';
  }
  if (type === 'timeline') {
    if (d.items.length < 2) return 'garis waktu: kurang dari 2 kejadian';
    return d.items.some((i: any) => missing(i.date)) ? 'garis waktu: tanggalnya tidak ada di artikel' : '';
  }
  if (type === 'quote') {
    if (!d.text || !d.source) return 'kutipan: tidak lengkap';
    return nf.includes(norm(d.text).replace(/[.,]$/, '')) ? '' : 'kutipan: kalimatnya tidak persis ada di artikel';
  }
  if (type === 'cause') return d.steps.length < 3 ? 'sebab-akibat: kurang dari 3 langkah' : '';
  if (type === 'map') {
    d.places = d.places.filter((p: any) => nf.includes(norm(p.label)) || nf.includes(norm(PLACE_OPTIONS.find(o => o.code === p.country)?.name || '\u0000')));
    return d.places.length < 2 ? 'peta: lokasinya tidak ada di artikel' : '';
  }
  return '';
};

export const parseAiJson = (raw: string): any => {
  const t = raw.replace(/```json|```/g, '').trim();
  try { return JSON.parse(t); } catch { /* coba potong */ }
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
  throw new Error('Jawaban AI tidak bisa dibaca');
};

// Ubah jawaban AI jadi usulan yang sudah rapi + terverifikasi
export const sanitizeAi = (json: any, paras: Para[]): { items: Suggestion[]; rejected: string[] } => {
  const full = paras.map(p => p.text).join('\n');
  const items: Suggestion[] = [];
  const rejected: string[] = [];
  const types: SuggestType[] = ['stats', 'table', 'chart', 'timeline', 'quote', 'cause', 'map'];
  arr(json?.blocks).slice(0, 8).forEach((b: any, i: number) => {
    const type = b?.type as SuggestType;
    if (!types.includes(type)) return;
    const data = shape(type, b.data);
    const why = verify(type, data, full);
    if (why) { rejected.push(why); return; }
    let after = Number.isFinite(Number(b.after)) ? Math.round(Number(b.after)) : 0;
    after = Math.max(0, Math.min(paras.length - 1, after));
    while (paras[after]?.heading && after > 0) after--; // jangan di bawah subjudul
    items.push({ id: `a${i + 1}`, type, data, after, reason: str(b.reason, 140) || 'Usulan AI' });
  });
  return { items, rejected };
};

export const suggestBlocks = async (title: string, paras: Para[]): Promise<SuggestResult> => {
  try {
    const raw = await callGemini(buildPrompt(title, paras));
    const { items, rejected } = sanitizeAi(parseAiJson(raw), paras);
    return { mode: 'ai', note: 'Disusun oleh Gemini. Angka dan kutipan sudah dicek harus ada di artikel.', items, rejected };
  } catch (e: any) {
    return { mode: 'rules', note: `AI belum bisa dipakai (${e?.message || 'gagal'}). Memakai mode aturan: hanya mengenali urutan tanggal, kutipan, dan lokasi.`, items: ruleSuggest(paras), rejected: [] };
  }
};
