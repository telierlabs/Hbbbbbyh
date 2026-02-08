// Profile.tsx - FIXED WITH SCROLL TO TOP
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [newsletter, setNewsletter] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [subscription, setSubscription] = useState('Gratis');
  const navigate = useNavigate();

  // SCROLL TO TOP ON LOAD
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
        const savedNewsletter = localStorage.getItem('newsletter') === 'true';
        const savedNotifications = localStorage.getItem('notifications') === 'true';
        const savedSubscription = localStorage.getItem('subscription_plan') || 'Gratis';
        setNewsletter(savedNewsletter);
        setNotifications(savedNotifications);
        setSubscription(savedSubscription);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleNewsletterToggle = () => {
    const newValue = !newsletter;
    setNewsletter(newValue);
    localStorage.setItem('newsletter', newValue.toString());
  };

  const handleNotificationsToggle = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem('notifications', newValue.toString());
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('admin_secret_code');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <h1 className="text-3xl font-bold mb-8 tracking-tight">Profil Saya</h1>
          
          <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-2xl">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-lg">{user.displayName || 'User'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-6 mb-8 pb-8 border-b border-gray-200">
            <h2 className="font-bold text-lg">Langganan</h2>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold">{subscription}</p>
                <p className="text-xs text-gray-500">Paket aktif saat ini</p>
              </div>
              {subscription === 'Gratis' && (
                <Link to="/subscribe" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all">
                  Upgrade
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-4 mb-8 pb-8 border-b border-gray-200">
            <h2 className="font-bold text-lg">Preferensi</h2>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-sm">Newsletter</p>
                <p className="text-xs text-gray-500">Terima email berita terbaru</p>
              </div>
              <button
                onClick={handleNewsletterToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  newsletter ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    newsletter ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-sm">Notifikasi</p>
                <p className="text-xs text-gray-500">Terima pemberitahuan artikel baru</p>
              </div>
              <button
                onClick={handleNotificationsToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-black' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
