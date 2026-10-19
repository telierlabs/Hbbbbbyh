import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { NewsArticle } from '../types';
import { trackPageview } from '../services/analytics';

// Pasang sekali di App (di dalam Router). Mencatat tiap pindah halaman. Tidak menampilkan apa pun.
const PageTracker: React.FC<{ articles: NewsArticle[] }> = ({ articles }) => {
  const { pathname } = useLocation();
  const list = useRef(articles);
  list.current = articles;
  const loaded = articles.length > 0;
  const done = useRef('');

  useEffect(() => {
    if (done.current === pathname) return;
    const isArticle = pathname.startsWith('/news/');
    const fire = () => {
      if (done.current === pathname) return;
      done.current = pathname;
      let title = '', cat = '';
      if (isArticle) {
        const a = list.current.find(x => x.id === pathname.split('/')[2]);
        title = a?.title || document.title || '';
        cat = a?.category || '';
      }
      trackPageview(pathname, { title, cat });
    };
    // halaman artikel: tunggu daftar artikel termuat supaya judulnya ikut tercatat (maksimal 2,5 detik)
    if (isArticle && !loaded) {
      const t = window.setTimeout(fire, 2500);
      return () => window.clearTimeout(t);
    }
    fire();
  }, [pathname, loaded]);

  return null;
};

export default PageTracker;
