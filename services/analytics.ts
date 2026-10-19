// Pelacakan kunjungan TelierNews (tanpa IP, tanpa data pribadi).
//
// Tiap tayangan halaman menulis 3 hal ke Firestore dalam satu batch:
//   1) analytics_visits/{auto}      : detail satu kunjungan (halaman, perangkat, sumber, dll), dipakai feed "Pengunjung masuk"
//   2) analytics_daily/{YYYY-MM-DD} : penghitung harian (tayangan, pengunjung, sesi, per jam, per artikel, dst), dipakai grafik
//   3) analytics_meta/totals        : total sepanjang masa
// Hari dihitung dengan zona waktu WIB.
//
// Pengunjung dikenali dari id acak di localStorage (bukan IP). Kunjungan admin tidak dihitung.

import { getFirestore, doc, collection, writeBatch, increment } from 'firebase/firestore';

export const COL_VISITS = 'analytics_visits';
export const COL_DAILY = 'analytics_daily';
export const COL_META = 'analytics_meta';
export const DOC_TOTALS = 'totals';

export interface VisitDoc {
  t: number; day: string; hour: number;
  path: string; kind: string; aid: string; title: string; cat: string;
  ref: string; refType: string;
  dev: string; os: string; br: string; cc: string; tz: string; lang: string; scr: number;
  vid: string; sid: string; nv: boolean; ns: boolean;
}

export interface DailyDoc {
  day: string; views?: number; visitors?: number; sessions?: number; newVisitors?: number;
  byHour?: Record<string, number>; byDev?: Record<string, number>; byRefType?: Record<string, number>;
  byRef?: Record<string, number>; byCC?: Record<string, number>; byBr?: Record<string, number>;
  byOs?: Record<string, number>; byKind?: Record<string, number>; byArticle?: Record<string, number>; byCat?: Record<string, number>;
}

export interface TotalsDoc { views?: number; sessions?: number; visitorsEver?: number }

/* ───────── waktu (WIB) ───────── */
const WIB = 7 * 3600 * 1000;
const iso = (ts: number) => new Date(ts + WIB).toISOString();
export const dayKey = (ts: number) => iso(ts).slice(0, 10);
export const hourOf = (ts: number) => Number(iso(ts).slice(11, 13));

/* ───────── pembersih kunci Firestore ───────── */
const key = (s: string) => (s || 'lainnya').replace(/[.\/\[\]*`~#$]/g, '_').slice(0, 40) || 'lainnya';

/* ───────── deteksi perangkat ───────── */
export const parseUA = (ua: string) => {
  const u = ua || '';
  const tablet = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(u);
  const mobile = /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(u);
  const dev = tablet ? 'tablet' : mobile ? 'mobile' : 'desktop';
  const os = /Android/i.test(u) ? 'Android' : /iPhone|iPad|iPod/i.test(u) ? 'iOS' : /Windows/i.test(u) ? 'Windows' : /Mac OS X|Macintosh/i.test(u) ? 'macOS' : /CrOS/i.test(u) ? 'ChromeOS' : /Linux/i.test(u) ? 'Linux' : 'Lainnya';
  const br =
    /Instagram/i.test(u) ? 'Instagram (in-app)' :
    /FBAN|FBAV|FB_IAB/i.test(u) ? 'Facebook (in-app)' :
    /TikTok|musical_ly|BytedanceWebview/i.test(u) ? 'TikTok (in-app)' :
    /Line\//i.test(u) ? 'LINE (in-app)' :
    /Twitter/i.test(u) ? 'X (in-app)' :
    /SamsungBrowser/i.test(u) ? 'Samsung Internet' :
    /EdgA?\/|Edg\//i.test(u) ? 'Edge' :
    /OPR\/|Opera/i.test(u) ? 'Opera' :
    /Firefox|FxiOS/i.test(u) ? 'Firefox' :
    /CriOS|Chrome\//i.test(u) ? 'Chrome' :
    /Safari\//i.test(u) ? 'Safari' : 'Lainnya';
  return { dev, os, br };
};

const isBot = (ua: string) => /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp\/|telegrambot/i.test(ua || '');

/* ───────── negara (perkiraan dari zona waktu, bukan IP) ───────── */
const TZ_CC: Record<string, string> = {
  'Asia/Jakarta': 'ID', 'Asia/Makassar': 'ID', 'Asia/Jayapura': 'ID', 'Asia/Pontianak': 'ID',
  'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Kuching': 'MY', 'Asia/Brunei': 'BN', 'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Manila': 'PH',
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN', 'Asia/Dhaka': 'BD', 'Asia/Karachi': 'PK',
  'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA', 'Asia/Kuwait': 'KW', 'Asia/Baghdad': 'IQ', 'Asia/Tehran': 'IR', 'Asia/Jerusalem': 'IL', 'Europe/Istanbul': 'TR',
  'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Madrid': 'ES', 'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Zurich': 'CH', 'Europe/Moscow': 'RU',
  'Africa/Cairo': 'EG', 'Africa/Lagos': 'NG', 'Africa/Johannesburg': 'ZA', 'Africa/Nairobi': 'KE',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Mexico_City': 'MX', 'America/Sao_Paulo': 'BR', 'America/Argentina/Buenos_Aires': 'AR',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Australia/Perth': 'AU', 'Australia/Brisbane': 'AU', 'Pacific/Auckland': 'NZ',
};
const guessCC = (tz: string) => TZ_CC[tz] || (tz ? tz.split('/')[0] : '??');

export const CC_NAME: Record<string, string> = {
  ID: 'Indonesia', SG: 'Singapura', MY: 'Malaysia', BN: 'Brunei', TH: 'Thailand', VN: 'Vietnam', PH: 'Filipina', JP: 'Jepang', KR: 'Korea Selatan', CN: 'China', HK: 'Hong Kong', TW: 'Taiwan',
  IN: 'India', BD: 'Bangladesh', PK: 'Pakistan', AE: 'Uni Emirat Arab', SA: 'Arab Saudi', QA: 'Qatar', KW: 'Kuwait', IQ: 'Irak', IR: 'Iran', IL: 'Israel', TR: 'Turki', GB: 'Inggris', IE: 'Irlandia',
  FR: 'Prancis', DE: 'Jerman', ES: 'Spanyol', IT: 'Italia', NL: 'Belanda', BE: 'Belgia', CH: 'Swiss', RU: 'Rusia', EG: 'Mesir', NG: 'Nigeria', ZA: 'Afrika Selatan', KE: 'Kenya',
  US: 'Amerika Serikat', CA: 'Kanada', MX: 'Meksiko', BR: 'Brasil', AR: 'Argentina', AU: 'Australia', NZ: 'Selandia Baru', '??': 'Tidak diketahui',
};

/* ───────── sumber trafik ───────── */
const SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|yandex|baidu|ecosia|brave)\./i;
const SOCIAL = /(^|\.)(facebook|fb|instagram|twitter|x|t|tiktok|youtube|youtu|threads|linkedin|reddit|pinterest|whatsapp|wa|telegram|t\.me|line|discord)\./i;

export const classifyRef = (referrer: string, own: string, utm: string): { ref: string; refType: string } => {
  if (utm) return { ref: utm.toLowerCase().slice(0, 40), refType: /ig|insta|fb|face|tiktok|tw|x\b|wa|tele|social/i.test(utm) ? 'sosial' : 'campaign' };
  if (!referrer) return { ref: '', refType: 'langsung' };
  let host = '';
  try { host = new URL(referrer).hostname.replace(/^www\./, '').replace(/^m\./, ''); } catch { return { ref: '', refType: 'langsung' }; }
  if (!host || host === own.replace(/^www\./, '')) return { ref: '', refType: 'internal' };
  if (SEARCH.test(host + '.')) return { ref: host, refType: 'pencarian' };
  if (SOCIAL.test(host + '.') || /^(l\.|lm\.)?facebook\.com$/.test(host) || host === 't.co' || host === 'wa.me') return { ref: host, refType: 'sosial' };
  return { ref: host, refType: 'situs lain' };
};

/* ───────── id pengunjung & sesi ───────── */
const rand = () => (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID().replace(/-/g, '').slice(0, 14) : Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-6));
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* abaikan */ } },
};

const classify = (path: string): { kind: string; aid: string; cat: string } => {
  if (path === '/' || path === '') return { kind: 'beranda', aid: '', cat: '' };
  if (path.startsWith('/news/')) return { kind: 'artikel', aid: path.split('/')[2] || '', cat: '' };
  if (path.startsWith('/category/')) return { kind: 'kategori', aid: '', cat: decodeURIComponent(path.split('/')[2] || '') };
  if (path.startsWith('/deep-dive')) return { kind: 'deep dive', aid: '', cat: '' };
  if (path.startsWith('/timeline/')) return { kind: 'timeline', aid: '', cat: '' };
  if (path.startsWith('/world')) return { kind: 'world', aid: '', cat: '' };
  if (path.startsWith('/quiz')) return { kind: 'quiz', aid: '', cat: '' };
  if (path.startsWith('/top-stories')) return { kind: 'top stories', aid: '', cat: '' };
  return { kind: 'lainnya', aid: '', cat: '' };
};

/* ───────── PELACAK ───────── */
export const trackPageview = async (path: string, meta: { title?: string; cat?: string } = {}): Promise<void> => {
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
    const ua = navigator.userAgent || '';
    if (isBot(ua)) return;
    if (/^\/admin/.test(path)) return;
    if (ls.get('admin_secret_code')) return; // perangkat admin tidak dihitung
    if (/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname)) return;

    const now = Date.now();
    const w = window as any;
    if (w.__tn_last && w.__tn_last.p === path && now - w.__tn_last.t < 1500) return; // cegah hitungan ganda
    w.__tn_last = { p: path, t: now };

    // pengunjung
    let vid = ls.get('tn_vid'); let nv = false;
    if (!vid) { vid = rand(); ls.set('tn_vid', vid); nv = true; }
    const day = dayKey(now);
    const newToday = ls.get('tn_vday') !== day; // pengunjung unik per hari
    ls.set('tn_vday', day);

    // sesi: berakhir setelah 30 menit tidak aktif
    let sid = ''; let ns = false;
    const raw = ls.get('tn_s') || '';
    const [s0, t0] = raw.split('|');
    if (s0 && now - Number(t0 || 0) < 30 * 60 * 1000) sid = s0; else { sid = rand(); ns = true; }
    ls.set('tn_s', `${sid}|${now}`);

    const { dev, os, br } = parseUA(ua);
    const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { return ''; } })();
    const cc = guessCC(tz);
    const c = classify(path);
    let ref = '', refType = 'internal';
    if (ns) {
      const utm = new URLSearchParams(location.search).get('utm_source') || '';
      ({ ref, refType } = classifyRef(document.referrer, location.hostname, utm));
      if (refType === 'internal') refType = 'langsung';
    }

    const visit: VisitDoc = {
      t: now, day, hour: hourOf(now), path: path.slice(0, 160), kind: c.kind, aid: c.aid, title: (meta.title || '').slice(0, 140), cat: (meta.cat || c.cat).slice(0, 40),
      ref, refType, dev, os, br, cc, tz: tz.slice(0, 40), lang: (navigator.language || '').slice(0, 12), scr: Math.round(window.innerWidth || 0),
      vid, sid, nv, ns,
    };

    const db = getFirestore();
    const batch = writeBatch(db);
    batch.set(doc(collection(db, COL_VISITS)), visit);

    const daily: any = {
      day,
      views: increment(1), visitors: increment(newToday ? 1 : 0), sessions: increment(ns ? 1 : 0), newVisitors: increment(nv ? 1 : 0),
      byHour: { [String(visit.hour)]: increment(1) },
      byDev: { [key(dev)]: increment(1) }, byBr: { [key(br)]: increment(1) }, byOs: { [key(os)]: increment(1) }, byCC: { [key(cc)]: increment(1) }, byKind: { [key(c.kind)]: increment(1) },
    };
    if (ns) { daily.byRefType = { [key(refType)]: increment(1) }; if (ref) daily.byRef = { [key(ref)]: increment(1) }; }
    if (c.aid) daily.byArticle = { [key(c.aid)]: increment(1) };
    if (visit.cat) daily.byCat = { [key(visit.cat)]: increment(1) };
    batch.set(doc(db, COL_DAILY, day), daily, { merge: true });

    batch.set(doc(db, COL_META, DOC_TOTALS), { views: increment(1), sessions: increment(ns ? 1 : 0), visitorsEver: increment(nv ? 1 : 0) }, { merge: true });
    await batch.commit();
  } catch {
    /* pelacakan tidak boleh mengganggu pembaca */
  }
};

/* ───────── ATURAN FIRESTORE (ditampilkan di Admin kalau akses ditolak) ───────── */
export const RULES_TEXT = `// Tambahkan di dalam "match /databases/{database}/documents { ... }", sejajar dengan aturan lain.
// Ganti email di isAdmin() dengan email akun admin lu.
function isAdmin() {
  return request.auth != null && request.auth.token.email == 'yatumnn@gmail.com';
}

match /analytics_visits/{id} {
  allow create: if request.resource.data.keys().hasOnly(['t','day','hour','path','kind','aid','title','cat','ref','refType','dev','os','br','cc','tz','lang','scr','vid','sid','nv','ns'])
                && request.resource.data.path is string && request.resource.data.path.size() < 200;
  allow read, delete: if isAdmin();
}
match /analytics_daily/{day} {
  allow create, update: if day.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
  allow read: if isAdmin();
}
match /analytics_meta/{id} {
  allow create, update: if id == 'totals';
  allow read: if isAdmin();
}`;
