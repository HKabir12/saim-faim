# সাইম ও ফাইমের সুন্নাতে খাতনা: সম্মানীর তালিকা

Next.js 15, TypeScript, PostgreSQL, Tailwind CSS।

## চালু করার ধাপ

1. `npm install`
2. `.env.example` কপি করে `.env.local` নাম দিন
3. PostgreSQL-এ একটা ডাটাবেস বানান (যেমন `khatna`) এবং `DATABASE_URL` ঠিক করুন
4. পাসওয়ার্ড হ্যাশ বানান: `npm run hash -- "আপনার-পাসওয়ার্ড"`
   যে লাইন আসবে (`ADMIN_PASSWORD_HASH=...`) সেটা `.env.local`-এ বসান
5. `AUTH_SECRET` বানান: `openssl rand -base64 32`
6. টেবিল বানান: `npm run db:init`
7. `npm run dev` এবং http://localhost:3000 খুলুন

## পাতা

- `/` হোম (আমন্ত্রণ পাতা)
- `/login` এডমিন লগইন
- `/dashboard` তালিকা, সার্চ, এন্ট্রি, এডিট, ডিলিট (শুধু লগইন করা এডমিন)

## ডিপ্লয় করলে

- সাইটে HTTPS থাকতে হবে, নইলে লগইন কুকি সেট হবে না
- `.env.local`-এর মানগুলো হোস্টিংয়ের Environment Variables-এ দিন
