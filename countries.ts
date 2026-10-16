// Daftar negara untuk halaman World + dropdown Admin.
//
// Mau nambah negara? Tambah satu blok di COUNTRIES:
//   { code: 'xx', name: 'Nama Negara', lat: ..., lon: ..., zoom: ..., keywords: ['kata', 'kunci'] }
// - code     : 2 huruf kecil, dipakai di URL (/world/xx) dan disimpan di artikel
// - lat/lon  : posisi titik negara di peta (lintang, bujur)
// - zoom     : seberapa dekat peta di halaman negara (negara besar 2-3, kecil 6-9)
// - tz       : zona waktu IANA ibukota, misal 'Asia/Jakarta' (dipakai kartu World Clock)
// - focus    : (opsional) [lat, lon] kalau pusat zoom beda dari titik marker
// - keywords : kata kunci (huruf kecil) untuk DETEKSI OTOMATIS negara dari judul/ringkasan berita
// - exact    : (opsional) singkatan yang harus persis huruf besar, misal 'AS', 'RI'
import { NewsArticle } from './types';

export interface Country {
  code: string;
  name: string;
  lat: number;
  lon: number;
  zoom: number;
  tz: string; // zona waktu IANA untuk kartu World Clock di Home
  focus?: [number, number];
  keywords: string[];
  exact?: string[];
}

export const COUNTRIES: Country[] = [
  {
    code: 'id', name: 'Indonesia', lat: -2.5, lon: 118, zoom: 3, tz: 'Asia/Jakarta',
    keywords: ['indonesia', 'indonesian', 'prabowo', 'jokowi', 'gibran', 'jakarta', 'nusantara', 'tni', 'polri', 'kpk', 'bmkg', 'dpr', 'mpr', 'rupiah', 'ihsg', 'krakatau', 'sumatera', 'sumatra', 'kalimantan', 'papua', 'surabaya', 'bandung', 'bali', 'yogyakarta', 'makassar', 'medan', 'semarang', 'aceh', 'sulawesi', 'kemenkeu', 'sri mulyani', 'gubernur', 'bupati', 'wali kota'],
    exact: ['RI'],
  },
  {
    code: 'us', name: 'Amerika Serikat', lat: 39.5, lon: -98.5, zoom: 2.4, tz: 'America/New_York',
    keywords: ['amerika serikat', 'amerika', 'trump', 'biden', 'gedung putih', 'white house', 'pentagon', 'wall street', 'nasdaq', 'dow jones', 'federal reserve', 'the fed', 'silicon valley', 'new york', 'california', 'texas', 'washington', 'kongres'],
    exact: ['AS', 'US', 'USA'],
  },
  {
    code: 'cn', name: 'China', lat: 35, lon: 104, zoom: 2.6, tz: 'Asia/Shanghai',
    keywords: ['china', 'tiongkok', 'cina', 'beijing', 'xi jinping', 'shanghai', 'shenzhen', 'huawei', 'tencent', 'alibaba', 'bytedance', 'xiaomi', 'hong kong', 'guangzhou', 'chengdu'],
  },
  {
    code: 'jp', name: 'Jepang', lat: 36.5, lon: 138.5, zoom: 5.5, tz: 'Asia/Tokyo',
    keywords: ['jepang', 'japan', 'tokyo', 'osaka', 'toyota', 'sony', 'nikkei', 'kishida', 'ishiba', 'nintendo', 'hiroshima', 'kyoto'],
  },
  {
    code: 'ru', name: 'Rusia', lat: 60, lon: 95, zoom: 1.7, tz: 'Europe/Moscow',
    keywords: ['rusia', 'russia', 'moskow', 'moskwa', 'moscow', 'putin', 'kremlin', 'lavrov', 'gazprom', 'siberia'],
  },
  {
    code: 'in', name: 'India', lat: 21, lon: 79, zoom: 3.6, tz: 'Asia/Kolkata',
    keywords: ['india', 'delhi', 'modi', 'mumbai', 'bengaluru', 'bollywood'],
  },
  {
    code: 'gb', name: 'Inggris', lat: 54, lon: -2.5, zoom: 7, tz: 'Europe/London',
    keywords: ['inggris', 'britania', 'britain', 'british', 'london', 'united kingdom', 'starmer', 'sunak', 'king charles', 'raja charles', 'downing street', 'westminster', 'premier league', 'manchester', 'liverpool'],
    exact: ['UK'],
  },
  {
    code: 'de', name: 'Jerman', lat: 51, lon: 10, zoom: 7, tz: 'Europe/Berlin',
    keywords: ['jerman', 'germany', 'german', 'berlin', 'bundestag', 'scholz', 'merz', 'volkswagen', 'bmw', 'munich', 'frankfurt', 'bundesliga'],
  },
  {
    code: 'au', name: 'Australia', lat: -25, lon: 134, zoom: 3, tz: 'Australia/Sydney',
    keywords: ['australia', 'canberra', 'sydney', 'melbourne', 'albanese', 'aussie', 'perth', 'brisbane'],
  },
  {
    code: 'sg', name: 'Singapura', lat: 1.35, lon: 103.8, zoom: 8, tz: 'Asia/Singapore',
    keywords: ['singapura', 'singapore'],
  },
  {
    code: 'my', name: 'Malaysia', lat: 4.2, lon: 102, zoom: 6.5, tz: 'Asia/Kuala_Lumpur', focus: [3.5, 109],
    keywords: ['malaysia', 'kuala lumpur', 'anwar ibrahim', 'petronas', 'putrajaya', 'johor'],
  },
  {
    code: 'kr', name: 'Korea Selatan', lat: 36.5, lon: 128, zoom: 9, tz: 'Asia/Seoul',
    keywords: ['korea selatan', 'south korea', 'seoul', 'samsung', 'hyundai', 'k-pop', 'kpop', 'yoon suk', 'busan'],
  },
  {
    code: 'fr', name: 'Prancis', lat: 46.5, lon: 2.5, zoom: 7, tz: 'Europe/Paris',
    keywords: ['prancis', 'france', 'french', 'paris', 'macron', 'elysee', 'louvre', 'marseille'],
  },
  {
    code: 'br', name: 'Brasil', lat: -10, lon: -52, zoom: 2.6, tz: 'America/Sao_Paulo',
    keywords: ['brasil', 'brazil', 'brasilia', 'lula', 'sao paulo', 'rio de janeiro', 'bolsonaro'],
  },
  {
    code: 'ua', name: 'Ukraina', lat: 49, lon: 31.5, zoom: 7, tz: 'Europe/Kyiv',
    keywords: ['ukraina', 'ukraine', 'kyiv', 'kiev', 'zelensky', 'zelenskyy', 'kharkiv', 'donbas', 'odesa'],
  },
  {
    code: 'sa', name: 'Arab Saudi', lat: 24, lon: 45, zoom: 4.5, tz: 'Asia/Riyadh',
    keywords: ['arab saudi', 'saudi', 'riyadh', 'riyad', 'aramco', 'mohammed bin salman', 'mekkah', 'makkah', 'mecca', 'jeddah'],
  },
];

export const getCountry = (code?: string): Country | undefined =>
  COUNTRIES.find(c => c.code === (code || '').toLowerCase());

export const getCountryName = (code?: string): string => getCountry(code)?.name || '';

// ───────────── Deteksi negara otomatis ─────────────

// Nilai khusus di Admin: berita ini sengaja TANPA negara (jangan dideteksi otomatis)
export const GLOBAL_CODE = 'global';

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface Matcher { code: string; words: RegExp[]; exact: RegExp[]; }

// Kata utuh (bukan potongan kata): "bali" cocok, "kebalikan" tidak
const MATCHERS: Matcher[] = COUNTRIES.map(c => ({
  code: c.code,
  words: c.keywords.map(k => new RegExp(`(^|[^a-z0-9])${escapeRe(k)}(?![a-z0-9])`, 'i')),
  exact: (c.exact || []).map(k => new RegExp(`(^|[^A-Za-z0-9])${escapeRe(k)}(?![A-Za-z0-9])`)),
}));

const scoreText = (text: string, weight: number, m: Matcher) => {
  let score = 0;
  let first = Infinity; // posisi kecocokan paling awal
  const hit = (re: RegExp) => {
    const r = re.exec(text);
    if (r) { score += weight; first = Math.min(first, r.index + r[1].length); }
  };
  m.words.forEach(hit);
  m.exact.forEach(hit);
  return { score, first };
};

// Judul: bobot 3 per kata kunci. Ringkasan: bobot 1. Minimal skor 2 supaya tidak asal tebak.
export const detectCountry = (title: string, summary: string): string => {
  let best = '';
  let bestScore = 0;
  let bestFirst = Infinity;
  for (const m of MATCHERS) {
    const t = scoreText(title || '', 3, m);
    const s = scoreText(summary || '', 1, m);
    const total = t.score + s.score;
    if (total < 2) continue;
    if (total > bestScore || (total === bestScore && t.first < bestFirst)) {
      best = m.code; bestScore = total; bestFirst = t.first;
    }
  }
  return best;
};

const detectCache = new WeakMap<object, string>();

// Negara sebuah artikel:
// 1) tag dari Admin kalau ada, 2) kosong kalau Admin pilih "Global", 3) kalau tidak: tebak dari isi berita.
export const getArticleCountry = (a: NewsArticle): string => {
  if (a.country === GLOBAL_CODE) return '';
  if (a.country) return a.country;
  const cached = detectCache.get(a);
  if (cached !== undefined) return cached;
  const code = detectCountry(a.title, a.summary);
  detectCache.set(a, code);
  return code;
};
