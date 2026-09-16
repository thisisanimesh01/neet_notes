import { z } from "zod";

export const noteFormSchema = z.object({
  subject: z.string().min(1),
  category: z.string().min(1),
  chapterName: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().min(49).max(49),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const purchaseSchema = z.object({
  noteId: z.string().min(1),
});

export const paymentVerifySchema = z.object({
  noteId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});
