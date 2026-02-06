import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../services/firebase';

const ADMIN_SECRET_CODE = '21122109'; // KODE RAHASIA ADMIN

const AdminLogin: React.FC = () => {
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !showCodeInput) {
        const savedCode = localStorage.getItem('admin_secret_code');
        if (savedCode === ADMIN_SECRET_CODE) {
          navigate('/admin');
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, showCodeInput]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Simpan user sementara
      setTempUser(result.user);
      
      // Tampilkan input kode admin
      setShowCodeInput(true);
      setLoading(false);
    } catch (err: any) {
      setError('Login dengan Google gagal!');
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // CEK KODE ADMIN!
    if (adminCode !== ADMIN_SECRET_CODE) {
      setError('KODE ADMIN SALAH! Anda akan logout.');
      
      // Logout paksa
      setTimeout(async () => {
        await auth.signOut();
        setShowCodeInput(false);
        setTempUser(null);
        setAdminCode('');
      }, 2000);
      
      return;
    }

    // Kode benar, simpan dan redirect
    localStorage.setItem('admin_secret_code', adminCode);
    navigate('/admin');
  };

  if (showCodeInput) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="mb-6">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-bold mb-4">
                ✓ Login Google Berhasil
              </div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">Verifikasi Admin</h1>
              <p className="text-gray-500 text-sm">Masukkan kode admin untuk melanjutkan</p>
            </div>

            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-red-600">
                  🔐 Kode Admin (Wajib!)
                </label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50 text-center text-2xl tracking-widest font-bold"
                  placeholder="••••••••"
                  autoFocus
                  required
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Hanya administrator TelierNews yang memiliki kode ini</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-200">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg"
              >
                🔓 Verifikasi & Masuk
              </button>

              <button
                type="button"
                onClick={async () => {
                  await auth.signOut();
                  setShowCodeInput(false);
                  setTempUser(null);
                  setAdminCode('');
                }}
                className="w-full py-3 text-gray-600 font-medium hover:text-black transition-all"
              >
                ← Kembali ke Login
              </button>
            </form>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-800 font-medium">
                ⚠️ <strong>PERHATIAN:</strong> Tanpa kode admin yang benar, Anda tidak dapat mengakses sistem.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-200 mb-4">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 px-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{loading ? 'Memproses...' : 'Login dengan Google'}</span>
          </button>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800 font-medium">
              ⚠️ <strong>PERHATIAN:</strong> Setelah login Google, Anda akan diminta memasukkan kode admin.
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
