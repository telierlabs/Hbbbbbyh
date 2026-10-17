import { NewsArticle } from './types';

// News Timeline = kumpulan artikel biasa yang punya nama timeline yang sama (field `timeline` di artikel).
// Tidak ada koleksi Firestore tambahan: semua dihitung dari daftar artikel.

export const slugify = (s: string): string =>
  (s || '').trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');

export interface TimelineItem {
  key: string;
  articleId: string;
  at: string; // ISO
  title: string;
  summary: string;
  category: string;
  imageUrl: string;
}

export interface Timeline {
  id: string; // slug nama timeline, dipakai di URL /timeline/:id
  title: string; // nama timeline
  items: TimelineItem[]; // urut dari AWAL ke SEKARANG
  lastAt: string;
  cover: string; // gambar update terbaru
  summary: string; // ringkasan artikel pertama
}

const ts = (iso: string) => new Date(iso).getTime() || 0;

// Semua timeline dari daftar artikel, yang terbaru diperbarui di depan
export const getTimelines = (articles: NewsArticle[]): Timeline[] => {
  const map = new Map<string, { title: string; list: NewsArticle[] }>();
  articles.forEach(a => {
    const name = (a.timeline || '').trim();
    if (!name) return;
    const id = slugify(name);
    if (!id) return;
    const cur = map.get(id);
    if (cur) cur.list.push(a); else map.set(id, { title: name, list: [a] });
  });
  const result: Timeline[] = [];
  map.forEach(({ title, list }, id) => {
    const sorted = [...list].sort((x, y) => ts(x.publishedAt) - ts(y.publishedAt));
    const items: TimelineItem[] = sorted.map(a => ({
      key: a.id, articleId: a.id, at: a.publishedAt, title: a.title, summary: a.summary,
      category: a.category, imageUrl: a.imageUrl,
    }));
    const last = items[items.length - 1];
    result.push({ id, title, items, lastAt: last.at, cover: last.imageUrl, summary: items[0].summary });
  });
  return result.sort((a, b) => ts(b.lastAt) - ts(a.lastAt));
};

export const getTimeline = (articles: NewsArticle[], id?: string): Timeline | undefined =>
  getTimelines(articles).find(t => t.id === id);

// Timeline yang punya update dalam `hours` jam terakhir
export const getActiveTimelines = (articles: NewsArticle[], hours = 48): Timeline[] => {
  const limit = Date.now() - hours * 3600 * 1000;
  return getTimelines(articles).filter(t => ts(t.lastAt) >= limit);
};

// Timeline tempat sebuah artikel berada (kalau ada)
export const getArticleTimeline = (articles: NewsArticle[], article: NewsArticle): Timeline | undefined =>
  article.timeline ? getTimeline(articles, slugify(article.timeline)) : undefined;

const pad = (n: number) => String(n).padStart(2, '0');

// "14.20"
export const formatClock = (iso: string): string => {
  const d = new Date(iso);
  return `${pad(d.getHours())}.${pad(d.getMinutes())}`;
};

// "Hari ini" / "Kemarin" / "12 Okt 2026"
export const dayLabel = (iso: string): string => {
  const d = new Date(iso);
  const today = new Date();
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(today) - start(d)) / 86400000);
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// "26 mnt" / "3 jam" / "2 hari"
export const timeAgo = (iso: string): string => {
  const mins = Math.max(1, Math.round((Date.now() - ts(iso)) / 60000));
  if (mins < 60) return `${mins} mnt`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} jam`;
  return `${Math.round(hrs / 24)} hari`;
};
