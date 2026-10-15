// Daftar negara untuk halaman World + dropdown Admin.
// Mau nambah negara? Cukup tambah satu baris di bawah.
export interface Country {
  code: string; // dipakai di URL: /world/id, /world/us, dst
  name: string;
}

export const COUNTRIES: Country[] = [
  { code: 'id', name: 'Indonesia' },
  { code: 'us', name: 'Amerika Serikat' },
  { code: 'cn', name: 'China' },
  { code: 'jp', name: 'Jepang' },
  { code: 'ru', name: 'Rusia' },
  { code: 'in', name: 'India' },
  { code: 'gb', name: 'Inggris' },
  { code: 'de', name: 'Jerman' },
  { code: 'au', name: 'Australia' },
  { code: 'sg', name: 'Singapura' },
];

export const getCountryName = (code?: string): string =>
  COUNTRIES.find(c => c.code === code)?.name || '';
