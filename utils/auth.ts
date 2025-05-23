import { NextApiRequest } from 'next';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'rahasia';

export interface TokenUser {
  userId: number;
  username: string;
}

export function getUserFromRequest(req: NextApiRequest): TokenUser | null {
  const token = req.cookies.token;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
      return {
        userId: (decoded as JwtPayload & { userId: number }).userId,
        username: (decoded as JwtPayload & { username: string }).username,
      };
    }
    return null;
  } catch {
    return null;
  }
}
