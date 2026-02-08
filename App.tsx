import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { NewsArticle } from './types';
import { fetchArticles, addArticle, deleteArticle } from './services/articleService';

function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

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
    if (newId) {
      await loadArticles();
    }
  };

  const handleDeleteArticle = async (id: string) => {
    const success = await deleteArticle(id);
    if (success) {
      await loadArticles();
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header onMenuToggle={toggleMenu} />
        <MobileMenu isOpen={menuOpen} onClose={closeMenu} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home articles={articles} />} />
            <Route path="/category/:categoryName" element={<Home articles={articles} />} />
            <Route path="/news/:id" element={<NewsDetail articles={articles} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/about" element={<About />} />
            <Route 
              path="/admin" 
              element={
                <Admin 
                  articles={articles}
                  onAddArticle={handleAddArticle}
                  onDeleteArticle={handleDeleteArticle}
                />
              } 
            />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
