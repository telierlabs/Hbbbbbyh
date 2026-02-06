import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebase';

const ADMIN_SECRET_CODE = '21122109'; // KODE RAHASIA ADMIN

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const savedCode = localStorage.getItem('admin_secret_code');
        if (savedCode === ADMIN_SECRET_CODE) {
          navigate('/admin');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // CEK KODE ADMIN DULU!
    if (adminCode !== ADMIN_SECRET_CODE) {
      setError('KODE ADMIN SALAH! Akses ditolak.');
      setLoading(false);
      return;
    }

    try {
      // Login dengan email & password
      await signInWithEmailAndPassword(auth, email, password);
      
      // Simpan kode admin ke localStorage
      localStorage.setItem('admin_secret_code', adminCode);
      
      navigate('/admin');
    } catch (err: any) {
      setError('Email atau password salah!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <div className="mb-6">
            <div className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-4">
              🔒 ADMIN ACCESS ONLY
            </div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Login Admin</h1>
            <p className="text-gray-500 text-sm">Akses Content Management System</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* KODE ADMIN - PALING ATAS! */}
            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-red-600">
                🔐 Kode Admin (Wajib!)
              </label>
              <input
                type="password"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50"
                placeholder="Masukkan kode admin rahasia"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Hanya admin yang memiliki kode ini</p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="admin@teliernews.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-200">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? 'Memverifikasi...' : '🔓 Masuk sebagai Admin'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800 font-medium">
              ⚠️ <strong>PERHATIAN:</strong> Halaman ini khusus untuk administrator TelierNews. 
              Tanpa kode admin yang benar, Anda tidak akan dapat mengakses sistem.
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            TelierNews Admin Panel © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
