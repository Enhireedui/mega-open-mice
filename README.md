# SAIN MOTORS — MEGA OPEN MIC

Registration landing page for the **MEGA OPEN MIC** event, presented by SAIN MOTORS.

Single page, Mongolian, dark UI. A visitor reads the prize, fills in three
fields, and the submission is appended to a Google Sheet.

Built from the MEGA TEST DRIVE 5 project. **That project is still live and still
taking registrations — it lives in its own folder, its own Netlify site and its
own spreadsheet, and nothing here touches it.**

---

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Styling | Tailwind CSS v4 (`@theme` tokens in `app/globals.css`) |
| Forms | react-hook-form + zod |
| Motion | framer-motion + CSS keyframes |
| Type | Self-hosted Montserrat + Inter (`public/fonts`) |
| Storage | Google Sheets via an Apps Script Web App |
| Host | Netlify (`@netlify/plugin-nextjs`) |

Cyrillic-ext subsets are **not** optional: Mongolian Ө/ө and Ү/ү fall outside
the basic `cyrillic` range.

---

## Local development

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

Without `GOOGLE_SHEETS_WEBHOOK_URL` set, `npm run dev` still exercises the whole
form — the server action short-circuits to success instead of writing a row, so
you can test validation, the loading state and the confirmation modal offline.

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # production build
```

---

## Environment variables

Copy `.env.example` to `.env.local` and fill it in. `.env.local` is gitignored.

| Variable | Notes |
|---|---|
| `GOOGLE_SHEETS_WEBHOOK_URL` | **Secret.** The Apps Script `/exec` URL. Server-only — never prefix with `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, used for Open Graph absolute URLs. |

In production these belong in **Netlify ▸ Site configuration ▸ Environment
variables**, not in the repo.

---

## Google Sheets backend

Target sheet:
<https://docs.google.com/spreadsheets/d/1J_fff-66k5Q027YpQFu0PlYKUGeYeW90GyRjnvR-T7c/edit>

`docs/apps-script.gs` is the whole backend. Deploy it from the sheet owner's
Google account:

1. Sheet ▸ **Extensions ▸ Apps Script**.
2. Replace everything in `Code.gs` with `docs/apps-script.gs`. Save.
3. **Deploy ▸ New deployment ▸ Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** — *not* "Anyone with Google Account"
4. Approve the permission prompt (Advanced ▸ Go to project ▸ Allow).
5. Copy the `/exec` URL into `GOOGLE_SHEETS_WEBHOOK_URL`.

After editing the script later you must publish a **new version**
(Deploy ▸ Manage deployments ▸ edit ▸ New version), or the old code keeps running.

### Sheet layout

| Col | Header | Written by |
|---|---|---|
| A | Бүртгүүлсэн огноо | script |
| B | Нэр | script |
| C | Утас | script |
| D | Дууны нэр | script |
| E | Холбогдсон | your team |
| F | Ирсэн эсэх | your team |
| G | Тэмдэглэл | your team |

Columns E–G are never touched, so notes added by hand survive every write.

### Contract

```
POST { timestamp, fullName, phone, songName }
  -> { ok: true }
  -> { ok: false, reason: "duplicate" | "invalid" | "busy" }

GET
  -> { ok: true, total: <rows> }        health check only
```

The duplicate check runs inside a document lock, so two simultaneous
submissions can never write the same phone number twice. The server action
never reports success without an explicit `ok: true` — a Web App deployed with
the wrong access setting answers `200` with a Google sign-in page, and treating
that as success would tell people they are registered when nothing was written.

**One registration per phone number.** That is stated on the form, enforced in
the server action (in-memory, per instance) and enforced authoritatively in the
Apps Script.

---

## Editing the page

`lib/config.ts` is the single source of truth. Prize amounts, the headline
sentence, the invitation copy, the date, the venue and the contact channels are
all there and are not duplicated anywhere else.

Still to confirm before launch — these are intentionally blank, and the page
hides the corresponding blocks rather than showing a placeholder:

- `schedule` — event date, weekday, ISO date, start time
- `venue` — name, hint, map URL
- `contact` — phone, Facebook, Instagram

Filling `schedule` or `venue.name` makes the date line under the form appear on
its own, and adds `startDate` / `location` to the page's Event structured data.

---

## Assets

| File | Used for |
|---|---|
| `public/brand/mega-open-mic.png` | Hero lockup |
| `public/brand/sain-motors.png` | Header and footer marks |
| `public/event/open-mic-poster.jpg` | Social share image (Open Graph / Twitter) only — not shown on the page |

`MEGA Open mic.png` and `OPEN MIC 4.png` in the project root are the untouched
originals the two files above were derived from. They are not served.

---

## Deploy

Deploy as its **own** Netlify site — never into the MEGA TEST DRIVE 5 site.

1. New site from this folder / repo.
2. Build command `npm run build`, Node 22 (both already in `netlify.toml`).
3. Set both environment variables.
4. Deploy, then submit one real registration and confirm the row lands in the
   sheet.
