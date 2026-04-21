# Comicron - Comic Book Tracker

Starter project Next.js App Router + Supabase untuk tracking komik berbasis input manual:

- Input issue (title, cover, ringkasan, status baca)
- Auto-save catatan issue (debounced)
- Profil karakter dengan editor Markdown
- Timeline crossover event berdasarkan urutan baca

## Stack

- Next.js 16 (App Router, Server Components)
- Tailwind CSS v4
- Supabase (PostgreSQL + Storage)
- Lucide React icons
- React Markdown + remark-gfm

## Struktur Utama

- Dashboard: [src/app/page.tsx](src/app/page.tsx)
- Server actions: [src/app/actions.ts](src/app/actions.ts)
- API autosave notes: [src/app/api/issues/[issueId]/notes/route.ts](src/app/api/issues/[issueId]/notes/route.ts)
- Characters: [src/app/characters/page.tsx](src/app/characters/page.tsx), [src/app/characters/[characterId]/page.tsx](src/app/characters/[characterId]/page.tsx)
- Events: [src/app/events/page.tsx](src/app/events/page.tsx), [src/app/events/[eventId]/page.tsx](src/app/events/[eventId]/page.tsx)
- Supabase SQL schema: [supabase/schema.sql](supabase/schema.sql)

## Setup Lokal

1. Install dependency.

```bash
npm install
```

2. Salin env dari template.

```bash
cp .env.example .env.local
```

3. Isi variabel di [ .env.example ](.env.example):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_COVERS_BUCKET (default: covers)

4. Di Supabase SQL Editor, jalankan [supabase/schema.sql](supabase/schema.sql).

5. Buat bucket Storage bernama covers (public bucket agar URL cover bisa langsung ditampilkan).

6. Jalankan development server.

```bash
npm run dev
```

## Catatan Keamanan dan Free Tier

- Query tulis dan upload cover menggunakan Server Actions/Route Handlers, sehingga service role key tetap server-side.
- Cocok untuk zero-cost awal di Vercel + Supabase free tier.
- Untuk produksi multi-user, lanjutkan dengan autentikasi dan kebijakan RLS granular per user.
