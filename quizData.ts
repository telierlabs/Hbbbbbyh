import { COUNTRIES, Country } from './countries';

export const ROUNDS = 5;

// Data kuis (tambah negara baru di countries.ts, lalu tambah ibukota & petunjuknya di sini)
// (tambah negara baru di countries.ts, lalu tambah ibukota & petunjuknya di bawah)
const CAPITALS: Record<string, string> = {
  id: 'Jakarta', us: 'Washington D.C.', cn: 'Beijing', jp: 'Tokyo', ru: 'Moskow', in: 'New Delhi',
  gb: 'London', de: 'Berlin', au: 'Canberra', sg: 'Singapura', my: 'Kuala Lumpur', kr: 'Seoul',
  fr: 'Paris', br: 'Brasilia', ua: 'Kyiv', sa: 'Riyadh',
};
const CLUES: Record<string, string> = {
  id: 'Rumah komodo dan pulau Bali', us: 'Gedung Putih dan Wall Street', cn: 'Tembok Besar dan panda raksasa',
  jp: 'Gunung Fuji dan kereta Shinkansen', ru: 'Kremlin dan hutan Siberia', in: 'Taj Mahal dan Bollywood',
  gb: 'Big Ben dan Buckingham Palace', de: 'Gerbang Brandenburg dan Oktoberfest', au: 'Opera House Sydney dan kanguru',
  sg: 'Patung Merlion dan Marina Bay Sands', my: 'Menara Kembar Petronas', kr: 'K-pop dan Namsan Tower',
  fr: 'Menara Eiffel dan museum Louvre', br: 'Patung Kristus Penebus dan Karnaval Rio',
  ua: 'Dijuluki lumbung gandum Eropa', sa: 'Rumah bagi kota Mekkah dan Madinah',
};

export type Kind = 'map' | 'capital' | 'clue' | 'time';
export interface Challenge { kind: Kind; title: string; desc: string; icon: string; }
export const CHALLENGES: Challenge[] = [
  { kind: 'map', title: 'Tebak dari Peta', desc: 'Negara mana yang ditandai di peta?', icon: '◎' },
  { kind: 'capital', title: 'Ibukota', desc: 'Pasangkan negara dengan ibukotanya', icon: '▲' },
  { kind: 'clue', title: 'Tebak dari Petunjuk', desc: 'Landmark ini ada di negara mana?', icon: '✦' },
  { kind: 'time', title: 'Beda Zona Waktu', desc: 'Jam berapa di sana sekarang?', icon: '◷' },
];

export interface Question { kind: Kind; prompt: string; code: string; options: string[]; answer: string; }

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};

const clockAt = (tz: string, d: Date) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(d);

export const build = (kind: Kind): Question[] => {
  const pool = shuffle(COUNTRIES).slice(0, ROUNDS);
  return pool.map((c: Country): Question => {
    const others = shuffle(COUNTRIES.filter(x => x.code !== c.code));
    if (kind === 'capital') {
      const options = shuffle([c, ...others.slice(0, 3)]).map(x => CAPITALS[x.code]);
      return { kind, prompt: `Apa ibukota ${c.name}?`, code: c.code, options, answer: CAPITALS[c.code] };
    }
    if (kind === 'clue') {
      const options = shuffle([c, ...others.slice(0, 3)]).map(x => x.name);
      return { kind, prompt: CLUES[c.code], code: c.code, options, answer: c.name };
    }
    if (kind === 'time') {
      const now = new Date();
      const correct = clockAt(c.tz, now);
      const [h, mi] = correct.split(':').map(Number);
      const fake = new Set<string>();
      while (fake.size < 3) {
        const dh = (Math.floor(Math.random() * 6) + 1) * (Math.random() < 0.5 ? -1 : 1);
        const t = `${String(((h + dh) % 24 + 24) % 24).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
        if (t !== correct) fake.add(t);
      }
      return {
        kind, code: c.code, options: shuffle([correct, ...fake]), answer: correct,
        prompt: `Sekarang di Jakarta jam ${clockAt('Asia/Jakarta', now)}. Jam berapa di ${c.name}?`,
      };
    }
    const options = shuffle([c, ...others.slice(0, 3)]).map(x => x.name);
    return { kind, prompt: 'Negara mana yang ditandai di peta?', code: c.code, options, answer: c.name };
  });
};

