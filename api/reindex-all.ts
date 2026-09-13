import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { GoogleAuth } from 'google-auth-library';

const firebaseConfig = {
  apiKey: process.env.FB_API,
  authDomain: process.env.FB_AID,
  projectId: process.env.FB_PID,
  storageBucket: process.env.FB_STOR,
  messagingSenderId: process.env.FB_MID,
  appId: process.env.FB_SID,
};

if (!getApps().length) initializeApp(firebaseConfig);
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Proteksi sederhana pakai secret key di query, biar gak sembarangan dipanggil orang
  if (req.query.key !== process.env.REINDEX_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_INDEXING_CLIENT_EMAIL,
        private_key: (process.env.GOOGLE_INDEXING_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });
    const client = await auth.getClient();

    const snapshot = await getDocs(collection(db, 'articles'));
    const results: { id: string; status: string }[] = [];

    for (const doc of snapshot.docs) {
      const url = `https://www.teliernews.com/news/${doc.id}`;
      try {
        await client.request({
          url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
          method: 'POST',
          data: { url, type: 'URL_UPDATED' },
        });
        results.push({ id: doc.id, status: 'ok' });
      } catch (err: any) {
        results.push({ id: doc.id, status: 'error: ' + (err?.response?.data?.error?.message || err.message) });
      }
      // Jeda kecil biar gak kena rate limit Google (200/hari, batasi juga per-request)
      await new Promise(r => setTimeout(r, 300));
    }

    return res.status(200).json({ total: results.length, results });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
                    }
