// Daftar negara untuk halaman World + dropdown Admin.
//
// Mau nambah negara? Tambah satu baris di COUNTRIES:
//   { code: 'xx', name: 'Nama Negara', lat: ..., lon: ..., zoom: ... }
// - code : 2 huruf kecil, dipakai di URL (/world/xx) dan disimpan di artikel
// - lat/lon : posisi titik negara di peta (lintang, bujur)
// - zoom : seberapa dekat peta di halaman negara (negara besar 2-3, kecil 6-9)
// - focus (opsional) : [lat, lon] kalau pusat zoom beda dari titik marker
export interface Country {
  code: string;
  name: string;
  lat: number;
  lon: number;
  zoom: number;
  focus?: [number, number];
}

export const COUNTRIES: Country[] = [
  { code: 'id', name: 'Indonesia', lat: -2.5, lon: 118, zoom: 3 },
  { code: 'us', name: 'Amerika Serikat', lat: 39.5, lon: -98.5, zoom: 2.4 },
  { code: 'cn', name: 'China', lat: 35, lon: 104, zoom: 2.6 },
  { code: 'jp', name: 'Jepang', lat: 36.5, lon: 138.5, zoom: 5.5 },
  { code: 'ru', name: 'Rusia', lat: 60, lon: 95, zoom: 1.7 },
  { code: 'in', name: 'India', lat: 21, lon: 79, zoom: 3.6 },
  { code: 'gb', name: 'Inggris', lat: 54, lon: -2.5, zoom: 7 },
  { code: 'de', name: 'Jerman', lat: 51, lon: 10, zoom: 7 },
  { code: 'au', name: 'Australia', lat: -25, lon: 134, zoom: 3 },
  { code: 'sg', name: 'Singapura', lat: 1.35, lon: 103.8, zoom: 8 },
  { code: 'my', name: 'Malaysia', lat: 4.2, lon: 102, zoom: 6.5, focus: [3.5, 109] },
  { code: 'kr', name: 'Korea Selatan', lat: 36.5, lon: 128, zoom: 9 },
  { code: 'fr', name: 'Prancis', lat: 46.5, lon: 2.5, zoom: 7 },
  { code: 'br', name: 'Brasil', lat: -10, lon: -52, zoom: 2.6 },
  { code: 'ua', name: 'Ukraina', lat: 49, lon: 31.5, zoom: 7 },
  { code: 'sa', name: 'Arab Saudi', lat: 24, lon: 45, zoom: 4.5 },
];

export const getCountry = (code?: string): Country | undefined =>
  COUNTRIES.find(c => c.code === (code || '').toLowerCase());

export const getCountryName = (code?: string): string => getCountry(code)?.name || '';
