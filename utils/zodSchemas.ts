import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(1),
  name: z.string().min(1),
  password: z.string().min(1),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const transactionSchema = z.object({
  id: z.number().optional(),  // <-- tambahkan ini supaya bisa ada id saat update
  title: z.string().min(1),
  amount: z.number(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date"
  }).optional(),
  createdAt: z.string().datetime().optional(),
});


export const userIdQuerySchema = z.object({
  userId: z.string().regex(/^\d+$/).transform(Number),
});

export const idQuerySchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number),
});