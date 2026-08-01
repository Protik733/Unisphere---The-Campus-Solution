# Render Deployment — do this exactly once, then never touch it again

This repo has **one real backend**: `backend/` (its `package.json` has every
dependency the server needs — express, mongoose, razorpay, socket.io,
nodemailer, jsonwebtoken, bcryptjs, cors, dotenv, @google/generative-ai, axios).
There used to be a second, empty `package.json` sitting at the repo root that
only listed `nodemailer` — if Render's "Root Directory" ever pointed at the
repo root instead of `backend`, Render would install *that* one instead and
the server would crash on startup with `Cannot find module 'express'` (etc.).
That stray file has been deleted so this can't happen again.

## Option A — Render Dashboard (manual, most common)

When creating the Web Service:

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Environment Variables** (Render dashboard → your service → Environment):
  add these (values come from your local `backend/.env` — that file is
  gitignored on purpose and never gets pushed, so Render never sees them
  unless you paste them in here):
  - `MONGO_URI`
  - `RAZORPAY_KEY`
  - `RAZORPAY_SECRET`
  - `JWT_SECRET`
  - `CAMPUS_EMAIL`
  - `CAMPUS_EMAIL_PASSWORD`
  - `OPENROUTER_API_KEY`
  - `PORT` — Render sets this automatically; you don't need to add it, but
    the server also falls back to 3000 locally.

## Option B — Render Blueprint (`render.yaml`, included in this repo)

Render can read `render.yaml` at the repo root and set Root Directory / Build
Command / Start Command automatically. You'll still be prompted to fill in
the secret values (`MONGO_URI`, `RAZORPAY_KEY`, etc.) in the dashboard — they
are intentionally left blank in `render.yaml` (`sync: false`) since they
should never be committed to git.

## Gmail (OTP + payment receipt emails)

`CAMPUS_EMAIL_PASSWORD` must be a **Gmail App Password**, not your normal
Gmail login password — Google removed plain-password SMTP login years ago.
To generate one: Google Account → Security → 2-Step Verification (must be ON)
→ App passwords → create one for "Mail" → paste the 16-character code (no
spaces) into `CAMPUS_EMAIL_PASSWORD`. If 2-Step Verification isn't enabled on
that Gmail account, the "App passwords" option won't even appear — turn that
on first.

## Frontend → backend connection

Every frontend page loads `frontend/config.js` first, which sets
`window.API_BASE` automatically:
- Opened through the Node server itself (`http://localhost:3000`, or your
  Render URL) → `API_BASE = ""` → same-origin requests. **No domain to edit,
  ever, no matter what your Render URL is.**
- Opened any other way locally (VS Code Live Server, double-clicking the
  HTML file) → falls back to `http://localhost:3000`.

You should never need to hardcode a domain anywhere in the frontend again.
