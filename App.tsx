
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { NewsArticle } from './types';
import { INITIAL_ARTICLES } from './constants';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Admin from './pages/Admin';
import NewsDetail from './pages/NewsDetail';

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
          <Route path="/" element={<Home articles={articles} />} />
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
          <Route path="/news/:id" element={<NewsDetail articles={articles} />} />
          <Route 
            path="/category/:cat" 
            element={<Home articles={articles} />} // In a real app, this would be filtered
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
