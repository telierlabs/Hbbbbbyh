import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const TYPES = [
  { value: 'Berita', icon: '📰' },
  { value: 'Opini', icon: '💭' },
  { value: 'Peristiwa', icon: '🌍' },
  { value: 'Pendidikan', icon: '🎓' },
  { value: 'Teknologi', icon: '💻' },
  { value: 'Bisnis', icon: '💼' },
  { value: 'Internasional', icon: '🌐' },
  { value: 'Lokal', icon: '🏙️' },
  { value: 'Lainnya', icon: '📸' },
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
          --ink:#141414; --ink-soft:#3a3a3a; --gray:#6b6b6b; --gray-line:#e2e2e0;
          --paper-tint:#f7f6f4; --rule:#c81e2c; --rule-tint:#fdecec;
          --radius-lg:20px; --radius-md:14px; --radius-sm:9px;
          font-family:'Inter',sans-serif; color:var(--ink); background:#fff;
        }
        .tn-opini h1, .tn-opini h2, .tn-opini h3{ font-family:'Fraunces',serif; margin:0; letter-spacing:-0.01em; }
        .tn-opini .wrap{ max-width:1000px; margin:0 auto; padding:0 24px; }

        .tn-opini .hero{ padding:56px 0 48px; border-bottom:1px solid var(--gray-line); }
        .tn-opini .badge{
          display:inline-flex; align-items:center; gap:8px; font-family:'IBM Plex Mono', monospace;
          font-size:11.5px; font-weight:500; letter-spacing:0.06em; text-transform:uppercase;
          color:var(--rule); background:var(--rule-tint); border:1px solid #f4c8c9;
          padding:6px 12px; border-radius:100px; margin-bottom:22px;
        }
        .tn-opini .badge::before{ content:''; width:6px; height:6px; border-radius:50%; background:var(--rule); }
        .tn-opini .hero h1{ font-size:clamp(30px, 5vw, 48px); line-height:1.08; font-weight:600; max-width:16ch; }
        .tn-opini .hero-sub{ font-size:17px; color:var(--ink-soft); line-height:1.55; max-width:52ch; margin-top:18px; }
        .tn-opini .hero-note{
          display:flex; gap:10px; align-items:flex-start; margin-top:20px; padding-top:20px;
          border-top:1px solid var(--gray-line); max-width:52ch; color:var(--gray); font-size:14px; line-height:1.6;
        }

        .tn-opini .form-section{ padding:44px 0 90px; }
        .tn-opini .step{ display:flex; gap:22px; padding:32px 0; border-bottom:1px solid var(--gray-line); }
        .tn-opini .step:last-of-type{ border-bottom:none; }
        .tn-opini .step-num{ font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--rule); font-weight:500; padding-top:4px; width:34px; flex-shrink:0; }
        .tn-opini .step-body{ flex:1; min-width:0; }
        .tn-opini .step-title{ font-size:21px; font-weight:600; margin-bottom:4px; }
        .tn-opini .step-desc{ color:var(--gray); font-size:14px; margin-bottom:24px; }
        @media (max-width:640px){ .tn-opini .step{ flex-direction:column; gap:8px; } }

        .tn-opini .type-grid{ display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; }
        @media (max-width:640px){ .tn-opini .type-grid{ grid-template-columns:repeat(2, 1fr); } }
        .tn-opini .type-card{
          position:relative; cursor:pointer; border:1.5px solid var(--gray-line); border-radius:var(--radius-md);
          padding:18px 14px; text-align:center; transition:border-color .16s ease, transform .16s ease, box-shadow .16s ease;
          background:#fff;
        }
        .tn-opini .type-card:hover{ border-color:#b8b8b6; transform:translateY(-1px); }
        .tn-opini .type-card .icon{ font-size:22px; display:block; margin-bottom:8px; }
        .tn-opini .type-card .label{ font-size:13.5px; font-weight:500; color:var(--ink-soft); }
        .tn-opini .type-card.active{ border-color:var(--ink); background:var(--ink); }
        .tn-opini .type-card.active .label{ color:#fff; }

        .tn-opini .field-grid{ display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        @media (max-width:640px){ .tn-opini .field-grid{ grid-template-columns:1fr; } }
        .tn-opini .field{ margin-bottom:20px; }
        .tn-opini .field:last-child{ margin-bottom:0; }
        .tn-opini .field label{ display:block; font-size:13.5px; font-weight:600; margin-bottom:8px; color:var(--ink); }
        .tn-opini .field label .opt{ color:var(--gray); font-weight:400; }
        .tn-opini .field input[type=text], .tn-opini .field input[type=email], .tn-opini .field input[type=tel],
        .tn-opini .field input[type=date], .tn-opini .field textarea{
          width:100%; padding:13px 15px; font-size:15px; font-family:inherit; color:var(--ink);
          border:1.5px solid var(--gray-line); border-radius:var(--radius-sm); background:#fff;
          transition:border-color .16s ease, box-shadow .16s ease;
        }
        .tn-opini .field input:focus, .tn-opini .field textarea:focus{
          outline:none; border-color:var(--ink); box-shadow:0 0 0 3.5px rgba(20,20,20,0.07);
        }
        .tn-opini .field input.err, .tn-opini .field textarea.err{ border-color:var(--rule); }
        .tn-opini .field textarea{ resize:vertical; min-height:200px; line-height:1.6; }
        .tn-opini .char-count{
          display:flex; justify-content:flex-end; font-size:12.5px; color:var(--gray);
          margin-top:6px; font-family:'IBM Plex Mono', monospace;
        }
        .tn-opini .error-msg{ display:flex; align-items:center; gap:6px; font-size:12.5px; color:var(--rule); margin-top:7px; font-weight:500; }

        .tn-opini .upload-area{
          border:1.5px dashed var(--gray-line); border-radius:var(--radius-md); padding:34px 20px;
          text-align:center; cursor:pointer; transition:border-color .16s ease, background .16s ease; background:var(--paper-tint);
        }
        .tn-opini .upload-area:hover, .tn-opini .upload-area.drag{ border-color:var(--ink); background:#f0efec; }
        .tn-opini .upload-title{ font-size:14.5px; font-weight:600; margin-bottom:4px; }
        .tn-opini .upload-hint{ font-size:13px; color:var(--gray); }
        .tn-opini .upload-formats{ font-family:'IBM Plex Mono', monospace; font-size:11px; color:var(--gray); letter-spacing:0.03em; margin-top:14px; }
        .tn-opini .upload-note{
          display:flex; gap:8px; margin-top:14px; padding:12px 14px; background:var(--paper-tint);
          border-radius:var(--radius-sm); font-size:12.5px; color:var(--gray); line-height:1.55;
        }
        .tn-opini .file-list{ margin-top:14px; display:flex; flex-direction:column; gap:8px; }
        .tn-opini .file-item{
          display:flex; align-items:center; gap:10px; padding:10px 12px; background:#fff;
          border:1px solid var(--gray-line); border-radius:var(--radius-sm); font-size:13.5px;
        }
        .tn-opini .file-item .fname{ flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .tn-opini .file-item .fsize{ color:var(--gray); font-size:12px; font-family:'IBM Plex Mono', monospace; }
        .tn-opini .file-item button{
          background:none; border:none; cursor:pointer; color:var(--gray); padding:2px 4px; font-size:16px; line-height:1; border-radius:6px;
        }
        .tn-opini .file-item button:hover{ color:var(--rule); background:var(--rule-tint); }

        .tn-opini .check-row{
          display:flex; gap:12px; align-items:flex-start; margin-bottom:14px; cursor:pointer;
          padding:14px; border-radius:var(--radius-sm); border:1.5px solid var(--gray-line);
          transition:border-color .16s ease, background .16s ease;
        }
        .tn-opini .check-row:hover{ border-color:#b8b8b6; background:var(--paper-tint); }
        .tn-opini .check-row:last-child{ margin-bottom:0; }
        .tn-opini .check-row input{
          appearance:none; -webkit-appearance:none; width:19px; height:19px; flex-shrink:0;
          border:1.5px solid var(--gray-line); border-radius:5px; margin-top:1px; cursor:pointer; position:relative;
        }
        .tn-opini .check-row input:checked{ background:var(--ink); border-color:var(--ink); }
        .tn-opini .check-row input:checked::after{
          content:''; position:absolute; left:6px; top:2px; width:5px; height:9px;
          border:solid #fff; border-width:0 2px 2px 0; transform:rotate(45deg);
        }
        .tn-opini .check-row span{ font-size:14px; line-height:1.5; color:var(--ink-soft); }

        .tn-opini .submit-bar{ display:flex; flex-direction:column; align-items:center; gap:12px; padding-top:36px; }
        .tn-opini .submit-btn{
          width:100%; max-width:340px; padding:17px 24px; background:var(--ink); color:#fff;
          border:none; border-radius:100px; font-size:15.5px; font-weight:600; letter-spacing:0.01em; cursor:pointer;
          transition:transform .15s ease, box-shadow .15s ease; box-shadow:0 8px 20px -8px rgba(20,20,20,0.4);
        }
        .tn-opini .submit-btn:hover:not(:disabled){ transform:translateY(-2px); }
        .tn-opini .submit-btn:disabled{ background:#d8d7d4; color:#9a9a97; cursor:not-allowed; box-shadow:none; }
        .tn-opini .submit-hint{ font-size:12.5px; color:var(--gray); }

        .tn-opini .free-banner{
          margin-top:48px; padding:28px 30px; border-radius:var(--radius-lg); background:var(--ink); color:#fff;
          display:flex; gap:18px; align-items:flex-start;
        }
        .tn-opini .free-banner h3{ font-size:18px; font-weight:600; margin-bottom:6px; font-family:'Inter',sans-serif; }
        .tn-opini .free-banner p{ font-size:14px; color:#c9c9c7; line-height:1.6; margin:0; }
        @media (max-width:600px){ .tn-opini .free-banner{ flex-direction:column; padding:22px; } }

        .tn-opini .success-screen{ text-align:center; padding:70px 24px 90px; max-width:520px; margin:0 auto; animation:tnRiseIn .5s ease; }
        @keyframes tnRiseIn{ from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);} }
        .tn-opini .success-icon{
          width:72px; height:72px; border-radius:50%; background:var(--ink); display:flex;
          align-items:center; justify-content:center; margin:0 auto 26px;
        }
        .tn-opini .success-screen h2{ font-size:28px; font-weight:600; margin-bottom:14px; }
        .tn-opini .success-screen p{ color:var(--gray); font-size:15px; line-height:1.65; margin-bottom:8px; }
        .tn-opini .success-actions{ display:flex; gap:12px; justify-content:center; margin-top:32px; flex-wrap:wrap; }
        .tn-opini .btn-outline, .tn-opini .btn-solid{
          padding:13px 24px; border-radius:100px; font-size:14.5px; font-weight:600; cursor:pointer;
          text-decoration:none; display:inline-block; border:1.5px solid transparent;
        }
        .tn-opini .btn-solid{ background:var(--ink); color:#fff; border-color:var(--ink); }
        .tn-opini .btn-outline{ background:#fff; color:var(--ink); border-color:var(--gray-line); }
      `}</style>

      {submitted ? (
        <div className="wrap">
          <div className="success-screen">
            <div className="success-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M5 12.5L10 17.5L19 7.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2>Terima kasih! 🎉</h2>
            <p>Tulisanmu sudah diterima oleh tim TelierNews.</p>
            <p>Tim kami akan meninjau informasi yang dikirim sebelum menentukan apakah tulisan dapat dipublikasikan.</p>
            <div className="success-actions">
              <button className="btn-solid" onClick={resetForm} type="button">Kirim Tulisan Lain</button>
              <Link to="/" className="btn-outline">Kembali ke Beranda</Link>
            </div>
          </div>
        </div>
      ) : (
        <>
          <header className="hero">
            <div className="wrap">
              <span className="badge">Gratis • Tanpa Biaya Publikasi</span>
              <h1>Kirim Tulisan ke TelierNews</h1>
              <p className="hero-sub">Punya informasi, berita, opini, atau cerita menarik? Kirim tulisanmu ke TelierNews secara gratis.</p>
              <div className="hero-note">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M12 8V13M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#6b6b6b" strokeWidth="1.6" />
                </svg>
                <span>Setiap kiriman akan melalui proses seleksi dan verifikasi editorial sebelum dipublikasikan.</span>
              </div>
            </div>
          </header>

          <main className="wrap form-section">
            <form onSubmit={handleSubmit} noValidate>

              {/* STEP 1 */}
              <div className="step">
                <div className="step-num">01</div>
                <div className="step-body">
                  <div className="step-title">Pilih Jenis Tulisan</div>
                  <div className="step-desc">Pilih kategori yang paling sesuai dengan tulisanmu.</div>
                  <div className="type-grid">
                    {TYPES.map(t => (
                      <label
                        key={t.value}
                        className={`type-card${jenis === t.value ? ' active' : ''}`}
                        onClick={() => { setJenis(t.value); markTouched('jenis'); }}
                      >
                        <input type="radio" name="jenis" value={t.value} checked={jenis === t.value} readOnly style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
                        <span className="icon">{t.icon}</span>
                        <span className="label">{t.value}</span>
                      </label>
                    ))}
                  </div>
                  {showErr('jenis') && <div className="error-msg">⚠ Pilih salah satu jenis tulisan.</div>}
                </div>
              </div>

              {/* STEP 2 */}
              <div className="step">
                <div className="step-num">02</div>
                <div className="step-body">
                  <div className="step-title">Data Pengirim</div>
                  <div className="step-desc">Kami butuh cara untuk menghubungimu jika tulisan lolos seleksi.</div>
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="nama">Nama</label>
                      <input id="nama" type="text" className={showErr('nama') ? 'err' : ''} value={nama}
                        onChange={e => setNama(e.target.value)} onBlur={() => markTouched('nama')}
                        placeholder="Nama lengkap / nama pena" />
                      {showErr('nama') && <div className="error-msg">⚠ Nama wajib diisi.</div>}
                    </div>
                    <div className="field">
                      <label htmlFor="email">Email</label>
                      <input id="email" type="email" className={showErr('email') ? 'err' : ''} value={email}
                        onChange={e => setEmail(e.target.value)} onBlur={() => markTouched('email')}
                        placeholder="Email aktif" />
                      {showErr('email') && <div className="error-msg">⚠ Masukkan format email yang valid.</div>}
                    </div>
                    <div className="field">
                      <label htmlFor="whatsapp">Nomor WhatsApp <span className="opt">(opsional)</span></label>
                      <input id="whatsapp" type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="08xxxxxxxxxx" />
                    </div>
                    <div className="field">
                      <label htmlFor="kota">Kota/Daerah</label>
                      <input id="kota" type="text" value={kota} onChange={e => setKota(e.target.value)} placeholder="Contoh: Cirebon, Jawa Barat" />
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3 */}
              <div className="step">
                <div className="step-num">03</div>
                <div className="step-body">
                  <div className="step-title">Detail Tulisan</div>
                  <div className="step-desc">Tulis atau tempelkan naskahmu selengkap mungkin.</div>
                  <div className="field">
                    <label htmlFor="judul">Judul</label>
                    <input id="judul" type="text" className={showErr('judul') ? 'err' : ''} value={judul}
                      onChange={e => setJudul(e.target.value)} onBlur={() => markTouched('judul')}
                      placeholder="Masukkan judul tulisan" />
                    {showErr('judul') && <div className="error-msg">⚠ Judul wajib diisi.</div>}
                  </div>
                  <div className="field">
                    <label htmlFor="isi">Isi tulisan</label>
                    <textarea id="isi" className={showErr('isi') ? 'err' : ''} value={isi}
                      onChange={e => setIsi(e.target.value)} onBlur={() => markTouched('isi')}
                      placeholder="Tulis atau tempel artikel di sini..." />
                    <div className="char-count">{isi.length} karakter</div>
                    {showErr('isi') && <div className="error-msg">⚠ Isi tulisan wajib diisi.</div>}
                  </div>
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="tanggal">Tanggal kejadian</label>
                      <input id="tanggal" type="date" className={showErr('tanggal') ? 'err' : ''} value={tanggal}
                        onChange={e => setTanggal(e.target.value)} onBlur={() => markTouched('tanggal')} />
                      {showErr('tanggal') && <div className="error-msg">⚠ Tanggal kejadian wajib diisi.</div>}
                    </div>
                    <div className="field">
                      <label htmlFor="lokasi">Lokasi kejadian</label>
                      <input id="lokasi" type="text" className={showErr('lokasi') ? 'err' : ''} value={lokasi}
                        onChange={e => setLokasi(e.target.value)} onBlur={() => markTouched('lokasi')}
                        placeholder="Kota, Provinsi, Negara" />
                      {showErr('lokasi') && <div className="error-msg">⚠ Lokasi kejadian wajib diisi.</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 4 */}
              <div className="step">
                <div className="step-num">04</div>
                <div className="step-body">
                  <div className="step-title">Sumber &amp; Bukti</div>
                  <div className="step-desc">Lampirkan sumber dan berkas pendukung bila ada.</div>
                  <div className="field">
                    <label htmlFor="sumber">Sumber informasi</label>
                    <input id="sumber" type="text" value={sumber} onChange={e => setSumber(e.target.value)}
                      placeholder="Link sumber / nama narasumber / keterangan" />
                  </div>
                  <div className="field" style={{ marginTop: 24 }}>
                    <label>Upload foto/video/dokumen</label>
                    <div
                      className={`upload-area${dragOver ? ' drag' : ''}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      role="button" tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                    >
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 12 }}>
                        <path d="M12 16V4M12 4L7 9M12 4L17 9" stroke="#141414" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 16V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16" stroke="#141414" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      <div className="upload-title">Tarik file ke sini atau klik untuk memilih</div>
                      <div className="upload-hint">Kamu bisa menambahkan lebih dari satu file</div>
                      <div className="upload-formats">JPG · PNG · WEBP · MP4 · PDF · DOCX</div>
                      <input
                        ref={fileInputRef} type="file" multiple
                        accept=".jpg,.jpeg,.png,.webp,.mp4,.pdf,.docx"
                        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
                        onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                      />
                    </div>
                    {files.length > 0 && (
                      <div className="file-list">
                        {files.map((f, idx) => (
                          <div className="file-item" key={`${f.name}-${idx}`}>
                            <span>📎</span>
                            <span className="fname">{f.name}</span>
                            <span className="fsize">{formatSize(f.size)}</span>
                            <button type="button" aria-label="Hapus file" onClick={() => removeFile(idx)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="upload-note">
                      <span>🔒</span>
                      <span>Pastikan Anda memiliki hak atau izin untuk mengirimkan foto/video yang diunggah.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 5 */}
              <div className="step">
                <div className="step-num">05</div>
                <div className="step-body">
                  <div className="step-title">Pernyataan Pengirim</div>
                  <div className="step-desc">Mohon baca dan setujui sebelum mengirim.</div>

                  <label className="check-row">
                    <input type="checkbox" checked={agree1} onChange={e => setAgree1(e.target.checked)} />
                    <span>Saya memastikan informasi yang saya kirim berdasarkan fakta dan tidak sengaja menyesatkan.</span>
                  </label>
                  <label className="check-row">
                    <input type="checkbox" checked={agree2} onChange={e => setAgree2(e.target.checked)} />
                    <span>Saya memahami bahwa TelierNews berhak melakukan penyuntingan, verifikasi, atau menolak tulisan sebelum dipublikasikan.</span>
                  </label>
                  <label className="check-row">
                    <input type="checkbox" checked={agree3} onChange={e => setAgree3(e.target.checked)} />
                    <span>Saya memberikan izin kepada TelierNews untuk mempublikasikan tulisan yang saya kirim.</span>
                  </label>
                  {(attempted && errors.agree) && <div className="error-msg">⚠ Semua pernyataan wajib dicentang sebelum mengirim.</div>}
                </div>
              </div>

              <div className="submit-bar">
                <button type="submit" className="submit-btn" disabled={!isFormValid}>🚀 KIRIM TULISAN</button>
                <div className="submit-hint">Lengkapi semua kolom wajib dan centang persetujuan untuk mengaktifkan tombol.</div>
              </div>
            </form>

            <div className="free-banner">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M12 2L14.5 9H21.5L15.8 13.3L18 20.3L12 16.2L6 20.3L8.2 13.3L2.5 9H9.5L12 2Z" stroke="#ffffff" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              <div>
                <h3>Gratis, tanpa biaya publikasi.</h3>
                <p>TelierNews tidak memungut biaya untuk pengiriman maupun publikasi tulisan. Setiap kiriman akan melalui proses seleksi dan verifikasi editorial.</p>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
};

export default Opini;
