import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';

// Init Firebase Admin
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FCM_SA_KEY || '{}');
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const messaging = getMessaging();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Hanya POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body, articleId, imageUrl } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'title dan body wajib diisi' });
  }

  try {
    // Ambil semua FCM tokens dari Firestore
    const tokensSnap = await db.collection('fcm_tokens').get();
    const tokens: string[] = tokensSnap.docs.map(doc => doc.data().token).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(200).json({ success: true, sent: 0, message: 'Belum ada subscriber' });
    }

    // Kirim notif ke semua token sekaligus (max 500 per batch)
    const chunks: string[][] = [];
    for (let i = 0; i < tokens.length; i += 500) {
      chunks.push(tokens.slice(i, i + 500));
    }

    let totalSent = 0;
    let totalFailed = 0;

    for (const chunk of chunks) {
      const response = await messaging.sendEachForMulticast({
        tokens: chunk,
        notification: {
          title,
          body,
          imageUrl: imageUrl || undefined,
        },
        data: {
          articleId: articleId || '',
          url: articleId ? `/news/${articleId}` : '/',
        },
        webpush: {
          notification: {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            requireInteraction: false,
          },
          fcmOptions: {
            link: articleId ? `https://www.teliernews.com/news/${articleId}` : 'https://www.teliernews.com',
          },
        },
      });

      totalSent += response.successCount;
      totalFailed += response.failureCount;

      // Hapus token yang tidak valid
      const invalidTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && (
          resp.error?.code === 'messaging/invalid-registration-token' ||
          resp.error?.code === 'messaging/registration-token-not-registered'
        )) {
          invalidTokens.push(chunk[idx]);
        }
      });

      // Hapus token tidak valid dari Firestore
      if (invalidTokens.length > 0) {
        const batch = db.batch();
        for (const token of invalidTokens) {
          const snap = await db.collection('fcm_tokens').where('token', '==', token).get();
          snap.docs.forEach(doc => batch.delete(doc.ref));
        }
        await batch.commit();
      }
    }

    return res.status(200).json({
      success: true,
      sent: totalSent,
      failed: totalFailed,
      total: tokens.length,
    });

  } catch (error: any) {
    console.error('FCM error:', error);
    return res.status(500).json({ error: error.message });
  }
}
