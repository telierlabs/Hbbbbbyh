import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { NewsArticle, Story } from '../types';

const STORIES_COLLECTION = 'stories';

// ── Firestore ──

export const fetchStories = async (): Promise<Story[]> => {
  try {
    const q = query(collection(db, STORIES_COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const list: Story[] = [];
    snap.forEach(d => {
      const data = d.data() as Partial<Story>;
      list.push({ id: d.id, title: '', summary: '', notes: [], createdAt: '', ...data } as Story);
    });
    return list;
  } catch (error) {
    console.error('❌ Error fetching stories:', error);
    return [];
  }
};

export const addStory = async (story: Omit<Story, 'id'>): Promise<string | null> => {
  try {
    const clean = JSON.parse(JSON.stringify(story));
    const ref = await addDoc(collection(db, STORIES_COLLECTION), clean);
    return ref.id;
  } catch (error) {
    console.error('❌ Error adding story:', error);
    alert('Gagal menyimpan cerita!');
    return null;
  }
};

export const updateStory = async (id: string, updates: Partial<Story>): Promise<boolean> => {
  try {
    const clean = JSON.parse(JSON.stringify(updates));
    await updateDoc(doc(db, STORIES_COLLECTION, id), clean);
    return true;
  } catch (error) {
    console.error('❌ Error updating story:', error);
    alert('Gagal update cerita!');
    return false;
  }
};

export const deleteStory = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, STORIES_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('❌ Error deleting story:', error);
    alert('Gagal menghapus cerita!');
    return false;
  }
};

// ── Helper lini masa (tanpa Firestore) ──

export interface TimelineItem {
  key: string;
  type: 'article' | 'note';
  at: string; // ISO
  title: string; // judul artikel atau teks catatan
  articleId?: string;
  category?: string;
  imageUrl?: string;
}

const ts = (iso: string) => new Date(iso).getTime() || 0;

// Semua update sebuah cerita (artikel + catatan), urut dari AWAL ke SEKARANG
export const buildTimeline = (story: Story, articles: NewsArticle[]): TimelineItem[] => {
  const items: TimelineItem[] = [];
  articles.forEach(a => {
    if (a.storyId === story.id) {
      items.push({ key: `a-${a.id}`, type: 'article', at: a.publishedAt, title: a.title, articleId: a.id, category: a.category, imageUrl: a.imageUrl });
    }
  });
  (story.notes || []).forEach(n => {
    items.push({ key: `n-${n.id}`, type: 'note', at: n.at, title: n.text });
  });
  return items.sort((x, y) => ts(x.at) - ts(y.at));
};

export interface ActiveStory { story: Story; items: TimelineItem[]; lastAt: string; }

// Cerita yang punya update dalam `hours` jam terakhir, yang terbaru diperbarui di depan
export const getActiveStories = (stories: Story[], articles: NewsArticle[], hours = 48): ActiveStory[] => {
  const limit = Date.now() - hours * 3600 * 1000;
  return stories
    .map(story => {
      const items = buildTimeline(story, articles);
      return { story, items, lastAt: items.length ? items[items.length - 1].at : '' };
    })
    .filter(s => s.items.length > 0 && ts(s.lastAt) >= limit)
    .sort((a, b) => ts(b.lastAt) - ts(a.lastAt));
};

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
