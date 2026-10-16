# 🦆 Duck Cosmetics — Official E-Commerce Storefront & Complete Order Management System (OMS)

> **Modern, High-Performance Indian Beauty & Wellness E-Commerce Platform**  
> Built with React 19, Tailwind CSS v4, and Vite. Features a full-fledged 19-module Admin Order Management System, Indian GST Tax Engine, Direct Image Uploads, and Carrier Tracking.

---

## 🌟 Key Features

### 🛒 Customer Storefront
* **Dynamic Product Catalog**: 5 Core Categories (*Baby Care, Face Wash, Vapor Rub, Ortho Pain Oil, Cosmetics*).
* **Live Inventory Integration**: Real-time stock counts, *"Only X left"* low-stock badges, and auto-disabling of out-of-stock items.
* **Auto-Gifting Promotion**: Purchasing any cosmetic automatically unlocks a complimentary *Daily Fresh Face Wash*.
* **PIN Code Serviceability Checker**: Instant delivery validation for Indian PIN codes.
* **Seamless Checkout & Coupuns**: Supports percentage/fixed promo codes (`DUCK15`, `WELCOME50`, `FREESHIP`), Cash on Delivery (COD), UPI, and Cards.
* **Customer Account Portal ("My Orders")**: Order tracking with live carrier links, 1-click cancellations (with automatic inventory restoration), and 7-day return requests.

### ⚙️ Complete Admin Order Management System (19 Modules)
1. **Dashboard Overview**: Financial KPIs, net recognized revenue, gross sales, uncollected COD, and sales velocity rankings.
2. **Orders & Fulfillment**: 12 real-time metric pills, multi-stage state machine (`New` $\rightarrow$ `Delivered`), staff assignment, and carrier tracking.
3. **Products & Catalog**: Full catalog CRUD with **Direct Computer Image File Upload** (auto-optimized WebP), MRP, selling prices, and HSN codes.
4. **Categories**: Revenue per category and catalog organization.
5. **Inventory & Stock**: Concurrency-safe stock adjustments, audit reasons, and warehouse valuation.
6. **Shipping & Delivery**: Carrier integrations (*Delhivery, BlueDart, DTDC, India Post, Shiprocket*) with tracking links and failed attempt logs.
7. **Returns & Refunds**: Customer return request review, physical item condition assessment, restocking decisions, and refund processing.
8. **Customers Directory**: LTV calculations, order histories, and VIP customer status.
9. **Staff & Permissions**: 7 operational roles with role-based access control and sensitive customer data masking.
10. **Coupons & Promotions**: Promotional campaign builder with minimum order value and discount caps.
11. **Website Content**: Live header announcement ticker editor and published store policies.
12. **Payments & Transactions**: Financial ledger with **Cash on Delivery (COD) courier cash reconciliation**.
13. **Invoices & Compliance**: 1-click preview and printing of **GST Tax Invoices**, **Packing Slips**, and **Carrier Shipping Labels** with barcodes.
14. **Notifications Queue**: Multi-channel customer logs (WhatsApp, SMS, Email).
15. **Reports & Analytics**: Sales breakdowns by tender type and category with CSV data export.
16. **Customer Support**: Helpdesk ticketing system with agent reply threads.
17. **Website Settings**: Legal registered entity, GSTIN (`24AAACD1234F1Z8`), PAN, and production cloud credentials.
18. **Security & Audit Logs**: Immutable chronological audit trail recording all staff actions.
19. **Suppliers & Purchase Orders**: Supplier catalog, procurement POs, and automated warehouse restocking upon arrival.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

Open [http://localhost:5173/](http://localhost:5173/) to view the live customer store.

### 🔐 Accessing the Admin OMS (Production Super Admin)
Normal shoppers see only the customer-facing e-commerce storefront. To access the Order Management System (OMS):
- Click **"Staff Portal"** in the website footer.
- Or append `/#admin` to the URL (e.g. `https://your-domain.vercel.app/#admin` or `http://localhost:5173/#admin`).
- Or press keyboard shortcut: **`Ctrl + Alt + A`**.
- Authenticate through the secure **Staff Sign-In Gate** using your master credentials:
  - **Super Admin Email**: `sutharpritesh7877@gmail.com`
  - **Security Password**: `Ram@7877545471`

---

## 🌐 Production Deployment (Vercel)

The repository includes a pre-configured `vercel.json` optimized for Single-Page Application (SPA) routing and edge caching. See [`GUIDE.md`](./GUIDE.md) for full instructions on connecting Supabase, Razorpay, and custom domains (`duckcosmetics.in`).

---

© 2026 Duck Cosmetics Private Limited. All Rights Reserved.
