# 🦆 Duck Cosmetics — Vercel Deployment & Production Setup Guide

This guide walks you through deploying the **Duck Cosmetics** Next.js 14 application to Vercel, configuring environment variables, securing the Admin OMS, and connecting your custom domain.

---

## 1. Import Repository into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Select your GitHub repository (`Duck Cosmetics Website` or `duck-cosmetics`).
4. Framework Preset: **Next.js** (detected automatically).
5. Root Directory: `./` (leave default).

---

## 2. Configure Environment Variables in Vercel
Before clicking "Deploy", go to **Project Settings** $\rightarrow$ **Environment Variables** in Vercel.

Copy each key from `.env.example` and paste your actual production values:

| Variable Name | Description | Example / Note |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cloud PostgreSQL Connection URI | `postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require` |
| `DIRECT_URL` | Direct connection for Prisma migrations | Same as above with direct port 5432 |
| `NEXTAUTH_SECRET` | 32+ character random string for JWTs | Generate via `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your live deployment URL or custom domain | `https://duckcosmetics.com` (or `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Public store canonical URL | `https://duckcosmetics.com` |
| `ADMIN_EMAIL` | Master Super Admin sign-in email | `admin@duckcosmetics.com` |
| `ADMIN_PASSWORD` | Master Super Admin password | `DuckAdmin2026!` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | From Google Cloud Console Credentials |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | From Google Cloud Console Credentials |
| `BREVO_API_KEY` | Transactional email API key | From Brevo (Sendinblue) or Resend |
| `EMAIL_FROM` | Sender display name and email address | `Duck Cosmetics Atelier <concierge@duckcosmetics.com>` |
| `RAZORPAY_KEY_ID` | Razorpay Merchant Key ID | `rzp_live_xxxxxxxx` (or `rzp_test_...`) |
| `RAZORPAY_KEY_SECRET`| Razorpay Key Secret | From Razorpay Dashboard $\rightarrow$ API Keys |
| `STRIPE_SECRET_KEY` | Stripe Live Secret Key | `sk_live_xxxxxxxx` (or `sk_test_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Public Key | `pk_live_xxxxxxxx` (or `pk_test_...`) |

> [!IMPORTANT]
> Always ensure `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` match your active Vercel domain or custom domain (`https://duckcosmetics.com`). If testing on a preview deployment, set them to the preview URL.

---

## 3. Database Hosting & Automated Backups (Supabase)
1. **Cloud Host**: We recommend **Supabase** or **Neon** for hosting PostgreSQL.
2. **Automated Daily Backups**:
   - In Supabase, navigate to **Project Settings** $\rightarrow$ **Database** $\rightarrow$ **Backups**.
   - Verify that **Daily Automated Backups (Point-in-Time Recovery)** are active.
3. **Run Prisma Migrations**:
   In your terminal before launch (or via Vercel build command):
   ```bash
   npx prisma db push
   ```

---

## 4. Admin Route Protection & Security
The repository includes a locked Next.js `middleware.ts`:
- All routes matching `/admin/:path*` require a valid JWT session token.
- Unauthenticated requests are immediately redirected to `/admin/login?callbackUrl=...`.
- The `/admin/login` page remains accessible for authorization.
- Zero public admin links exist in the customer storefront.

---

## 5. Custom Domain & SSL Setup
1. In Vercel, go to **Project Settings** $\rightarrow$ **Domains**.
2. Add your domain: `duckcosmetics.com` and `www.duckcosmetics.com`.
3. Update your DNS records at your registrar (GoDaddy, Namecheap, Cloudflare):
   - **Type A**: `@` $\rightarrow$ `76.76.21.21`
   - **Type CNAME**: `www` $\rightarrow$ `cname.vercel-dns.com`
4. Vercel will automatically provision a free, auto-renewing **Let's Encrypt SSL (HTTPS)** certificate.

---

## 6. Post-Deployment Verification Checklist
- [ ] Visit `https://yourdomain.com` — verify high-res Deep Purple `#5D3A7A` logo renders cleanly.
- [ ] Test the Cookie Consent banner at the bottom of the screen; click "Accept All".
- [ ] Verify Legal Pages:
  - `/privacy` (Privacy Policy with GDPR, CCPA, IT Act)
  - `/terms` (Terms of Service)
  - `/returns` (14-day Refund & Return Policy)
  - `/shipping` (Shipping & Delivery Policy)
- [ ] Test Customer Auth modal:
  - Sign In / Create Account with bcrypt encryption
  - "Continue with Google" OAuth flow
  - "Forgot Password?" email dispatch & `/reset-password` page
- [ ] Verify Admin OMS at `/admin` (ensure unauthenticated visitors are redirected to `/admin/login`).
- [ ] Verify Category Manager at `/admin/categories` and Mega Menu Promo Editor at `/admin/mega-menu`.

---

© 2026 Duck Cosmetics Private Limited. All Rights Reserved.
