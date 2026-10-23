# SAIT Anonymous Ask Us Anything — Spatial UI Experience

> Developed for the **Student Association of Information Technology (SAIT)** General Introductory Meeting (GIM) session with first-year juniors.

---

## 🌟 Overview

The **SAIT Anonymous Ask Us Anything** application enables junior students to submit questions anonymously from their mobile phones during the GIM session, broadcasts incoming questions live on a classroom projector with real-time updates, and gives the organizing team complete presenter control from a secured admin panel.

Built with a **Spatial UI Experience**, featuring deep midnight navy tones, electric violet and cyan accent lighting, CSS 3D perspectives, subtle pointer tilt physics, and responsive presentation layouts.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with 3D spatial perspective utilities
- **Motion & Physics**: [Framer Motion](https://www.framer.com/motion/) & dynamic specular glare
- **Icons**: [Lucide React](https://lucide.dev/)
- **Database**: [Supabase PostgreSQL](https://supabase.com/) with Row Level Security (RLS)
- **Realtime Sync**: [Supabase Realtime](https://supabase.com/docs/guides/realtime) WebSocket subscriptions
- **QR Code**: [QRCode](https://www.npmjs.com/package/qrcode) with high-contrast PNG & SVG export
- **Celebration**: [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Security**: Server-validated PIN, constant-time comparison, cryptographically signed HttpOnly session cookies

---

## 🧭 Application Routes

| Route | Role | Description |
| :--- | :--- | :--- |
| **`/`** | **Landing Hub** | Overview of the session with interactive 3D spatial cards linking to all three portals. |
| **`/submit`** | **Student Portal** | Mobile-first anonymous question form. No login, character counter (500 max), spam honeypot trap, suggestion chips, and instant submission confirmation. |
| **`/display`** | **Classroom Projector** | High-contrast 16:9 projector view readable from the back of the auditorium. Spotlight view for currently discussed question, live queue dock, and fullscreen support. |
| **`/admin`** | **Organizer Control Panel** | Protected by server-side PIN authentication. Previous / Next question navigation, Mark as Answered, Hide / Delete moderation, CSV/JSON data export, and downloadable QR code. |

---

## 🔒 Privacy & Anonymous Submission Rules

- **Zero Identification**: No names, email addresses, student IDs, phone numbers, or social handles are ever requested.
- **Zero Tracking**: IP addresses, user agents, and tracking cookies are **never** persisted in the database.
- **Sanitized Input**: All submissions are stripped of HTML/script injection vectors and rendered as pure plain text.
- **Bot Defense**: Silent honeypot trap and in-memory rate limiting prevent spam flooding without penalizing honest students.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-org/sait-quiz.git
cd sait-quiz
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
ADMIN_PIN=sait2025
ADMIN_SESSION_SECRET=a_strong_random_secret_string_32_chars_or_more
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

*(Note: If Supabase credentials are not provided initially, the application automatically runs in local in-memory preview mode so organizers can test immediately).*

### 3. Run Development Server

```bash
npm run dev
```

Visit:
- Hub: [http://localhost:3000](http://localhost:3000)
- Student Submission: [http://localhost:3000/submit](http://localhost:3000/submit)
- Classroom Projector: [http://localhost:3000/display](http://localhost:3000/display)
- Organizer Panel: [http://localhost:3000/admin](http://localhost:3000/admin) *(Default PIN: `sait2025`)*

---

## 🗄️ Supabase PostgreSQL Setup Guide

Execute the provided [`supabase-schema.sql`](./supabase-schema.sql) script in your Supabase project:

1. Open your **[Supabase Dashboard](https://supabase.com/dashboard)**.
2. Select your project and navigate to the **SQL Editor** in the left sidebar.
3. Click **New Query**, paste the entire contents of [`supabase-schema.sql`](./supabase-schema.sql), and click **Run**.
4. Confirm tables created:
   - `public.questions` (Stores question text, creation timestamp, and status `pending | answered | hidden`)
   - `public.session_state` (Stores singleton record tracking the currently highlighted question)
5. Row Level Security (RLS) is automatically enabled:
   - Public anonymous users can insert questions and read visible questions.
   - Projector clients can read `session_state`.
   - Admin operations (moderation, deletion, session reset) run via server API routes using `SUPABASE_SERVICE_ROLE_KEY`.
6. Realtime replication is automatically enabled for `questions` and `session_state`.

---

## 🌐 Deployment on Vercel

1. Push your repository to GitHub (ensure `.env.local` is **not** committed).
2. Log into **[Vercel](https://vercel.com/)** and click **Add New Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_PIN` *(Choose your secret organizer PIN)*
   - `ADMIN_SESSION_SECRET` *(32+ char random string)*
   - `NEXT_PUBLIC_APP_URL` *(Your production domain, e.g. `https://sait-auau.vercel.app`)*
5. Click **Deploy**.
6. Once deployed, open `/admin` using your PIN and download the final high-contrast QR code pointing to the live URL.

---

## 📱 QR Code Generation & Testing

1. Navigate to `/admin` and log in.
2. In the right panel, preview the auto-generated high-contrast QR code.
3. Click **Download PNG** (for slide decks) or **Download SVG** (for high-resolution physical printing).
4. **Pre-Session Verification**: Scan the printed or projected QR code using a real mobile phone (both iOS and Android) to confirm it opens the live `/submit` page seamlessly over mobile data.

---

## 🛟 Live Session Operational Plan & Offline Contingency

If the college campus Wi-Fi fluctuates during the live GIM session:
1. **Last-Synced Projector Cache**: The projector display (`/display`) caches all loaded questions in the browser's `localStorage`. If connection is lost, questions remain on screen, accompanied by an unobtrusive "Reconnecting" status indicator.
2. **Automatic Reconnection**: The client will continuously attempt to reconnect to Supabase Realtime in the background without needing a manual browser refresh.
3. **Admin Backup Export**: Organizers can click **Export CSV** or **Export JSON** at any point from `/admin` to save a local snapshot of all questions.
4. **Manual Fallback**: If cellular connectivity is disrupted in the auditorium, organizers can distribute paper index cards while keeping the existing projector screen visible.

---

## 🧪 Verification & Acceptance Criteria

Run the automated end-to-end verification suite:

```bash
npm run build
node test-e2e.mjs
```

### Minimized Checklist:
- [x] **Anonymous Submissions**: Submits without login or personal data request.
- [x] **Realtime Projector**: Automatically updates upon student submission.
- [x] **Admin Moderation**: Previous, Next, Show on Screen, Mark Answered, Hide, Delete.
- [x] **Authorization**: Admin routes reject unauthenticated requests with HTTP 401.
- [x] **Validation**: Enforces 500-character limit, rejects whitespace-only, strips scripts.
- [x] **Backups**: Downloadable CSV and JSON dumps.
- [x] **Responsive**: Tested on mobile devices, standard laptops, and 16:9 projector displays.
