import { db } from '@/src/db';
import { transactions } from '@/src/db/schema';
import { transactionSchema } from '@/utils/zodSchemas';
import { eq } from 'drizzle-orm';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user: any = getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  console.log(user);
  
  const userId = user.userId;

  if (req.method === 'GET') {
    const result = await db.select().from(transactions).where(eq(transactions.userId, userId));
    return res.status(200).json(result);
  }

  if (req.method === 'POST') {
    const parsed = transactionSchema.safeParse(req.body);
    console.log("ini req body: ",req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid data' });

    const { title, amount, date } = parsed.data;

  // Buat string YYYY-MM-DD, fallback ke sekarang kalau kosong
  const formattedDate = date
    ? new Date(date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  await db.insert(transactions).values({
    title,
    amount,
    userId,
    date: formattedDate, // Kirim string 'YYYY-MM-DD'
  });
    return res.status(200).json({ message: 'Transaction added' });
  }

  if (req.method === 'PUT') {
  const parsed = transactionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid data' });

  const { id, title, amount, date } = parsed.data;

  // Validasi id, karena ini update
  if (!id) return res.status(400).json({ error: 'Missing transaction id' });

  // Pastikan transaksi milik user
  const existing = await db.select().from(transactions).where(eq(transactions.id, id));
  if (!existing.length || existing[0].userId !== userId) {
    return res.status(403).json({ error: 'Unauthorized update' });
  }

  const formattedDate = date
    ? new Date(date).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  await db.update(transactions)
    .set({
      title,
      amount,
      date: formattedDate,
    })
    .where(eq(transactions.id, id));

  return res.status(200).json({ message: 'Transaction updated' });
    }

  if (req.method === 'DELETE') {
    const id = parseInt(Array.isArray(req.query.id) ? req.query.id[0] : req.query.id || '');
    const existing = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!existing.length || existing[0].userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized delete' });
    }
    await db.delete(transactions).where(eq(transactions.id, id));
    return res.status(200).json({ message: 'Deleted' });
  }


  res.status(405).end();
}