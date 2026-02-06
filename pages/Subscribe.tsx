import React from 'react';
import { useNavigate } from 'react-router-dom';

const Subscribe: React.FC = () => {
  const navigate = useNavigate();

  const handleSubscribe = (plan: string, price: string) => {
    localStorage.setItem('subscription_plan', plan);
    alert(`Berhasil berlangganan ${plan}!`);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Pilih Paket Langganan</h1>
          <p className="text-lg text-gray-600">Dapatkan akses penuh ke semua konten TelierNews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Gratis */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Gratis</h2>
              <div className="text-4xl font-extrabold mb-2">Rp 0</div>
              <p className="text-sm text-gray-500">Selamanya</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-sm">Akses berita terbaru</span>
              </li>
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                <span className="text-sm text-gray-400">Dengan iklan</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('Gratis', 'Rp 0')}
              className="w-full py-3 border-2 border-black text-black rounded-xl font-bold hover:bg-black hover:text-white transition-all"
            >
              Pilih Gratis
            </button>
          </div>

          {/* Premium */}
          <div className="bg-gradient-to-br from-black to-gray-800 rounded-3xl shadow-2xl p-8 border-4 border-black relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
              POPULER
            </div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-white">Premium</h2>
              <div className="text-4xl font-extrabold mb-2 text-white">Rp 25.000</div>
              <p className="text-sm text-gray-300">/bulan</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-sm text-white">Akses penuh semua artikel</span>
              </li>
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-sm text-white">Tanpa iklan</span>
              </li>
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-sm text-white">AI Cylen unlimited</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('Premium', 'Rp 25.000')}
              className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-100 transition-all"
            >
              Pilih Premium
            </button>
          </div>

          {/* Pro */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Pro</h2>
              <div className="text-4xl font-extrabold mb-2">Rp 50.000</div>
              <p className="text-sm text-gray-500">/bulan</p>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-sm">Semua fitur Premium</span>
              </li>
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-sm">Newsletter eksklusif</span>
              </li>
              <li className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                <span className="text-sm">Akses awal artikel baru</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('Pro', 'Rp 50.000')}
              className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
            >
              Pilih Pro
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">Semua paket dapat dibatalkan kapan saja</p>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
