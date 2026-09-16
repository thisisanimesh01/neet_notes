# NEET Notes

A production-ready platform for selling handwritten NEET preparation notes with secure PDF delivery, online payments, private cloud storage, and admin management.

**Live:** https://neetnotes.vercel.app

---

## Features

- 📚 Chapter-wise Biology and Chemistry notes
- 💰 ₹49 per chapter
- 👀 Two-page PDF preview before purchase
- 🔒 Private PDF storage and protected downloads
- 💳 Razorpay payment integration
- 🔐 Server-side payment and access verification
- 🛠️ Admin dashboard for note and order management
- ☁️ Direct-to-storage PDF uploads for large files
- 🚀 Production deployment on Vercel

---

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL, Prisma
- **Storage:** Supabase Storage
- **Payments:** Razorpay
- **Deployment:** Vercel

---

## Architecture

```text
Customer
   │
   ▼
Next.js Application
   │
   ├── PostgreSQL + Prisma
   ├── Supabase Private Storage
   └── Razorpay Payments