import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleAuth } from 'google-auth-library';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { articleId, type } = req.body;
  if (!articleId) return res.status(400).json({ error: 'articleId wajib diisi' });

  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_INDEXING_CLIENT_EMAIL,
        private_key: (process.env.GOOGLE_INDEXING_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const client = await auth.getClient();
    const url = `https://www.teliernews.com/news/${articleId}`;

    const response = await client.request({
      url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
      method: 'POST',
      data: {
        url,
        type: type || 'URL_UPDATED',
      },
    });

    return res.status(200).json({ success: true, url, result: response.data });
  } catch (err: any) {
    console.error('Indexing API error:', err?.response?.data || err.message);
    return res.status(500).json({ error: 'Gagal submit ke Indexing API', detail: err?.response?.data || err.message });
  }
}
