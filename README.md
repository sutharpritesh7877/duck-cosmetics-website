# 🦆 Duck Cosmetics — Haute Botanical Skincare & Luxury E-Commerce Platform

> **An International, High-Fashion E-Commerce Experience & Complete Order Management System (OMS)**  
> Built with Next.js 14+ (App Router), React 19, Tailwind CSS, Framer Motion, Prisma ORM, and NextAuth.js. Currently in Pre-Launch ("Coming Soon") VIP Access mode.

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.11-2D3748?style=flat&logo=prisma)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-5D3A7A)](#)

---

## 💎 Brand Identity & Design System

Duck Cosmetics blends clinical-grade dermatological science with haute botanical formulations and classical Ayurvedic botanicals. Every pixel adheres to our strict luxury design system:

| UI Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Primary Purple** | `#5D3A7A` | Brand signature, primary CTAs, active states, and key accents |
| **Background Lilac**| `#F8F6FA` | Product card surfaces, secondary editorial sections, and footer |
| **Pure White** | `#FFFFFF` | Main canvas, cards, and modal dialogs |
| **Text Dark** | `#1A1A1A` | High-contrast editorial headlines & typography |
| **Text Gray** | `#666666` | Editorial body copy, ingredients, and regulatory notes |
| **Border Lilac** | `#EADBF7` | Hairline 1px borders and elevated divider lines |

### 🖋️ Typography & Motion
- **Headings**: Editorial Serif (`Playfair Display`, `Bodoni`) for luxury gravitas.
- **Body & UI**: Clean geometric Sans-Serif (`Inter`, `Montserrat`) with tracked letter-spacing.
- **Micro-Interactions**: Powered by **Framer Motion** — fluid hover states, staggered card fade-ins, animated mega-menu reveals, and soft ambient drop shadows.

---

## ✨ Features & Architecture

### 🛍️ Public Storefront (Pre-Launch VIP Experience)
- **High-Resolution Brand Logo**: Uncompromising Deep Purple (`#5D3A7A`) 2x WebP/PNG emblem horizontally centered with navigation.
- **Animated Mega-Menu Dropdown**: Smooth Framer Motion reveal of Curated Collections (*Baby Care*, *Ayurvedic*, *Skincare*, *Velvet Cushion Tints*, etc.).
- **Dynamic Category Filtering**: Dedicated collection hubs (`/shop`, `/shop/baby-care`, `/shop/ayurvedic`, `/shop/skincare`) with real-time parameter sync.
- **Pre-Launch VIP Waitlist**:
  - Modal with strict Zod email validation.
  - Automatic double-opt-in / welcome confirmation email with Brevo/Resend dispatch.
  - Deduplicated database storage with timestamp tracking.
- **Editorial Brand Story (`/about`)**:
  - The Ahmedabad Atelier story.
  - Cruelty-free pledge and Ayurvedic fusion philosophy.
  - Founding team and regulatory compliance credentials.
- **Customer Concierge (`/contact` & `/faq`)**:
  - Interactive multi-field support inquiry form.
  - Automated concierge acknowledgment email sent directly to the customer.
  - Instant admin notification dispatched to `admin@duckcosmetics.com`.
  - Expandable FAQ accordions answering formulation and shipping queries.
- **Mobile First**: Clean 3-line hamburger drawer navigation for screens `< 768px`.
- **Custom 404 Experience (`/not-found`)**: Luxury editorial missing-page illustration and quick return link.

### 🛡️ Admin Order Management System (OMS)
Access protected at `/admin` (zero public buttons on the storefront):
- **Role-Based Authentication**: Secure session cookies via JWT / NextAuth with automatic redirects for unauthorized users.
- **Product Management CRUD**:
  - Full title, slug, price, category, status (`LIVE`, `COMING_SOON`, `DRAFT`), and stock tracking.
  - Rich luxury formulation fields: *Ingredients List*, *Directions for Use*, *Safety Warnings*, *Age Guidance*, *Manufacturer Details*, and *Editorial Rating (1-5 Stars)*.
- **Live Content & Settings Customizer**:
  - Live edit Announcement Bar banner text, Hero Headline, Subtitles, Story copy, Support WhatsApp, and Support Email.
  - Zero hardcoded text — updates reflect across the storefront instantly.
- **Waitlist & VIP Subscribers Directory**:
  - View, search, filter, and export VIP waitlist members to CSV.
- **Reviews Moderation Engine**:
  - Review submitted customer feedback, approve verified buyer reviews, or reject spam before publishing.
- **Customer Messages Concierge**:
  - Review inquiries submitted through the contact form with customer details.

---

## 🛠️ Tech Stack & Directory Structure

```text
├── prisma/
│   └── schema.prisma             # PostgreSQL data models (User, Product, Order, Waitlist, Review)
├── public/
│   ├── duck-logo.webp            # Official Deep Purple (#5D3A7A) brand logo (2x crisp)
│   ├── favicon.svg               # SVG favicon in #5D3A7A
│   ├── favicon-32x32.png         # Standard browser tab icon
│   ├── favicon-192x192.png       # PWA high-res touch icon
│   └── og-image.jpg              # 1200x630 OpenGraph social preview banner
├── src/
│   ├── app/                      # Next.js 14 App Router
│   │   ├── (public)/             # Customer storefront routes
│   │   │   ├── page.tsx          # Homepage with Hero, Editorial, and Product Grid
│   │   │   ├── shop/             # Dynamic catalog & collection routes (/shop/[category])
│   │   │   ├── about/            # Brand philosophy & atelier story
│   │   │   ├── contact/          # Concierge inquiry form
│   │   │   ├── faq/              # FAQ accordions
│   │   │   ├── reviews/          # Verified customer testimonials
│   │   │   ├── robots.ts         # Automated search engine robots.txt
│   │   │   ├── sitemap.ts        # Dynamic XML sitemap
│   │   │   └── not-found.tsx     # Custom luxury 404 page
│   │   ├── admin/                # Protected Admin OMS
│   │   │   ├── login/            # Secure NextAuth sign-in gate
│   │   │   ├── products/         # Catalog CRUD with formulation attributes
│   │   │   ├── settings/         # Dynamic content & branding customizer
│   │   │   ├── waitlist/         # VIP waitlist analytics & CSV export
│   │   │   ├── reviews/          # Review approval queue
│   │   │   └── messages/         # Concierge inquiry inbox
│   │   └── api/                  # RESTful API endpoints with Zod validation
│   ├── components/               # Reusable React components
│   │   ├── layout/               # Header (sticky with scroll shadow), Footer (Soft Lilac)
│   │   ├── home/                 # Hero, Category Showcase, Product Section
│   │   └── ui/                   # DuckLogo, WaitlistModal, Toast, Badges
│   └── lib/                      # Core backend utilities
│       ├── auth.ts               # NextAuth & JWT session management
│       ├── db.ts                 # Hybrid DB service (Prisma + JSON datastore fallback)
│       ├── email.ts              # Brevo / Resend transactional email automations
│       └── validation.ts         # Strict Zod schemas
└── scripts/
    └── generate-assets.cjs       # Node.js asset pipeline (Sharp OG image & favicon generator)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or newer
- **npm** or **pnpm** / **yarn**

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-org/duck-cosmetics.git
cd duck-cosmetics
npm install --legacy-peer-deps
```

### 2. Environment Configuration
Copy the provided `.env.example` to create your local `.env.local`:
```bash
cp .env.example .env.local
```
Configure your keys as needed:
- `DATABASE_URL`: PostgreSQL connection string (Supabase / Neon / Local Postgres).
- `BREVO_API_KEY` / `RESEND_API_KEY`: API keys for transactional emails.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 4 tracking ID.
- `NEXT_PUBLIC_META_PIXEL_ID`: Meta (Facebook) Pixel ID.

### 3. Database Initialization (Optional)
Duck Cosmetics includes a resilient, zero-config datastore fallback that runs out of the box. If connecting to a live PostgreSQL database:
```bash
npx prisma generate
npx prisma db push
```

### 4. Running Locally
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build
```bash
npm run build
npm run start
```

---

## 🔐 Admin OMS Credentials

Admin access is restricted to authorized personnel:
- **URL**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Default Email**: `admin@duckcosmetics.com`
- **Default Password**: `DuckAdmin2026!`

*(Can be configured via `DEFAULT_ADMIN_EMAIL` and `DEFAULT_ADMIN_PASSWORD` in your environment).*

---

## 📧 Email Automation Triggers

1. **VIP Waitlist Welcome Email**: Triggered immediately when a user joins the waitlist via the header, product card "Coming Soon" button, or footer newsletter.
2. **Concierge Inquiry Auto-Responder**: Dispatched to customers who submit an inquiry on the `/contact` page with an estimated response window.
3. **Internal Concierge Alert**: Real-time notification dispatched to `admin@duckcosmetics.com` summarizing incoming inquiries.

---

## 🔍 SEO & Analytics

- **Schema.org Structured Data**: Embedded `BeautyBrand` and `Store` JSON-LD in `layout.tsx`.
- **OpenGraph & Twitter Cards**: High-res 1200x630 banner (`/og-image.jpg`) generated for social media previews.
- **Dynamic XML Sitemap**: Generated at `/sitemap.xml` with category deep-links.
- **Robots.txt**: Generated dynamically at `/robots.txt` with protected admin paths disallowed.
- **Analytics Ready**: Google Analytics 4 and Meta Pixel initialized asynchronously without blocking first paint.

---

## 📄 License & Credits

© 2026 Duck Cosmetics Private Limited. All Rights Reserved.  
Crafted with passion in Ahmedabad, India.
