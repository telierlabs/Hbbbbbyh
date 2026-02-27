import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import MobileMenu from './components/MobileMenu';
import Footer from './components/Footer';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Subscribe from './pages/Subscribe';
import About from './pages/About';
import Editorial from './pages/Editorial';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Help from './pages/Help';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Team from './pages/Team';
import Instagram from './pages/Instagram';
import { NewsArticle } from './types';
import { fetchArticles, addArticle, deleteArticle } from './services/articleService';

const AppContent = () => {
  const location = useLocation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isHomePage = location.pathname === '/' || location.pathname.startsWith('/category/');
  const isNewsDetail = location.pathname.startsWith('/news/');
  const isInstagram = location.pathname === '/instagram';

  useEffect(() => { loadArticles(); }, []);
  useEffect(() => { setSearchQuery(''); }, [location.pathname]);

  const loadArticles = async () => {
    try {
      const data = await fetchArticles();
      setArticles(data);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArticle = async (article: NewsArticle) => {
    const newId = await addArticle(article);
    if (newId) await loadArticles();
  };

  const handleDeleteArticle = async (id: string) => {
    const success = await deleteArticle(id);
    if (success) await loadArticles();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: isHomePage || isInstagram ? '#000' : '#fff' }}
    >
      {/* Sembunyikan header & footer di halaman instagram */}
      {!isInstagram && (
        <>
          <Header onMenuToggle={() => setMenuOpen(!menuOpen)} onSearch={setSearchQuery} />
          <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
      )}

      <main className={`flex-grow ${!isHomePage && !isInstagram ? 'pt-16 md:pt-20' : ''}`}>
        <Routes>
          <Route path="/" element={<Home articles={articles} searchQuery={searchQuery} />} />
          <Route path="/category/:categoryName" element={<Home articles={articles} searchQuery={searchQuery} />} />
          <Route path="/news/:id" element={<NewsDetail articles={articles} />} />
          <Route path="/instagram" element={<Instagram articles={articles} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/subscribe" element={<Subscribe />} />
          <Route path="/about" element={<About />} />
          <Route path="/editorial" element={<Editorial />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/team" element={<Team />} />
          <Route path="/admin" element={<Admin articles={articles} onAddArticle={handleAddArticle} onDeleteArticle={handleDeleteArticle} />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isNewsDetail && !isInstagram && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
