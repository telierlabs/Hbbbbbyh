import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const TYPES = [
  'Berita',
  'Opini',
  'Peristiwa',
  'Pendidikan',
  'Teknologi',
  'Bisnis',
  'Internasional',
  'Lokal',
  'Lainnya',
];

const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Opini: React.FC = () => {
  const [jenis, setJenis] = useState('');
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [kota, setKota] = useState('');
  const [judul, setJudul] = useState('');
  const [isi, setIsi] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [sumber, setSumber] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attempted, setAttempted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const errors = {
    jenis: jenis === '',
    nama: nama.trim() === '',
    email: email.trim() === '' || !emailValid(email.trim()),
    judul: judul.trim() === '',
    isi: isi.trim() === '',
    tanggal: tanggal === '',
    lokasi: lokasi.trim() === '',
    agree: !(agree1 && agree2 && agree3),
  };

  const isFormValid = !Object.values(errors).some(Boolean);
  const showErr = (key: keyof typeof errors) => (touched[key] || attempted) && errors[key];
  const markTouched = (key: string) => setTouched(prev => ({ ...prev, [key]: true }));

  const addFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    setFiles(prev => [...prev, ...Array.from(list)]);
  }, []);

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (!isFormValid) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setJenis(''); setNama(''); setEmail(''); setWhatsapp(''); setKota('');
    setJudul(''); setIsi(''); setTanggal(''); setLokasi(''); setSumber('');
    setFiles([]); setAgree1(false); setAgree2(false); setAgree3(false);
    setTouched({}); setAttempted(false); setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="tn-opini">
      <style>{`
        .tn-opini{
          --ink:#141414; --soft:#3f3f3f; --mute:#6b6b6b; --line:#e4e4e2; --tint:#f6f6f4; --accent:#c81e2c;
          font-family:'Inter',system-ui,sans-serif; font-size:16px; line-height:1.6;
          color:var(--ink); background:#fff; -webkit-font-smoothing:antialiased;
        }
        .tn-opini *, .tn-opini *::before, .tn-opini *::after{ box-sizing:border-box; }
        .tn-opini h1, .tn-opini h2{ font-family:'Fraunces',Georgia,serif; font-weight:600; margin:0; letter-spacing:-0.01em; }

        /* Container: satu-satunya sumber padding kiri-kanan */
        .tn-opini .wrap{ max-width:640px; margin:0 auto; padding-left:20px; padding-right:20px; }

        /* Hero */
        .tn-opini .hero{ padding-top:48px; padding-bottom:32px; }
        .tn-opini .hero h1{ font-size:clamp(32px, 8vw, 44px); line-height:1.1; }
        .tn-opini .hero-sub{ color:var(--soft); margin:14px 0 0; max-width:46ch; }
        .tn-opini .hero-note{ color:var(--mute); font-size:14px; margin:12px 0 0; }

        /* Section */
        .tn-opini .block{ padding-top:32px; padding-bottom:32px; border-top:1px solid var(--line); }
        .tn-opini .block h2{ font-size:22px; margin-bottom:4px; }
        .tn-opini .block-desc{ color:var(--mute); font-size:14px; margin:0 0 20px; }

        /* Jenis tulisan */
        .tn-opini .types{ display:flex; flex-wrap:wrap; gap:8px; }
        .tn-opini .type-chip{ cursor:pointer; }
        .tn-opini .type-chip input{ position:absolute; opacity:0; pointer-events:none; }
        .tn-opini .type-chip span{
          display:block; padding:10px 16px; border:1px solid var(--line); border-radius:8px;
          font-size:14.5px; color:var(--soft); transition:border-color .15s ease, background .15s ease;
        }
        .tn-opini .type-chip:hover span{ border-color:var(--mute); }
        .tn-opini .type-chip input:checked + span{ background:var(--ink); border-color:var(--ink); color:#fff; font-weight:500; }
        .tn-opini .type-chip input:focus-visible + span{ outline:2px solid var(--accent); outline-offset:2px; }

        /* Field */
        .tn-opini .grid{ display:grid; grid-template-columns:1fr 1fr; gap:0 16px; }
        @media (max-width:560px){ .tn-opini .grid{ grid-template-columns:1fr; } }
        .tn-opini .field{ margin-bottom:18px; }
        .tn-opini .field:last-child{ margin-bottom:0; }
        .tn-opini .grid .field:last-child{ margin-bottom:18px; }
        .tn-opini .label{ display:block; font-size:14px; font-weight:500; margin-bottom:6px; }
        .tn-opini .opt{ color:var(--mute); font-weight:400; }
        .tn-opini input[type=text], .tn-opini input[type=email], .tn-opini input[type=tel],
        .tn-opini input[type=date], .tn-opini textarea{
          width:100%; padding:12px 14px; font:inherit; font-size:16px; color:var(--ink); background:#fff;
          border:1px solid var(--line); border-radius:8px; transition:border-color .15s ease;
        }
        .tn-opini input:focus, .tn-opini textarea:focus{ outline:none; border-color:var(--ink); }
        .tn-opini input.err, .tn-opini textarea.err{ border-color:var(--accent); }
        .tn-opini textarea{ min-height:200px; resize:vertical; line-height:1.6; }
        .tn-opini .char-count{ text-align:right; font-size:12.5px; color:var(--mute); margin-top:4px; }
        .tn-opini .error-msg{ color:var(--accent); font-size:13px; margin-top:6px; }

        /* Upload */
        .tn-opini .upload-area{
          border:1px dashed var(--mute); border-radius:8px; padding:28px 16px; text-align:center;
          cursor:pointer; background:var(--tint); transition:border-color .15s ease;
        }
        .tn-opini .upload-area:hover, .tn-opini .upload-area.drag{ border-color:var(--ink); }
        .tn-opini .upload-area:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
        .tn-opini .upload-title{ display:block; font-weight:500; }
        .tn-opini .upload-formats{ display:block; color:var(--mute); font-size:13px; }
        .tn-opini .file-list{ margin-top:12px; }
        .tn-opini .file-item{ display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid var(--line); font-size:14px; }
        .tn-opini .file-item .fname{ flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .tn-opini .file-item .fsize{ color:var(--mute); font-size:12.5px; }
        .tn-opini .file-item button{ background:none; border:0; color:var(--mute); cursor:pointer; font:inherit; font-size:13px; padding:4px; }
        .tn-opini .file-item button:hover{ color:var(--accent); }
        .tn-opini .upload-note{ font-size:13px; color:var(--mute); margin:12px 0 0; }

        /* Pernyataan */
        .tn-opini .check-row{ display:flex; gap:12px; align-items:flex-start; padding:10px 0; cursor:pointer; font-size:14.5px; color:var(--soft); }
        .tn-opini .check-row input{ margin:4px 0 0; width:18px; height:18px; accent-color:var(--ink); flex-shrink:0; cursor:pointer; }

        /* Kirim */
        .tn-opini .submit-bar{ padding-top:32px; padding-bottom:56px; border-top:1px solid var(--line); }
        .tn-opini .submit-btn{
          width:100%; padding:16px; border:0; border-radius:8px; background:var(--ink); color:#fff;
          font:inherit; font-weight:600; cursor:pointer; transition:opacity .15s ease;
        }
        .tn-opini .submit-btn:hover:not(:disabled){ opacity:.88; }
        .tn-opini .submit-btn:disabled{ background:var(--line); color:var(--mute); cursor:not-allowed; }
        .tn-opini .submit-btn:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }
        .tn-opini .submit-hint{ text-align:center; color:var(--mute); font-size:13px; margin:12px 0 0; }

        /* Sukses */
        .tn-opini .success-screen{ padding-top:80px; padding-bottom:80px; text-align:center; }
        .tn-opini .success-screen h2{ font-size:28px; margin-bottom:12px; }
        .tn-opini .success-screen p{ color:var(--soft); margin:0 0 8px; }
        .tn-opini .success-actions{ display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:28px; }
        .tn-opini .btn-solid, .tn-opini .btn-outline{
          padding:12px 22px; border-radius:8px; font:inherit; font-weight:500; cursor:pointer;
          text-decoration:none; display:inline-block; border:1px solid var(--line);
        }
        .tn-opini .btn-solid{ background:var(--ink); border-color:var(--ink); color:#fff; }
        .tn-opini .btn-outline{ background:#fff; color:var(--ink); }
      `}</style>

      {submitted ? (
        <div className="wrap">
          <div className="success-screen">
            <h2>Tulisanmu sudah terkirim</h2>
            <p>Tim TelierNews akan meninjau kirimanmu sebelum menentukan apakah bisa dipublikasikan.</p>
            <div className="success-actions">
              <button className="btn-solid" onClick={resetForm} type="button">Kirim tulisan lain</button>
              <Link to="/" className="btn-outline">Kembali ke beranda</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="wrap">
          <header className="hero">
            <h1>Kirim tulisan ke TelierNews</h1>
            <p className="hero-sub">
              Punya informasi, berita, opini, atau cerita menarik? Kirim tulisanmu secara gratis, tanpa biaya publikasi.
            </p>
            <p className="hero-note">
              Setiap kiriman melalui seleksi dan verifikasi editorial sebelum dipublikasikan.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            {/* Jenis tulisan */}
            <section className="block">
              <h2>Jenis tulisan</h2>
              <p className="block-desc">Pilih kategori yang paling sesuai.</p>
              <div className="types" role="radiogroup" aria-label="Jenis tulisan">
                {TYPES.map(t => (
                  <label key={t} className="type-chip">
                    <input
                      type="radio"
                      name="jenis"
                      value={t}
                      checked={jenis === t}
                      onChange={() => { setJenis(t); markTouched('jenis'); }}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              {showErr('jenis') && <div className="error-msg">Pilih salah satu jenis tulisan.</div>}
            </section>

            {/* Data pengirim */}
            <section className="block">
              <h2>Data pengirim</h2>
              <p className="block-desc">Kami menghubungimu lewat sini jika tulisan lolos seleksi.</p>
              <div className="grid">
                <div className="field">
                  <label className="label" htmlFor="nama">Nama</label>
                  <input id="nama" type="text" className={showErr('nama') ? 'err' : ''} value={nama}
                    onChange={e => setNama(e.target.value)} onBlur={() => markTouched('nama')}
                    placeholder="Nama lengkap atau nama pena" />
                  {showErr('nama') && <div className="error-msg">Nama wajib diisi.</div>}
                </div>
                <div className="field">
                  <label className="label" htmlFor="email">Email</label>
                  <input id="email" type="email" className={showErr('email') ? 'err' : ''} value={email}
                    onChange={e => setEmail(e.target.value)} onBlur={() => markTouched('email')}
                    placeholder="nama@email.com" />
                  {showErr('email') && <div className="error-msg">Masukkan email yang valid.</div>}
                </div>
                <div className="field">
                  <label className="label" htmlFor="whatsapp">WhatsApp <span className="opt">(opsional)</span></label>
                  <input id="whatsapp" type="tel" value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)} placeholder="08xxxxxxxxxx" />
                </div>
                <div className="field">
                  <label className="label" htmlFor="kota">Kota <span className="opt">(opsional)</span></label>
                  <input id="kota" type="text" value={kota}
                    onChange={e => setKota(e.target.value)} placeholder="Cirebon, Jawa Barat" />
                </div>
              </div>
            </section>

            {/* Isi tulisan */}
            <section className="block">
              <h2>Isi tulisan</h2>
              <p className="block-desc">Tulis atau tempel naskahmu selengkap mungkin.</p>
              <div className="field">
                <label className="label" htmlFor="judul">Judul</label>
                <input id="judul" type="text" className={showErr('judul') ? 'err' : ''} value={judul}
                  onChange={e => setJudul(e.target.value)} onBlur={() => markTouched('judul')} />
                {showErr('judul') && <div className="error-msg">Judul wajib diisi.</div>}
              </div>
              <div className="field">
                <label className="label" htmlFor="isi">Naskah</label>
                <textarea id="isi" className={showErr('isi') ? 'err' : ''} value={isi}
                  onChange={e => setIsi(e.target.value)} onBlur={() => markTouched('isi')} />
                <div className="char-count">{isi.length} karakter</div>
                {showErr('isi') && <div className="error-msg">Naskah wajib diisi.</div>}
              </div>
              <div className="grid">
                <div className="field">
                  <label className="label" htmlFor="tanggal">Tanggal kejadian</label>
                  <input id="tanggal" type="date" className={showErr('tanggal') ? 'err' : ''} value={tanggal}
                    onChange={e => setTanggal(e.target.value)} onBlur={() => markTouched('tanggal')} />
                  {showErr('tanggal') && <div className="error-msg">Tanggal wajib diisi.</div>}
                </div>
                <div className="field">
                  <label className="label" htmlFor="lokasi">Lokasi kejadian</label>
                  <input id="lokasi" type="text" className={showErr('lokasi') ? 'err' : ''} value={lokasi}
                    onChange={e => setLokasi(e.target.value)} onBlur={() => markTouched('lokasi')}
                    placeholder="Kota, Provinsi" />
                  {showErr('lokasi') && <div className="error-msg">Lokasi wajib diisi.</div>}
                </div>
              </div>
            </section>

            {/* Sumber dan lampiran */}
            <section className="block">
              <h2>Sumber dan lampiran</h2>
              <p className="block-desc">Opsional, tapi membantu proses verifikasi.</p>
              <div className="field">
                <label className="label" htmlFor="sumber">Sumber informasi</label>
                <input id="sumber" type="text" value={sumber} onChange={e => setSumber(e.target.value)}
                  placeholder="Link, narasumber, atau keterangan" />
              </div>
              <div
                className={`upload-area${dragOver ? ' drag' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
              >
                <span className="upload-title">Pilih file atau tarik ke sini</span>
                <span className="upload-formats">JPG, PNG, WEBP, MP4, PDF, DOCX</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                accept=".jpg,.jpeg,.png,.webp,.mp4,.pdf,.docx"
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
              />
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((f, idx) => (
                    <div className="file-item" key={`${f.name}-${idx}`}>
                      <span className="fname">{f.name}</span>
                      <span className="fsize">{formatSize(f.size)}</span>
                      <button type="button" onClick={() => removeFile(idx)}>Hapus</button>
                    </div>
                  ))}
                </div>
              )}
              <p className="upload-note">Pastikan kamu punya hak atau izin atas foto dan video yang diunggah.</p>
            </section>

            {/* Pernyataan */}
            <section className="block">
              <h2>Pernyataan</h2>
              <p className="block-desc">Baca dan setujui sebelum mengirim.</p>
              <label className="check-row">
                <input type="checkbox" checked={agree1} onChange={e => setAgree1(e.target.checked)} />
                <span>Informasi yang saya kirim berdasarkan fakta dan tidak sengaja menyesatkan.</span>
              </label>
              <label className="check-row">
                <input type="checkbox" checked={agree2} onChange={e => setAgree2(e.target.checked)} />
                <span>TelierNews berhak menyunting, memverifikasi, atau menolak tulisan sebelum dipublikasikan.</span>
              </label>
              <label className="check-row">
                <input type="checkbox" checked={agree3} onChange={e => setAgree3(e.target.checked)} />
                <span>Saya mengizinkan TelierNews mempublikasikan tulisan yang saya kirim.</span>
              </label>
              {attempted && errors.agree && (
                <div className="error-msg">Semua pernyataan wajib disetujui sebelum mengirim.</div>
              )}
            </section>

            <div className="submit-bar">
              <button type="submit" className="submit-btn" disabled={!isFormValid}>Kirim tulisan</button>
              <p className="submit-hint">Isi semua kolom wajib dan setujui pernyataan untuk mengirim.</p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Opini;
