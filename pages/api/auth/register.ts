import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { registerSchema } from '@/utils/zodSchemas';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    console.log('Validation failed:', parsed.error);
    return res.status(400).json({ error: 'Invalid data' });
  }

  const { username, password, name } = parsed.data;

  // Cek username sudah ada atau belum
  const existingUser = await db.select().from(users).where(eq(users.username, username));
  if (existingUser.length > 0) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    
    await db.insert(users).values({ username, password: hashed, name });
    return res.status(200).json({ message: 'User registered' });
  } catch (error) {
    console.error('DB insert error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
