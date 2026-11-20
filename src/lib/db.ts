import fs from "fs";
import path from "path";
import prisma from "./prisma";
import bcrypt from "bcryptjs";
import {
  fetchSiteSettingsFromFirestore,
  saveSiteSettingsToFirestore,
  fetchContactSettingsFromFirestore,
  saveContactSettingsToFirestore,
  fetchAdminProductsFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
} from "../backend/firebaseService";

export type ProductStatus = "DRAFT" | "COMING_SOON" | "LIVE";
export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "RETURNED";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  parentCategoryId?: string | null;
  description?: string;
  shortDescription?: string;
  bannerImageUrl?: string;
  subCategories?: string[] | any[];
  subCategoriesList?: string[];
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MegaMenuPromoData {
  id: string;
  badgeText: string;
  title: string;
  description: string;
  posterImageUrl: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  mrp: number;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  gst: number;
  hsn: string;
  imageUrl: string;
  backImageUrl?: string;
  textureImageUrl?: string;
  lifestyleImageUrl?: string;
  galleryImages?: string[];
  categoryId: string;
  categoryName?: string;
  category?: CategoryData;
  status: ProductStatus;
  isFeatured: boolean;
  isBestSeller?: boolean;
  ingredients?: string;
  directions?: string;
  warnings?: string;
  manufacturer?: string;
  rating?: number;
  reviewCount?: number;
  sku?: string;
  variety?: string;
  size?: string;
  imageAlt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemData {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  pincode?: string;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  isManual: boolean;
  notes?: string;
  items: OrderItemData[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewData {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  productId?: string;
  productTitle?: string;
  status: ReviewStatus;
  adminReply?: string;
  verified: boolean;
  createdAt: string;
}

export interface CouponData {
  id: string;
  code: string;
  discountPercent: number;
  minOrderAmount: number;
  freeGift?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WaitlistData {
  id: string;
  email: string;
  createdAt: string;
  source: string;
}

export interface PaymentGatewaysData {
  razorpayEnabled?: boolean;
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  razorpayTestMode?: boolean;
  stripeEnabled?: boolean;
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeTestMode?: boolean;
  codEnabled?: boolean;
  codMaxLimit?: number;
  phonepeEnabled?: boolean;
}

export interface ShippingZonesData {
  domesticFreeThreshold?: number;
  domesticFlatRate?: number;
  domesticExpressRate?: number;
  domesticCarrier?: string;
  domesticTransitDays?: string;
  internationalFreeThreshold?: number;
  internationalFlatRate?: number;
  internationalCarrier?: string;
  internationalTransitDays?: string;
}

export interface SiteSettingsData {
  id: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageUrl: string;
  announcementBarText: string;
  footerTagline: string;
  trustBadge1: string;
  trustBadge2: string;
  maisonHeadline: string;
  maisonSubheadline: string;
  buttonText: string;
  baseCurrency?: "INR" | "USD";
  exchangeRateInrToUsd?: number;
  globalRouting?: any;
  paymentGateways?: PaymentGatewaysData;
  shippingZones?: ShippingZonesData;
  updatedAt: string;
}

export interface ContactSettingsData {
  id: string;
  phone1: string;
  phone2: string;
  phone3: string;
  email: string;
  address: string;
  bottomText: string;
  updatedAt: string;
}

export interface PageContentData {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface ContactMessageData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
}

export interface FaqItemData {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserData {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  phoneNumber?: string;
  role: "ADMIN" | "STAFF" | "USER";
  resetToken?: string;
  resetTokenExpiry?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AddressData {
  id: string;
  userId: string;
  type: "SHIPPING" | "BILLING";
  isDefault: boolean;
  name: string;
  phone: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WishlistData {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

const DEFAULT_SETTINGS: SiteSettingsData = {
  id: "default",
  heroHeadline: "REDEFINE YOUR GLOW",
  heroSubheadline:
    "Unveiling premium, playful & sophisticated beauty. Consciously formulated botanicals engineered for radiant, effortless luminescence.",
  heroImageUrl:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
  announcementBarText: "Free Shipping Over ₹800 | 100% Cruelty-Free",
  footerTagline:
    "Duck Cosmetics — Redefining high-fashion beauty with conscious botanicals.",
  trustBadge1: "100% CRUELTY-FREE",
  trustBadge2: "DERMATOLOGICALLY TESTED",
  maisonHeadline: "Sophisticated Science, Playful Radiance.",
  maisonSubheadline:
    "Duck Cosmetics was founded on a singular obsession: to dismantle the boundary between uncompromising clinical dermatology and haute couture pleasure.",
  buttonText: "JOIN THE WAITLIST",
  paymentGateways: {
    razorpayEnabled: true,
    razorpayKeyId: "rzp_test_5D3A7A9991",
    razorpayKeySecret: "••••••••••••••••",
    razorpayTestMode: true,
    stripeEnabled: true,
    stripePublishableKey: "pk_test_51P...",
    stripeSecretKey: "••••••••••••••••",
    stripeTestMode: true,
    codEnabled: true,
    codMaxLimit: 5000,
    phonepeEnabled: false,
  },
  shippingZones: {
    domesticFreeThreshold: 800,
    domesticFlatRate: 99,
    domesticExpressRate: 199,
    domesticCarrier: "Delhivery Express / BlueDart",
    domesticTransitDays: "2-4 Business Days",
    internationalFreeThreshold: 1500,
    internationalFlatRate: 200,
    internationalCarrier: "DHL Express / FedEx International",
    internationalTransitDays: "5-10 Business Days",
  },
  updatedAt: new Date().toISOString(),
};

const DEFAULT_CONTACT_SETTINGS: ContactSettingsData = {
  id: "default",
  phone1: "+91 79 4001 8899",
  phone2: "+91 98250 12345",
  phone3: "+91 99099 87654",
  email: "concierge@duckcosmetics.com",
  address:
    "Duck Cosmetics Atelier, Level 4, Signature Towers, SG Highway, Bodakdev, Ahmedabad, Gujarat 380054, India",
  bottomText: "Duck Cosmetics — Care for Every Little Moment.",
  updatedAt: new Date().toISOString(),
};

const DEFAULT_CATEGORIES: CategoryData[] = [
  {
    id: "cat-1",
    name: "Skincare",
    slug: "skincare",
    description: "Clean active botanicals & cellular hydrators",
    shortDescription: "Clean active botanicals & cellular hydrators",
    displayOrder: 1,
    subCategoriesList: ["Serums & Oils", "Cleansers", "Moisturizers", "Sun Protection"],
    bannerImageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop",
  },
  { id: "cat-2", name: "Serums & Oils", slug: "serums-oils", parentCategoryId: "cat-1", description: "Cellular renewal dew veils & nectars", displayOrder: 1 },
  { id: "cat-3", name: "Cleansers", slug: "cleansers", parentCategoryId: "cat-1", description: "Cloud melting balms & oat milks", displayOrder: 2 },
  { id: "cat-4", name: "Moisturizers", slug: "moisturizers", parentCategoryId: "cat-1", description: "Whipped cashmere moisture soufflés", displayOrder: 3 },
  {
    id: "cat-5",
    name: "Baby Care",
    slug: "baby-care",
    description: "Pediatric-tested hypoallergenic soothing baby care",
    shortDescription: "Pediatric-tested hypoallergenic soothing baby care",
    displayOrder: 2,
    subCategoriesList: ["Baby Lotions", "Baby Washes", "Diaper Creams", "Soothing Balms"],
    bannerImageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop",
  },
  { id: "cat-5a", name: "Baby Lotions", slug: "baby-lotions", parentCategoryId: "cat-5", description: "Sweet almond & nourishing shea lotions", displayOrder: 1 },
  { id: "cat-5b", name: "Baby Washes", slug: "baby-washes", parentCategoryId: "cat-5", description: "Tear-free oat & chamomile cleansing washes", displayOrder: 2 },
  { id: "cat-5c", name: "Diaper Creams", slug: "diaper-creams", parentCategoryId: "cat-5", description: "Calming zinc & organic calendula barrier", displayOrder: 3 },
  {
    id: "cat-6",
    name: "Ayurvedic",
    slug: "ayurvedic",
    description: "Classical Kashmiri saffron & sandalwood infusions",
    shortDescription: "Classical Kashmiri saffron & sandalwood infusions",
    displayOrder: 3,
    subCategoriesList: ["Facial Oils", "Kumkumadi Royal", "Ubtan & Masks", "Herbal Tonics"],
    bannerImageUrl: "https://images.unsplash.com/photo-1608248597359-5f2571217066?q=80&w=1200&auto=format&fit=crop",
  },
  { id: "cat-6a", name: "Facial Oils", slug: "facial-oils", parentCategoryId: "cat-6", description: "Cold-pressed Kumkumadi royal nectars", displayOrder: 1 },
  { id: "cat-6b", name: "Ubtan & Masks", slug: "ubtan-masks", parentCategoryId: "cat-6", description: "Herbal radiance & sandalwood glow masks", displayOrder: 2 },
  {
    id: "cat-7",
    name: "Makeup",
    slug: "makeup",
    description: "High-fashion velvet cushion tints & glow drops",
    shortDescription: "High-fashion velvet cushion tints & glow drops",
    displayOrder: 4,
    subCategoriesList: ["Lip & Cheek", "Sun & Glow", "Silk Primer"],
  },
  { id: "cat-10", name: "Lip & Cheek", slug: "lip-cheek", parentCategoryId: "cat-7", description: "Soft-focus rose petal glaze flushes", displayOrder: 1 },
  { id: "cat-9", name: "Sun & Glow", slug: "sun-glow", parentCategoryId: "cat-7", description: "Invisible mineral SPF & pearl primers", displayOrder: 2 },
  {
    id: "cat-8",
    name: "Haircare",
    slug: "haircare",
    description: "Botanical scalp recovery & silk protein oils",
    shortDescription: "Botanical scalp recovery & silk protein oils",
    displayOrder: 5,
    subCategoriesList: ["Scalp Recovery", "Hair Oils", "Amla Elixirs"],
  },
  { id: "cat-8a", name: "Scalp & Hair Oils", slug: "scalp-hair-oils", parentCategoryId: "cat-8", description: "Cold-pressed rosemary & amla elixirs", displayOrder: 1 },
];

const DEFAULT_MEGA_MENU_PROMO: MegaMenuPromoData = {
  id: "default",
  badgeText: "PRE-LAUNCH VIP",
  title: "Baby Care & Pure Botanicals",
  description: "Pediatrician-tested hypoallergenic formulas with cold-pressed almond and organic calendula.",
  posterImageUrl: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop",
  primaryButtonText: "EXPLORE BABY CARE",
  primaryButtonLink: "/shop/baby-care",
  secondaryButtonText: "JOIN DROP WAITLIST",
  secondaryButtonLink: "waitlist-modal",
  isActive: true,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_PAGES: PageContentData[] = [
  {
    id: "page-about",
    slug: "about",
    title: "Our Story — Sophisticated Science & Ayurvedic Purity",
    content: `## The Maison Philosophy

Duck Cosmetics was founded on a singular obsession: to dismantle the boundary between uncompromising clinical dermatology and haute couture pleasure.

Our formulations merge time-honored Ayurvedic botanical wisdom with Swiss bio-fermented peptides. From cold-pressed Kashmiri saffron to bio-fermented hyaluronic fractions, every formula honors your natural skin texture while imbuing an ethereal, camera-ready luminosity.

### The Purity Pledge
- **100% Cruelty-Free & Vegan:** Certified by PETA. Zero animal testing, ever.
- **Dermatologically & Pediatric Tested:** Safe for the most delicate barriers.
- **Conscious Sustainable Luxury:** Packaged in UV-shielded recyclable European glass.`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-faq",
    slug: "faq",
    title: "Frequently Asked Questions",
    content: `### 1. What is Duck Cosmetics?
Duck Cosmetics is an international haute beauty and skincare brand bridging pure botanicals and advanced clinical dermatological efficacy.

### 2. How does the Pre-Launch VIP Waitlist work?
By reserving your spot, you receive private 48-hour pre-launch ordering privileges, debut deluxe botanical sample allocations, and complimentary priority shipping on your debut order.

### 3. What is your Baby Care formulation standard?
Our Baby Care line is pediatric and ophthalmologist certified, 100% fragrance-free, hypoallergenic, and formulated without parabens or phthalates.

### 4. Are products safe for sensitive and eczema-prone skin?
Yes. Every product is rigorously patch-tested under strict dermatological control on sensitive human skin panels.

### 5. Where are products formulated?
Our primary formulation laboratories are located in Grasse, France; Zurich, Switzerland; and our state-of-the-art research atelier in Ahmedabad, India.`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-privacy",
    slug: "privacy",
    title: "Privacy & Data Protection Policy",
    content: `## Duck Cosmetics Privacy & Data Protection Policy

**Effective Date:** November 2026 · **Compliance Standards:** GDPR (EU 2016/679), CCPA/CPRA (California), IT Act 2000 & Digital Personal Data Protection Act (India).

Duck Cosmetics Inc. ("Duck Cosmetics", "we", "our", or "us") is dedicated to upholding the highest standards of data integrity, confidentiality, and client discretion. This Privacy Charter governs how our Maison collects, utilizes, safeguards, and shares personal data acquired through our storefront, mobile interfaces, VIP waitlists, and client concierge channels.

---

### 1. Categories of Personal Data Collected
- **Identity & Contact Telemetry:** Full legal name, verified email address, telephone contact, delivery destination, and VIP waitlist reservation timestamp.
- **Transactional & Payment Details:** Tokenized payment credentials securely encrypted via PCI-DSS Level 1 compliant gateways (Stripe, Razorpay). Duck Cosmetics never stores unencrypted credit card numbers or banking secrets.
- **Device & Browsing Intelligence:** IP address, browser type, geographic geolocation, referral URLs, and session analytics collected via strictly managed cookies.

---

### 2. Legal Grounds & Purposes for Processing
We process your personal information strictly on the following lawful bases:
1. **Contractual Performance:** To fulfill order reservations, process transactions, deliver cosmetic parcels, and dispatch transactional notifications.
2. **Legitimate Maison Interests:** To enhance formulation suggestions, prevent malicious fraud, secure our digital infrastructure, and maintain concierge care quality.
3. **Explicit Consent (GDPR Art. 6 / DPDP Act):** For dispatching private preview drops, newsletter beauty editorials, and tailored formulation invitations. You retain the unconditional right to withdraw consent at any time.

---

### 3. Cookies, Telemetry & Tracking Technologies
We utilize first-party and select third-party cookies to optimize user experience, maintain cart persistence, and analyze anonymous audience engagement:
- **Strictly Essential Cookies:** Necessary for navigation, secure checkout, and CSRF token defense.
- **Performance & Analytics Cookies:** Google Analytics 4 (GA4) with IP anonymization enabled.
- **Consent Control:** You may adjust your cookie preferences at any time via our bottom Cookie Consent Banner or through your native browser settings.

---

### 4. Global Data Protection Rights
Depending on your geographic residency, you are entitled to exercise the following statutory rights:
- **Right to Access & Portability:** Request an encrypted archive of personal telemetry held by our atelier.
- **Right to Rectification & Erasure ("Right to be Forgotten"):** Request immediate permanent erasure of your profile and waitlist records.
- **California Consumer Privacy Act (CCPA) Disclosure:** We do NOT sell, lease, or monetize your personal information to third-party data brokers.
- **Exercise Your Rights:** Contact our Data Protection Officer at [privacy@duckcosmetics.com](mailto:privacy@duckcosmetics.com). Requests are fulfilled within 30 days without cost.

---

### 5. Data Retention & Cryptographic Security
All transmissions are armored with **256-bit AES encryption** over TLS 1.3. Telemetry is retained solely for the period required to fulfill transactional warranties and statutory tax compliances.`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-terms",
    slug: "terms",
    title: "Terms of Service & Atelier Conditions",
    content: `## Duck Cosmetics Terms of Service & Client Agreement

**Last Updated:** November 2026 · **Jurisdiction:** Ahmedabad, Gujarat, India & International Commercial Arbitration.

Welcome to Duck Cosmetics. By accessing this website, joining the Pre-Launch VIP Waitlist, or engaging with our client concierge services, you unreservedly agree to be bound by these Terms of Service.

---

### 1. Pre-Launch Allocations & VIP Reservation Status
- **Waitlist Privileges:** Joining our VIP Waitlist confers priority notification privileges for upcoming micro-batch formulation drops.
- **No Immediate Purchase Obligation:** Waitlist registration does not constitute a financial charge or an absolute guarantee of stock allocation should market demand exceed batch capacity.
- **Fair Allocation Rule:** Duck Cosmetics reserves the right to limit quantities per customer account to prevent unauthorized commercial resale.

---

### 2. Intellectual Property & Trademark Protection
All trademarks, logos, brand emblems ("dUCK COSMETICS", duck silhouette device), bespoke typography, packaging design trade dress, formula descriptions, photography, and digital code are the exclusive intellectual property of Duck Cosmetics Private Limited. Any unauthorized reproduction, scraping, reverse engineering, or commercial exploitation is strictly prohibited under international copyright and trademark laws.

---

### 3. Client Accounts & Security Obligations
- When creating an account, you agree to provide authentic, current, and complete credentials.
- You are responsible for safeguarding your confidential password and any session tokens generated on your devices.
- Notify our concierge immediately at [security@duckcosmetics.com](mailto:security@duckcosmetics.com) if you suspect unauthorized access.

---

### 4. Product Descriptions, Allergies & Dermatological Guidance
- While every botanical ingredient, HSN classification, and safety warning is meticulously documented, individual dermatological sensitivities may vary.
- We strongly advise reviewing full ingredient declarations and conducting a 24-hour patch test prior to full facial application.
- Product formulations are designed for cosmetic and skincare enhancement and do not purport to diagnose, treat, or cure clinical dermatological pathologies.

---

### 5. Governing Law & Dispute Resolution
These Terms and any contractual disputes shall be governed by and construed in accordance with the laws of India, with primary jurisdiction held in the commercial courts of Ahmedabad, Gujarat, without prejudice to mandatory statutory consumer protections under international law.`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-returns",
    slug: "returns",
    title: "Refund & Return Policy",
    content: `## Duck Cosmetics Refund & Return Policy

**Pure Satisfaction Guarantee** · **Standard Return Window:** 14 Calendar Days from Delivery.

At Duck Cosmetics, we stand behind the uncompromising craftsmanship of our haute botanical formulations. If your acquisition does not completely meet your expectations, our Client Concierge is at your service.

---

### 1. Return Eligibility & Hygiene Safeguards
To be eligible for a return and full refund:
- **Unopened & Factory-Sealed:** Due to strict international health, safety, and cosmetic hygiene regulations, skincare, baby care, and cosmetic items must remain **unopened, unused, and in their original packaging with unbroken tamper-evident seal intact**.
- **Hygiene Exemption:** Opened, swabbed, or partially used cosmetics cannot be accepted for return or resale under international hygiene protocols.
- **Reporting Window:** Return requests must be initiated within **14 calendar days** from the verified carrier delivery timestamp.

---

### 2. Damaged, Defective, or Incorrect Shipments
If your parcel arrives damaged in transit, defective, or contains an incorrect formulation:
- Contact our Concierge desk at [concierge@duckcosmetics.com](mailto:concierge@duckcosmetics.com) within **48 hours of delivery**.
- Please provide your Order Number and clear photographs of the transit damage or packaging defect.
- We will immediately dispatch a complimentary express replacement or issue a 100% refund without requiring you to pay return courier fees.

---

### 3. Step-by-Step Return Process
1. **Initiate Request:** Email [concierge@duckcosmetics.com](mailto:concierge@duckcosmetics.com) with your order ID and reason for return.
2. **Return Authorization:** Our concierge will provide an official Return Merchandise Authorization (RMA) number and a pre-paid return shipping label.
3. **Secure Repackaging:** Place the unopened item securely in its original protective packaging.
4. **Inspection & Approval:** Upon arrival at our Ahmedabad Atelier fulfillment center, our quality control team will inspect the tamper seal within 48 business hours.

---

### 4. Refund Processing & Timelines
- Approved refunds are credited directly back to the original method of tender (Credit/Debit Card, Netbanking, or UPI).
- **Processing Time:** Banking institutions typically reflect refunded funds within **5 to 7 business days**.
- In the case of Cash on Delivery (COD) orders, our concierge will issue a secure direct bank transfer (NEFT/IMPS) or an instant Duck VIP Store Credit voucher per your preference.`,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "page-shipping",
    slug: "shipping",
    title: "Shipping & Delivery Policy",
    content: `## Duck Cosmetics Global Shipping & Fulfillment Policy

**Complimentary Pan-India Shipping on Orders Over ₹800** · **Express Worldwide Dispatch**

Duck Cosmetics partners with premier luxury couriers—including **Delhivery Express, BlueDart, DHL Express, and FedEx**—to ensure every formulation reaches your hands in pristine condition.

---

### 1. Domestic Shipping (India)
- **Complimentary Delivery:** Complimentary standard insured shipping applies automatically to all domestic orders over **₹800 INR**.
- **Standard Flat Rate:** Orders below ₹800 incur a flat shipping and handling fee of **₹99 INR**.
- **Express Courier Option:** Premium priority overnight air courier is available for **₹199 INR**.
- **Transit Timelines:**
  - Metro Hubs (Mumbai, Delhi NCR, Bengaluru, Ahmedabad, Chennai, Hyderabad): **2 to 3 Business Days**.
  - Rest of India: **3 to 5 Business Days**.

---

### 2. International Courier Shipping
- **Complimentary Worldwide Shipping:** Complimentary express international courier on all global orders over **$150 USD** (approx. ₹12,500 INR).
- **Standard International Flat Rate:** Global deliveries below $150 are shipped via DHL Express or FedEx International Priority at a flat subsidized rate of **$20 USD** (₹1,600 INR).
- **Transit Timelines:**
  - North America & Western Europe: **4 to 7 Business Days**.
  - Middle East & Southeast Asia: **3 to 5 Business Days**.
  - Australia & Rest of World: **6 to 10 Business Days**.

---

### 3. Real-Time Tracking & Dispatch Telemetry
Every parcel dispatched from our fulfillment center is assigned a real-time carrier tracking number. You will receive an automated dispatch notification with a live tracking link via email and SMS the moment your parcel departs our atelier.

---

### 4. Customs, Duties & Import Taxes (International)
For international shipments, customs duties and import taxes may be assessed by local customs authorities upon arrival in your country. Unless otherwise indicated during special promotional drops, import tariffs and customs handling fees are the responsibility of the recipient.`,
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_PRODUCTS: ProductData[] = [
  {
    "id": "hydrating-essence-toner",
    "title": "Hydrating Essence Toner",
    "description": "With hyaluronic acid and natural extracts.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184732/duck-cosmetics-products/hydrating-essence-toner.webp",
    "backImageUrl": "/images/products/hydrating-essence-toner.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184732/duck-cosmetics-products/hydrating-essence-toner.webp",
    "lifestyleImageUrl": "/images/products/hydrating-essence-toner.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184732/duck-cosmetics-products/hydrating-essence-toner.webp",
      "/images/products/hydrating-essence-toner.webp"
    ],
    "categoryId": "cat-1",
    "categoryName": "Skincare",
    "status": "COMING_SOON",
    "isFeatured": true,
    "isBestSeller": false,
    "ingredients": "Rosa Damascena Flower Water, Aloe Barbadensis Leaf Juice, Centella Asiatica Extract, Sodium Hyaluronate, Panthenol (Pro-Vitamin B5), Allantoin, Citric Acid, Potassium Sorbate.",
    "directions": "After cleansing, saturate a soft organic cotton pad or mist directly over face and neck. Press softly until completely absorbed.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 98,
    "sku": "DUCK-001",
    "variety": "Essence-toner, hydrating",
    "size": "",
    "imageAlt": "Duck Cosmetics Hydrating Essence Toner",
    "createdAt": "2026-10-12T14:43:38.436Z",
    "updatedAt": "2026-11-20T14:43:38.437Z"
  },
  {
    "id": "vitamin-c-glow-serum",
    "title": "Vitamin C Glow Serum",
    "description": "With hyaluronic acid and natural extracts.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184746/duck-cosmetics-products/vitamin-c-glow-serum.webp",
    "backImageUrl": "/images/products/vitamin-c-glow-serum.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184746/duck-cosmetics-products/vitamin-c-glow-serum.webp",
    "lifestyleImageUrl": "/images/products/vitamin-c-glow-serum.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184746/duck-cosmetics-products/vitamin-c-glow-serum.webp",
      "/images/products/vitamin-c-glow-serum.webp"
    ],
    "categoryId": "cat-2",
    "categoryName": "Serums & Oils",
    "status": "COMING_SOON",
    "isFeatured": true,
    "isBestSeller": true,
    "ingredients": "Aqua, Sodium Hyaluronate, 3-O-Ethyl Ascorbic Acid (Vitamin C), Niacinamide (Vitamin B3), Glycerin, Ferulic Acid, Camellia Sinensis (Green Tea) Leaf Extract, Phenoxyethanol, Ethylhexylglycerin.",
    "directions": "Dispense 3-4 drops onto cleansed palms. Gently pat into face, neck, and decollete every morning and evening before applying moisturizer.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 111,
    "sku": "DUCK-002",
    "variety": "Vitamin C",
    "size": "30 ml / 1.0 fl oz",
    "imageAlt": "Duck Cosmetics Vitamin C Glow Serum",
    "createdAt": "2026-10-13T14:43:38.437Z",
    "updatedAt": "2026-11-20T14:43:38.437Z"
  },
  {
    "id": "hydrating-gel-moisturizer",
    "title": "Hydrating Gel Moisturizer",
    "description": "Hydrating gel moisturizer in a signature purple jar.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184732/duck-cosmetics-products/hydrating-gel-moisturizer.webp",
    "backImageUrl": "/images/products/hydrating-gel-moisturizer.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184732/duck-cosmetics-products/hydrating-gel-moisturizer.webp",
    "lifestyleImageUrl": "/images/products/hydrating-gel-moisturizer.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184732/duck-cosmetics-products/hydrating-gel-moisturizer.webp",
      "/images/products/hydrating-gel-moisturizer.webp"
    ],
    "categoryId": "cat-4",
    "categoryName": "Moisturizers",
    "status": "COMING_SOON",
    "isFeatured": true,
    "isBestSeller": true,
    "ingredients": "Aqua, Caprylic/Capric Triglyceride, Butyrospermum Parkii (Shea) Butter, Squalane, Ceramide NP, Sodium Hyaluronate, Tocopherol (Vitamin E), Avena Sativa (Oat) Kernel Extract, Carbomer.",
    "directions": "Smooth a nickel-sized amount upward across clean facial contours, neck, and jawline morning and evening.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 124,
    "sku": "DUCK-003",
    "variety": "Gel",
    "size": "",
    "imageAlt": "Duck Cosmetics Hydrating Gel Moisturizer",
    "createdAt": "2026-10-14T14:43:38.437Z",
    "updatedAt": "2026-11-20T14:43:38.437Z"
  },
  {
    "id": "spf-50-hybrid-sunscreen",
    "title": "SPF 50+ Hybrid Sunscreen",
    "description": "Lightweight and hydrating. Broad spectrum UVA/UVB, water resistant.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184741/duck-cosmetics-products/spf-50-hybrid-sunscreen.webp",
    "backImageUrl": "/images/products/spf-50-hybrid-sunscreen.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184741/duck-cosmetics-products/spf-50-hybrid-sunscreen.webp",
    "lifestyleImageUrl": "/images/products/spf-50-hybrid-sunscreen.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184741/duck-cosmetics-products/spf-50-hybrid-sunscreen.webp",
      "/images/products/spf-50-hybrid-sunscreen.webp"
    ],
    "categoryId": "cat-1",
    "categoryName": "Skincare",
    "status": "COMING_SOON",
    "isFeatured": true,
    "isBestSeller": true,
    "ingredients": "Zinc Oxide, Titanium Dioxide, Aqua, C12-15 Alkyl Benzoate, Dimethicone, Niacinamide, Tocopheryl Acetate, Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine, Silica, Camellia Sinensis Extract.",
    "directions": "Apply generously 15 minutes before sun exposure as the final step in your morning skincare ritual. Reapply every 2 hours or after swimming.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 137,
    "sku": "DUCK-004",
    "variety": "Hybrid",
    "size": "50 ml / 1.69 fl oz",
    "imageAlt": "Duck Cosmetics SPF 50+ Hybrid Sunscreen",
    "createdAt": "2026-10-15T14:43:38.437Z",
    "updatedAt": "2026-11-20T14:43:38.437Z"
  },
  {
    "id": "botanical-glow-face-oil",
    "title": "Botanical Glow Face Oil",
    "description": "Botanical facial oil for a healthy glow.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184727/duck-cosmetics-products/botanical-glow-face-oil.webp",
    "backImageUrl": "/images/products/botanical-glow-face-oil.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184727/duck-cosmetics-products/botanical-glow-face-oil.webp",
    "lifestyleImageUrl": "/images/products/botanical-glow-face-oil.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184727/duck-cosmetics-products/botanical-glow-face-oil.webp",
      "/images/products/botanical-glow-face-oil.webp"
    ],
    "categoryId": "cat-2",
    "categoryName": "Serums & Oils",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Argania Spinosa (Argan) Kernel Oil, Simmondsia Chinensis (Jojoba) Seed Oil, Rosa Canina (Rosehip) Seed Oil, Sclerocarya Birrea (Marula) Seed Oil, Tocopherol, Rosmarinus Officinalis Extract.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 150,
    "sku": "DUCK-005",
    "variety": "Blended facial oil",
    "size": "",
    "imageAlt": "Duck Cosmetics Botanical Glow Face Oil",
    "createdAt": "2026-10-16T14:43:38.437Z",
    "updatedAt": "2026-11-20T14:43:38.437Z"
  },
  {
    "id": "aha-bha-exfoliator",
    "title": "AHA / BHA Exfoliator",
    "description": "Gentle resurfacing facial exfoliator.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184725/duck-cosmetics-products/aha-bha-exfoliator.webp",
    "backImageUrl": "/images/products/aha-bha-exfoliator.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184725/duck-cosmetics-products/aha-bha-exfoliator.webp",
    "lifestyleImageUrl": "/images/products/aha-bha-exfoliator.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184725/duck-cosmetics-products/aha-bha-exfoliator.webp",
      "/images/products/aha-bha-exfoliator.webp"
    ],
    "categoryId": "cat-3",
    "categoryName": "Cleansers",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Kaolin Clay, Bentonite, Aqua, Glycolic Acid (AHA), Salicylic Acid (BHA), Lactic Acid, Aloe Barbadensis Leaf Extract, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Charcoal Powder.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 163,
    "sku": "DUCK-006",
    "variety": "AHA, BHA",
    "size": "100 ml",
    "imageAlt": "Duck Cosmetics AHA / BHA Exfoliator",
    "createdAt": "2026-10-17T14:43:38.437Z",
    "updatedAt": "2026-11-20T14:43:38.437Z"
  },
  {
    "id": "purifying-clay-face-mask",
    "title": "Purifying Clay Face Mask",
    "description": "Purifying clay face mask.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184737/duck-cosmetics-products/purifying-clay-face-mask.webp",
    "backImageUrl": "/images/products/purifying-clay-face-mask.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184737/duck-cosmetics-products/purifying-clay-face-mask.webp",
    "lifestyleImageUrl": "/images/products/purifying-clay-face-mask.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184737/duck-cosmetics-products/purifying-clay-face-mask.webp",
      "/images/products/purifying-clay-face-mask.webp"
    ],
    "categoryId": "cat-1",
    "categoryName": "Skincare",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Kaolin Clay, Bentonite, Aqua, Glycolic Acid (AHA), Salicylic Acid (BHA), Lactic Acid, Aloe Barbadensis Leaf Extract, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Charcoal Powder.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 176,
    "sku": "DUCK-007",
    "variety": "Clay, wash-off",
    "size": "",
    "imageAlt": "Duck Cosmetics Purifying Clay Face Mask",
    "createdAt": "2026-10-18T14:43:38.437Z",
    "updatedAt": "2026-11-20T14:43:38.437Z"
  },
  {
    "id": "foaming-gel-cleanser",
    "title": "Foaming Gel Cleanser",
    "description": "Gentle and refreshing foaming gel cleanser.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184729/duck-cosmetics-products/foaming-gel-cleanser.webp",
    "backImageUrl": "/images/products/foaming-gel-cleanser.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184729/duck-cosmetics-products/foaming-gel-cleanser.webp",
    "lifestyleImageUrl": "/images/products/foaming-gel-cleanser.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184729/duck-cosmetics-products/foaming-gel-cleanser.webp",
      "/images/products/foaming-gel-cleanser.webp"
    ],
    "categoryId": "cat-3",
    "categoryName": "Cleansers",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Aqua, Sodium Cocoyl Isethionate, Cocamidopropyl Betaine, Glycerin, Decyl Glucoside, Panthenol, Camellia Sinensis Leaf Extract, Hydrolyzed Wheat Protein, Citric Acid, Sodium Benzoate.",
    "directions": "Lather a small pump with warm water between hands. Massage gently across damp skin in circular motions. Rinse thoroughly with cool water.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 189,
    "sku": "DUCK-008",
    "variety": "Gel, foam",
    "size": "",
    "imageAlt": "Duck Cosmetics Foaming Gel Cleanser",
    "createdAt": "2026-10-19T14:43:38.437Z",
    "updatedAt": "2026-11-20T14:43:38.437Z"
  },
  {
    "id": "iridescent-glow-highlighter",
    "title": "Iridescent Glow Highlighter",
    "description": "Faceted-compact highlighter with an iridescent glow.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184733/duck-cosmetics-products/iridescent-glow-highlighter.webp",
    "backImageUrl": "/images/products/iridescent-glow-highlighter.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184733/duck-cosmetics-products/iridescent-glow-highlighter.webp",
    "lifestyleImageUrl": "/images/products/iridescent-glow-highlighter.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184733/duck-cosmetics-products/iridescent-glow-highlighter.webp",
      "/images/products/iridescent-glow-highlighter.webp"
    ],
    "categoryId": "cat-9",
    "categoryName": "Sun & Glow",
    "status": "COMING_SOON",
    "isFeatured": true,
    "isBestSeller": true,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 202,
    "sku": "DUCK-009",
    "variety": "Powder, shimmer",
    "size": "",
    "imageAlt": "Duck Cosmetics Iridescent Glow Highlighter",
    "createdAt": "2026-10-20T14:43:38.437Z",
    "updatedAt": "2026-11-20T14:43:38.437Z"
  },
  {
    "id": "sculpting-contour-stick",
    "title": "Sculpting Contour Stick",
    "description": "Stick contour for sculpting the face.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184740/duck-cosmetics-products/sculpting-contour-stick.webp",
    "backImageUrl": "/images/products/sculpting-contour-stick.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184740/duck-cosmetics-products/sculpting-contour-stick.webp",
    "lifestyleImageUrl": "/images/products/sculpting-contour-stick.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184740/duck-cosmetics-products/sculpting-contour-stick.webp",
      "/images/products/sculpting-contour-stick.webp"
    ],
    "categoryId": "cat-9",
    "categoryName": "Sun & Glow",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 215,
    "sku": "DUCK-010",
    "variety": "Stick",
    "size": "",
    "imageAlt": "Duck Cosmetics Sculpting Contour Stick",
    "createdAt": "2026-10-21T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "velvet-matte-lipstick",
    "title": "Velvet Matte Lipstick",
    "description": "Velvet matte lipstick.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184745/duck-cosmetics-products/velvet-matte-lipstick.webp",
    "backImageUrl": "/images/products/velvet-matte-lipstick.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184745/duck-cosmetics-products/velvet-matte-lipstick.webp",
    "lifestyleImageUrl": "/images/products/velvet-matte-lipstick.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184745/duck-cosmetics-products/velvet-matte-lipstick.webp",
      "/images/products/velvet-matte-lipstick.webp"
    ],
    "categoryId": "cat-10",
    "categoryName": "Lip & Cheek",
    "status": "COMING_SOON",
    "isFeatured": true,
    "isBestSeller": true,
    "ingredients": "Ricinus Communis (Castor) Seed Oil, Butyrospermum Parkii (Shea) Butter, Euphorbia Cerifera (Candelilla) Cera, Simmondsia Chinensis Seed Oil, Hyaluronic Acid, Tocopherol, Natural Mica CI 77491.",
    "directions": "Glide effortlessly across lips starting from the center outward. Layer for richer couture intensity or pair with Duck lip liner.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 228,
    "sku": "DUCK-011",
    "variety": "Matte",
    "size": "",
    "imageAlt": "Duck Cosmetics Velvet Matte Lipstick",
    "createdAt": "2026-10-22T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "high-shine-plumping-lip-gloss",
    "title": "High-Shine Plumping Lip Gloss",
    "description": "High-shine plumping lip gloss.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184731/duck-cosmetics-products/high-shine-plumping-lip-gloss.webp",
    "backImageUrl": "/images/products/high-shine-plumping-lip-gloss.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184731/duck-cosmetics-products/high-shine-plumping-lip-gloss.webp",
    "lifestyleImageUrl": "/images/products/high-shine-plumping-lip-gloss.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184731/duck-cosmetics-products/high-shine-plumping-lip-gloss.webp",
      "/images/products/high-shine-plumping-lip-gloss.webp"
    ],
    "categoryId": "cat-10",
    "categoryName": "Lip & Cheek",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": true,
    "ingredients": "Ricinus Communis (Castor) Seed Oil, Butyrospermum Parkii (Shea) Butter, Euphorbia Cerifera (Candelilla) Cera, Simmondsia Chinensis Seed Oil, Hyaluronic Acid, Tocopherol, Natural Mica CI 77491.",
    "directions": "Glide effortlessly across lips starting from the center outward. Layer for richer couture intensity or pair with Duck lip liner.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 91,
    "sku": "DUCK-012",
    "variety": "Plumping, high-shine, tinted",
    "size": "",
    "imageAlt": "Duck Cosmetics High-Shine Plumping Lip Gloss",
    "createdAt": "2026-10-23T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "precision-long-wear-lip-liner",
    "title": "Precision Long-Wear Lip Liner",
    "description": "Precision long-wear lip liner.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184736/duck-cosmetics-products/precision-long-wear-lip-liner.webp",
    "backImageUrl": "/images/products/precision-long-wear-lip-liner.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184736/duck-cosmetics-products/precision-long-wear-lip-liner.webp",
    "lifestyleImageUrl": "/images/products/precision-long-wear-lip-liner.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184736/duck-cosmetics-products/precision-long-wear-lip-liner.webp",
      "/images/products/precision-long-wear-lip-liner.webp"
    ],
    "categoryId": "cat-10",
    "categoryName": "Lip & Cheek",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Ricinus Communis (Castor) Seed Oil, Butyrospermum Parkii (Shea) Butter, Euphorbia Cerifera (Candelilla) Cera, Simmondsia Chinensis Seed Oil, Hyaluronic Acid, Tocopherol, Natural Mica CI 77491.",
    "directions": "Glide effortlessly across lips starting from the center outward. Layer for richer couture intensity or pair with Duck lip liner.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 104,
    "sku": "DUCK-013",
    "variety": "Pencil, long-wear",
    "size": "0.28 g",
    "imageAlt": "Duck Cosmetics Precision Long-Wear Lip Liner",
    "createdAt": "2026-10-24T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "waterproof-precision-eyeliner",
    "title": "Waterproof Precision Eyeliner",
    "description": "Waterproof precision eyeliner.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184747/duck-cosmetics-products/waterproof-precision-eyeliner.webp",
    "backImageUrl": "/images/products/waterproof-precision-eyeliner.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184747/duck-cosmetics-products/waterproof-precision-eyeliner.webp",
    "lifestyleImageUrl": "/images/products/waterproof-precision-eyeliner.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184747/duck-cosmetics-products/waterproof-precision-eyeliner.webp",
      "/images/products/waterproof-precision-eyeliner.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 117,
    "sku": "DUCK-014",
    "variety": "Waterproof",
    "size": "",
    "imageAlt": "Duck Cosmetics Waterproof Precision Eyeliner",
    "createdAt": "2026-10-25T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "volumizing-lash-mascara",
    "title": "Volumizing Lash Mascara",
    "description": "Volumizing lash mascara.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184747/duck-cosmetics-products/volumizing-lash-mascara.webp",
    "backImageUrl": "/images/products/volumizing-lash-mascara.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184747/duck-cosmetics-products/volumizing-lash-mascara.webp",
    "lifestyleImageUrl": "/images/products/volumizing-lash-mascara.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184747/duck-cosmetics-products/volumizing-lash-mascara.webp",
      "/images/products/volumizing-lash-mascara.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 130,
    "sku": "DUCK-015",
    "variety": "Volumizing",
    "size": "",
    "imageAlt": "Duck Cosmetics Volumizing Lash Mascara",
    "createdAt": "2026-10-26T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "luxe-pigment-eyeshadow-palette",
    "title": "Luxe Pigment Eyeshadow Palette",
    "description": "Luxe pigment eyeshadow palette.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184733/duck-cosmetics-products/luxe-pigment-eyeshadow-palette.webp",
    "backImageUrl": "/images/products/luxe-pigment-eyeshadow-palette.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184733/duck-cosmetics-products/luxe-pigment-eyeshadow-palette.webp",
    "lifestyleImageUrl": "/images/products/luxe-pigment-eyeshadow-palette.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184733/duck-cosmetics-products/luxe-pigment-eyeshadow-palette.webp",
      "/images/products/luxe-pigment-eyeshadow-palette.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": true,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 143,
    "sku": "DUCK-016",
    "variety": "Palette, pigment",
    "size": "",
    "imageAlt": "Duck Cosmetics Luxe Pigment Eyeshadow Palette",
    "createdAt": "2026-10-27T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "sculpt-hold-brow-gel",
    "title": "Sculpt & Hold Brow Gel",
    "description": "Sculpt and hold brow gel.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184739/duck-cosmetics-products/sculpt-hold-brow-gel.webp",
    "backImageUrl": "/images/products/sculpt-hold-brow-gel.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184739/duck-cosmetics-products/sculpt-hold-brow-gel.webp",
    "lifestyleImageUrl": "/images/products/sculpt-hold-brow-gel.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184739/duck-cosmetics-products/sculpt-hold-brow-gel.webp",
      "/images/products/sculpt-hold-brow-gel.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 156,
    "sku": "DUCK-017",
    "variety": "Gel",
    "size": "",
    "imageAlt": "Duck Cosmetics Sculpt & Hold Brow Gel",
    "createdAt": "2026-10-28T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "sun-kissed-matte-bronzer",
    "title": "Sun-Kissed Matte Bronzer",
    "description": "Sun-kissed matte bronzer compact.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184743/duck-cosmetics-products/sun-kissed-matte-bronzer.webp",
    "backImageUrl": "/images/products/sun-kissed-matte-bronzer.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184743/duck-cosmetics-products/sun-kissed-matte-bronzer.webp",
    "lifestyleImageUrl": "/images/products/sun-kissed-matte-bronzer.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184743/duck-cosmetics-products/sun-kissed-matte-bronzer.webp",
      "/images/products/sun-kissed-matte-bronzer.webp"
    ],
    "categoryId": "cat-9",
    "categoryName": "Sun & Glow",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 169,
    "sku": "DUCK-018",
    "variety": "Powder, matte",
    "size": "",
    "imageAlt": "Duck Cosmetics Sun-Kissed Matte Bronzer",
    "createdAt": "2026-10-29T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "pro-colour-corrector",
    "title": "Pro Colour Corrector",
    "description": "Pro colour corrector.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184736/duck-cosmetics-products/pro-colour-corrector.webp",
    "backImageUrl": "/images/products/pro-colour-corrector.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184736/duck-cosmetics-products/pro-colour-corrector.webp",
    "lifestyleImageUrl": "/images/products/pro-colour-corrector.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184736/duck-cosmetics-products/pro-colour-corrector.webp",
      "/images/products/pro-colour-corrector.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 182,
    "sku": "DUCK-019",
    "variety": "Liquid",
    "size": "",
    "imageAlt": "Duck Cosmetics Pro Colour Corrector",
    "createdAt": "2026-10-30T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "stardust-face-body-shimmer",
    "title": "Stardust Face & Body Shimmer",
    "description": "Shimmer for face and body in a faceted jar.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184742/duck-cosmetics-products/stardust-face-body-shimmer.webp",
    "backImageUrl": "/images/products/stardust-face-body-shimmer.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184742/duck-cosmetics-products/stardust-face-body-shimmer.webp",
    "lifestyleImageUrl": "/images/products/stardust-face-body-shimmer.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184742/duck-cosmetics-products/stardust-face-body-shimmer.webp",
      "/images/products/stardust-face-body-shimmer.webp"
    ],
    "categoryId": "cat-9",
    "categoryName": "Sun & Glow",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 195,
    "sku": "DUCK-020",
    "variety": "Gel shimmer",
    "size": "",
    "imageAlt": "Duck Cosmetics Stardust Face & Body Shimmer",
    "createdAt": "2026-10-31T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "sulfate-free-hydrating-shampoo",
    "title": "Sulfate-Free Hydrating Shampoo",
    "description": "With natural botanicals and argan oil.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330590",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184742/duck-cosmetics-products/sulfate-free-hydrating-shampoo.webp",
    "backImageUrl": "/images/products/sulfate-free-hydrating-shampoo.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184742/duck-cosmetics-products/sulfate-free-hydrating-shampoo.webp",
    "lifestyleImageUrl": "/images/products/sulfate-free-hydrating-shampoo.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184742/duck-cosmetics-products/sulfate-free-hydrating-shampoo.webp",
      "/images/products/sulfate-free-hydrating-shampoo.webp"
    ],
    "categoryId": "cat-8",
    "categoryName": "Haircare",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Aqua, Sodium Cocoyl Isethionate, Cocamidopropyl Betaine, Glycerin, Decyl Glucoside, Panthenol, Camellia Sinensis Leaf Extract, Hydrolyzed Wheat Protein, Citric Acid, Sodium Benzoate.",
    "directions": "Massage thoroughly through wet hair and scalp. Allow rich botanical actives to penetrate for 3-5 minutes, then rinse cleanly with cool water.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 208,
    "sku": "DUCK-021",
    "variety": "Hydrating, sulfate-free",
    "size": "400 ml / 13.5 fl oz",
    "imageAlt": "Duck Cosmetics Sulfate-Free Hydrating Shampoo",
    "createdAt": "2026-11-01T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "silk-repair-conditioner",
    "title": "Silk Repair Conditioner",
    "description": "Nourishing and hydrating with natural extracts.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330590",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184740/duck-cosmetics-products/silk-repair-conditioner.webp",
    "backImageUrl": "/images/products/silk-repair-conditioner.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184740/duck-cosmetics-products/silk-repair-conditioner.webp",
    "lifestyleImageUrl": "/images/products/silk-repair-conditioner.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184740/duck-cosmetics-products/silk-repair-conditioner.webp",
      "/images/products/silk-repair-conditioner.webp"
    ],
    "categoryId": "cat-8",
    "categoryName": "Haircare",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Massage thoroughly through wet hair and scalp. Allow rich botanical actives to penetrate for 3-5 minutes, then rinse cleanly with cool water.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 221,
    "sku": "DUCK-022",
    "variety": "Rinse-out",
    "size": "400 ml / 13.5 fl oz",
    "imageAlt": "Duck Cosmetics Silk Repair Conditioner",
    "createdAt": "2026-11-02T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "nourishing-argan-hair-oil",
    "title": "Nourishing Argan Hair Oil",
    "description": "Nourishing argan hair oil.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330590",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184734/duck-cosmetics-products/nourishing-argan-hair-oil.webp",
    "backImageUrl": "/images/products/nourishing-argan-hair-oil.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184734/duck-cosmetics-products/nourishing-argan-hair-oil.webp",
    "lifestyleImageUrl": "/images/products/nourishing-argan-hair-oil.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184734/duck-cosmetics-products/nourishing-argan-hair-oil.webp",
      "/images/products/nourishing-argan-hair-oil.webp"
    ],
    "categoryId": "cat-8a",
    "categoryName": "Scalp & Hair Oils",
    "status": "COMING_SOON",
    "isFeatured": true,
    "isBestSeller": true,
    "ingredients": "Argania Spinosa (Argan) Kernel Oil, Simmondsia Chinensis (Jojoba) Seed Oil, Rosa Canina (Rosehip) Seed Oil, Sclerocarya Birrea (Marula) Seed Oil, Tocopherol, Rosmarinus Officinalis Extract.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 234,
    "sku": "DUCK-023",
    "variety": "Argan, nourishing",
    "size": "100 ml / 3.4 fl oz",
    "imageAlt": "Duck Cosmetics Nourishing Argan Hair Oil",
    "createdAt": "2026-11-03T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "frizz-control-shine-hair-serum",
    "title": "Frizz-Control Shine Hair Serum",
    "description": "Frizz-control shine hair serum.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330590",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184730/duck-cosmetics-products/frizz-control-shine-hair-serum.webp",
    "backImageUrl": "/images/products/frizz-control-shine-hair-serum.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184730/duck-cosmetics-products/frizz-control-shine-hair-serum.webp",
    "lifestyleImageUrl": "/images/products/frizz-control-shine-hair-serum.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184730/duck-cosmetics-products/frizz-control-shine-hair-serum.webp",
      "/images/products/frizz-control-shine-hair-serum.webp"
    ],
    "categoryId": "cat-8a",
    "categoryName": "Scalp & Hair Oils",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Aqua, Sodium Hyaluronate, 3-O-Ethyl Ascorbic Acid (Vitamin C), Niacinamide (Vitamin B3), Glycerin, Ferulic Acid, Camellia Sinensis (Green Tea) Leaf Extract, Phenoxyethanol, Ethylhexylglycerin.",
    "directions": "Dispense 3-4 drops onto cleansed palms. Gently pat into face, neck, and decollete every morning and evening before applying moisturizer.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 97,
    "sku": "DUCK-024",
    "variety": "Frizz-control, shine",
    "size": "",
    "imageAlt": "Duck Cosmetics Frizz-Control Shine Hair Serum",
    "createdAt": "2026-11-04T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "flexible-hold-hair-styling-cream",
    "title": "Flexible Hold Hair Styling Cream",
    "description": "Natural shine, flexible hold styling cream.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330590",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184729/duck-cosmetics-products/flexible-hold-hair-styling-cream.webp",
    "backImageUrl": "/images/products/flexible-hold-hair-styling-cream.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184729/duck-cosmetics-products/flexible-hold-hair-styling-cream.webp",
    "lifestyleImageUrl": "/images/products/flexible-hold-hair-styling-cream.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184729/duck-cosmetics-products/flexible-hold-hair-styling-cream.webp",
      "/images/products/flexible-hold-hair-styling-cream.webp"
    ],
    "categoryId": "cat-8",
    "categoryName": "Haircare",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 110,
    "sku": "DUCK-025",
    "variety": "Cream",
    "size": "",
    "imageAlt": "Duck Cosmetics Flexible Hold Hair Styling Cream",
    "createdAt": "2026-11-05T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "bond-building-repair-hair-mask",
    "title": "Bond-Building Repair Hair Mask",
    "description": "Intense nourishment hair mask.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330590",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184726/duck-cosmetics-products/bond-building-repair-hair-mask.webp",
    "backImageUrl": "/images/products/bond-building-repair-hair-mask.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184726/duck-cosmetics-products/bond-building-repair-hair-mask.webp",
    "lifestyleImageUrl": "/images/products/bond-building-repair-hair-mask.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184726/duck-cosmetics-products/bond-building-repair-hair-mask.webp",
      "/images/products/bond-building-repair-hair-mask.webp"
    ],
    "categoryId": "cat-8",
    "categoryName": "Haircare",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Kaolin Clay, Bentonite, Aqua, Glycolic Acid (AHA), Salicylic Acid (BHA), Lactic Acid, Aloe Barbadensis Leaf Extract, Melaleuca Alternifolia (Tea Tree) Leaf Oil, Charcoal Powder.",
    "directions": "Massage thoroughly through wet hair and scalp. Allow rich botanical actives to penetrate for 3-5 minutes, then rinse cleanly with cool water.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 123,
    "sku": "DUCK-026",
    "variety": "Bond-building, repairing",
    "size": "200 ml",
    "imageAlt": "Duck Cosmetics Bond-Building Repair Hair Mask",
    "createdAt": "2026-11-06T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "detoxifying-scalp-care-serum",
    "title": "Detoxifying Scalp Care Serum",
    "description": "Detoxifying scalp care serum.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330590",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184728/duck-cosmetics-products/detoxifying-scalp-care-serum.webp",
    "backImageUrl": "/images/products/detoxifying-scalp-care-serum.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184728/duck-cosmetics-products/detoxifying-scalp-care-serum.webp",
    "lifestyleImageUrl": "/images/products/detoxifying-scalp-care-serum.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184728/duck-cosmetics-products/detoxifying-scalp-care-serum.webp",
      "/images/products/detoxifying-scalp-care-serum.webp"
    ],
    "categoryId": "cat-8a",
    "categoryName": "Scalp & Hair Oils",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 136,
    "sku": "DUCK-027",
    "variety": "Serum",
    "size": "",
    "imageAlt": "Duck Cosmetics Detoxifying Scalp Care Serum",
    "createdAt": "2026-11-07T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "all-day-fixing-setting-spray",
    "title": "All-Day Fixing Setting Spray",
    "description": "Make-up lasts all day, with aloe vera and vitamin C.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184725/duck-cosmetics-products/all-day-fixing-setting-spray.webp",
    "backImageUrl": "/images/products/all-day-fixing-setting-spray.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184725/duck-cosmetics-products/all-day-fixing-setting-spray.webp",
    "lifestyleImageUrl": "/images/products/all-day-fixing-setting-spray.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184725/duck-cosmetics-products/all-day-fixing-setting-spray.webp",
      "/images/products/all-day-fixing-setting-spray.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 149,
    "sku": "DUCK-028",
    "variety": "Long-wear",
    "size": "100 ml",
    "imageAlt": "Duck Cosmetics All-Day Fixing Setting Spray",
    "createdAt": "2026-11-08T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "nourishing-lip-care",
    "title": "Nourishing Lip Care",
    "description": "Nourishing lip care in a jar.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184735/duck-cosmetics-products/nourishing-lip-care.webp",
    "backImageUrl": "/images/products/nourishing-lip-care.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184735/duck-cosmetics-products/nourishing-lip-care.webp",
    "lifestyleImageUrl": "/images/products/nourishing-lip-care.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184735/duck-cosmetics-products/nourishing-lip-care.webp",
      "/images/products/nourishing-lip-care.webp"
    ],
    "categoryId": "cat-1",
    "categoryName": "Skincare",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Ricinus Communis (Castor) Seed Oil, Butyrospermum Parkii (Shea) Butter, Euphorbia Cerifera (Candelilla) Cera, Simmondsia Chinensis Seed Oil, Hyaluronic Acid, Tocopherol, Natural Mica CI 77491.",
    "directions": "Glide effortlessly across lips starting from the center outward. Layer for richer couture intensity or pair with Duck lip liner.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 162,
    "sku": "DUCK-029",
    "variety": "Treatment, balm",
    "size": "",
    "imageAlt": "Duck Cosmetics Nourishing Lip Care",
    "createdAt": "2026-11-09T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "clarifying-acne-treatment",
    "title": "Clarifying Acne Treatment",
    "description": "Clarifying spot treatment.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184727/duck-cosmetics-products/clarifying-acne-treatment.webp",
    "backImageUrl": "/images/products/clarifying-acne-treatment.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184727/duck-cosmetics-products/clarifying-acne-treatment.webp",
    "lifestyleImageUrl": "/images/products/clarifying-acne-treatment.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184727/duck-cosmetics-products/clarifying-acne-treatment.webp",
      "/images/products/clarifying-acne-treatment.webp"
    ],
    "categoryId": "cat-1",
    "categoryName": "Skincare",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 175,
    "sku": "DUCK-030",
    "variety": "Spot treatment",
    "size": "15 ml",
    "imageAlt": "Duck Cosmetics Clarifying Acne Treatment",
    "createdAt": "2026-11-10T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "repairing-essence-ampoule",
    "title": "Repairing Essence Ampoule",
    "description": "Repairing essence ampoule in a faceted bottle.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184738/duck-cosmetics-products/repairing-essence-ampoule.webp",
    "backImageUrl": "/images/products/repairing-essence-ampoule.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184738/duck-cosmetics-products/repairing-essence-ampoule.webp",
    "lifestyleImageUrl": "/images/products/repairing-essence-ampoule.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184738/duck-cosmetics-products/repairing-essence-ampoule.webp",
      "/images/products/repairing-essence-ampoule.webp"
    ],
    "categoryId": "cat-2",
    "categoryName": "Serums & Oils",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Aqua, Sodium Hyaluronate, 3-O-Ethyl Ascorbic Acid (Vitamin C), Niacinamide (Vitamin B3), Glycerin, Ferulic Acid, Camellia Sinensis (Green Tea) Leaf Extract, Phenoxyethanol, Ethylhexylglycerin.",
    "directions": "Dispense 3-4 drops onto cleansed palms. Gently pat into face, neck, and decollete every morning and evening before applying moisturizer.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 188,
    "sku": "DUCK-031",
    "variety": "Repairing",
    "size": "",
    "imageAlt": "Duck Cosmetics Repairing Essence Ampoule",
    "createdAt": "2026-11-11T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "refreshing-glow-face-mist",
    "title": "Refreshing Glow Face Mist",
    "description": "Face mist with aloe vera and vitamin C.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184737/duck-cosmetics-products/refreshing-glow-face-mist.webp",
    "backImageUrl": "/images/products/refreshing-glow-face-mist.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184737/duck-cosmetics-products/refreshing-glow-face-mist.webp",
    "lifestyleImageUrl": "/images/products/refreshing-glow-face-mist.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184737/duck-cosmetics-products/refreshing-glow-face-mist.webp",
      "/images/products/refreshing-glow-face-mist.webp"
    ],
    "categoryId": "cat-1",
    "categoryName": "Skincare",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Rosa Damascena Flower Water, Aloe Barbadensis Leaf Juice, Centella Asiatica Extract, Sodium Hyaluronate, Panthenol (Pro-Vitamin B5), Allantoin, Citric Acid, Potassium Sorbate.",
    "directions": "After cleansing, saturate a soft organic cotton pad or mist directly over face and neck. Press softly until completely absorbed.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 201,
    "sku": "DUCK-032",
    "variety": "Refreshing, hydrating",
    "size": "100 ml",
    "imageAlt": "Duck Cosmetics Refreshing Glow Face Mist",
    "createdAt": "2026-11-12T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "weightless-hd-foundation",
    "title": "Weightless HD Foundation",
    "description": "Weightless matte, SPF 30, with natural extracts.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184748/duck-cosmetics-products/weightless-hd-foundation.webp",
    "backImageUrl": "/images/products/weightless-hd-foundation.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184748/duck-cosmetics-products/weightless-hd-foundation.webp",
    "lifestyleImageUrl": "/images/products/weightless-hd-foundation.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184748/duck-cosmetics-products/weightless-hd-foundation.webp",
      "/images/products/weightless-hd-foundation.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": true,
    "ingredients": "Aqua, Cyclopentasiloxane, Dimethicone Crosspolymer, Niacinamide, Glycerin, Silica, Titanium Dioxide (CI 77891), Iron Oxides (CI 77491, CI 77492, CI 77499), Tocopherol.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 214,
    "sku": "DUCK-033",
    "variety": "Liquid, weightless matte, SPF 30",
    "size": "30 ml / 1.0 fl oz",
    "imageAlt": "Duck Cosmetics Weightless HD Foundation",
    "createdAt": "2026-11-13T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "full-coverage-hydrating-concealer",
    "title": "Full-Coverage Hydrating Concealer",
    "description": "Full-coverage hydrating concealer.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184730/duck-cosmetics-products/full-coverage-hydrating-concealer.webp",
    "backImageUrl": "/images/products/full-coverage-hydrating-concealer.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184730/duck-cosmetics-products/full-coverage-hydrating-concealer.webp",
    "lifestyleImageUrl": "/images/products/full-coverage-hydrating-concealer.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184730/duck-cosmetics-products/full-coverage-hydrating-concealer.webp",
      "/images/products/full-coverage-hydrating-concealer.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Aqua, Cyclopentasiloxane, Dimethicone Crosspolymer, Niacinamide, Glycerin, Silica, Titanium Dioxide (CI 77891), Iron Oxides (CI 77491, CI 77492, CI 77499), Tocopherol.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 227,
    "sku": "DUCK-034",
    "variety": "Liquid, full-coverage, hydrating",
    "size": "",
    "imageAlt": "Duck Cosmetics Full-Coverage Hydrating Concealer",
    "createdAt": "2026-11-14T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "mattifying-make-up-primer",
    "title": "Mattifying Make Up Primer",
    "description": "Mattifying make-up primer with SPF 20.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184734/duck-cosmetics-products/mattifying-make-up-primer.webp",
    "backImageUrl": "/images/products/mattifying-make-up-primer.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184734/duck-cosmetics-products/mattifying-make-up-primer.webp",
    "lifestyleImageUrl": "/images/products/mattifying-make-up-primer.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184734/duck-cosmetics-products/mattifying-make-up-primer.webp",
      "/images/products/mattifying-make-up-primer.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Aqua, Cyclopentasiloxane, Dimethicone Crosspolymer, Niacinamide, Glycerin, Silica, Titanium Dioxide (CI 77891), Iron Oxides (CI 77491, CI 77492, CI 77499), Tocopherol.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 90,
    "sku": "DUCK-035",
    "variety": "Mattifying, SPF 20",
    "size": "",
    "imageAlt": "Duck Cosmetics Mattifying Make Up Primer",
    "createdAt": "2026-11-15T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "ultra-hd-loose-setting-powder",
    "title": "Ultra HD Loose Setting Powder",
    "description": "Ultra HD loose setting powder.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184744/duck-cosmetics-products/ultra-hd-loose-setting-powder.webp",
    "backImageUrl": "/images/products/ultra-hd-loose-setting-powder.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184744/duck-cosmetics-products/ultra-hd-loose-setting-powder.webp",
    "lifestyleImageUrl": "/images/products/ultra-hd-loose-setting-powder.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184744/duck-cosmetics-products/ultra-hd-loose-setting-powder.webp",
      "/images/products/ultra-hd-loose-setting-powder.webp"
    ],
    "categoryId": "cat-7",
    "categoryName": "Makeup",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.8,
    "reviewCount": 103,
    "sku": "DUCK-036",
    "variety": "Loose, setting",
    "size": "",
    "imageAlt": "Duck Cosmetics Ultra HD Loose Setting Powder",
    "createdAt": "2026-11-16T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "velvet-tint-blush",
    "title": "Velvet Tint Blush",
    "description": "Velvet tint blush compact.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184745/duck-cosmetics-products/velvet-tint-blush.webp",
    "backImageUrl": "/images/products/velvet-tint-blush.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184745/duck-cosmetics-products/velvet-tint-blush.webp",
    "lifestyleImageUrl": "/images/products/velvet-tint-blush.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184745/duck-cosmetics-products/velvet-tint-blush.webp",
      "/images/products/velvet-tint-blush.webp"
    ],
    "categoryId": "cat-10",
    "categoryName": "Lip & Cheek",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Botanical Infusion (Aqua, Organic Aloe Vera), Plant-Derived Squalane, Bio-Fermented Peptides, Tocopherol (Vitamin E), Natural Mineral Pigments, Cruelty-Free Botanical Extracts.",
    "directions": "Apply smoothly as desired for a radiant, velvet-finish haute beauty look. Suitable for daily use on all skin types.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 4.9,
    "reviewCount": 116,
    "sku": "DUCK-037",
    "variety": "Powder, compact",
    "size": "",
    "imageAlt": "Duck Cosmetics Velvet Tint Blush",
    "createdAt": "2026-11-17T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  },
  {
    "id": "revitalizing-eye-cream",
    "title": "Revitalizing Eye Cream",
    "description": "De-puff and brighten eye cream.",
    "price": 0,
    "mrp": 0,
    "sellingPrice": 0,
    "costPrice": 0,
    "stock": 0,
    "gst": 18,
    "hsn": "330499",
    "imageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184738/duck-cosmetics-products/revitalizing-eye-cream.webp",
    "backImageUrl": "/images/products/revitalizing-eye-cream.webp",
    "textureImageUrl": "https://res.cloudinary.com/fddgundt/image/upload/v1795184738/duck-cosmetics-products/revitalizing-eye-cream.webp",
    "lifestyleImageUrl": "/images/products/revitalizing-eye-cream.webp",
    "galleryImages": [
      "https://res.cloudinary.com/fddgundt/image/upload/v1795184738/duck-cosmetics-products/revitalizing-eye-cream.webp",
      "/images/products/revitalizing-eye-cream.webp"
    ],
    "categoryId": "cat-4",
    "categoryName": "Moisturizers",
    "status": "COMING_SOON",
    "isFeatured": false,
    "isBestSeller": false,
    "ingredients": "Aqua, Caprylic/Capric Triglyceride, Butyrospermum Parkii (Shea) Butter, Squalane, Ceramide NP, Sodium Hyaluronate, Tocopherol (Vitamin E), Avena Sativa (Oat) Kernel Extract, Carbomer.",
    "directions": "Smooth a nickel-sized amount upward across clean facial contours, neck, and jawline morning and evening.",
    "warnings": "For external dermatological application only. Avoid direct eye contact. In case of ocular contact, rinse thoroughly with fresh water. Patch test advised. Age: 16+.",
    "manufacturer": "Duck Cosmetics Haute Skincare Laboratory, 14 Rue des Roses, 06130 Grasse, France & Bodakdev Atelier, Ahmedabad 380054, India.",
    "rating": 5,
    "reviewCount": 129,
    "sku": "DUCK-038",
    "variety": "De-puffing, brightening",
    "size": "",
    "imageAlt": "Duck Cosmetics Revitalizing Eye Cream",
    "createdAt": "2026-11-18T14:43:38.438Z",
    "updatedAt": "2026-11-20T14:43:38.438Z"
  }
];

const DEFAULT_ORDERS: OrderData[] = [
  {
    id: "ord-1001",
    orderNumber: "DC-ORD-1001",
    customerName: "Ananya Deshmukh",
    phone: "+91 98200 11223",
    email: "ananya.d@luxuryvogue.in",
    address: "B-402, Oberoi Sky Heights, Lokhandwala Complex, Andheri West",
    city: "Mumbai",
    pincode: "400053",
    totalAmount: 2198.0,
    status: "SHIPPED",
    paymentMethod: "UPI",
    isManual: false,
    notes: "VIP Launch Member order with priority courier delivery.",
    items: [
      {
        productId: "prod-1",
        title: "Luminous Dew Veil Serum",
        price: 1199.0,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=900&auto=format&fit=crop",
      },
      {
        productId: "prod-2",
        title: "Silk Velvet Cushion Tint",
        price: 999.0,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1631730486784-5456119f69ae?q=80&w=900&auto=format&fit=crop",
      },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: "ord-1002",
    orderNumber: "DC-ORD-1002",
    customerName: "Kavita Shah",
    phone: "+91 98251 77665",
    email: "kavita.shah@ahmedabad.com",
    address: "12, Ambience Bungalows, Near Rajpath Club, SG Highway",
    city: "Ahmedabad",
    pincode: "380054",
    totalAmount: 1850.0,
    status: "PENDING",
    paymentMethod: "WhatsApp / Phone",
    isManual: true,
    notes: "Manual order taken over WhatsApp Concierge by staff member.",
    items: [
      {
        productId: "prod-6",
        title: "Kumkumadi Royal Saffron Radiance Elixir",
        price: 1850.0,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1608248597359-5f210543e49e?q=80&w=900&auto=format&fit=crop",
      },
    ],
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

const DEFAULT_REVIEWS: ReviewData[] = [
  {
    id: "rev-1",
    customerName: "Aishwarya Rai K.",
    rating: 5,
    comment:
      "The Kumkumadi Royal Saffron Elixir transformed my post-wedding skincare ritual. The cold-pressed Kashmiri saffron leaves an editorial, camera-ready dew without feeling greasy.",
    productId: "prod-6",
    productTitle: "Kumkumadi Royal Saffron Radiance Elixir",
    status: "APPROVED",
    verified: true,
    adminReply: "Thank you Aishwarya! We take immense pride in our cold-pressed Kashmiri saffron atelier.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "rev-2",
    customerName: "Dr. Meera Patel",
    rating: 5,
    comment:
      "As a pediatric dermatologist, finding a formula as gentle and pure as the Duck Petit Pure Comfort Baby Balm is rare. 0% synthetic fragrance, oat lipid barrier protection. Exceptional formulation.",
    productId: "prod-5",
    productTitle: "Duck Petit Pure Comfort Baby Balm",
    status: "APPROVED",
    verified: true,
    adminReply: "Honored by your clinical endorsement, Dr. Patel!",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "rev-3",
    customerName: "Natasha Singhania",
    rating: 5,
    comment:
      "The Silk Velvet Cushion Tint in Rose Petal is pure haute couture. It glides like a dream and lasts through 12-hour shoots without creasing. Worth every rupee.",
    productId: "prod-2",
    productTitle: "Silk Velvet Cushion Tint",
    status: "APPROVED",
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "rev-4",
    customerName: "Rohan Kapoor",
    rating: 5,
    comment:
      "Ordered via WhatsApp concierge for my sister's birthday hamper. Seamless ordering, Ahmedabad atelier dispatch in 24 hours, and packaging worthy of Paris fashion week.",
    productId: "prod-1",
    productTitle: "Luminous Dew Veil Serum",
    status: "APPROVED",
    verified: true,
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
];

const DEFAULT_COUPONS: CouponData[] = [
  {
    id: "coup-1",
    code: "DUCK15",
    discountPercent: 15,
    minOrderAmount: 800,
    freeGift: "Complimentary Deluxe Botanical Face Wash (30ml)",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "coup-2",
    code: "VIPGLOW",
    discountPercent: 20,
    minOrderAmount: 1500,
    freeGift: "Silk Sleep Mask & Sample Elixir Vial",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_USERS: UserData[] = [
  {
    id: "admin-pritesh",
    email: "sutharpritesh7877@gmail.com",
    passwordHash: bcrypt.hashSync("Ram@7877545471", 10),
    name: "Pritesh Suthar (Owner & Executive Admin)",
    role: "ADMIN",
    createdAt: new Date().toISOString(),
  },
  {
    id: "admin-default",
    email: "admin@duckcosmetics.com",
    passwordHash: bcrypt.hashSync("DuckAdmin2026!", 10),
    name: "Duck Executive Admin",
    role: "ADMIN",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_FAQS: FaqItemData[] = [
  {
    id: "faq-1",
    question: "When is the official launch date?",
    answer:
      "Duck Cosmetics will officially unveil its debut drop in Spring 2026. VIP Waitlist members receive private 48-hour pre-launch ordering privileges before the collection opens to the public.",
    isActive: true,
    order: 1,
    tags: ["launch", "date", "release", "when"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-2",
    question: "Is Duck Cosmetics 100% cruelty-free and vegan?",
    answer:
      "Yes, completely. Every Duck Cosmetics formulation is certified cruelty-free by PETA and 100% vegan. We never test on animals or commission third-party animal testing anywhere in the world.",
    isActive: true,
    order: 2,
    tags: ["cruelty", "free", "vegan", "animals", "peta"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-3",
    question: "How do I join the Pre-Launch VIP Waitlist?",
    answer:
      "Simply click 'JOIN THE WAITLIST' anywhere on the boutique and enter your verified email address. You will receive an automated double opt-in confirmation and priority allocation status.",
    isActive: true,
    order: 3,
    tags: ["waitlist", "vip", "join", "reservation", "early"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-4",
    question: "What is your Baby Care formulation standard?",
    answer:
      "Our pediatric Baby Care collection is ophthalmologist and dermatologist certified, tear-free, hypoallergenic, and enriched with cold-pressed sweet almond and organic calendula. 0% parabens, sulfates, or phthalates.",
    isActive: true,
    order: 4,
    tags: ["baby", "care", "infant", "pediatric", "sensitive", "skin"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-5",
    question: "Where are Duck Cosmetics products formulated?",
    answer:
      "Our formulations are developed across boutique research laboratories in Grasse (France), Zurich (Switzerland), and our state-of-the-art research atelier in Ahmedabad (India).",
    isActive: true,
    order: 5,
    tags: ["where", "made", "formulated", "labs", "grasse", "india"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-6",
    question: "What payment methods do you accept?",
    answer:
      "For India, we accept UPI (Google Pay, PhonePe, Paytm), RuPay, Indian Netbanking, and Cash on Delivery (COD). For international orders, we support Visa, Mastercard, American Express, Apple Pay, and PayPal.",
    isActive: true,
    order: 6,
    tags: ["payment", "methods", "upi", "cod", "cards", "stripe", "razorpay"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-7",
    question: "What is your return and exchange policy?",
    answer:
      "We provide a 14-day pure satisfaction return window on unopened, factory-sealed cosmetic formulations. If your parcel arrives damaged in transit, report it within 48 hours for a complimentary express replacement.",
    isActive: true,
    order: 7,
    tags: ["returns", "refund", "exchange", "damaged", "policy"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "faq-8",
    question: "Do you ship internationally?",
    answer:
      "Yes! We ship worldwide via DHL Express and FedEx International Priority. Complimentary international express courier is included on all global orders over $150 USD.",
    isActive: true,
    order: 8,
    tags: ["shipping", "international", "global", "delivery", "dhl", "fedex"],
    createdAt: new Date().toISOString(),
  },
];

export interface ConciergeQAData {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  order: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

const DEFAULT_CONCIERGE_QAS: ConciergeQAData[] = [
  {
    id: "cqa-1",
    question: "How can I track my shipment?",
    answer: "You can track your order in real-time on our Order Tracking portal (/track-order) using your Order ID and checkout email. All parcels are dispatched via BlueDart and Delhivery Express with insured delivery.",
    isActive: true,
    order: 1,
    tags: ["track", "shipment", "order", "delivery", "carrier", "bluedart", "delhivery"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cqa-2",
    question: "Are Duck Cosmetics products 100% cruelty-free?",
    answer: "Yes, absolutely. Duck Cosmetics is proudly 100% cruelty-free and vegan-certified. We never test on animals at any stage of research, clinical trials, or ingredient harvesting.",
    isActive: true,
    order: 2,
    tags: ["cruelty-free", "vegan", "animal testing", "peta", "ethical"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cqa-3",
    question: "What are your delivery timelines & shipping charges?",
    answer: "We offer Complimentary Atelier Shipping across India on all orders above ₹800. Standard domestic delivery takes 2 to 4 business days. International express transit takes 5 to 10 business days.",
    isActive: true,
    order: 3,
    tags: ["shipping", "delivery", "timelines", "free shipping", "charges", "days", "transit"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cqa-4",
    question: "How do I secure Pre-Launch VIP Access & discounts?",
    answer: "Click the 'WAITLIST' button in our header to join our VIP circle. Inaugural members receive priority 48-hour ordering allocation and private 15% VIP discount code DUCKVIP15.",
    isActive: true,
    order: 4,
    tags: ["vip", "waitlist", "discount", "code", "pre-launch", "coupon", "access"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cqa-5",
    question: "What is your return, exchange & refund policy?",
    answer: "We provide a 14-day return privilege on all sealed, unopened formulations in original packaging. Simply contact concierge@duckcosmetics.com or visit /returns to initiate an express courier pickup.",
    isActive: true,
    order: 5,
    tags: ["return", "refund", "exchange", "damaged", "policy"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cqa-6",
    question: "Are your Baby Care products safe for newborns?",
    answer: "Yes. Our Baby Care formulations are 100% hypoallergenic, pediatric and ophthalmologist certified, fragrance-free, and formulated without parabens, phthalates, or harsh sulfates.",
    isActive: true,
    order: 6,
    tags: ["baby", "baby care", "newborn", "hypoallergenic", "pediatric", "sensitive"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "cqa-7",
    question: "What are the botanical sources for your Ayurvedic Nectars?",
    answer: "Our Ayurvedic range uses cold-pressed Kashmiri saffron, 26-herb Kumkumadi thailam, pure white sandalwood, and organic wild rosehip, harvested sustainably under fair-trade principles.",
    isActive: true,
    order: 7,
    tags: ["ayurvedic", "kumkumadi", "saffron", "ingredients", "botanicals"],
    createdAt: new Date().toISOString(),
  },
];

interface LocalStore {
  users: UserData[];
  categories: CategoryData[];
  products: ProductData[];
  waitlist: WaitlistData[];
  siteSettings: SiteSettingsData;
  contactSettings: ContactSettingsData;
  pages: PageContentData[];
  messages: ContactMessageData[];
  orders: OrderData[];
  reviews: ReviewData[];
  coupons: CouponData[];
  faqs?: FaqItemData[];
  conciergeQAs?: ConciergeQAData[];
  addresses?: AddressData[];
  wishlists?: WishlistData[];
  megaMenuPromo?: MegaMenuPromoData;
}

function getLocalStore(): LocalStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial: LocalStore = {
        users: [...DEFAULT_USERS],
        categories: [...DEFAULT_CATEGORIES],
        products: [...DEFAULT_PRODUCTS],
        waitlist: [],
        siteSettings: { ...DEFAULT_SETTINGS },
        contactSettings: { ...DEFAULT_CONTACT_SETTINGS },
        pages: [...DEFAULT_PAGES],
        messages: [],
        orders: [...DEFAULT_ORDERS],
        reviews: [...DEFAULT_REVIEWS],
        coupons: [...DEFAULT_COUPONS],
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(STORE_FILE, "utf-8");
    const parsed: LocalStore = JSON.parse(content);

    let changed = false;
    if (!parsed.siteSettings) {
      parsed.siteSettings = (parsed as any).settings || { ...DEFAULT_SETTINGS };
      changed = true;
    }
    if (!parsed.siteSettings.buttonText) {
      parsed.siteSettings.buttonText = "JOIN THE WAITLIST";
      changed = true;
    }
    (parsed as any).settings = parsed.siteSettings;

    if (!parsed.contactSettings) {
      parsed.contactSettings = { ...DEFAULT_CONTACT_SETTINGS };
      changed = true;
    }
    if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = [...DEFAULT_USERS];
      changed = true;
    } else {
      DEFAULT_USERS.forEach((du) => {
        const existing = parsed.users.find((u) => u.email.toLowerCase() === du.email.toLowerCase());
        if (!existing) {
          parsed.users.push({ ...du });
          changed = true;
        } else {
          existing.passwordHash = du.passwordHash;
          existing.role = "ADMIN";
          changed = true;
        }
      });
    }
    if (!parsed.orders) {
      parsed.orders = [...DEFAULT_ORDERS];
      changed = true;
    }
    if (!parsed.reviews) {
      parsed.reviews = [...DEFAULT_REVIEWS];
      changed = true;
    }
    if (!parsed.coupons) {
      parsed.coupons = [...DEFAULT_COUPONS];
      changed = true;
    }
    if (!parsed.pages) {
      parsed.pages = [...DEFAULT_PAGES];
      changed = true;
    } else {
      // Ensure all standard legal pages exist
      DEFAULT_PAGES.forEach((dp) => {
        if (!parsed.pages.some((p) => p.slug === dp.slug)) {
          parsed.pages.push({ ...dp });
          changed = true;
        }
      });
    }
    if (!parsed.siteSettings.paymentGateways) {
      parsed.siteSettings.paymentGateways = { ...DEFAULT_SETTINGS.paymentGateways };
      changed = true;
    }
    if (!parsed.siteSettings.shippingZones) {
      parsed.siteSettings.shippingZones = { ...DEFAULT_SETTINGS.shippingZones };
      changed = true;
    }
    if (!parsed.messages) {
      parsed.messages = [];
      changed = true;
    }
    if (!parsed.waitlist) {
      parsed.waitlist = [];
      changed = true;
    }
    if (!parsed.faqs || parsed.faqs.length === 0) {
      parsed.faqs = [...DEFAULT_FAQS];
      changed = true;
    }
    if (!parsed.conciergeQAs || parsed.conciergeQAs.length === 0) {
      parsed.conciergeQAs = [...DEFAULT_CONCIERGE_QAS];
      changed = true;
    }
    if (!parsed.addresses) {
      parsed.addresses = [];
      changed = true;
    }
    if (!parsed.wishlists) {
      parsed.wishlists = [];
      changed = true;
    }
    if (!parsed.megaMenuPromo) {
      parsed.megaMenuPromo = { ...DEFAULT_MEGA_MENU_PROMO };
      changed = true;
    }
    // Upgrade existing categories with default displayOrder and subCategoriesList if missing
    parsed.categories = parsed.categories.map((c) => {
      const defaultMatch = DEFAULT_CATEGORIES.find((dc) => dc.id === c.id || dc.slug === c.slug);
      return {
        ...c,
        shortDescription: c.shortDescription || c.description || defaultMatch?.shortDescription || "",
        displayOrder: c.displayOrder !== undefined ? c.displayOrder : (defaultMatch?.displayOrder || 99),
        subCategoriesList: Array.isArray(c.subCategoriesList)
          ? c.subCategoriesList
          : (defaultMatch?.subCategoriesList || []),
        bannerImageUrl: c.bannerImageUrl || defaultMatch?.bannerImageUrl || undefined,
      };
    });
    parsed.products = parsed.products.map((p) => {
      const isBestSeller = p.isBestSeller ?? (p.id === "prod-1" || p.id === "prod-2" || p.id === "prod-5" || p.id === "prod-6");
      return {
        ...p,
        isBestSeller,
        mrp: p.mrp ?? Math.round(p.price * 1.25),
        sellingPrice: p.sellingPrice ?? p.price,
        costPrice: p.costPrice ?? Math.round(p.price * 0.35),
        stock: p.stock ?? 65,
        gst: p.gst ?? 18,
        hsn: p.hsn ?? "330499",
      };
    });
    if (changed) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch (e) {
    console.error("Local store read error:", e);
    return {
      users: [...DEFAULT_USERS],
      categories: [...DEFAULT_CATEGORIES],
      products: [...DEFAULT_PRODUCTS],
      waitlist: [],
      siteSettings: { ...DEFAULT_SETTINGS },
      contactSettings: { ...DEFAULT_CONTACT_SETTINGS },
      pages: [...DEFAULT_PAGES],
      messages: [],
      orders: [...DEFAULT_ORDERS],
      reviews: [...DEFAULT_REVIEWS],
      coupons: [...DEFAULT_COUPONS],
    };
  }
}

function saveLocalStore(data: LocalStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Local store save error:", e);
  }
}

let prismaAvailable: boolean | null = null;
async function checkPrisma(): Promise<boolean> {
  if (prismaAvailable !== null) return prismaAvailable;
  try {
    await prisma.$queryRaw`SELECT 1`;
    prismaAvailable = true;
  } catch {
    prismaAvailable = false;
  }
  return prismaAvailable;
}

export const dbService = {
  // --- Site Settings ---
  async getSiteSettings(): Promise<SiteSettingsData> {
    if (await checkPrisma()) {
      try {
        const s =
          (await prisma.siteSettings.findFirst({
            orderBy: { updatedAt: "desc" },
          })) ||
          (await prisma.siteSettings.findUnique({ where: { id: "default" } }));
        if (s) {
          return {
            id: s.id,
            heroHeadline: s.heroHeadline,
            heroSubheadline: s.heroSubheadline,
            heroImageUrl: s.heroImageUrl,
            announcementBarText: s.announcementBarText,
            footerTagline: s.footerTagline,
            trustBadge1: s.trustBadge1,
            trustBadge2: s.trustBadge2,
            maisonHeadline: s.maisonHeadline,
            maisonSubheadline: s.maisonSubheadline,
            buttonText: (s as any).buttonText || "JOIN THE WAITLIST",
            updatedAt: s.updatedAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma getSiteSettings fallback:", e);
      }
    }

    // Cloud Firestore Fallback (Preserves admin settings across Vercel Lambdas)
    try {
      const fb = await fetchSiteSettingsFromFirestore();
      if (fb && (fb.heroImageUrl || fb.heroHeadline)) {
        return {
          ...DEFAULT_SETTINGS,
          ...(fb as any),
          updatedAt: (fb as any).updatedAt || new Date().toISOString(),
        };
      }
    } catch (fbErr) {
      console.warn("Firestore getSiteSettings fallback:", fbErr);
    }

    const store = getLocalStore();
    return store.siteSettings || { ...DEFAULT_SETTINGS };
  },

  async updateSiteSettings(data: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
    let result: SiteSettingsData | null = null;
    if (await checkPrisma()) {
      try {
        const updated = await prisma.siteSettings.upsert({
          where: { id: "default" },
          create: { ...DEFAULT_SETTINGS, ...data },
          update: data as any,
        });
        result = {
          id: updated.id,
          heroHeadline: updated.heroHeadline,
          heroSubheadline: updated.heroSubheadline,
          heroImageUrl: updated.heroImageUrl,
          announcementBarText: updated.announcementBarText,
          footerTagline: updated.footerTagline,
          trustBadge1: updated.trustBadge1,
          trustBadge2: updated.trustBadge2,
          maisonHeadline: updated.maisonHeadline,
          maisonSubheadline: updated.maisonSubheadline,
          buttonText: (updated as any).buttonText || "JOIN THE WAITLIST",
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updateSiteSettings fallback:", e);
      }
    }

    // Dual-sync to Cloud Firestore
    try {
      await saveSiteSettingsToFirestore((result || { ...DEFAULT_SETTINGS, ...data }) as any);
    } catch (fbErr) {
      console.warn("Firestore saveSiteSettings fallback:", fbErr);
    }

    const store = getLocalStore();
    store.siteSettings = {
      ...store.siteSettings,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(store);
    return result || store.siteSettings;
  },

  // --- Contact Settings ---
  async getContactSettings(): Promise<ContactSettingsData> {
    if (await checkPrisma()) {
      try {
        const c =
          (await prisma.contactSettings.findFirst({
            orderBy: { updatedAt: "desc" },
          })) ||
          (await prisma.contactSettings.findUnique({ where: { id: "default" } }));
        if (c) {
          return {
            id: c.id,
            phone1: c.phone1,
            phone2: c.phone2,
            phone3: c.phone3,
            email: c.email,
            address: c.address,
            bottomText: c.bottomText,
            updatedAt: c.updatedAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma getContactSettings fallback:", e);
      }
    }

    // Cloud Firestore Fallback (Real-time cloud sync across Vercel lambdas)
    try {
      const fb = await fetchContactSettingsFromFirestore();
      if (fb && (fb.address || fb.email || fb.phone1)) {
        return {
          ...DEFAULT_CONTACT_SETTINGS,
          ...fb,
          updatedAt: fb.updatedAt || new Date().toISOString(),
        };
      }
    } catch (fbErr) {
      console.warn("Firestore getContactSettings fallback:", fbErr);
    }

    const store = getLocalStore();
    return store.contactSettings || { ...DEFAULT_CONTACT_SETTINGS };
  },

  async updateContactSettings(data: Partial<ContactSettingsData>): Promise<ContactSettingsData> {
    let result: ContactSettingsData | null = null;
    if (await checkPrisma()) {
      try {
        const updated = await prisma.contactSettings.upsert({
          where: { id: "default" },
          create: { ...DEFAULT_CONTACT_SETTINGS, ...data },
          update: data,
        });
        result = {
          id: updated.id,
          phone1: updated.phone1,
          phone2: updated.phone2,
          phone3: updated.phone3,
          email: updated.email,
          address: updated.address,
          bottomText: updated.bottomText,
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updateContactSettings fallback:", e);
      }
    }

    // Dual-sync to Cloud Firestore
    try {
      await saveContactSettingsToFirestore((result || { ...DEFAULT_CONTACT_SETTINGS, ...data }));
    } catch (fbErr) {
      console.warn("Firestore saveContactSettings fallback:", fbErr);
    }

    const store = getLocalStore();
    store.contactSettings = {
      ...store.contactSettings,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(store);
    return result || store.contactSettings;
  },

  // --- Pages CMS ---
  async getPageContent(slug: string): Promise<PageContentData | null> {
    if (await checkPrisma()) {
      try {
        const page = await prisma.pageContent.findUnique({ where: { slug } });
        if (page) {
          return {
            id: page.id,
            slug: page.slug,
            title: page.title,
            content: page.content,
            updatedAt: page.updatedAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma getPageContent fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.pages.find((p) => p.slug === slug) || null;
  },

  async updatePageContent(slug: string, title: string, content: string): Promise<PageContentData> {
    if (await checkPrisma()) {
      try {
        const updated = await prisma.pageContent.upsert({
          where: { slug },
          create: { slug, title, content },
          update: { title, content },
        });
        return {
          id: updated.id,
          slug: updated.slug,
          title: updated.title,
          content: updated.content,
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updatePageContent fallback:", e);
      }
    }
    const store = getLocalStore();
    const idx = store.pages.findIndex((p) => p.slug === slug);
    const updatedPage: PageContentData = {
      id: idx >= 0 ? store.pages[idx].id : `page-${slug}`,
      slug,
      title,
      content,
      updatedAt: new Date().toISOString(),
    };
    if (idx >= 0) {
      store.pages[idx] = updatedPage;
    } else {
      store.pages.push(updatedPage);
    }
    saveLocalStore(store);
    return updatedPage;
  },

  async getAllPages(): Promise<PageContentData[]> {
    if (await checkPrisma()) {
      try {
        const list = await prisma.pageContent.findMany({ orderBy: { slug: "asc" } });
        if (list.length > 0) {
          return list.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            content: p.content,
            updatedAt: p.updatedAt.toISOString(),
          }));
        }
      } catch (e) {
        console.warn("Prisma getAllPages fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.pages;
  },

  // --- Contact Messages ---
  async createContactMessage(data: { name: string; email: string; phone?: string; message: string }) {
    if (await checkPrisma()) {
      try {
        const msg = await prisma.contactMessage.create({ data });
        return {
          id: msg.id,
          name: msg.name,
          email: msg.email,
          phone: msg.phone || undefined,
          message: msg.message,
          createdAt: msg.createdAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma createContactMessage fallback:", e);
      }
    }
    const store = getLocalStore();
    const newMsg: ContactMessageData = {
      id: `msg-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    };
    store.messages.unshift(newMsg);
    saveLocalStore(store);
    return newMsg;
  },

  async getContactMessages(): Promise<ContactMessageData[]> {
    if (await checkPrisma()) {
      try {
        const list = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
        return list.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          phone: m.phone || undefined,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
        }));
      } catch (e) {
        console.warn("Prisma getContactMessages fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.messages || [];
  },

  // --- Staff Management ---
  async getStaffList(): Promise<Array<{ id: string; name: string; email: string; role: "ADMIN" | "STAFF"; createdAt: string }>> {
    if (await checkPrisma()) {
      try {
        const users = await prisma.user.findMany({
          where: { role: { in: ["ADMIN", "STAFF"] } },
          orderBy: { createdAt: "desc" },
        });
        return users.map((u) => ({
          id: u.id,
          name: u.name || "Executive",
          email: u.email,
          role: u.role as "ADMIN" | "STAFF",
          createdAt: u.createdAt.toISOString(),
        }));
      } catch (e) {
        console.warn("Prisma getStaffList fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.users
      .filter((u) => u.role === "ADMIN" || u.role === "STAFF")
      .map((u) => ({
        id: u.id,
        name: u.name || "Executive Staff",
        email: u.email,
        role: u.role as "ADMIN" | "STAFF",
        createdAt: u.createdAt,
      }));
  },

  async createStaffMember(data: { name: string; email: string; password: string; role: "ADMIN" | "STAFF" }) {
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const cleanEmail = data.email.trim().toLowerCase();

    if (await checkPrisma()) {
      try {
        const u = await prisma.user.create({
          data: {
            name: data.name,
            email: cleanEmail,
            passwordHash,
            role: data.role,
          },
        });
        return {
          id: u.id,
          name: u.name || data.name,
          email: u.email,
          role: u.role,
        };
      } catch (e) {
        console.warn("Prisma createStaffMember fallback:", e);
      }
    }

    const store = getLocalStore();
    const existing = store.users.find((u) => u.email === cleanEmail);
    if (existing) {
      throw new Error("A staff member or administrator with this email already exists");
    }

    const newUser: UserData = {
      id: `staff-${Date.now()}`,
      name: data.name,
      email: cleanEmail,
      passwordHash,
      role: data.role,
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    saveLocalStore(store);
    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
  },

  async deleteStaffMember(id: string): Promise<boolean> {
    if (await checkPrisma()) {
      try {
        await prisma.user.delete({ where: { id } });
        return true;
      } catch (e) {
        console.warn("Prisma deleteStaffMember fallback:", e);
      }
    }
    const store = getLocalStore();
    const prevLen = store.users.length;
    store.users = store.users.filter((u) => u.id !== id);
    saveLocalStore(store);
    return store.users.length < prevLen;
  },

  // --- Categories ---
  async getCategories(): Promise<CategoryData[]> {
    if (await checkPrisma()) {
      try {
        const list = await prisma.category.findMany({
          orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        });
        if (list.length > 0) {
          return list.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            parentCategoryId: c.parentCategoryId,
            shortDescription: c.shortDescription || undefined,
            description: c.shortDescription || undefined,
            bannerImageUrl: c.bannerImageUrl || undefined,
            subCategoriesList: c.subCategoriesList || [],
            subCategories: c.subCategoriesList || [],
            displayOrder: c.displayOrder,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
          }));
        }
      } catch (e) {
        console.warn("Prisma getCategories fallback:", e);
      }
    }
    const store = getLocalStore();
    return [...store.categories].sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
  },

  async getCategoryBySlug(slug: string): Promise<CategoryData | null> {
    if (await checkPrisma()) {
      try {
        const c = await prisma.category.findUnique({ where: { slug } });
        if (c) {
          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            parentCategoryId: c.parentCategoryId,
            shortDescription: c.shortDescription || undefined,
            description: c.shortDescription || undefined,
            bannerImageUrl: c.bannerImageUrl || undefined,
            subCategoriesList: c.subCategoriesList || [],
            subCategories: c.subCategoriesList || [],
            displayOrder: c.displayOrder,
            createdAt: c.createdAt.toISOString(),
            updatedAt: c.updatedAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma getCategoryBySlug fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  async createCategory(data: {
    name: string;
    slug?: string;
    shortDescription?: string;
    bannerImageUrl?: string;
    subCategoriesList?: string[];
    displayOrder?: number;
    parentCategoryId?: string | null;
  }): Promise<CategoryData> {
    const slug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")).trim();
    const displayOrder = data.displayOrder ?? 99;
    const subCategoriesList = data.subCategoriesList || [];

    if (await checkPrisma()) {
      try {
        const created = await prisma.category.create({
          data: {
            name: data.name.trim(),
            slug,
            shortDescription: data.shortDescription ? data.shortDescription.trim() : null,
            bannerImageUrl: data.bannerImageUrl ? data.bannerImageUrl.trim() : null,
            subCategoriesList,
            displayOrder,
            parentCategoryId: data.parentCategoryId || null,
          },
        });
        return {
          id: created.id,
          name: created.name,
          slug: created.slug,
          parentCategoryId: created.parentCategoryId,
          shortDescription: created.shortDescription || undefined,
          description: created.shortDescription || undefined,
          bannerImageUrl: created.bannerImageUrl || undefined,
          subCategoriesList: created.subCategoriesList || [],
          subCategories: created.subCategoriesList || [],
          displayOrder: created.displayOrder,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma createCategory fallback:", e);
      }
    }

    const store = getLocalStore();
    const newCat: CategoryData = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      slug,
      shortDescription: data.shortDescription?.trim(),
      description: data.shortDescription?.trim(),
      bannerImageUrl: data.bannerImageUrl?.trim(),
      subCategoriesList,
      subCategories: subCategoriesList,
      displayOrder,
      parentCategoryId: data.parentCategoryId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.categories.push(newCat);
    saveLocalStore(store);
    return newCat;
  },

  async updateCategory(
    id: string,
    data: Partial<CategoryData>
  ): Promise<CategoryData | null> {
    if (await checkPrisma()) {
      try {
        const updated = await prisma.category.update({
          where: { id },
          data: {
            ...(data.name ? { name: data.name.trim() } : {}),
            ...(data.slug ? { slug: data.slug.trim() } : {}),
            ...(data.shortDescription !== undefined ? { shortDescription: data.shortDescription ? data.shortDescription.trim() : null } : {}),
            ...(data.bannerImageUrl !== undefined ? { bannerImageUrl: data.bannerImageUrl ? data.bannerImageUrl.trim() : null } : {}),
            ...(data.subCategoriesList ? { subCategoriesList: data.subCategoriesList } : {}),
            ...(data.displayOrder !== undefined ? { displayOrder: Number(data.displayOrder) } : {}),
            ...(data.parentCategoryId !== undefined ? { parentCategoryId: data.parentCategoryId || null } : {}),
          },
        });
        return {
          id: updated.id,
          name: updated.name,
          slug: updated.slug,
          parentCategoryId: updated.parentCategoryId,
          shortDescription: updated.shortDescription || undefined,
          description: updated.shortDescription || undefined,
          bannerImageUrl: updated.bannerImageUrl || undefined,
          subCategoriesList: updated.subCategoriesList || [],
          subCategories: updated.subCategoriesList || [],
          displayOrder: updated.displayOrder,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updateCategory fallback:", e);
      }
    }

    const store = getLocalStore();
    const index = store.categories.findIndex((c) => c.id === id || c.slug === id);
    if (index === -1) return null;
    store.categories[index] = {
      ...store.categories[index],
      ...data,
      description: data.shortDescription || store.categories[index].description,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(store);
    return store.categories[index];
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (await checkPrisma()) {
      try {
        await prisma.category.delete({ where: { id } });
        return true;
      } catch (e) {
        console.warn("Prisma deleteCategory fallback:", e);
      }
    }
    const store = getLocalStore();
    const len = store.categories.length;
    store.categories = store.categories.filter((c) => c.id !== id && c.slug !== id);
    if (store.categories.length < len) {
      saveLocalStore(store);
      return true;
    }
    return false;
  },

  // --- Mega Menu Promo Card ---
  async getMegaMenuPromo(): Promise<MegaMenuPromoData> {
    if (await checkPrisma()) {
      try {
        const promo = await prisma.megaMenuPromo.findFirst();
        if (promo) {
          return {
            id: promo.id,
            badgeText: promo.badgeText,
            title: promo.title,
            description: promo.description,
            posterImageUrl: promo.posterImageUrl,
            primaryButtonText: promo.primaryButtonText,
            primaryButtonLink: promo.primaryButtonLink,
            secondaryButtonText: promo.secondaryButtonText,
            secondaryButtonLink: promo.secondaryButtonLink,
            isActive: promo.isActive,
            updatedAt: promo.updatedAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma getMegaMenuPromo fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.megaMenuPromo || DEFAULT_MEGA_MENU_PROMO;
  },

  async updateMegaMenuPromo(data: Partial<MegaMenuPromoData>): Promise<MegaMenuPromoData> {
    if (await checkPrisma()) {
      try {
        const updated = await prisma.megaMenuPromo.upsert({
          where: { id: "default" },
          create: {
            id: "default",
            badgeText: data.badgeText || "PRE-LAUNCH VIP",
            title: data.title || "Baby Care & Pure Botanicals",
            description: data.description || "Pediatrician-tested hypoallergenic formulas with cold-pressed almond and organic calendula.",
            posterImageUrl: data.posterImageUrl || "",
            primaryButtonText: data.primaryButtonText || "EXPLORE BABY CARE",
            primaryButtonLink: data.primaryButtonLink || "/shop/baby-care",
            secondaryButtonText: data.secondaryButtonText || "JOIN DROP WAITLIST",
            secondaryButtonLink: data.secondaryButtonLink || "waitlist-modal",
            isActive: data.isActive !== undefined ? data.isActive : true,
          },
          update: {
            ...(data.badgeText ? { badgeText: data.badgeText.trim() } : {}),
            ...(data.title ? { title: data.title.trim() } : {}),
            ...(data.description ? { description: data.description.trim() } : {}),
            ...(data.posterImageUrl !== undefined ? { posterImageUrl: data.posterImageUrl.trim() } : {}),
            ...(data.primaryButtonText ? { primaryButtonText: data.primaryButtonText.trim() } : {}),
            ...(data.primaryButtonLink ? { primaryButtonLink: data.primaryButtonLink.trim() } : {}),
            ...(data.secondaryButtonText ? { secondaryButtonText: data.secondaryButtonText.trim() } : {}),
            ...(data.secondaryButtonLink ? { secondaryButtonLink: data.secondaryButtonLink.trim() } : {}),
            ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
          },
        });
        return {
          id: updated.id,
          badgeText: updated.badgeText,
          title: updated.title,
          description: updated.description,
          posterImageUrl: updated.posterImageUrl,
          primaryButtonText: updated.primaryButtonText,
          primaryButtonLink: updated.primaryButtonLink,
          secondaryButtonText: updated.secondaryButtonText,
          secondaryButtonLink: updated.secondaryButtonLink,
          isActive: updated.isActive,
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updateMegaMenuPromo fallback:", e);
      }
    }
    const store = getLocalStore();
    store.megaMenuPromo = {
      ...(store.megaMenuPromo || DEFAULT_MEGA_MENU_PROMO),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(store);
    return store.megaMenuPromo;
  },

  // --- Products ---
  async getProducts(options?: {
    featuredOnly?: boolean;
    bestSellerOnly?: boolean;
    isBestSeller?: boolean;
    status?: ProductStatus;
    search?: string;
    categoryId?: string;
    categorySlug?: string;
    subcategorySlug?: string;
    sort?: "featured" | "price-asc" | "price-desc" | "newest";
    page?: number;
    limit?: number;
  }): Promise<{ products: ProductData[]; total: number }> {
    const {
      featuredOnly,
      bestSellerOnly,
      isBestSeller,
      status,
      search,
      categoryId,
      categorySlug,
      subcategorySlug,
      sort,
      page = 1,
      limit = 100,
    } = options || {};

    // 1. Primary DB Source: Prisma ORM (Live DB queries on PostgreSQL / Supabase)
    if (await checkPrisma()) {
      try {
        const whereClause: any = {};
        if (featuredOnly) whereClause.isFeatured = true;
        if (bestSellerOnly || isBestSeller) whereClause.isBestSeller = true;
        if (status) {
          whereClause.status = status;
        }
        if (categoryId && categoryId !== "ALL" && categoryId !== "all") {
          whereClause.categoryId = categoryId;
        }
        if (search && search.trim()) {
          whereClause.OR = [
            { title: { contains: search.trim(), mode: "insensitive" } },
            { description: { contains: search.trim(), mode: "insensitive" } },
          ];
        }

        const orderByClause: any =
          sort === "price-asc"
            ? { sellingPrice: "asc" }
            : sort === "price-desc"
            ? { sellingPrice: "desc" }
            : sort === "newest"
            ? { createdAt: "desc" }
            : { createdAt: "desc" };

        const [prismaProducts, totalCount] = await Promise.all([
          prisma.product.findMany({
            where: whereClause,
            include: { category: true },
            orderBy: orderByClause,
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.product.count({ where: whereClause }),
        ]);

        if (prismaProducts && prismaProducts.length > 0) {
          return {
            products: prismaProducts.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              price: Number(p.price || p.sellingPrice),
              mrp: Number(p.mrp || p.price),
              sellingPrice: Number(p.sellingPrice || p.price),
              costPrice: Number(p.costPrice || 0),
              stock: p.stock ?? 50,
              gst: Number(p.gst ?? 18),
              hsn: p.hsn || "330499",
              imageUrl: p.imageUrl,
              backImageUrl: p.backImageUrl || undefined,
              textureImageUrl: p.textureImageUrl || undefined,
              lifestyleImageUrl: p.lifestyleImageUrl || undefined,
              galleryImages: [p.imageUrl, p.backImageUrl, p.textureImageUrl, p.lifestyleImageUrl].filter(Boolean) as string[],
              categoryId: p.categoryId,
              categoryName: p.category?.name || "General",
              category: p.category
                ? {
                    id: p.category.id,
                    name: p.category.name,
                    slug: p.category.slug,
                  }
                : undefined,
              status: p.status as ProductStatus,
              isFeatured: p.isFeatured,
              isBestSeller: Boolean((p as any).isBestSeller),
              ingredients: p.ingredients || undefined,
              directions: p.directions || undefined,
              warnings: p.warnings || undefined,
              manufacturer: p.manufacturer || undefined,
              rating: p.rating ? Number(p.rating) : 4.9,
              reviewCount: p.reviewCount ?? 120,
              createdAt: p.createdAt.toISOString(),
              updatedAt: p.updatedAt.toISOString(),
            })),
            total: totalCount,
          };
        }
      } catch (prismaErr) {
        console.warn("Prisma getProducts query error / fallback:", prismaErr);
      }
    }

    // 2. Secondary Cloud Source: Google Cloud Firestore (Dual-sync on Vercel)
    try {
      const fbProducts = await fetchAdminProductsFromFirestore();
      if (fbProducts && fbProducts.length > 0) {
        let list: ProductData[] = fbProducts.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description || "",
          price: Number(p.price || p.sellingPrice || 0),
          mrp: Number(p.mrp || p.price || 0),
          sellingPrice: Number(p.sellingPrice || p.price || 0),
          costPrice: Number(p.costPrice || 0),
          stock: p.stock ?? 50,
          gst: Number(p.gst ?? 18),
          hsn: p.hsn || "330499",
          imageUrl: p.imageUrl || p.image || "",
          backImageUrl: p.backImageUrl,
          textureImageUrl: p.textureImageUrl,
          lifestyleImageUrl: p.lifestyleImageUrl,
          galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages : [p.imageUrl].filter(Boolean),
          categoryId: p.categoryId || (p.category?.id) || "",
          categoryName: p.category?.name || p.categoryName || "General",
          category: p.category,
          status: (p.status || "LIVE") as ProductStatus,
          isFeatured: Boolean(p.isFeatured),
          isBestSeller: Boolean(p.isBestSeller),
          ingredients: p.ingredients,
          directions: p.directions,
          warnings: p.warnings,
          manufacturer: p.manufacturer,
          rating: p.rating ? Number(p.rating) : 4.9,
          reviewCount: p.reviewCount ?? 120,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString(),
        }));

        if (featuredOnly) list = list.filter((p) => p.isFeatured);
        if (bestSellerOnly || isBestSeller) list = list.filter((p) => p.isBestSeller);
        if (status) list = list.filter((p) => p.status === status);
        if (categoryId && categoryId !== "ALL" && categoryId !== "all") {
          list = list.filter((p) => p.categoryId === categoryId);
        }
        if (search && search.trim()) {
          const q = search.trim().toLowerCase();
          list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
        }

        return {
          products: list.slice((page - 1) * limit, page * limit),
          total: list.length,
        };
      }
    } catch (fbErr) {
      console.warn("Firestore getProducts fallback:", fbErr);
    }

    const store = getLocalStore();
    let filtered = [...store.products];

    // 1. Resolve Category Filter (by slug or ID)
    const targetSlug =
      categorySlug ||
      (categoryId && !categoryId.startsWith("cat-") && categoryId !== "ALL"
        ? categoryId
        : undefined);

    if (targetSlug && targetSlug !== "ALL" && targetSlug !== "all") {
      const mainCat = store.categories.find(
        (c) =>
          c.slug.toLowerCase() === targetSlug.toLowerCase() ||
          c.name.toLowerCase() === targetSlug.toLowerCase()
      );
      if (mainCat) {
        // Find mainCat and all direct children
        const childCatIds = store.categories
          .filter((c) => c.parentCategoryId === mainCat.id)
          .map((c) => c.id);
        const matchIds = new Set([mainCat.id, ...childCatIds]);

        filtered = filtered.filter(
          (p) =>
            matchIds.has(p.categoryId) ||
            (p.categoryName &&
              p.categoryName.toLowerCase() === mainCat.name.toLowerCase())
        );
      } else {
        filtered = filtered.filter(
          (p) =>
            p.categoryId.toLowerCase() === targetSlug.toLowerCase() ||
            (p.categoryName &&
              p.categoryName.toLowerCase().includes(targetSlug.toLowerCase()))
        );
      }
    } else if (categoryId && categoryId !== "ALL" && categoryId !== "all") {
      const cat = store.categories.find((c) => c.id === categoryId);
      if (cat) {
        const childCatIds = store.categories
          .filter((c) => c.parentCategoryId === cat.id)
          .map((c) => c.id);
        const matchIds = new Set([cat.id, ...childCatIds]);
        filtered = filtered.filter(
          (p) =>
            matchIds.has(p.categoryId) ||
            (p.categoryName &&
              p.categoryName.toLowerCase() === cat.name.toLowerCase())
        );
      } else {
        filtered = filtered.filter((p) => p.categoryId === categoryId);
      }
    }

    // 2. Resolve Subcategory Filter
    if (subcategorySlug && subcategorySlug !== "ALL" && subcategorySlug !== "all") {
      const subCat = store.categories.find(
        (c) =>
          c.slug.toLowerCase() === subcategorySlug.toLowerCase() ||
          c.name.toLowerCase() === subcategorySlug.toLowerCase()
      );
      if (subCat) {
        filtered = filtered.filter(
          (p) =>
            p.categoryId === subCat.id ||
            (p.categoryName &&
              p.categoryName.toLowerCase() === subCat.name.toLowerCase())
        );
      }
    }

    // 3. Featured / Status / Search filters
    if (featuredOnly) {
      filtered = filtered.filter((p) => p.isFeatured);
    }
    if (bestSellerOnly || isBestSeller) {
      filtered = filtered.filter((p) => Boolean(p.isBestSeller));
    }
    if (status) {
      filtered = filtered.filter((p) => p.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    // 4. Sorting logic
    if (sort === "price-asc") {
      filtered.sort(
        (a, b) =>
          (a.sellingPrice ?? a.price) - (b.sellingPrice ?? b.price)
      );
    } else if (sort === "price-desc") {
      filtered.sort(
        (a, b) =>
          (b.sellingPrice ?? b.price) - (a.sellingPrice ?? a.price)
      );
    } else if (sort === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sort === "featured") {
      filtered.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return { products: paginated, total };
  },

  async getProductById(id: string): Promise<ProductData | null> {
    if (await checkPrisma()) {
      try {
        const p = await prisma.product.findUnique({
          where: { id },
          include: { category: true },
        });
        if (p) {
          return {
            id: p.id,
            title: p.title,
            description: p.description,
            price: Number(p.price),
            mrp: Number((p as any).mrp ?? p.price),
            sellingPrice: Number((p as any).sellingPrice ?? p.price),
            costPrice: Number((p as any).costPrice ?? 0),
            stock: Number((p as any).stock ?? 50),
            gst: Number((p as any).gst ?? 18),
            hsn: (p as any).hsn || "330499",
            imageUrl: p.imageUrl,
            backImageUrl: (p as any).backImageUrl || undefined,
            textureImageUrl: (p as any).textureImageUrl || undefined,
            lifestyleImageUrl: (p as any).lifestyleImageUrl || undefined,
            categoryId: p.categoryId,
            categoryName: p.category?.name || "General",
            status: p.status as ProductStatus,
            isFeatured: p.isFeatured,
            ingredients: (p as any).ingredients || undefined,
            directions: (p as any).directions || undefined,
            warnings: (p as any).warnings || undefined,
            manufacturer: (p as any).manufacturer || undefined,
            rating: (p as any).rating ? Number((p as any).rating) : 4.9,
            reviewCount: (p as any).reviewCount ?? 120,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma getProductById fallback:", e);
      }
    }
    const store = getLocalStore();
    return (
      store.products.find(
        (p) =>
          p.id === id ||
          p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === id.toLowerCase()
      ) || null
    );
  },

  async createProduct(data: {
    title: string;
    description: string;
    price: number;
    mrp?: number;
    sellingPrice?: number;
    costPrice?: number;
    stock?: number;
    gst?: number;
    hsn?: string;
    imageUrl: string;
    backImageUrl?: string;
    textureImageUrl?: string;
    lifestyleImageUrl?: string;
    galleryImages?: string[];
    categoryId: string;
    status: ProductStatus;
    isFeatured: boolean;
    isBestSeller?: boolean;
    ingredients?: string;
    directions?: string;
    warnings?: string;
    manufacturer?: string;
    rating?: number;
    reviewCount?: number;
  }): Promise<ProductData> {
    const mrp = data.mrp ?? data.price;
    const sellingPrice = data.sellingPrice ?? data.price;
    const costPrice = data.costPrice ?? Math.round(data.price * 0.35);
    const stock = data.stock ?? 50;
    const gst = data.gst ?? 18;
    const hsn = data.hsn ?? "330499";

    if (await checkPrisma()) {
      try {
        const p = await prisma.product.create({
          data: {
            title: data.title,
            description: data.description,
            price: sellingPrice,
            mrp,
            sellingPrice,
            costPrice,
            stock,
            gst,
            hsn,
            imageUrl: data.imageUrl,
            backImageUrl: data.backImageUrl,
            textureImageUrl: data.textureImageUrl,
            lifestyleImageUrl: data.lifestyleImageUrl,
            categoryId: data.categoryId,
            status: data.status,
            isFeatured: data.isFeatured,
            isBestSeller: data.isBestSeller ?? false,
            ingredients: data.ingredients,
            directions: data.directions,
            warnings: data.warnings,
            manufacturer: data.manufacturer,
            rating: data.rating ?? 4.9,
            reviewCount: data.reviewCount ?? 120,
          },
          include: { category: true },
        });

        const createdProductData: ProductData = {
          id: p.id,
          title: p.title,
          description: p.description,
          price: Number(p.price),
          mrp: Number(p.mrp),
          sellingPrice: Number(p.sellingPrice),
          costPrice: Number(p.costPrice),
          stock: p.stock,
          gst: Number(p.gst),
          hsn: p.hsn,
          imageUrl: p.imageUrl,
          backImageUrl: p.backImageUrl || undefined,
          textureImageUrl: p.textureImageUrl || undefined,
          lifestyleImageUrl: p.lifestyleImageUrl || undefined,
          galleryImages: data.galleryImages || [p.imageUrl],
          categoryId: p.categoryId,
          categoryName: p.category?.name || "General",
          status: p.status as ProductStatus,
          isFeatured: p.isFeatured,
          isBestSeller: Boolean((p as any).isBestSeller),
          ingredients: p.ingredients || undefined,
          directions: p.directions || undefined,
          warnings: p.warnings || undefined,
          manufacturer: p.manufacturer || undefined,
          rating: p.rating ? Number(p.rating) : 4.9,
          reviewCount: p.reviewCount ?? 120,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };

        // Dual-sync to Firestore and in-memory store
        saveProductToFirestore(createdProductData as any).catch(() => {});
        const store = getLocalStore();
        store.products.unshift(createdProductData);
        saveLocalStore(store);

        return createdProductData;
      } catch (e) {
        console.warn("Prisma createProduct fallback:", e);
      }
    }

    const store = getLocalStore();
    const category = store.categories.find((c) => c.id === data.categoryId);
    const newProduct: ProductData = {
      id: `prod-${Date.now()}`,
      title: data.title,
      description: data.description,
      price: sellingPrice,
      mrp,
      sellingPrice,
      costPrice,
      stock,
      gst,
      hsn,
      imageUrl: data.imageUrl,
      backImageUrl: data.backImageUrl,
      textureImageUrl: data.textureImageUrl,
      lifestyleImageUrl: data.lifestyleImageUrl,
      galleryImages: data.galleryImages || [],
      categoryId: data.categoryId,
      categoryName: category?.name || "General",
      status: data.status,
      isFeatured: data.isFeatured,
      isBestSeller: Boolean(data.isBestSeller),
      ingredients: data.ingredients,
      directions: data.directions,
      warnings: data.warnings,
      manufacturer: data.manufacturer,
      rating: data.rating ?? 4.9,
      reviewCount: data.reviewCount ?? 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Dual-sync to Firestore
    saveProductToFirestore(newProduct as any).catch(() => {});
    store.products.unshift(newProduct);
    saveLocalStore(store);
    return newProduct;
  },

  async updateProduct(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      price: number;
      mrp: number;
      sellingPrice: number;
      costPrice: number;
      stock: number;
      gst: number;
      hsn: string;
      imageUrl: string;
      backImageUrl?: string;
      textureImageUrl?: string;
      lifestyleImageUrl?: string;
      galleryImages?: string[];
      categoryId: string;
      status: ProductStatus;
      isFeatured: boolean;
      isBestSeller: boolean;
      ingredients: string;
      directions: string;
      warnings: string;
      manufacturer: string;
      rating: number;
      reviewCount: number;
    }>
  ): Promise<ProductData | null> {
    if (await checkPrisma()) {
      try {
        const updatePayload: any = { ...data };
        if (data.sellingPrice !== undefined) {
          updatePayload.price = data.sellingPrice;
        }

        const p = await prisma.product.update({
          where: { id },
          data: updatePayload,
          include: { category: true },
        });

        const updatedData: ProductData = {
          id: p.id,
          title: p.title,
          description: p.description,
          price: Number(p.price),
          mrp: Number(p.mrp),
          sellingPrice: Number(p.sellingPrice),
          costPrice: Number(p.costPrice),
          stock: p.stock,
          gst: Number(p.gst),
          hsn: p.hsn,
          imageUrl: p.imageUrl,
          backImageUrl: p.backImageUrl || undefined,
          textureImageUrl: p.textureImageUrl || undefined,
          lifestyleImageUrl: p.lifestyleImageUrl || undefined,
          categoryId: p.categoryId,
          categoryName: p.category?.name || "General",
          status: p.status as ProductStatus,
          isFeatured: p.isFeatured,
          isBestSeller: Boolean((p as any).isBestSeller),
          ingredients: p.ingredients || undefined,
          directions: p.directions || undefined,
          warnings: p.warnings || undefined,
          manufacturer: p.manufacturer || undefined,
          rating: p.rating ? Number(p.rating) : 4.9,
          reviewCount: p.reviewCount ?? 120,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };

        // Dual-sync to Firestore and in-memory store
        saveProductToFirestore(updatedData as any).catch(() => {});
        const store = getLocalStore();
        const pIdx = store.products.findIndex((prod) => prod.id === id);
        if (pIdx !== -1) {
          store.products[pIdx] = { ...store.products[pIdx], ...updatedData };
          saveLocalStore(store);
        }

        return updatedData;
      } catch (e) {
        console.warn("Prisma updateProduct fallback:", e);
      }
    }

    const store = getLocalStore();
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const existing = store.products[idx];
    const category = data.categoryId
      ? store.categories.find((c) => c.id === data.categoryId)
      : undefined;

    const updated: ProductData = {
      ...existing,
      ...data,
      price: data.sellingPrice ?? data.price ?? existing.price,
      mrp: data.mrp ?? existing.mrp,
      sellingPrice: data.sellingPrice ?? existing.sellingPrice,
      costPrice: data.costPrice ?? existing.costPrice,
      stock: data.stock ?? existing.stock,
      gst: data.gst ?? existing.gst,
      hsn: data.hsn ?? existing.hsn,
      categoryName: category?.name || existing.categoryName,
      updatedAt: new Date().toISOString(),
    };

    saveProductToFirestore(updated as any).catch(() => {});
    store.products[idx] = updated;
    saveLocalStore(store);
    return updated;
  },

  async updateProductStatus(id: string, status: ProductStatus): Promise<ProductData | null> {
    return this.updateProduct(id, { status });
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (await checkPrisma()) {
      try {
        await prisma.product.delete({ where: { id } });
        deleteProductFromFirestore(id).catch(() => {});
        const store = getLocalStore();
        store.products = store.products.filter((p) => p.id !== id);
        saveLocalStore(store);
        return true;
      } catch (e) {
        console.warn("Prisma deleteProduct fallback:", e);
      }
    }
    deleteProductFromFirestore(id).catch(() => {});
    const store = getLocalStore();
    const prevLen = store.products.length;
    store.products = store.products.filter((p) => p.id !== id);
    saveLocalStore(store);
    return store.products.length < prevLen;
  },

  // --- Orders (OMS) ---
  async getOrders(options?: {
    status?: OrderStatus;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: OrderData[]; total: number }> {
    const { status, search, page = 1, limit = 50 } = options || {};

    if (await checkPrisma()) {
      try {
        const where: any = {};
        if (status) where.status = status;
        if (search) {
          where.OR = [
            { orderNumber: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search } },
          ];
        }

        const [items, total] = await Promise.all([
          prisma.order.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
          }),
          prisma.order.count({ where }),
        ]);

        return {
          orders: items.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            phone: o.phone,
            email: o.email || undefined,
            address: o.address,
            city: o.city || undefined,
            pincode: o.pincode || undefined,
            totalAmount: Number(o.totalAmount),
            status: o.status as OrderStatus,
            paymentMethod: o.paymentMethod,
            isManual: o.isManual,
            notes: o.notes || undefined,
            items: JSON.parse(o.itemsJson || "[]"),
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
          })),
          total,
        };
      } catch (e) {
        console.warn("Prisma getOrders fallback:", e);
      }
    }

    const store = getLocalStore();
    let filtered = [...store.orders];

    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q)
      );
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return { orders: paginated, total };
  },

  async getOrderById(id: string): Promise<OrderData | null> {
    if (await checkPrisma()) {
      try {
        const o = await prisma.order.findFirst({
          where: {
            OR: [{ id }, { orderNumber: id }],
          },
        });
        if (o) {
          return {
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            phone: o.phone,
            email: o.email || undefined,
            address: o.address,
            city: o.city || undefined,
            pincode: o.pincode || undefined,
            totalAmount: Number(o.totalAmount),
            status: o.status as OrderStatus,
            paymentMethod: o.paymentMethod,
            isManual: o.isManual,
            notes: o.notes || undefined,
            items: JSON.parse(o.itemsJson || "[]"),
            userId: o.userId || undefined,
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma getOrderById fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.orders.find((o) => o.id === id || o.orderNumber === id) || null;
  },

  async createManualOrder(data: {
    customerName: string;
    phone: string;
    email?: string;
    address: string;
    city?: string;
    pincode?: string;
    totalAmount: number;
    paymentMethod: string;
    notes?: string;
    items: OrderItemData[];
  }): Promise<OrderData> {
    const orderNumber = `DC-ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    if (await checkPrisma()) {
      try {
        const o = await prisma.order.create({
          data: {
            orderNumber,
            customerName: data.customerName,
            phone: data.phone,
            email: data.email,
            address: data.address,
            city: data.city,
            pincode: data.pincode,
            totalAmount: data.totalAmount,
            status: "PENDING",
            paymentMethod: data.paymentMethod || "WhatsApp / Manual",
            isManual: true,
            notes: data.notes,
            itemsJson: JSON.stringify(data.items),
          },
        });

        return {
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          phone: o.phone,
          email: o.email || undefined,
          address: o.address,
          city: o.city || undefined,
          pincode: o.pincode || undefined,
          totalAmount: Number(o.totalAmount),
          status: o.status as OrderStatus,
          paymentMethod: o.paymentMethod,
          isManual: o.isManual,
          notes: o.notes || undefined,
          items: data.items,
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma createManualOrder fallback:", e);
      }
    }

    const store = getLocalStore();
    const newOrder: OrderData = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerName: data.customerName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      totalAmount: data.totalAmount,
      status: "PENDING",
      paymentMethod: data.paymentMethod || "WhatsApp / Manual",
      isManual: true,
      notes: data.notes,
      items: data.items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.orders.unshift(newOrder);
    saveLocalStore(store);
    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderData | null> {
    if (await checkPrisma()) {
      try {
        const o = await prisma.order.update({
          where: { id },
          data: { status },
        });
        return {
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          phone: o.phone,
          email: o.email || undefined,
          address: o.address,
          city: o.city || undefined,
          pincode: o.pincode || undefined,
          totalAmount: Number(o.totalAmount),
          status: o.status as OrderStatus,
          paymentMethod: o.paymentMethod,
          isManual: o.isManual,
          notes: o.notes || undefined,
          items: JSON.parse(o.itemsJson || "[]"),
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updateOrderStatus fallback:", e);
      }
    }

    const store = getLocalStore();
    const idx = store.orders.findIndex((o) => o.id === id);
    if (idx === -1) return null;

    store.orders[idx].status = status;
    store.orders[idx].updatedAt = new Date().toISOString();
    saveLocalStore(store);
    return store.orders[idx];
  },

  // --- Customer Reviews ---
  async getReviews(options?: {
    status?: ReviewStatus;
    productId?: string;
  }): Promise<ReviewData[]> {
    const { status, productId } = options || {};

    if (await checkPrisma()) {
      try {
        const where: any = {};
        if (status) where.status = status;
        if (productId) where.productId = productId;

        const list = await prisma.review.findMany({
          where,
          include: { product: true },
          orderBy: { createdAt: "desc" },
        });

        return list.map((r) => ({
          id: r.id,
          customerName: r.customerName,
          rating: r.rating,
          comment: r.comment,
          productId: r.productId || undefined,
          productTitle: r.product?.title || undefined,
          status: r.status as ReviewStatus,
          adminReply: r.adminReply || undefined,
          verified: r.verified,
          createdAt: r.createdAt.toISOString(),
        }));
      } catch (e) {
        console.warn("Prisma getReviews fallback:", e);
      }
    }

    const store = getLocalStore();
    let filtered = [...store.reviews];
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (productId) {
      filtered = filtered.filter((r) => r.productId === productId);
    }
    return filtered;
  },

  async getApprovedReviews(limit: number = 8): Promise<ReviewData[]> {
    const all = await this.getReviews({ status: "APPROVED" });
    return all.slice(0, limit);
  },

  async createReview(data: {
    customerName: string;
    rating: number;
    comment: string;
    productId?: string;
    status?: ReviewStatus;
  }): Promise<ReviewData> {
    const status = data.status || "APPROVED";

    if (await checkPrisma()) {
      try {
        const r = await prisma.review.create({
          data: {
            customerName: data.customerName,
            rating: data.rating,
            comment: data.comment,
            productId: data.productId,
            status,
            verified: true,
          },
          include: { product: true },
        });

        return {
          id: r.id,
          customerName: r.customerName,
          rating: r.rating,
          comment: r.comment,
          productId: r.productId || undefined,
          productTitle: r.product?.title || undefined,
          status: r.status as ReviewStatus,
          adminReply: r.adminReply || undefined,
          verified: r.verified,
          createdAt: r.createdAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma createReview fallback:", e);
      }
    }

    const store = getLocalStore();
    const product = data.productId
      ? store.products.find((p) => p.id === data.productId)
      : undefined;

    const newReview: ReviewData = {
      id: `rev-${Date.now()}`,
      customerName: data.customerName,
      rating: data.rating,
      comment: data.comment,
      productId: data.productId,
      productTitle: product?.title,
      status,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    store.reviews.unshift(newReview);
    saveLocalStore(store);
    return newReview;
  },

  async updateReviewStatus(id: string, status: ReviewStatus): Promise<ReviewData | null> {
    if (await checkPrisma()) {
      try {
        const r = await prisma.review.update({
          where: { id },
          data: { status },
          include: { product: true },
        });
        return {
          id: r.id,
          customerName: r.customerName,
          rating: r.rating,
          comment: r.comment,
          productId: r.productId || undefined,
          productTitle: r.product?.title || undefined,
          status: r.status as ReviewStatus,
          adminReply: r.adminReply || undefined,
          verified: r.verified,
          createdAt: r.createdAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updateReviewStatus fallback:", e);
      }
    }

    const store = getLocalStore();
    const idx = store.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    store.reviews[idx].status = status;
    saveLocalStore(store);
    return store.reviews[idx];
  },

  async replyToReview(id: string, adminReply: string): Promise<ReviewData | null> {
    if (await checkPrisma()) {
      try {
        const r = await prisma.review.update({
          where: { id },
          data: { adminReply },
          include: { product: true },
        });
        return {
          id: r.id,
          customerName: r.customerName,
          rating: r.rating,
          comment: r.comment,
          productId: r.productId || undefined,
          productTitle: r.product?.title || undefined,
          status: r.status as ReviewStatus,
          adminReply: r.adminReply || undefined,
          verified: r.verified,
          createdAt: r.createdAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma replyToReview fallback:", e);
      }
    }

    const store = getLocalStore();
    const idx = store.reviews.findIndex((r) => r.id === id);
    if (idx === -1) return null;

    store.reviews[idx].adminReply = adminReply;
    saveLocalStore(store);
    return store.reviews[idx];
  },

  async deleteReview(id: string): Promise<boolean> {
    if (await checkPrisma()) {
      try {
        await prisma.review.delete({ where: { id } });
        return true;
      } catch (e) {
        console.warn("Prisma deleteReview fallback:", e);
      }
    }
    const store = getLocalStore();
    const prevLen = store.reviews.length;
    store.reviews = store.reviews.filter((r) => r.id !== id);
    saveLocalStore(store);
    return store.reviews.length < prevLen;
  },

  // --- Coupons & Promotions ---
  async getCoupons(): Promise<CouponData[]> {
    if (await checkPrisma()) {
      try {
        const list = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
        return list.map((c) => ({
          id: c.id,
          code: c.code,
          discountPercent: c.discountPercent,
          minOrderAmount: Number(c.minOrderAmount),
          freeGift: c.freeGift || undefined,
          isActive: c.isActive,
          createdAt: c.createdAt.toISOString(),
        }));
      } catch (e) {
        console.warn("Prisma getCoupons fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.coupons;
  },

  async createCoupon(data: {
    code: string;
    discountPercent: number;
    minOrderAmount: number;
    freeGift?: string;
  }): Promise<CouponData> {
    const code = data.code.trim().toUpperCase();

    if (await checkPrisma()) {
      try {
        const c = await prisma.coupon.create({
          data: {
            code,
            discountPercent: data.discountPercent,
            minOrderAmount: data.minOrderAmount,
            freeGift: data.freeGift,
            isActive: true,
          },
        });
        return {
          id: c.id,
          code: c.code,
          discountPercent: c.discountPercent,
          minOrderAmount: Number(c.minOrderAmount),
          freeGift: c.freeGift || undefined,
          isActive: c.isActive,
          createdAt: c.createdAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma createCoupon fallback:", e);
      }
    }

    const store = getLocalStore();
    const newCoupon: CouponData = {
      id: `coup-${Date.now()}`,
      code,
      discountPercent: data.discountPercent,
      minOrderAmount: data.minOrderAmount,
      freeGift: data.freeGift,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    store.coupons.unshift(newCoupon);
    saveLocalStore(store);
    return newCoupon;
  },

  async toggleCoupon(id: string, isActive: boolean): Promise<CouponData | null> {
    if (await checkPrisma()) {
      try {
        const c = await prisma.coupon.update({
          where: { id },
          data: { isActive },
        });
        return {
          id: c.id,
          code: c.code,
          discountPercent: c.discountPercent,
          minOrderAmount: Number(c.minOrderAmount),
          freeGift: c.freeGift || undefined,
          isActive: c.isActive,
          createdAt: c.createdAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma toggleCoupon fallback:", e);
      }
    }
    const store = getLocalStore();
    const idx = store.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    store.coupons[idx].isActive = isActive;
    saveLocalStore(store);
    return store.coupons[idx];
  },

  async deleteCoupon(id: string): Promise<boolean> {
    if (await checkPrisma()) {
      try {
        await prisma.coupon.delete({ where: { id } });
        return true;
      } catch (e) {
        console.warn("Prisma deleteCoupon fallback:", e);
      }
    }
    const store = getLocalStore();
    const prevLen = store.coupons.length;
    store.coupons = store.coupons.filter((c) => c.id !== id);
    saveLocalStore(store);
    return store.coupons.length < prevLen;
  },

  // --- Waitlist ---
  async addToWaitlist(
    param: string | { email: string; source?: string },
    optionalSource?: string
  ): Promise<{ success: boolean; isNew: boolean; entry: WaitlistData; waitlist: WaitlistData }> {
    const rawEmail = typeof param === "string" ? param : param.email;
    const source = typeof param === "string" ? (optionalSource || "Hero CTA") : (param.source || "Hero CTA");
    const cleanEmail = rawEmail.trim().toLowerCase();

    if (await checkPrisma()) {
      try {
        const existing = await prisma.waitlist.findUnique({ where: { email: cleanEmail } });
        if (existing) {
          const entry: WaitlistData = {
            id: existing.id,
            email: existing.email,
            createdAt: existing.createdAt.toISOString(),
            source: existing.source,
          };
          return {
            success: true,
            isNew: false,
            entry,
            waitlist: entry,
          };
        }
        const created = await prisma.waitlist.create({
          data: { email: cleanEmail, source },
        });
        const entry: WaitlistData = {
          id: created.id,
          email: created.email,
          createdAt: created.createdAt.toISOString(),
          source: created.source,
        };
        return {
          success: true,
          isNew: true,
          entry,
          waitlist: entry,
        };
      } catch (e) {
        console.warn("Prisma addToWaitlist fallback:", e);
      }
    }

    const store = getLocalStore();
    const existing = store.waitlist.find((w) => w.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: true, isNew: false, entry: existing, waitlist: existing };
    }

    const newWaitlist: WaitlistData = {
      id: `wait-${Date.now()}`,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
      source,
    };
    store.waitlist.unshift(newWaitlist);
    saveLocalStore(store);
    return { success: true, isNew: true, entry: newWaitlist, waitlist: newWaitlist };
  },

  async getWaitlist(): Promise<WaitlistData[]> {
    if (await checkPrisma()) {
      try {
        const list = await prisma.waitlist.findMany({ orderBy: { createdAt: "desc" } });
        return list.map((w) => ({
          id: w.id,
          email: w.email,
          createdAt: w.createdAt.toISOString(),
          source: w.source,
        }));
      } catch (e) {
        console.warn("Prisma getWaitlist fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.waitlist;
  },

  // --- Dashboard Stats (Comprehensive OMS Analytics) ---
  async getDashboardStats() {
    const productsRes = await this.getProducts({ limit: 1000 });
    const waitlist = await this.getWaitlist();
    const messages = await this.getContactMessages();
    const ordersRes = await this.getOrders({ limit: 1000 });
    const reviews = await this.getReviews();

    const comingSoonCount = productsRes.products.filter((p) => p.status === "COMING_SOON").length;
    const liveCount = productsRes.products.filter((p) => p.status === "LIVE").length;
    const draftCount = productsRes.products.filter((p) => p.status === "DRAFT").length;
    const featuredCount = productsRes.products.filter((p) => p.isFeatured).length;

    const totalOrders = ordersRes.total;
    const pendingOrders = ordersRes.orders.filter((o) => o.status === "PENDING").length;
    const totalRevenue = ordersRes.orders
      .filter((o) => o.status !== "RETURNED")
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const lowStockProducts = productsRes.products.filter((p) => p.stock < 10);
    const approvedReviewsCount = reviews.filter((r) => r.status === "APPROVED").length;
    const pendingReviewsCount = reviews.filter((r) => r.status === "PENDING").length;

    const recentActivity = [
      ...ordersRes.orders.slice(0, 4).map((o) => ({
        id: `act-o-${o.id}`,
        type: "order",
        title: `Order #${o.orderNumber}: ₹${o.totalAmount.toLocaleString("en-IN")}`,
        detail: `Client: ${o.customerName} (${o.status})`,
        time: o.createdAt,
      })),
      ...reviews.slice(0, 3).map((r) => ({
        id: `act-r-${r.id}`,
        type: "review",
        title: `Review: ${r.rating}★ by ${r.customerName}`,
        detail: `"${r.comment.slice(0, 40)}..."`,
        time: r.createdAt,
      })),
      ...waitlist.slice(0, 3).map((w) => ({
        id: `act-w-${w.id}`,
        type: "waitlist",
        title: `VIP Waitlist: ${w.email}`,
        detail: `Source: ${w.source}`,
        time: w.createdAt,
      })),
      ...messages.slice(0, 2).map((m) => ({
        id: `act-m-${m.id}`,
        type: "message",
        title: `Client Inquiry: ${m.name}`,
        detail: m.message.slice(0, 35) + "...",
        time: m.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);

    return {
      totalProducts: productsRes.total,
      totalWaitlist: waitlist.length,
      totalMessages: messages.length,
      totalOrders,
      pendingOrders,
      totalRevenue,
      lowStockCount: lowStockProducts.length,
      approvedReviewsCount,
      pendingReviewsCount,
      comingSoonCount,
      liveCount,
      draftCount,
      featuredCount,
      recentActivity,
    };
  },

  // --- Auth & User Management ---
  async findAdminByEmail(email: string): Promise<UserData | null> {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Dynamic Environment Variable Administrator (Vercel / .env)
    const envAdminEmail = (
      process.env.ADMIN_EMAIL ||
      process.env.DEFAULT_ADMIN_EMAIL ||
      process.env.VITE_ADMIN_EMAIL ||
      ""
    ).trim().toLowerCase();
    const envAdminPass = (
      process.env.ADMIN_PASSWORD ||
      process.env.DEFAULT_ADMIN_PASSWORD ||
      process.env.VITE_ADMIN_PASSWORD ||
      ""
    ).trim();

    if (envAdminEmail && cleanEmail === envAdminEmail) {
      const pass = envAdminPass || "Ram@7877545471";
      return {
        id: "admin-env",
        email: envAdminEmail,
        passwordHash: bcrypt.hashSync(pass, 10),
        name: "Pritesh Suthar (Executive Admin)",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      };
    }

    // 2. Owner Administrator account (sutharpritesh7877@gmail.com)
    if (cleanEmail === "sutharpritesh7877@gmail.com") {
      const pass = envAdminPass || "Ram@7877545471";
      return {
        id: "admin-pritesh",
        email: "sutharpritesh7877@gmail.com",
        passwordHash: bcrypt.hashSync(pass, 10),
        name: "Pritesh Suthar (Owner & Executive Admin)",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      };
    }

    // 3. Built-in Duck Atelier Admin fallback
    if (cleanEmail === "admin@duckcosmetics.com") {
      return {
        id: "admin-default",
        email: "admin@duckcosmetics.com",
        passwordHash: bcrypt.hashSync("DuckAdmin2026!", 10),
        name: "Duck Executive Admin",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      };
    }

    // 4. Prisma database check
    if (await checkPrisma()) {
      try {
        const u = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (u) {
          return {
            id: u.id,
            email: u.email,
            passwordHash: u.passwordHash,
            name: u.name || undefined,
            role: u.role as any,
            createdAt: u.createdAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma findAdminByEmail fallback:", e);
      }
    }

    // 5. Local JSON datastore lookup
    const store = getLocalStore();
    return store.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async findUserByEmail(email: string): Promise<UserData | null> {
    const cleanEmail = email.trim().toLowerCase();

    // Owner administrator account access
    if (cleanEmail === "sutharpritesh7877@gmail.com") {
      const pass =
        process.env.ADMIN_PASSWORD ||
        process.env.DEFAULT_ADMIN_PASSWORD ||
        process.env.VITE_ADMIN_PASSWORD ||
        "Ram@7877545471";
      return {
        id: "admin-pritesh",
        email: "sutharpritesh7877@gmail.com",
        passwordHash: bcrypt.hashSync(pass, 10),
        name: "Pritesh Suthar",
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      };
    }

    if (await checkPrisma()) {
      try {
        const u = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (u) {
          return {
            id: u.id,
            email: u.email,
            passwordHash: u.passwordHash,
            name: u.name || undefined,
            role: u.role as any,
            resetToken: (u as any).resetToken || undefined,
            resetTokenExpiry: (u as any).resetTokenExpiry ? (u as any).resetTokenExpiry.toISOString() : undefined,
            createdAt: u.createdAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma findUserByEmail fallback:", e);
      }
    }
    const store = getLocalStore();
    return store.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  async createCustomerUser(data: { name?: string; email: string; passwordHash: string }): Promise<UserData> {
    const cleanEmail = data.email.trim().toLowerCase();
    const newUser: UserData = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      name: data.name?.trim() || cleanEmail.split("@")[0],
      passwordHash: data.passwordHash,
      role: "USER",
      createdAt: new Date().toISOString(),
    };

    if (await checkPrisma()) {
      try {
        const created = await prisma.user.create({
          data: {
            email: cleanEmail,
            name: newUser.name,
            passwordHash: data.passwordHash,
            role: "USER",
          },
        });
        return {
          id: created.id,
          email: created.email,
          name: created.name || undefined,
          passwordHash: created.passwordHash,
          role: created.role as any,
          createdAt: created.createdAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma createCustomerUser fallback:", e);
      }
    }

    const store = getLocalStore();
    store.users = store.users.filter((u) => u.email.toLowerCase() !== cleanEmail);
    store.users.push(newUser);
    saveLocalStore(store);
    return newUser;
  },

  async createPasswordResetToken(email: string): Promise<{ token: string; user: UserData } | null> {
    const cleanEmail = email.trim().toLowerCase();
    const store = getLocalStore();
    const userIndex = store.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (userIndex === -1) {
      return null;
    }

    // Generate random 40-character hex token
    const token = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    // Strict 15-minute token expiry
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    store.users[userIndex].resetToken = token;
    store.users[userIndex].resetTokenExpiry = expiry;
    saveLocalStore(store);

    return { token, user: store.users[userIndex] };
  },

  async verifyPasswordResetToken(token: string): Promise<UserData | null> {
    if (!token || token.length < 10) return null;
    const store = getLocalStore();
    const user = store.users.find((u) => u.resetToken === token);

    if (!user || !user.resetTokenExpiry) {
      return null;
    }

    if (new Date(user.resetTokenExpiry).getTime() < Date.now()) {
      return null; // Token expired
    }

    return user;
  },

  async resetUserPassword(token: string, newPasswordHash: string): Promise<boolean> {
    const store = getLocalStore();
    const userIndex = store.users.findIndex((u) => u.resetToken === token);

    if (userIndex === -1) return false;

    const user = store.users[userIndex];
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry).getTime() < Date.now()) {
      return false; // Token expired
    }

    store.users[userIndex].passwordHash = newPasswordHash;
    delete store.users[userIndex].resetToken;
    delete store.users[userIndex].resetTokenExpiry;
    saveLocalStore(store);

    if (await checkPrisma()) {
      try {
        await prisma.user.update({
          where: { email: user.email },
          data: { passwordHash: newPasswordHash },
        });
      } catch (e) {
        console.warn("Prisma resetUserPassword update warning:", e);
      }
    }

    return true;
  },

  // --- Payment Gateways & Shipping Zones (Admin Config) ---
  async getPaymentGateways(): Promise<PaymentGatewaysData> {
    const settings = await this.getSiteSettings();
    return settings.paymentGateways || DEFAULT_SETTINGS.paymentGateways || {};
  },

  async updatePaymentGateways(gateways: PaymentGatewaysData): Promise<PaymentGatewaysData> {
    const store = getLocalStore();
    const current = store.siteSettings || DEFAULT_SETTINGS;
    current.paymentGateways = { ...(current.paymentGateways || {}), ...gateways };
    current.updatedAt = new Date().toISOString();
    store.siteSettings = current;
    saveLocalStore(store);
    return current.paymentGateways;
  },

  async getShippingZones(): Promise<ShippingZonesData> {
    const settings = await this.getSiteSettings();
    return settings.shippingZones || DEFAULT_SETTINGS.shippingZones || {};
  },

  async updateShippingZones(zones: ShippingZonesData): Promise<ShippingZonesData> {
    const store = getLocalStore();
    const current = store.siteSettings || DEFAULT_SETTINGS;
    current.shippingZones = { ...(current.shippingZones || {}), ...zones };
    current.updatedAt = new Date().toISOString();
    store.siteSettings = current;
    saveLocalStore(store);
    return current.shippingZones;
  },

  async updateGlobalRouting(routing: any): Promise<any> {
    const store = getLocalStore();
    const current = store.siteSettings || DEFAULT_SETTINGS;
    current.globalRouting = { ...(current.globalRouting || {}), ...routing };
    if (routing.baseCurrency) {
      current.baseCurrency = routing.baseCurrency;
    }
    if (routing.usdToInrRate) {
      current.exchangeRateInrToUsd = 1 / Number(routing.usdToInrRate);
    }
    current.updatedAt = new Date().toISOString();
    store.siteSettings = current;
    saveLocalStore(store);
    return current.globalRouting;
  },

  // --- Smart FAQ Concierge (Self-Contained Q&A Engine) ---
  async getFaqs(activeOnly = false): Promise<FaqItemData[]> {
    const store = getLocalStore();
    const list = store.faqs || DEFAULT_FAQS;
    const filtered = activeOnly ? list.filter((f) => f.isActive) : list;
    return filtered.sort((a, b) => a.order - b.order);
  },

  async createFaq(data: {
    question: string;
    answer: string;
    isActive?: boolean;
    order?: number;
    tags?: string[];
  }): Promise<FaqItemData> {
    const store = getLocalStore();
    if (!store.faqs) store.faqs = [...DEFAULT_FAQS];

    const newFaq: FaqItemData = {
      id: `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      question: data.question.trim(),
      answer: data.answer.trim(),
      isActive: data.isActive !== undefined ? data.isActive : true,
      order: data.order !== undefined ? data.order : store.faqs.length + 1,
      tags: data.tags || data.question.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
      createdAt: new Date().toISOString(),
    };

    store.faqs.push(newFaq);
    saveLocalStore(store);
    return newFaq;
  },

  async updateFaq(id: string, data: Partial<FaqItemData>): Promise<FaqItemData | null> {
    const store = getLocalStore();
    if (!store.faqs) store.faqs = [...DEFAULT_FAQS];

    const index = store.faqs.findIndex((f) => f.id === id);
    if (index === -1) return null;

    store.faqs[index] = {
      ...store.faqs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveLocalStore(store);
    return store.faqs[index];
  },

  async deleteFaq(id: string): Promise<boolean> {
    const store = getLocalStore();
    if (!store.faqs) return false;

    const initialLen = store.faqs.length;
    store.faqs = store.faqs.filter((f) => f.id !== id);

    if (store.faqs.length < initialLen) {
      saveLocalStore(store);
      return true;
    }
    return false;
  },

  // --- AI Concierge Pre-Loaded Q&A Management ---
  async getConciergeQAs(options?: { activeOnly?: boolean; search?: string }): Promise<ConciergeQAData[]> {
    if (await checkPrisma()) {
      try {
        const list = await prisma.conciergeQA.findMany({
          where: {
            ...(options?.activeOnly ? { isActive: true } : {}),
            ...(options?.search ? {
              OR: [
                { question: { contains: options.search, mode: "insensitive" } },
                { answer: { contains: options.search, mode: "insensitive" } },
              ]
            } : {}),
          },
          orderBy: { order: "asc" },
        });
        if (list && list.length > 0) {
          return list.map((q) => ({
            id: q.id,
            question: q.question,
            answer: q.answer,
            isActive: q.isActive,
            order: q.order,
            createdAt: q.createdAt.toISOString(),
            updatedAt: q.updatedAt.toISOString(),
          }));
        }
      } catch (e) {
        console.warn("Prisma getConciergeQAs fallback:", e);
      }
    }

    const store = getLocalStore();
    let list = store.conciergeQAs || DEFAULT_CONCIERGE_QAS;
    if (options?.activeOnly) {
      list = list.filter((q) => q.isActive);
    }
    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter((item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return [...list].sort((a, b) => a.order - b.order);
  },

  async createConciergeQA(data: {
    question: string;
    answer: string;
    isActive?: boolean;
    order?: number;
    tags?: string[];
  }): Promise<ConciergeQAData> {
    const isActive = data.isActive !== undefined ? data.isActive : true;
    const order = data.order !== undefined ? Number(data.order) : 0;

    if (await checkPrisma()) {
      try {
        const created = await prisma.conciergeQA.create({
          data: {
            question: data.question.trim(),
            answer: data.answer.trim(),
            isActive,
            order,
          },
        });
        return {
          id: created.id,
          question: created.question,
          answer: created.answer,
          isActive: created.isActive,
          order: created.order,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma createConciergeQA fallback:", e);
      }
    }

    const store = getLocalStore();
    if (!store.conciergeQAs) store.conciergeQAs = [...DEFAULT_CONCIERGE_QAS];

    const newQA: ConciergeQAData = {
      id: `cqa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      question: data.question.trim(),
      answer: data.answer.trim(),
      isActive,
      order: order || store.conciergeQAs.length + 1,
      tags: data.tags || data.question.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.conciergeQAs.push(newQA);
    saveLocalStore(store);
    return newQA;
  },

  async updateConciergeQA(id: string, data: Partial<ConciergeQAData>): Promise<ConciergeQAData | null> {
    if (await checkPrisma()) {
      try {
        const updated = await prisma.conciergeQA.update({
          where: { id },
          data: {
            ...(data.question ? { question: data.question.trim() } : {}),
            ...(data.answer ? { answer: data.answer.trim() } : {}),
            ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
            ...(data.order !== undefined ? { order: Number(data.order) } : {}),
          },
        });
        return {
          id: updated.id,
          question: updated.question,
          answer: updated.answer,
          isActive: updated.isActive,
          order: updated.order,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updateConciergeQA fallback:", e);
      }
    }

    const store = getLocalStore();
    if (!store.conciergeQAs) store.conciergeQAs = [...DEFAULT_CONCIERGE_QAS];

    const index = store.conciergeQAs.findIndex((q) => q.id === id);
    if (index === -1) return null;

    store.conciergeQAs[index] = {
      ...store.conciergeQAs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveLocalStore(store);
    return store.conciergeQAs[index];
  },

  async deleteConciergeQA(id: string): Promise<boolean> {
    if (await checkPrisma()) {
      try {
        await prisma.conciergeQA.delete({ where: { id } });
        return true;
      } catch (e) {
        console.warn("Prisma deleteConciergeQA fallback:", e);
      }
    }

    const store = getLocalStore();
    if (!store.conciergeQAs) return false;

    const initialLen = store.conciergeQAs.length;
    store.conciergeQAs = store.conciergeQAs.filter((q) => q.id !== id);

    if (store.conciergeQAs.length < initialLen) {
      saveLocalStore(store);
      return true;
    }
    return false;
  },

  // --- Customer Account Dashboard Services ---
  async getUserProfile(userId: string): Promise<UserData | null> {
    if (await checkPrisma()) {
      try {
        const u = await prisma.user.findUnique({ where: { id: userId } });
        if (u) {
          return {
            id: u.id,
            email: u.email,
            name: u.name || undefined,
            phoneNumber: u.phoneNumber || undefined,
            role: u.role as any,
            passwordHash: u.passwordHash,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
      } catch (e) {
        console.warn("Prisma getUserProfile fallback:", e);
      }
    }
    const store = getLocalStore();
    const user = store.users.find((u) => u.id === userId || u.email === userId);
    return user || null;
  },

  async updateUserProfile(userId: string, data: { name?: string; email?: string; phoneNumber?: string }): Promise<UserData | null> {
    if (await checkPrisma()) {
      try {
        const u = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(data.name !== undefined ? { name: data.name } : {}),
            ...(data.email !== undefined ? { email: data.email.toLowerCase().trim() } : {}),
            ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
          },
        });
        return {
          id: u.id,
          email: u.email,
          name: u.name || undefined,
          phoneNumber: u.phoneNumber || undefined,
          role: u.role as any,
          passwordHash: u.passwordHash,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updateUserProfile fallback:", e);
      }
    }
    const store = getLocalStore();
    const index = store.users.findIndex((u) => u.id === userId || u.email === userId);
    if (index === -1) return null;
    store.users[index] = {
      ...store.users[index],
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.email !== undefined ? { email: data.email.toLowerCase().trim() } : {}),
      ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(store);
    return store.users[index];
  },

  async updateUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
    if (await checkPrisma()) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { passwordHash: newPasswordHash },
        });
        return true;
      } catch (e) {
        console.warn("Prisma updateUserPassword fallback:", e);
      }
    }
    const store = getLocalStore();
    const index = store.users.findIndex((u) => u.id === userId || u.email === userId);
    if (index === -1) return false;
    store.users[index].passwordHash = newPasswordHash;
    store.users[index].updatedAt = new Date().toISOString();
    saveLocalStore(store);
    return true;
  },

  async getUserOrders(userId: string, userEmail?: string): Promise<OrderData[]> {
    if (await checkPrisma()) {
      try {
        const list = await prisma.order.findMany({
          where: {
            OR: [
              { userId },
              ...(userEmail ? [{ email: { equals: userEmail, mode: "insensitive" as const } }] : []),
            ],
          },
          orderBy: { createdAt: "desc" },
        });
        if (list && list.length > 0) {
          return list.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            phone: o.phone,
            email: o.email || undefined,
            address: o.address,
            city: o.city || undefined,
            pincode: o.pincode || undefined,
            totalAmount: Number(o.totalAmount),
            status: o.status as OrderStatus,
            paymentMethod: o.paymentMethod,
            isManual: o.isManual,
            notes: o.notes || undefined,
            items: JSON.parse(o.itemsJson || "[]"),
            userId: o.userId || undefined,
            createdAt: o.createdAt.toISOString(),
            updatedAt: o.updatedAt.toISOString(),
          }));
        }
      } catch (e) {
        console.warn("Prisma getUserOrders fallback:", e);
      }
    }
    const store = getLocalStore();
    const lowerEmail = userEmail?.toLowerCase().trim();
    return store.orders
      .filter((o) => o.userId === userId || (lowerEmail && o.email?.toLowerCase().trim() === lowerEmail))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getUserAddresses(userId: string): Promise<AddressData[]> {
    if (await checkPrisma()) {
      try {
        const list = await prisma.address.findMany({
          where: { userId },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        });
        return list.map((a) => ({
          id: a.id,
          userId: a.userId,
          type: a.type as "SHIPPING" | "BILLING",
          isDefault: a.isDefault,
          name: a.name,
          phone: a.phone,
          street1: a.street1,
          street2: a.street2 || undefined,
          city: a.city,
          state: a.state,
          zip: a.zip,
          country: a.country,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        }));
      } catch (e) {
        console.warn("Prisma getUserAddresses fallback:", e);
      }
    }
    const store = getLocalStore();
    return (store.addresses || [])
      .filter((a) => a.userId === userId)
      .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  },

  async createAddress(userId: string, data: Omit<AddressData, "id" | "userId" | "createdAt" | "updatedAt">): Promise<AddressData> {
    if (await checkPrisma()) {
      try {
        if (data.isDefault) {
          await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
          });
        }
        const created = await prisma.address.create({
          data: {
            userId,
            name: data.name.trim(),
            phone: data.phone.trim(),
            street1: data.street1.trim(),
            street2: data.street2 ? data.street2.trim() : null,
            city: data.city.trim(),
            state: data.state.trim(),
            zip: data.zip.trim(),
            country: data.country || "India",
            type: (data.type as any) || "SHIPPING",
            isDefault: Boolean(data.isDefault),
          },
        });
        return {
          id: created.id,
          userId: created.userId,
          type: created.type as any,
          isDefault: created.isDefault,
          name: created.name,
          phone: created.phone,
          street1: created.street1,
          street2: created.street2 || undefined,
          city: created.city,
          state: created.state,
          zip: created.zip,
          country: created.country,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma createAddress fallback:", e);
      }
    }
    const store = getLocalStore();
    if (!store.addresses) store.addresses = [];
    if (data.isDefault) {
      store.addresses.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }
    const newAddress: AddressData = {
      id: `addr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      ...data,
      isDefault: Boolean(data.isDefault) || store.addresses.filter((a) => a.userId === userId).length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.addresses.push(newAddress);
    saveLocalStore(store);
    return newAddress;
  },

  async updateAddress(id: string, userId: string, data: Partial<AddressData>): Promise<AddressData | null> {
    if (await checkPrisma()) {
      try {
        if (data.isDefault) {
          await prisma.address.updateMany({
            where: { userId },
            data: { isDefault: false },
          });
        }
        const updated = await prisma.address.update({
          where: { id },
          data: {
            ...(data.name ? { name: data.name.trim() } : {}),
            ...(data.phone ? { phone: data.phone.trim() } : {}),
            ...(data.street1 ? { street1: data.street1.trim() } : {}),
            ...(data.street2 !== undefined ? { street2: data.street2 ? data.street2.trim() : null } : {}),
            ...(data.city ? { city: data.city.trim() } : {}),
            ...(data.state ? { state: data.state.trim() } : {}),
            ...(data.zip ? { zip: data.zip.trim() } : {}),
            ...(data.country ? { country: data.country } : {}),
            ...(data.type ? { type: data.type as any } : {}),
            ...(data.isDefault !== undefined ? { isDefault: data.isDefault } : {}),
          },
        });
        return {
          id: updated.id,
          userId: updated.userId,
          type: updated.type as any,
          isDefault: updated.isDefault,
          name: updated.name,
          phone: updated.phone,
          street1: updated.street1,
          street2: updated.street2 || undefined,
          city: updated.city,
          state: updated.state,
          zip: updated.zip,
          country: updated.country,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        };
      } catch (e) {
        console.warn("Prisma updateAddress fallback:", e);
      }
    }
    const store = getLocalStore();
    if (!store.addresses) return null;
    const index = store.addresses.findIndex((a) => a.id === id && a.userId === userId);
    if (index === -1) return null;
    if (data.isDefault) {
      store.addresses.forEach((a) => {
        if (a.userId === userId) a.isDefault = false;
      });
    }
    store.addresses[index] = {
      ...store.addresses[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveLocalStore(store);
    return store.addresses[index];
  },

  async deleteAddress(id: string, userId: string): Promise<boolean> {
    if (await checkPrisma()) {
      try {
        await prisma.address.delete({ where: { id } });
        return true;
      } catch (e) {
        console.warn("Prisma deleteAddress fallback:", e);
      }
    }
    const store = getLocalStore();
    if (!store.addresses) return false;
    const len = store.addresses.length;
    store.addresses = store.addresses.filter((a) => !(a.id === id && a.userId === userId));
    if (store.addresses.length < len) {
      saveLocalStore(store);
      return true;
    }
    return false;
  },

  async setDefaultAddress(id: string, userId: string): Promise<boolean> {
    return !!(await this.updateAddress(id, userId, { isDefault: true }));
  },

  async getUserWishlist(userId: string): Promise<ProductData[]> {
    if (await checkPrisma()) {
      try {
        const items = await prisma.wishlist.findMany({
          where: { userId },
          include: { product: { include: { category: true } } },
          orderBy: { createdAt: "desc" },
        });
        if (items && items.length > 0) {
          return items.map((item) => {
            const p = item.product;
            return {
              id: p.id,
              title: p.title,
              description: p.description,
              price: Number(p.price),
              mrp: Number(p.mrp),
              sellingPrice: Number(p.sellingPrice),
              costPrice: Number(p.costPrice),
              stock: p.stock,
              gst: Number(p.gst),
              hsn: p.hsn,
              imageUrl: p.imageUrl,
              backImageUrl: p.backImageUrl || undefined,
              textureImageUrl: p.textureImageUrl || undefined,
              lifestyleImageUrl: p.lifestyleImageUrl || undefined,
              categoryId: p.categoryId,
              category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : undefined,
              status: p.status as ProductStatus,
              isFeatured: p.isFeatured,
              isBestSeller: p.isBestSeller,
              rating: p.rating ? Number(p.rating) : 4.9,
              reviewCount: p.reviewCount || 120,
              createdAt: p.createdAt.toISOString(),
              updatedAt: p.updatedAt.toISOString(),
            };
          });
        }
      } catch (e) {
        console.warn("Prisma getUserWishlist fallback:", e);
      }
    }
    const store = getLocalStore();
    const wishItems = (store.wishlists || []).filter((w) => w.userId === userId);
    const productIds = new Set(wishItems.map((w) => w.productId));
    return store.products.filter((p) => productIds.has(p.id));
  },

  async toggleWishlist(userId: string, productId: string): Promise<{ inWishlist: boolean; count: number }> {
    if (await checkPrisma()) {
      try {
        const existing = await prisma.wishlist.findUnique({
          where: {
            userId_productId: { userId, productId },
          },
        });
        if (existing) {
          await prisma.wishlist.delete({
            where: { id: existing.id },
          });
          const count = await prisma.wishlist.count({ where: { userId } });
          return { inWishlist: false, count };
        } else {
          await prisma.wishlist.create({
            data: { userId, productId },
          });
          const count = await prisma.wishlist.count({ where: { userId } });
          return { inWishlist: true, count };
        }
      } catch (e) {
        console.warn("Prisma toggleWishlist fallback:", e);
      }
    }
    const store = getLocalStore();
    if (!store.wishlists) store.wishlists = [];
    const index = store.wishlists.findIndex((w) => w.userId === userId && w.productId === productId);
    let inWishlist = false;
    if (index >= 0) {
      store.wishlists.splice(index, 1);
      inWishlist = false;
    } else {
      store.wishlists.push({
        id: `wsh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        productId,
        createdAt: new Date().toISOString(),
      });
      inWishlist = true;
    }
    saveLocalStore(store);
    const count = store.wishlists.filter((w) => w.userId === userId).length;
    return { inWishlist, count };
  },

  async getVipWaitlistStatus(email?: string, userId?: string): Promise<{ isVip: boolean; position: number; totalWaitlist: number }> {
    const store = getLocalStore();
    const waitlist = store.waitlist || [];
    const totalWaitlist = Math.max(waitlist.length + 1400, 1402);

    if (!email && !userId) {
      return { isVip: true, position: 1402, totalWaitlist };
    }

    const cleanEmail = email?.toLowerCase().trim();
    const index = waitlist.findIndex((w) => w.email.toLowerCase().trim() === cleanEmail);
    if (index >= 0) {
      return { isVip: true, position: index + 1, totalWaitlist };
    }
    let hash = 0;
    const str = cleanEmail || userId || "vip";
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const position = Math.abs(hash % 900) + 100;
    return { isVip: true, position, totalWaitlist };
  },
};
