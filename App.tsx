import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NewsArticle } from './types';
import { INITIAL_ARTICLES } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';

const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem('telier_articles');
    return saved ? JSON.parse(saved) : INITIAL_ARTICLES;
  });

  useEffect(() => {
    localStorage.setItem('telier_articles', JSON.stringify(articles));
  }, [articles]);

  const handleAddArticle = (article: NewsArticle) => {
    setArticles([article, ...articles]);
  };

  const handleDeleteArticle = (id: string) => {
    setArticles(articles.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* PUBLIC ROUTES - untuk user biasa */}
          <Route path="/" element={<Home articles={articles} />} />
          <Route path="/news/:id" element={<NewsDetail articles={articles} />} />
          <Route path="/category/:cat" element={<Home articles={articles} />} />
          <Route path="/login" element={<Login />} />
          
          {/* ADMIN ROUTES - khusus admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
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
          
          {/* Redirect /admin/* ke /admin */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
