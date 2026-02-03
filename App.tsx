import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NewsArticle } from './types';
import { fetchArticles, addArticle as saveArticle, deleteArticle as removeArticle } from './services/articleService';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import NewsDetail from './pages/NewsDetail';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';

const App: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch articles from Firestore on mount
  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    const articlesFromFirestore = await fetchArticles();
    setArticles(articlesFromFirestore);
    setLoading(false);
  };

  const handleAddArticle = async (article: NewsArticle) => {
    // Save to Firestore
    const articleId = await saveArticle(article);
    
    if (articleId) {
      // Add to local state with the Firestore ID
      setArticles([{ ...article, id: articleId }, ...articles]);
      alert('✅ Berita berhasil dipublikasikan!');
    } else {
      alert('❌ Gagal menyimpan berita. Cek console untuk detail error!');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    // Delete from Firestore
    const success = await removeArticle(id);
    
    if (success) {
      // Remove from local state
      setArticles(articles.filter(a => a.id !== id));
      alert('✅ Berita berhasil dihapus!');
    } else {
      alert('❌ Gagal menghapus berita. Cek console untuk detail error!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-500">Loading articles...</p>
        </div>
      </div>
    );
  }

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
