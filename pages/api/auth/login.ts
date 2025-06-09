// /api/auth/login.ts
import { db } from '@/src/db';
import { users } from '@/src/db/schema';
import { loginSchema } from '@/utils/zodSchemas';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end('Method Not Allowed');
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid data' });

  const { username, password } = parsed.data;
  const user = await db.select().from(users).where(eq(users.username, username));
  if (!user.length) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user[0].password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user[0].id, username: user[0].username }, JWT_SECRET, { expiresIn: '1d' });

  // Set HttpOnly cookie  
  res.setHeader('Set-Cookie', serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
    path: '/',
  }));

  return res.status(200).json({ message: 'Login successful', userId: user[0].id, name: user[0].name });
}
