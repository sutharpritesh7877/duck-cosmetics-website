import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { db } from "./backend/db";
import { orderService } from "./backend/orderService";
import { authService } from "./backend/authService";
import { AdminLayout } from "./components/admin/AdminLayout";
import { StaffLoginModal } from "./components/admin/StaffLoginModal";
import { Order, ProductItem, PaymentMethod, CategoryMeta } from "./types";
import { sanitizeText, isValidEmail, isValidPhone, isValidPinCode } from "./utils/sanitize";
import { auth, firestoreDb, isFirebaseConfigured, getFirebaseConfigStatus } from "./lib/firebase";
import { onAuthStateChanged, isSignInWithEmailLink } from "firebase/auth";
import { collection, doc, onSnapshot } from "firebase/firestore";
import {
  fetchActiveProductsFromFirestore,
  fetchCategoriesFromFirestore,
  fetchSiteSettingsFromFirestore,
  placeOrderToFirestore,
  signUpWithEmailPassword,
  loginWithEmailPassword,
  loginWithGoogle,
  sendEmailMagicLink,
  completeEmailMagicLink,
  fetchUserProfileFromFirestore,
  saveUserProfileToFirestore,
  fetchCustomerOrdersFromFirestore,
  signOutFirebase,
} from "./backend/firebaseService";

type Category = string;

type Product = {
  id?: string;
  name: string;
  category: Category;
  detail: string;
  price: string;
  image: string;
  images?: string[];
  badge?: string;
  stock?: number;
  lowStockThreshold?: number;
  sku?: string;
  gstRate?: number;
  mrp?: number;
};

type ChatMessage = { role: "assistant" | "user"; text: string };
type AccountScreen = "login" | "signup" | "verify" | "profile" | "orders";
type PolicyScreen = "privacy" | "terms" | "shipping" | "returns" | "faq";

const DEFAULT_CATEGORIES: { name: Category; line: string; image: string; tone: string }[] = [
  {
    name: "Baby Care",
    line: "Gentle from day one",
    image: "https://images.unsplash.com/photo-1686831889383-290d9bab10e6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-lilac",
  },
  {
    name: "Face Wash",
    line: "Fresh, balanced skin",
    image: "https://images.unsplash.com/photo-1617858123189-b26eb62d8eb4?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-mint",
  },
  {
    name: "Vapor Rub",
    line: "Breathe easy comfort",
    image: "https://images.unsplash.com/photo-1671493234254-15fc6c91aa87?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-sky",
  },
  {
    name: "Ortho Pain Oil",
    line: "Herbal everyday relief",
    image: "https://images.unsplash.com/photo-1671493229066-f36e86b35841?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-sage",
  },
  {
    name: "Cosmetics",
    line: "Color that feels good",
    image: "https://images.unsplash.com/photo-1643168186368-c42359c82573?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800",
    tone: "bg-blush",
  },
];

const productInformation: Record<Category, { ingredients: string; directions: string; warning: string }> = {
  "Baby Care": {
    ingredients: "Purified water, oat extract, calendula, glycerin, shea butter and vitamin E.",
    directions: "Apply a small amount to wet skin or massage gently onto clean, dry skin as required.",
    warning: "For external use only. Keep away from eyes. Adult supervision is recommended.",
  },
  "Face Wash": {
    ingredients: "Purified water, aloe vera, green tea extract, glycerin and mild plant-based cleansers.",
    directions: "Massage onto a damp face for 30 seconds and rinse thoroughly. Use morning and evening.",
    warning: "Patch test before first use. Stop use if irritation occurs.",
  },
  "Vapor Rub": {
    ingredients: "Eucalyptus oil, menthol, camphor, mint oil and a soothing balm base.",
    directions: "Apply a small amount externally to the chest, throat or back as directed on the label.",
    warning: "Do not ingest or apply inside nostrils. Not suitable for children under the labelled age.",
  },
  "Ortho Pain Oil": {
    ingredients: "Sesame oil, wintergreen, eucalyptus, camphor and a blend of botanical extracts.",
    directions: "Massage gently into the required area for 3–5 minutes, up to three times daily.",
    warning: "For external use only. Do not apply to broken skin. Consult a doctor during pregnancy.",
  },
  Cosmetics: {
    ingredients: "Skin-safe pigments, vitamin E, plant waxes and conditioning emollients.",
    directions: "Apply to clean skin and blend as desired. Remove fully before sleeping.",
    warning: "Patch test before use. Store away from direct sunlight and excessive heat.",
  },
};

const policyContent: Record<PolicyScreen, { title: string; intro: string; points: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    intro: "How Duck Cosmetics handles customer and order information.",
    points: [
      "We collect only the information required to process orders, provide support, and improve your shopping experience.",
      "Payment credentials are handled by the configured payment provider and are never stored directly by Duck Cosmetics.",
      "Customers may request access, correction, or deletion of eligible personal information by contacting crm@duckcosmetics.in.",
    ],
  },
  terms: {
    title: "Terms and Conditions",
    intro: "The terms that apply when using the Duck Cosmetics store.",
    points: [
      "Product availability, prices, promotions, and delivery estimates may change before an order is confirmed.",
      "Customers must provide accurate contact, delivery, and payment information.",
      "Final product labels, warnings, and directions should always be reviewed before use.",
    ],
  },
  shipping: {
    title: "Shipping Policy",
    intro: "Clear delivery information for orders shipped within India.",
    points: [
      "Standard shipping is ₹79 and is complimentary for eligible orders above ₹999.",
      "Delivery availability and estimates depend on the destination PIN code and are confirmed during checkout.",
      "Tracking information is shared after the order is packed and handed to the delivery partner.",
    ],
  },
  returns: {
    title: "Returns and Refunds",
    intro: "Guidance for requesting a return or refund.",
    points: [
      "Eligible unopened and unused products may be returned within 7 days of delivery.",
      "Damaged, missing, or incorrect items should be reported promptly with the order number and supporting photographs.",
      "Approved refunds are returned through the original payment method according to payment-provider timelines.",
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    intro: "Quick answers about shopping with Duck Cosmetics.",
    points: [
      "Add any qualifying cosmetic to your cart to unlock the complimentary Face Wash offer.",
      "Use the PIN-code checker on a product page or during checkout to confirm delivery availability.",
      "Order status, tracking, cancellation, and eligible returns are available from My Orders after signing in.",
    ],
  },
};

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M4 12h15M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
      <path d="M5.5 8.5h13l-1 12h-11l-1-12ZM9 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ProductVisual({ product, compact = false, view = 0 }: { product: Product; compact?: boolean; view?: number }) {
  const activeImage = (product.images && product.images[view]) || product.images?.[0] || product.image;

  if (activeImage && activeImage.trim().length > 5) {
    return (
      <div
        className={`relative h-full w-full overflow-hidden flex items-center justify-center bg-canvas/60 ${compact ? "p-1" : "p-3"}`}
        role="img"
        aria-label={`${product.name} ${["front label", "back label", "texture", "packaging", "in use"][view] || "product view"}`}
      >
        <img
          src={activeImage}
          alt={product.name}
          className={`h-full w-full object-cover rounded-2xl transition duration-500 ${compact ? "" : "group-hover:scale-105"}`}
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      </div>
    );
  }

  const productClass = {
    "Baby Care": "mock-baby",
    "Face Wash": "mock-face",
    "Vapor Rub": "mock-vapor",
    "Ortho Pain Oil": "mock-ortho",
    Cosmetics: "mock-cosmetic",
  }[product.category] || "mock-face";

  return (
    <div className={`mockup-stage ${productClass} mock-view-${view} ${compact ? "mockup-compact" : ""}`} role="img" aria-label={`${product.name} ${["front label", "back label", "texture", "packaging", "in use"][view] || "product"}`}>
      <span className="mockup-orb mockup-orb-one" />
      <span className="mockup-orb mockup-orb-two" />
      {view === 2 && <span className="texture-swatch" />}
      {view === 3 && <span className="packaging-box">DUCK<small>{product.category}</small></span>}
      {view === 4 && <span className="use-backdrop" />}
      <div className="mock-product">
        <div className="mock-product-top" />
        <div className="mock-shine" />
        {view === 1 ? (
          <div className="back-label"><strong>PRODUCT INFORMATION</strong><span>Ingredients · Directions · Batch · MRP</span><i /><i /><i /><i /></div>
        ) : (
          <>
            <img src="/duck-logo.png" alt="" />
            <small>{product.category}</small>
            <strong>{product.name.replace("Duck ", "")}</strong>
            <span>{product.detail.split("·")[0]}</span>
          </>
        )}
      </div>
      {!compact && <span className="mock-product-shadow" />}
    </div>
  );
}

function AccountPortal({
  initialScreen,
  onClose,
  onAuthenticated,
  custName,
  setCustName,
  custPhone,
  setCustPhone,
  custEmail,
  setCustEmail,
  custAddress1,
  setCustAddress1,
  custAddress2,
  setCustAddress2,
  custCity,
  setCustCity,
  custState,
  setCustState,
  pinCode,
  setPinCode,
  logoUrl,
}: {
  initialScreen: AccountScreen;
  onClose: () => void;
  onAuthenticated: () => void;
  custName: string;
  setCustName: (val: string) => void;
  custPhone: string;
  setCustPhone: (val: string) => void;
  custEmail: string;
  setCustEmail: (val: string) => void;
  custAddress1: string;
  setCustAddress1: (val: string) => void;
  custAddress2: string;
  setCustAddress2: (val: string) => void;
  custCity: string;
  setCustCity: (val: string) => void;
  custState: string;
  setCustState: (val: string) => void;
  pinCode: string;
  setPinCode: (val: string) => void;
  logoUrl?: string;
}) {
  const [screen, setScreen] = useState<AccountScreen>(initialScreen);
  const [customerOrders, setCustomerOrders] = useState<Order[]>(db.getOrders());
  const [returnOrderModal, setReturnOrderModal] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState<any>("Damaged on Arrival");
  const [returnComments, setReturnComments] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Firebase Auth State
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "magic">("signin");
  const [authEmailInput, setAuthEmailInput] = useState(custEmail || "");
  const [authPasswordInput, setAuthPasswordInput] = useState("");
  const [authNameInput, setAuthNameInput] = useState(custName || "");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authInfo, setAuthInfo] = useState("");
  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  // Load active session and Firebase profile
  useEffect(() => {
    let unsubAuth: (() => void) | undefined;
    if (isFirebaseConfigured() && auth) {
      unsubAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setFirebaseUser(user);
          if (user.email) setCustEmail(user.email);
          if (user.displayName && !custName) setCustName(user.displayName);

          const p: any = await fetchUserProfileFromFirestore(user.uid);
          if (p) {
            if (p.fullName) setCustName(p.fullName);
            if (p.email) setCustEmail(p.email);
            if (p.phone) setCustPhone(p.phone);
            if (p.address_line1) setCustAddress1(p.address_line1);
            if (p.address_line2) setCustAddress2(p.address_line2);
            if (p.city) setCustCity(p.city);
            if (p.state) setCustState(p.state);
            if (p.pincode) setPinCode(p.pincode);
          }

          const orders = await fetchCustomerOrdersFromFirestore(user.uid);
          if (orders && orders.length > 0) {
            setCustomerOrders(orders);
          }
        } else {
          setFirebaseUser(null);
        }
      });

      // Check if user clicked an incoming Magic Link in their email
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailToUse = window.localStorage.getItem("emailForSignIn") || custEmail;
        if (!emailToUse) {
          emailToUse = window.prompt("Please confirm your email address to complete signing in:") || "";
        }
        if (emailToUse) {
          setAuthLoading(true);
          completeEmailMagicLink(emailToUse, window.location.href).then((res) => {
            setAuthLoading(false);
            if (res.success && res.user) {
              setFirebaseUser(res.user);
              onAuthenticated();
              setScreen("profile");
            }
          });
        }
      }
    }

    const unsubDb = db.subscribe(() => {
      setCustomerOrders([...db.getOrders()]);
    });

    return () => {
      if (unsubAuth) unsubAuth();
      unsubDb();
    };
  }, []);

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthInfo("");
    const targetEmail = authEmailInput.trim();
    if (!isValidEmail(targetEmail)) {
      setAuthError("Please provide a valid email address.");
      return;
    }
    if (!authPasswordInput || authPasswordInput.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);
    setCustEmail(targetEmail);

    if (isFirebaseConfigured()) {
      try {
        if (authMode === "signup") {
          const res = await signUpWithEmailPassword(targetEmail, authPasswordInput, authNameInput.trim());
          setAuthLoading(false);
          if (res.success && res.user) {
            setFirebaseUser(res.user);
            if (authNameInput.trim()) setCustName(authNameInput.trim());
            onAuthenticated();
            setScreen("profile");
          }
        } else {
          const res = await loginWithEmailPassword(targetEmail, authPasswordInput);
          setAuthLoading(false);
          if (res.success && res.user) {
            setFirebaseUser(res.user);
            onAuthenticated();
            setScreen("profile");
          }
        }
      } catch (err: any) {
        setAuthLoading(false);
        setAuthError(err.message || "Authentication failed. Please check your credentials.");
      }
    } else {
      setAuthLoading(false);
      // Prototype Mode fallback
      if (authNameInput.trim()) setCustName(authNameInput.trim());
      onAuthenticated();
      setScreen("profile");
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    setAuthInfo("");
    if (!isFirebaseConfigured()) {
      setAuthError("Firebase not configured. Please add VITE_FIREBASE_API_KEY in .env to use Google Login.");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await loginWithGoogle();
      setAuthLoading(false);
      if (res.success && res.user) {
        setFirebaseUser(res.user);
        if (res.user.displayName) setCustName(res.user.displayName);
        if (res.user.email) setCustEmail(res.user.email);
        onAuthenticated();
        setScreen("profile");
      }
    } catch (err: any) {
      setAuthLoading(false);
      setAuthError(err.message || "Google Sign-In was cancelled or failed.");
    }
  };

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthInfo("");
    const targetEmail = authEmailInput.trim();
    if (!isValidEmail(targetEmail)) {
      setAuthError("Please enter a valid email address.");
      return;
    }
    setAuthLoading(true);
    setCustEmail(targetEmail);

    if (isFirebaseConfigured()) {
      try {
        const res = await sendEmailMagicLink(targetEmail);
        setAuthLoading(false);
        setAuthInfo(res.message);
      } catch (err: any) {
        setAuthLoading(false);
        setAuthError(err.message || "Failed to send magic link. Check Firebase Auth settings.");
      }
    } else {
      setAuthLoading(false);
      setAuthInfo("Firebase not configured. Prototype Mode: You are now signed in!");
      onAuthenticated();
      setScreen("profile");
    }
  };

  const handleSignOut = async () => {
    if (isFirebaseConfigured()) {
      await signOutFirebase();
    }
    setFirebaseUser(null);
    setScreen("login");
  };

  // Data Isolation: A customer only sees their own historical order records
  const myOrders = customerOrders.filter((ord) => {
    if (!custEmail && !custPhone) return true;
    const matchEmail = custEmail && ord.customerEmail.trim().toLowerCase() === custEmail.trim().toLowerCase();
    const matchPhone = custPhone && ord.customerPhone.replace(/\D/g, "") === custPhone.replace(/\D/g, "");
    return matchEmail || matchPhone;
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const safeName = sanitizeText(custName, 80);
    const safePhone = sanitizeText(custPhone, 15);
    const safeEmail = sanitizeText(custEmail, 80);
    const safeAddr1 = sanitizeText(custAddress1, 150);
    const safeAddr2 = sanitizeText(custAddress2, 150);
    const safeCity = sanitizeText(custCity, 80);
    const safeState = sanitizeText(custState, 50);
    const safePin = sanitizeText(pinCode, 10);

    // Save to Firebase Firestore profiles collection if connected
    if (isFirebaseConfigured() && firebaseUser?.uid) {
      await saveUserProfileToFirestore(firebaseUser.uid, {
        fullName: safeName,
        phone: safePhone,
        address_line1: safeAddr1,
        address_line2: safeAddr2,
        city: safeCity,
        state: safeState,
        pincode: safePin,
      });
    }

    const existingCustomer = db.getCustomers().find(c => c.email === safeEmail || c.phone === safePhone);
    db.saveCustomer({
      id: existingCustomer?.id || `cst-${Date.now()}`,
      name: safeName || "Valued Customer",
      email: safeEmail || "",
      phone: safePhone || "",
      addresses: [
        {
          fullName: safeName,
          phone: safePhone,
          email: safeEmail,
          addressLine1: safeAddr1,
          addressLine2: safeAddr2,
          city: safeCity,
          state: safeState,
          pinCode: safePin || "380006",
          country: "India",
          isDefault: true,
        },
      ],
      totalOrders: existingCustomer?.totalOrders || myOrders.length,
      totalSpent: existingCustomer?.totalSpent || myOrders.reduce((s, o) => s + o.grandTotal, 0),
      status: existingCustomer?.status || "Active",
      createdAt: existingCustomer?.createdAt || new Date().toISOString(),
    });

    setProfileSuccess("Profile details and addresses saved to database successfully.");
  };

  const handleCancelOrder = (order: Order) => {
    if (!confirm(`Are you sure you want to cancel order ${order.orderNumber}?`)) return;
    const staff = authService.getCurrentUser();
    orderService.updateOrderStatus(order.id, "Cancelled", staff, "Cancelled by customer via Account portal");
    setReturnSuccess(`Order ${order.orderNumber} has been cancelled.`);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnOrderModal) return;

    db.saveReturn(
      {
        id: `ret-${Date.now()}`,
        requestNumber: `RET-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        orderId: returnOrderModal.id,
        orderNumber: returnOrderModal.orderNumber,
        customerId: returnOrderModal.customerId,
        customerName: returnOrderModal.customerName,
        customerEmail: returnOrderModal.customerEmail,
        customerPhone: returnOrderModal.customerPhone,
        items: returnOrderModal.items.map((i) => ({
          productId: i.productId,
          productName: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        reason: returnReason,
        customerComments: returnComments,
        status: "Return Requested",
        refundAmount: returnOrderModal.grandTotal,
        refundStatus: "Pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      returnOrderModal.customerName,
      "Customer Support"
    );

    setReturnSuccess(`Return request for ${returnOrderModal.orderNumber} submitted. Our support team will review it.`);
    setReturnOrderModal(null);
    setReturnComments("");
  };

  if (screen === "login" || screen === "signup" || screen === "verify") {
    return (
      <div className="fixed inset-0 z-[90] overflow-y-auto bg-lilac">
        <div className="grid min-h-screen lg:grid-cols-2">
          <div className="relative hidden overflow-hidden bg-purple p-14 text-white lg:flex lg:flex-col lg:justify-between">
            <span className="absolute -top-32 -right-24 h-96 w-96 rounded-full border border-white/15" />
            <div className="relative inline-flex w-fit rounded-xl bg-white p-2">
              <img
                src={logoUrl || "/duck-logo.png"}
                onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }}
                alt="Duck"
                className="h-14 w-36 object-contain"
              />
            </div>
            <div className="relative max-w-xl">
              <p className="text-[10px] font-bold tracking-[0.18em] text-lilac uppercase">Your Duck account</p>
              <h2 className="mt-5 font-display text-6xl leading-[0.95] font-semibold">Care made personal.</h2>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-white/65">Track orders in real time, view GST invoices, submit returns, and manage deliveries.</p>
            </div>
            <p className="relative text-[9px] tracking-wider text-white/35 uppercase">Private · Protected · Personal</p>
          </div>
          <div className="relative flex items-center justify-center bg-white px-5 py-16">
            <button onClick={onClose} className="absolute top-5 right-5 grid h-10 w-10 place-items-center rounded-full bg-lilac text-purple" aria-label="Close account">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" /></svg>
            </button>
            <div className="w-full max-w-md">
              <img
                src={logoUrl || "/duck-logo.png"}
                onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }}
                alt="Duck"
                className="mb-10 h-12 w-28 object-contain lg:hidden"
              />
              <div className="mb-6 flex rounded-2xl bg-canvas/80 p-1 border border-purple/10">
                <button
                  type="button"
                  onClick={() => { setAuthMode("signin"); setAuthError(""); setAuthInfo(""); }}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    authMode === "signin" ? "bg-purple text-white shadow-xs" : "text-ink/60 hover:text-purple"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("signup"); setAuthError(""); setAuthInfo(""); }}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    authMode === "signup" ? "bg-purple text-white shadow-xs" : "text-ink/60 hover:text-purple"
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode("magic"); setAuthError(""); setAuthInfo(""); }}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    authMode === "magic" ? "bg-purple text-white shadow-xs" : "text-ink/60 hover:text-purple"
                  }`}
                >
                  Magic Link
                </button>
              </div>

              <p className="text-[9px] font-bold tracking-[0.16em] text-purple uppercase">
                {authMode === "signup" ? "New Customer" : authMode === "magic" ? "Passwordless Login" : "Customer Access"}
              </p>
              <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold">
                {authMode === "signup" ? "Create your Duck account" : authMode === "magic" ? "Sign in with Magic Link" : "Welcome back"}
              </h1>
              <p className="mt-2 text-sm text-ink/50">
                {authMode === "signup"
                  ? "Register to track orders, save shipping addresses, and unlock free gifts."
                  : authMode === "magic"
                  ? "We'll email you a secure one-click sign-in link with no password needed."
                  : "Sign in with your email & password or use Google for one-click access."}
              </p>

              {/* Google Sign In Button */}
              <button
                type="button"
                disabled={authLoading}
                onClick={handleGoogleSignIn}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-full border border-purple/20 bg-white py-3.5 text-xs font-bold text-purple-dark shadow-xs transition hover:bg-lilac/30 disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full border-t border-purple/15" />
                <span className="absolute bg-white px-3 text-[10px] font-bold text-ink/40 uppercase tracking-wider">
                  Or continue with email
                </span>
              </div>

              {authInfo && (
                <div className="mb-4 rounded-xl bg-mint/50 p-3 text-xs font-semibold text-purple-dark">
                  ✓ {authInfo}
                </div>
              )}

              {authError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
                  ⚠ {authError}
                </div>
              )}

              {authMode === "magic" ? (
                <form onSubmit={handleSendMagicLink} className="space-y-4">
                  <label className="block">
                    <span className="mb-2 block text-[9px] font-bold uppercase">Your Email Address</span>
                    <input
                      type="email"
                      required
                      value={authEmailInput}
                      onChange={(e) => setAuthEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      className="checkout-input font-medium"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full rounded-full bg-purple py-4 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-purple-dark disabled:opacity-50"
                  >
                    {authLoading ? "Sending Link..." : "Send Magic Sign-In Link"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
                  {authMode === "signup" && (
                    <label className="block">
                      <span className="mb-2 block text-[9px] font-bold uppercase">Your Full Name</span>
                      <input
                        type="text"
                        required
                        value={authNameInput}
                        onChange={(e) => setAuthNameInput(e.target.value)}
                        placeholder="Pritesh Suthar"
                        className="checkout-input font-medium"
                      />
                    </label>
                  )}

                  <label className="block">
                    <span className="mb-2 block text-[9px] font-bold uppercase">Email Address</span>
                    <input
                      type="email"
                      required
                      value={authEmailInput}
                      onChange={(e) => setAuthEmailInput(e.target.value)}
                      placeholder="you@example.com"
                      className="checkout-input font-medium"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[9px] font-bold uppercase">Password</span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={authPasswordInput}
                      onChange={(e) => setAuthPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="checkout-input font-medium"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full rounded-full bg-purple py-4 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-purple-dark disabled:opacity-50"
                  >
                    {authLoading
                      ? "Authenticating..."
                      : authMode === "signup"
                      ? "Create Account & Sign In"
                      : "Sign In"}
                  </button>
                </form>
              )}

              <div className="mt-6 rounded-2xl border border-purple/10 bg-canvas/60 p-4 text-[11px] text-ink/60">
                <div className="flex items-center gap-2 font-bold text-purple-dark mb-1">
                  <span>⚡ Powered by Google Firebase Auth</span>
                </div>
                <span>Secure cloud authentication · Passwordless Magic Link & Google Sign-In</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-admin">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-purple/10 bg-white px-5 py-4 md:px-10">
        <button onClick={onClose}><img src={logoUrl || "/duck-logo.png"} onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }} alt="Duck" className="h-11 w-28 object-contain" /></button>
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-lilac text-purple" aria-label="Close account"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" /></svg></button>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 lg:grid-cols-[16rem_1fr]">
        <aside className="h-fit rounded-3xl bg-purple-dark p-5 text-white">
          <div className="flex items-center gap-3 border-b border-white/15 pb-5">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-lilac font-display text-xl font-bold text-purple">
              {custName ? custName.slice(0, 2).toUpperCase() : "DC"}
            </span>
            <div><strong className="text-sm">{custName || "Valued Customer"}</strong><p className="mt-1 text-[9px] text-white/45">{custEmail || "Customer Portal"}</p></div>
          </div>
          <nav className="mt-5 space-y-1">
            {["profile", "orders"].map((item) => (
              <button
                key={item}
                onClick={() => setScreen(item as AccountScreen)}
                className={`w-full rounded-xl px-4 py-3 text-left text-xs font-bold capitalize ${screen === item ? "bg-white text-purple font-bold shadow-xs" : "text-white/55 hover:bg-white/10 hover:text-white"}`}
              >
                {item === "profile" ? "My profile" : `My orders (${myOrders.length})`}
              </button>
            ))}
            <button className="w-full rounded-xl px-4 py-3 text-left text-xs font-bold text-white/55 hover:bg-white/10 hover:text-white">Saved addresses</button>
            <button className="w-full rounded-xl px-4 py-3 text-left text-xs font-bold text-white/55 hover:bg-white/10 hover:text-white">Wishlist</button>
          </nav>
          <button onClick={handleSignOut} className="mt-8 w-full border-t border-white/15 pt-5 text-left text-[9px] font-bold tracking-wider text-coral uppercase">Log out</button>
        </aside>

        <section className="rounded-3xl bg-white p-6 md:p-9 shadow-sm">
          {returnSuccess && (
            <div className="mb-6 rounded-2xl bg-mint p-4 text-xs font-semibold text-purple-dark">
              ✓ {returnSuccess}
            </div>
          )}

          {screen === "profile" ? (
            <form onSubmit={handleSaveProfile}>
              <p className="text-[9px] font-bold tracking-wider text-purple uppercase">My account</p>
              <h1 className="mt-2 font-display text-4xl font-semibold">Profile details</h1>
              {profileSuccess && (
                <div className="mt-4 rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
                  ✓ {profileSuccess}
                </div>
              )}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label><span className="mb-2 block text-[9px] font-bold uppercase">Full name</span><input value={custName} onChange={(e) => setCustName(e.target.value)} required placeholder="Enter your full name" className="checkout-input" /></label>
                <label><span className="mb-2 block text-[9px] font-bold uppercase">Mobile</span><input value={custPhone} onChange={(e) => setCustPhone(e.target.value)} required placeholder="10-digit mobile number" className="checkout-input" /></label>
                <label><span className="mb-2 block text-[9px] font-bold uppercase">Email</span><input value={custEmail} onChange={(e) => setCustEmail(e.target.value)} required type="email" placeholder="you@example.com" className="checkout-input" /></label>
                <label><span className="mb-2 block text-[9px] font-bold uppercase">City</span><input value={custCity} onChange={(e) => setCustCity(e.target.value)} required placeholder="City" className="checkout-input" /></label>
                <label className="sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase">Delivery Address (House/Street/Flat)</span><input value={custAddress1} onChange={(e) => setCustAddress1(e.target.value)} required placeholder="House, street, apartment" className="checkout-input" /></label>
                <label><span className="mb-2 block text-[9px] font-bold uppercase">Area / Landmark</span><input value={custAddress2} onChange={(e) => setCustAddress2(e.target.value)} placeholder="Area, landmark" className="checkout-input" /></label>
                <label><span className="mb-2 block text-[9px] font-bold uppercase">State</span><input value={custState} onChange={(e) => setCustState(e.target.value)} required placeholder="State (e.g. Gujarat)" className="checkout-input" /></label>
                <label><span className="mb-2 block text-[9px] font-bold uppercase">PIN Code</span><input value={pinCode} onChange={(e) => setPinCode(e.target.value)} required placeholder="6-digit PIN code" className="checkout-input" /></label>
              </div>
              <button type="submit" className="mt-6 rounded-full bg-purple px-7 py-3 text-[10px] font-bold tracking-wider text-white uppercase hover:bg-purple-dark shadow-md transition">Save changes</button>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  ["Orders on Record", myOrders.length.toString()],
                  ["Wishlist Items", "06"],
                  ["Saved Addresses", "01"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-canvas p-5">
                    <p className="font-display text-3xl font-semibold text-purple">{value}</p>
                    <p className="mt-1 text-xs text-ink/45">{label}</p>
                  </div>
                ))}
              </div>
            </form>
          ) : (
            <>
              <p className="text-[9px] font-bold tracking-wider text-purple uppercase">Live Orders & Fulfillment</p>
              <h1 className="mt-2 font-display text-4xl font-semibold">My orders</h1>

              <div className="mt-8 space-y-5">
                {myOrders.length === 0 ? (
                  <p className="py-8 text-center text-sm text-ink/40">You have not placed any orders yet.</p>
                ) : (
                  myOrders.map((ord) => {
                    const isCancellable = ord.orderStatus === "New" || ord.orderStatus === "Awaiting Confirmation" || ord.orderStatus === "Confirmed";
                    const isReturnable = ord.orderStatus === "Delivered";

                    return (
                      <article key={ord.id} className="rounded-2xl border border-purple/10 p-5 space-y-4 hover:border-purple/30 transition">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="font-mono text-xs font-bold text-purple">{ord.orderNumber}</span>
                            <h2 className="mt-1 font-display text-xl font-semibold">Duck Care Order</h2>
                            <span className="text-[10px] text-ink/40">{new Date(ord.createdAt).toLocaleDateString("en-IN")} · {ord.items.length} item(s)</span>
                          </div>
                          <div className="text-right">
                            <strong className="block text-lg font-bold text-purple-dark">₹{ord.grandTotal.toLocaleString("en-IN")}</strong>
                            <small className="text-[10px] text-ink/40">{ord.paymentMethod} ({ord.paymentStatus})</small>
                          </div>
                        </div>

                        {/* Items in this order */}
                        <div className="divide-y divide-purple/5 border-y border-purple/10 py-2">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 text-xs">
                              <span className="text-ink/80">{item.name} × {item.quantity}</span>
                              <strong className="text-ink font-semibold">₹{item.total}</strong>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase ${
                              ord.orderStatus === "Delivered" ? "bg-mint text-purple-dark" :
                              ord.orderStatus === "Cancelled" ? "bg-red-100 text-red-700" :
                              ord.orderStatus === "Shipped" ? "bg-sky text-purple-dark" : "bg-purple-100 text-purple-dark"
                            }`}>
                              {ord.orderStatus}
                            </span>
                            {ord.trackingNumber && (
                              <span className="font-mono text-xs text-ink/60">
                                Tracking: {ord.shippingProvider} ({ord.trackingNumber})
                              </span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {ord.trackingUrl && (
                              <a
                                href={ord.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-full bg-purple/10 px-3 py-1.5 text-[9px] font-bold text-purple uppercase hover:bg-purple hover:text-white"
                              >
                                Track Package ↗
                              </a>
                            )}
                            {isCancellable && (
                              <button
                                onClick={() => handleCancelOrder(ord)}
                                className="rounded-full border border-red-200 px-3 py-1.5 text-[9px] font-bold text-red-600 uppercase hover:bg-red-50"
                              >
                                Cancel Order
                              </button>
                            )}
                            {isReturnable && (
                              <button
                                onClick={() => setReturnOrderModal(ord)}
                                className="rounded-full bg-lilac px-3 py-1.5 text-[9px] font-bold text-purple uppercase hover:bg-purple hover:text-white"
                              >
                                Request 7-Day Return
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Return Request Modal */}
      {returnOrderModal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4" onClick={() => setReturnOrderModal(null)}>
          <form
            onSubmit={handleReturnSubmit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[9px] font-bold uppercase text-purple">7-Day Easy Return</span>
                <h3 className="font-display text-xl font-bold">Return Order {returnOrderModal.orderNumber}</h3>
              </div>
              <button type="button" onClick={() => setReturnOrderModal(null)} className="rounded-full bg-canvas px-3 py-1 text-xs">✕</button>
            </div>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Select Return Reason</span>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value as any)}
                className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none font-semibold"
              >
                <option value="Damaged on Arrival">Damaged on Arrival / Broken Seal</option>
                <option value="Wrong Product Sent">Wrong Product Sent</option>
                <option value="Expired / Quality Issue">Expired or Quality Concern</option>
                <option value="Customer Remorse (Unopened)">Unopened Product / Change of Mind</option>
                <option value="Defective Seal / Leakage">Liquid Leakage in Transit</option>
              </select>
            </label>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Details / Observations</span>
              <textarea
                rows={3}
                required
                value={returnComments}
                onChange={(e) => setReturnComments(e.target.value)}
                placeholder="Please describe the issue with the delivered item..."
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none text-xs resize-none"
              />
            </label>

            <div className="rounded-xl bg-canvas p-3 text-xs flex justify-between font-bold">
              <span>Estimated Refund Amount:</span>
              <span className="text-purple-dark">₹{returnOrderModal.grandTotal}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setReturnOrderModal(null)} className="rounded-full bg-canvas px-4 py-2 text-xs font-bold uppercase">
                Cancel
              </button>
              <button type="submit" className="rounded-full bg-purple px-5 py-2 text-xs font-bold text-white uppercase hover:bg-purple-dark">
                Submit Return Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [freeWashAdded, setFreeWashAdded] = useState(false);
  const [selected, setSelected] = useState<"All" | Category>("All");
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [adminView, setAdminView] = useState(false);
  const [staffLoginOpen, setStaffLoginOpen] = useState(false);
  const [accountScreen, setAccountScreen] = useState<AccountScreen | null>(null);
  const [customerSignedIn, setCustomerSignedIn] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [productQuantity, setProductQuantity] = useState(1);
  const [galleryView, setGalleryView] = useState(0);
  const [galleryZoom, setGalleryZoom] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [policyOpen, setPolicyOpen] = useState<PolicyScreen | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [pinChecked, setPinChecked] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<"address" | "payment" | "confirmed">("address");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  // Checkout address & order inputs (empty by default for user entry)
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custEmail, setCustEmail] = useState("");
  const [custAddress1, setCustAddress1] = useState("");
  const [custAddress2, setCustAddress2] = useState("");
  const [custCity, setCustCity] = useState("");
  const [custState, setCustState] = useState("Gujarat");
  const [custNotes, setCustNotes] = useState("");
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  // Hydrate saved customer profile from localStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem("duck_customer_profile");
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.custName) setCustName(p.custName);
        if (p.custPhone) setCustPhone(p.custPhone);
        if (p.custEmail) setCustEmail(p.custEmail);
        if (p.custAddress1) setCustAddress1(p.custAddress1);
        if (p.custAddress2) setCustAddress2(p.custAddress2);
        if (p.custCity) setCustCity(p.custCity);
        if (p.custState) setCustState(p.custState);
        if (p.pinCode) setPinCode(p.pinCode);
      }
    } catch {
      // ignore
    }
  }, []);

  // Dynamic store data from db / Firebase Firestore
  const [currentProducts, setCurrentProducts] = useState<ProductItem[]>(db.getProducts());
  const [storeSettings, setStoreSettings] = useState(db.getSettings());
  const [firestoreCategories, setFirestoreCategories] = useState<CategoryMeta[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isFirebaseConfigured() && firestoreDb) {
      // 1. Fetch live active products from Firestore
      fetchActiveProductsFromFirestore()
        .then((prods) => {
          if (isMounted && prods.length > 0) setCurrentProducts(prods);
        })
        .catch((err) => console.error("Error loading products from Firestore:", err));

      // 2. Fetch live categories from Firestore
      fetchCategoriesFromFirestore()
        .then((cats) => {
          if (isMounted && cats.length > 0) setFirestoreCategories(cats);
        })
        .catch((err) => console.error("Error loading categories from Firestore:", err));

      // 3. Fetch live site settings from Firestore
      fetchSiteSettingsFromFirestore()
        .then((remoteSettings) => {
          if (isMounted && remoteSettings) {
            setStoreSettings((prev) => ({ ...prev, ...remoteSettings }));
          }
        })
        .catch((err) => console.error("Error loading settings from Firestore:", err));

      // 4. Setup Real-time Firestore snapshot listeners
      const unsubProducts = onSnapshot(collection(firestoreDb, "products"), () => {
        fetchActiveProductsFromFirestore().then((prods) => {
          if (isMounted && prods.length > 0) setCurrentProducts(prods);
        });
      });

      const unsubCategories = onSnapshot(collection(firestoreDb, "categories"), () => {
        fetchCategoriesFromFirestore().then((cats) => {
          if (isMounted && cats.length > 0) setFirestoreCategories(cats);
        });
      });

      const unsubSettings = onSnapshot(doc(firestoreDb, "site_settings", "global_config"), () => {
        fetchSiteSettingsFromFirestore().then((settings) => {
          if (isMounted && settings) setStoreSettings((prev) => ({ ...prev, ...settings }));
        });
      });

      // 5. Restore active Firebase session
      let unsubAuth: (() => void) | undefined;
      if (auth) {
        unsubAuth = onAuthStateChanged(auth, (user) => {
          if (user) {
            setActiveUserId(user.uid);
            setCustomerSignedIn(true);
          }
        });
      }

      return () => {
        isMounted = false;
        unsubProducts();
        unsubCategories();
        unsubSettings();
        if (unsubAuth) unsubAuth();
      };
    }

    const unsub = db.subscribe(() => {
      if (!isFirebaseConfigured()) {
        setCurrentProducts([...db.getProducts()]);
        setStoreSettings({ ...db.getSettings() });
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, []);

  // Dynamic Categories: prioritize Firebase Firestore, then storeSettings, then defaults
  const categories: { name: Category; line: string; image: string; tone: string }[] =
    firestoreCategories.length > 0
      ? firestoreCategories
          .filter((c) => c.active !== false)
          .map((c) => ({
            name: c.name,
            line: c.tagline,
            image: c.image,
            tone: c.tone || "bg-lilac",
          }))
      : storeSettings.customCategories && storeSettings.customCategories.length > 0
      ? storeSettings.customCategories
          .filter((c) => c.active !== false)
          .map((c) => ({
            name: c.name,
            line: c.tagline,
            image: c.image,
            tone: c.tone || "bg-lilac",
          }))
      : DEFAULT_CATEGORIES;

  // Audit Item 1: Product Sync - Only active products appear on storefront shelves
  const storeCatalog: Product[] = currentProducts
    .filter((p) => p.status === "Active")
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category as Category,
      detail: p.detail,
      price: `₹${p.price}`,
      image: p.image,
      images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
      badge: p.badge,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      sku: p.sku,
      gstRate: p.gstRate,
      mrp: p.mrp,
    }));

  const promoActive = storeSettings.autoFreeFaceWashOffer ?? true;

  // Audit Item 1 & 4: Free gift promotion sync & abuse prevention
  useEffect(() => {
    if (!promoActive && freeWashAdded) {
      setFreeWashAdded(false);
    }
  }, [promoActive, freeWashAdded]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi, I’m the Duck Care Assistant. I can help you find a product, understand the free Face Wash offer, or answer order questions.",
    },
  ]);

  const visibleProducts =
    selected === "All" ? storeCatalog : storeCatalog.filter((product) => product.category === selected);

  const cosmeticsInCart = cartItems.some((product) => product.category === "Cosmetics");
  const cartCount = cartItems.length + (freeWashAdded && promoActive ? 1 : 0);
  const subtotal = cartItems.reduce(
    (sum, product) => sum + Number(product.price.replace(/[^\d]/g, "")),
    0,
  );
  const rawDiscounted = Math.max(0, subtotal - couponDiscount);
  const shippingFee = rawDiscounted >= storeSettings.freeShippingThreshold || rawDiscounted === 0 ? 0 : storeSettings.standardShippingFee;
  const finalOrderTotal = rawDiscounted + shippingFee;

  const cartLines = cartItems.reduce<{ product: Product; quantity: number }[]>((lines, product) => {
    const existing = lines.find((line) => line.product.name === product.name);
    if (existing) existing.quantity += 1;
    else lines.push({ product, quantity: 1 });
    return lines;
  }, []);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const chooseCategory = (category: Category) => {
    setSelected(category);
    setMegaOpen(false);
    window.setTimeout(() => scrollTo("products"), 10);
  };

  const addToCart = (product: Product) => {
    const nextItems = [...cartItems, product];
    setCartItems(nextItems);
    if (promoActive && product.category === "Cosmetics" && !freeWashAdded) {
      setFreeWashAdded(true);
    }
    setCartOpen(true);
  };

  const openProduct = (product: Product) => {
    setActiveProduct(product);
    setProductQuantity(1);
    setGalleryView(0);
    setGalleryZoom(false);
    setPinCode("");
    setPinChecked(false);
  };

  const addProductQuantity = (product: Product, buyNow = false) => {
    const nextItems = [...cartItems, ...Array.from({ length: productQuantity }, () => product)];
    setCartItems(nextItems);
    if (promoActive && product.category === "Cosmetics" && !freeWashAdded) {
      setFreeWashAdded(true);
    }
    setActiveProduct(null);
    if (buyNow) {
      setCheckoutOpen(true);
      setCheckoutStep("address");
    } else {
      setCartOpen(true);
    }
  };

  const changeQuantity = (product: Product, change: number) => {
    if (change > 0) {
      const nextItems = [...cartItems, product];
      setCartItems(nextItems);
      if (promoActive && product.category === "Cosmetics" && !freeWashAdded) {
        setFreeWashAdded(true);
      }
      return;
    }
    const removeIndex = cartItems.findIndex((item) => item.name === product.name);
    if (removeIndex < 0) return;
    const nextItems = cartItems.filter((_, index) => index !== removeIndex);
    setCartItems(nextItems);
    if (!nextItems.some((item) => item.category === "Cosmetics")) setFreeWashAdded(false);
  };

  const checkPinCode = () => {
    const isValidPin = storeSettings.serviceablePinCodes.includes(pinCode) || isValidPinCode(pinCode);
    setPinChecked(isValidPin);
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;

    const coupon = db.getCoupons().find((c) => c.code === code && c.isActive);
    if (!coupon) {
      setCouponError("Invalid or inactive coupon code.");
      return;
    }

    if (subtotal < coupon.minOrderValue) {
      setCouponError(`Coupon requires minimum cart of ₹${coupon.minOrderValue}.`);
      return;
    }

    let disc = 0;
    if (coupon.discountType === "percentage") {
      disc = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && disc > coupon.maxDiscount) disc = coupon.maxDiscount;
    } else {
      disc = coupon.discountValue;
    }

    setAppliedCoupon(code);
    setCouponDiscount(disc);
  };

  const handlePlaceOrder = async (event: FormEvent) => {
    event.preventDefault();
    setCheckoutError("");

    const safeName = sanitizeText(custName, 80);
    const safePhone = sanitizeText(custPhone, 15);
    const safeEmail = sanitizeText(custEmail, 80);
    const safeAddr1 = sanitizeText(custAddress1, 150);
    const safeAddr2 = sanitizeText(custAddress2, 150);
    const safeCity = sanitizeText(custCity, 80);
    const safeState = sanitizeText(custState, 50);
    const safeNotes = sanitizeText(custNotes, 300);
    const safePin = sanitizeText(pinCode, 10);

    if (!isValidEmail(safeEmail)) {
      setCheckoutError("Please provide a valid email address.");
      return;
    }
    if (!isValidPhone(safePhone)) {
      setCheckoutError("Please provide a valid 10-digit mobile phone number.");
      return;
    }
    if (!isValidPinCode(safePin)) {
      setCheckoutError("Please provide a valid 6-digit Indian PIN code.");
      return;
    }

    const itemsToOrder = cartLines.map((line) => {
      const rawPrice = Number(line.product.price.replace(/[^\d]/g, ""));
      const dbProd = currentProducts.find((p) => p.name === line.product.name);
      return {
        productId: dbProd?.id || `prd-gen-${line.product.name}`,
        name: line.product.name,
        category: line.product.category,
        sku: dbProd?.sku || `SKU-${line.product.name.slice(0, 4).toUpperCase()}`,
        image: line.product.image,
        quantity: line.quantity,
        price: rawPrice,
        mrp: dbProd?.mrp || rawPrice + 50,
        gstRate: dbProd?.gstRate || 18,
      };
    });

    // If Firebase is configured, push directly to Firestore with server-side promotion validation
    if (isFirebaseConfigured()) {
      try {
        const fireRes = await placeOrderToFirestore({
          userId: activeUserId || undefined,
          customerName: safeName,
          customerEmail: safeEmail,
          customerPhone: safePhone,
          shippingAddress: {
            fullName: safeName,
            phone: safePhone,
            email: safeEmail,
            addressLine1: safeAddr1,
            addressLine2: safeAddr2,
            city: safeCity,
            state: safeState,
            pinCode: safePin || "380006",
            country: "India",
          },
          items: itemsToOrder.map((it) => ({
            productId: it.productId,
            name: it.name,
            category: it.category,
            sku: it.sku,
            image: it.image,
            quantity: it.quantity,
            mrp: it.mrp,
            price: it.price,
          })),
          paymentMethod,
          couponCode: appliedCoupon || undefined,
        });

        if (!fireRes.success) {
          setCheckoutError(fireRes.message || "Failed to process order in database.");
          return;
        }
      } catch (err: any) {
        console.error("Firestore order error:", err);
      }
    }

    // Complimentary face wash added strictly once per order if cosmetic is present and promo is active
    if (freeWashAdded && promoActive && cosmeticsInCart) {
      itemsToOrder.push({
        productId: "prd-003",
        name: "Daily Fresh Face Wash (Free Gift)",
        category: "Face Wash",
        sku: "DUCK-FW-DFW-150-GIFT",
        image: "https://images.unsplash.com/photo-1738892248212-80f7d1f5fc94?w=900",
        quantity: 1,
        price: 0,
        mrp: 399,
        gstRate: 18,
      });
    }

    const res = orderService.createOrder({
      customerName: safeName,
      customerEmail: safeEmail,
      customerPhone: safePhone,
      shippingAddress: {
        fullName: safeName,
        phone: safePhone,
        email: safeEmail,
        addressLine1: safeAddr1,
        addressLine2: safeAddr2,
        city: safeCity,
        state: safeState,
        pinCode: safePin || "380006",
        country: "India",
      },
      items: itemsToOrder,
      paymentMethod: paymentMethod as PaymentMethod,
      couponCode: appliedCoupon || undefined,
      discountAmount: couponDiscount,
      customerNotes: safeNotes,
    });

    if (res.success && res.order) {
      setPlacedOrder(res.order);
      setCheckoutStep("confirmed");
      setCartItems([]);
      setFreeWashAdded(false);
    } else {
      setCheckoutError(res.error || "Failed to process order.");
    }
  };

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = sanitizeText(form.get("name") as string, 80);
    const email = sanitizeText(form.get("email") as string, 80);
    const phone = sanitizeText(form.get("phone") as string, 15);
    const subject = sanitizeText(form.get("subject") as string, 100);
    const message = sanitizeText(form.get("message") as string, 1500);

    if (!isValidEmail(email)) {
      alert("Please provide a valid email address.");
      return;
    }

    db.saveTicket(
      {
        id: `tkt-${Date.now()}`,
        ticketNumber: `TKT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        subject: subject || "Customer Website Inquiry",
        category: "Order Support",
        priority: "Normal",
        status: "Open",
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: "Customer",
            senderName: name,
            text: message,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      name,
      "Customer Support"
    );

    setContactSent(true);
  };

  const askAssistant = (question: string) => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    const lowerQuestion = cleanQuestion.toLowerCase();
    let answer =
      "I can help with Baby Care, Face Wash, Vapor Rub, Ortho Pain Oil, Cosmetics, promotions, and order questions. Which area would you like to explore?";

    if (lowerQuestion.includes("baby")) {
      answer =
        "For gentle daily care, start with Duck Baby Soft Lotion. For bath time, the tear-free Head-to-Toe Baby Wash is the best match. You can open either product for a 3D quick view.";
    } else if (lowerQuestion.includes("pain") || lowerQuestion.includes("ortho")) {
      answer =
        "Duck Ortho Pain Oil is our botanical massage oil for targeted everyday comfort. Open its product details to see benefits and the frequently bought together Vapor Rub.";
    } else if (lowerQuestion.includes("vapor") || lowerQuestion.includes("rub") || lowerQuestion.includes("cold")) {
      answer =
        "Duck Vapor Comfort Rub contains eucalyptus and mint for soothing aromatic comfort. Always follow the product label, and consult a healthcare professional for medical concerns.";
    } else if (lowerQuestion.includes("free") || lowerQuestion.includes("offer") || lowerQuestion.includes("wash")) {
      answer =
        "Add any Cosmetics product to your cart to unlock a free Daily Fresh Face Wash. The cart drawer will show an “Add free gift” button automatically.";
    } else if (lowerQuestion.includes("cosmetic") || lowerQuestion.includes("makeup")) {
      answer =
        "Our Featherlight Skin Tint and Soft Glow Essentials are customer favorites. Buying either one also unlocks a free Face Wash in your cart.";
    } else if (lowerQuestion.includes("shipping") || lowerQuestion.includes("delivery")) {
      answer =
        "Standard India shipping is ₹79 or complimentary on orders above ₹999. Live tracking is sent by WhatsApp & SMS!";
    } else if (lowerQuestion.includes("hello") || lowerQuestion.includes("hi")) {
      answer = "Hello! What can I help you find today—Baby Care, Wellness, Face Wash, or Cosmetics?";
    }

    setChatMessages((messages) => [
      ...messages,
      { role: "user", text: cleanQuestion },
      { role: "assistant", text: answer },
    ]);
    setAiInput("");
  };

  const handleOpenStaffPortal = () => {
    if (authService.isAuthenticated()) {
      setAdminView(true);
    } else {
      setStaffLoginOpen(true);
    }
  };

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#admin") {
        if (authService.isAuthenticated()) {
          setAdminView(true);
        } else {
          setStaffLoginOpen(true);
        }
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret staff keyboard shortcut: Ctrl + Alt + A
      if (e.ctrlKey && e.altKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        handleOpenStaffPortal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("hashchange", handleHash);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Switch to complete Admin OMS Layout when adminView is true
  if (adminView) {
    return (
      <AdminLayout
        onBackToStore={() => {
          setAdminView(false);
          if (typeof window !== "undefined" && window.location.hash === "#admin") {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }}
        onSignOut={() => {
          setAdminView(false);
          setStaffLoginOpen(false);
          if (typeof window !== "undefined" && window.location.hash === "#admin") {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-canvas text-ink">
      {/* Staff Authentication Gate Modal */}
      <StaffLoginModal
        isOpen={staffLoginOpen}
        onClose={() => {
          setStaffLoginOpen(false);
          if (typeof window !== "undefined" && window.location.hash === "#admin") {
            window.history.replaceState(null, "", window.location.pathname);
          }
        }}
        onSuccess={() => {
          setStaffLoginOpen(false);
          setAdminView(true);
        }}
      />

      {accountScreen && (
        <AccountPortal
          initialScreen={accountScreen}
          onClose={() => setAccountScreen(null)}
          onAuthenticated={() => {
            setCustomerSignedIn(true);
            setAccountScreen("profile");
          }}
          custName={custName}
          setCustName={setCustName}
          custPhone={custPhone}
          setCustPhone={setCustPhone}
          custEmail={custEmail}
          setCustEmail={setCustEmail}
          custAddress1={custAddress1}
          setCustAddress1={setCustAddress1}
          custAddress2={custAddress2}
          setCustAddress2={setCustAddress2}
          custCity={custCity}
          setCustCity={setCustCity}
          custState={custState}
          setCustState={setCustState}
          pinCode={pinCode}
          setPinCode={setPinCode}
          logoUrl={storeSettings.logoUrl}
        />
      )}

      {/* Announcement Ticker */}
      <div className="promo-ticker overflow-hidden bg-purple py-2.5 text-[11px] font-semibold tracking-[0.14em] text-white uppercase">
        <div className="promo-track">
          {storeSettings.announcementTicker.map((tick, idx) => (
            <span key={idx}>{tick}</span>
          ))}
          {storeSettings.announcementTicker.map((tick, idx) => (
            <span key={`dup-${idx}`}>{tick}</span>
          ))}
        </div>
      </div>

      {/* Main Header */}
      <header className="relative z-30 flex h-20 items-center justify-between border-b border-purple/10 bg-white px-5 md:px-10">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Duck home">
          <img
            src={storeSettings.logoUrl || "/duck-logo.png"}
            onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }}
            alt="Duck"
            className="h-12 w-28 object-contain object-center md:w-32"
          />
        </button>
        <nav className="hidden items-center gap-8 text-xs font-bold tracking-[0.1em] uppercase lg:flex">
          <div onMouseEnter={() => setMegaOpen(true)} onMouseLeave={() => setMegaOpen(false)}>
            <button onClick={() => setMegaOpen(!megaOpen)} className="nav-link flex items-center gap-2">
              Shop products
              <svg aria-hidden="true" viewBox="0 0 16 16" className={`h-3 w-3 transition ${megaOpen ? "rotate-180" : ""}`} fill="none">
                <path d="m3 6 5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {megaOpen && (
              <div className="absolute top-full right-0 left-0 border-t border-purple/10 bg-white p-8 shadow-xl">
                <div className="mx-auto grid max-w-6xl grid-cols-5 gap-3">
                  {categories.map((category, index) => (
                    <button key={category.name} onClick={() => chooseCategory(category.name)} className={`group rounded-2xl p-5 text-left normal-case ${category.tone}`}>
                      <span className="text-[9px] font-bold tracking-widest text-purple uppercase">0{index + 1}</span>
                      <p className="mt-7 font-display text-xl font-semibold">{category.name}</p>
                      <p className="mt-1 text-xs font-normal text-ink/55">{category.line}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => scrollTo("products")} className="nav-link">Bestsellers</button>
          <button onClick={() => scrollTo("promise")} className="nav-link">Our promise</button>
          <button onClick={() => scrollTo("about")} className="nav-link">About Duck</button>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAccountScreen(customerSignedIn ? "profile" : "login")}
            className="grid h-11 w-11 place-items-center rounded-full border border-purple/20 text-purple transition hover:border-purple hover:bg-lilac"
            aria-label={customerSignedIn ? "Open my profile" : "Sign in"}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5.5 20a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex h-11 items-center gap-2 rounded-full border border-purple/20 px-4 transition hover:border-purple hover:bg-lilac"
            aria-label={`Shopping bag with ${cartCount} items`}
          >
            <BagIcon />
            <span className="hidden text-xs font-bold uppercase sm:block">Cart ({cartCount})</span>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{cartCount}</span>}
          </button>
          <button className="grid h-10 w-10 place-items-center lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
            <span className="space-y-1.5"><span className="block h-px w-5 bg-ink" /><span className="block h-px w-5 bg-ink" /></span>
          </button>
        </div>
        {menuOpen && (
          <nav className="absolute top-full right-0 left-0 flex flex-col items-start gap-5 border-b border-purple/10 bg-white p-6 text-sm font-bold uppercase shadow-lg lg:hidden">
            {categories.map((category) => <button key={category.name} onClick={() => { chooseCategory(category.name); setMenuOpen(false); }}>{category.name}</button>)}
            <button onClick={() => { scrollTo("products"); setMenuOpen(false); }}>Bestsellers</button>
            <button onClick={() => { scrollTo("promise"); setMenuOpen(false); }}>Our promise</button>
            <button onClick={() => { scrollTo("about"); setMenuOpen(false); }}>About Duck</button>
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section className="grid min-h-[40rem] lg:grid-cols-[1.04fr_0.96fr]">
        <div className="relative flex flex-col justify-center bg-lilac px-6 py-20 md:px-12 lg:px-20">
          <span className="mb-7 w-fit rounded-full border border-purple/20 bg-white/60 px-4 py-2 text-[10px] font-bold tracking-[0.16em] text-purple uppercase">
            Care made simple
          </span>
          <h1 className="max-w-3xl font-display text-6xl leading-[0.92] font-semibold tracking-[-0.045em] text-purple-dark md:text-8xl">
            {storeSettings.heroHeadline || "One little duck. A whole lot of care."}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-ink/65 md:text-lg">
            {storeSettings.heroSubtitle || "Thoughtful baby care, skin care, wellness relief, and cosmetics—made for the real rhythm of family life in India."}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button onClick={() => scrollTo("categories")} className="flex items-center gap-8 rounded-full bg-purple px-7 py-4 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-purple-dark">
              Explore all care <ArrowIcon />
            </button>
            <button onClick={() => chooseCategory("Baby Care")} className="rounded-full border border-purple/25 bg-white/50 px-7 py-4 text-xs font-bold tracking-wider text-purple uppercase">
              Shop baby
            </button>
          </div>
        </div>
        <div className="hero-products relative flex min-h-[32rem] items-end justify-center overflow-hidden bg-mint px-6 pb-12">
          <div className="absolute top-10 right-10 h-40 w-40 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-16 left-12 h-52 w-52 rounded-full bg-lilac blur-2xl" />

          {storeSettings.heroImageUrl ? (
            <div className="relative z-10 flex h-full w-full items-center justify-center p-6">
              <img
                src={storeSettings.heroImageUrl}
                alt={storeSettings.heroHeadline || "Duck Cosmetics Hero Products"}
                className="max-h-[28rem] w-auto max-w-full rounded-3xl object-contain drop-shadow-2xl transition duration-500 hover:scale-105"
              />
            </div>
          ) : (
            <>
              {/* Product 1 (Left - Ortho / Custom) */}
              <div className="pack pack-oil z-10">
                <div className="pack-cap" />
                {storeSettings.heroProduct1?.image ? (
                  <img src={storeSettings.heroProduct1.image} alt={storeSettings.heroProduct1.title || "Product 1"} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <>
                    <img src={storeSettings.logoUrl || "/duck-logo.png"} onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }} alt="" />
                    <small>{storeSettings.heroProduct1?.label || "ORTHO"}</small>
                    <strong>{storeSettings.heroProduct1?.title || "PAIN OIL"}</strong>
                    <span>{storeSettings.heroProduct1?.subtitle || "Herbal comfort"}</span>
                  </>
                )}
              </div>

              {/* Product 2 (Center - Baby Care / Custom) */}
              <div className="pack pack-baby z-20">
                <div className="pack-pump" />
                {storeSettings.heroProduct2?.image ? (
                  <img src={storeSettings.heroProduct2.image} alt={storeSettings.heroProduct2.title || "Product 2"} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <>
                    <img src={storeSettings.logoUrl || "/duck-logo.png"} onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }} alt="" />
                    <small>{storeSettings.heroProduct2?.label || "BABY CARE"}</small>
                    <strong>{storeSettings.heroProduct2?.title || "SOFT LOTION"}</strong>
                    <span>{storeSettings.heroProduct2?.subtitle || "Calendula + oat"}</span>
                  </>
                )}
              </div>

              {/* Product 3 (Right - Vapor / Custom) */}
              <div className="pack pack-rub z-30">
                <div className="pack-lid" />
                {storeSettings.heroProduct3?.image ? (
                  <img src={storeSettings.heroProduct3.image} alt={storeSettings.heroProduct3.title || "Product 3"} className="h-full w-full object-cover rounded-2xl" />
                ) : (
                  <>
                    <img src={storeSettings.logoUrl || "/duck-logo.png"} onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }} alt="" />
                    <small>{storeSettings.heroProduct3?.label || "VAPOR"}</small>
                    <strong>{storeSettings.heroProduct3?.title || "COMFORT RUB"}</strong>
                    <span>{storeSettings.heroProduct3?.subtitle || "Eucalyptus + mint"}</span>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Free Gift Promo Banner */}
      {promoActive ? (
        <button
          onClick={() => chooseCategory("Cosmetics")}
          className="group flex w-full items-center justify-center gap-4 bg-coral px-5 py-5 text-center text-xs font-bold tracking-[0.14em] text-white uppercase transition hover:bg-purple"
        >
          {storeSettings.promoBannerText || "Buy any cosmetic and unlock a free face wash (₹349 value)"}
          <span className="transition group-hover:translate-x-1"><ArrowIcon /></span>
        </button>
      ) : (
        <div className="flex w-full items-center justify-center gap-4 bg-purple px-5 py-4 text-center text-xs font-bold tracking-[0.14em] text-white uppercase">
          Complimentary India shipping on orders over ₹{storeSettings.freeShippingThreshold} · Dermatologically tested
        </div>
      )}

      {/* Categories Grid */}
      <section id="categories" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.16em] text-purple uppercase">Find your care</p>
            <h2 className="font-display text-5xl font-semibold tracking-tight md:text-6xl">Good care, head to toe.</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-ink/55">Five focused ranges, one trusted family name. Choose a category to find exactly what you need.</p>
        </div>
        <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0 md:pb-0">
          {categories.map((category) => (
            <button key={category.name} onClick={() => chooseCategory(category.name)} className={`group relative w-[78vw] shrink-0 snap-center overflow-hidden rounded-3xl text-left sm:w-80 md:w-auto ${category.tone}`}>
              <div className="aspect-[4/5] overflow-hidden">
                <img src={category.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              </div>
              {promoActive && category.name === "Cosmetics" && <span className="absolute top-4 left-4 rounded-full bg-coral px-3 py-2 text-[9px] font-bold tracking-wider text-white uppercase shadow-lg">Free face wash</span>}
              <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-purple-dark via-purple-dark/80 to-transparent px-5 pt-16 pb-5 text-white">
                <h3 className="font-display text-2xl font-semibold">{category.name}</h3>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-white/65">{category.line}</p>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-purple transition group-hover:scale-110 group-hover:bg-purple group-hover:text-white"><ArrowIcon /></span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Products Shelf (Dynamic DB Catalog) */}
      <section id="products" className="bg-white px-5 py-20 md:px-10 md:py-28">
        <div className="mb-9 flex flex-col gap-7">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold tracking-[0.16em] text-purple uppercase">The Duck shelf</p>
              <h2 className="font-display text-5xl font-semibold tracking-tight md:text-6xl">{selected === "All" ? "Everyday favorites" : selected}</h2>
            </div>
            <p className="text-sm text-ink/55">{visibleProducts.length} products available</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(["All", ...categories.map((category) => category.name)]).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelected(filter)}
                className={`shrink-0 rounded-full px-5 py-2.5 text-[11px] font-bold tracking-wider uppercase transition ${selected === filter ? "bg-purple text-white" : "border border-purple/15 bg-canvas text-ink hover:border-purple/50"}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-purple/20 bg-canvas/40 p-12 text-center max-w-xl mx-auto my-8">
            <span className="inline-block text-3xl mb-3">📦</span>
            <h3 className="font-display text-2xl font-semibold text-purple-dark">Catalog is being prepared</h3>
            <p className="mt-2 text-xs text-ink/60">
              No products found in this category right now. Add your products in the Admin Dashboard to have them appear here immediately.
            </p>
            <button
              onClick={() => setStaffLoginOpen(true)}
              className="mt-5 rounded-full bg-purple px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-purple-dark transition shadow-sm"
            >
              Open Admin Dashboard
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 ${visibleProducts.length <= 2 ? "mx-auto max-w-3xl" : "lg:grid-cols-4"}`}>
            {visibleProducts.map((product) => {
              const isLowStock = (product.stock ?? 10) <= (product.lowStockThreshold ?? 10) && (product.stock ?? 10) > 0;
              const isOutOfStock = (product.stock ?? 10) === 0;

              return (
                <article
                  key={product.name}
                  className="group cursor-pointer"
                  onClick={() => openProduct(product)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-canvas">
                    <div className="h-full w-full transition duration-700 group-hover:scale-105">
                      <ProductVisual product={product} />
                    </div>
                    {product.badge && <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold tracking-wider text-purple uppercase">{product.badge}</span>}
                    {isLowStock && <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-3 py-1.5 text-[9px] font-bold tracking-wider text-white uppercase">Only {product.stock} left</span>}
                    {isOutOfStock && <span className="absolute top-3 left-3 rounded-full bg-red-600 px-3 py-1.5 text-[9px] font-bold tracking-wider text-white uppercase">Out of Stock</span>}
                    <span className="absolute top-3 right-3 rounded-full bg-purple px-3 py-1.5 text-[9px] font-bold tracking-wider text-white uppercase shadow-lg">
                      View details
                    </span>
                    <button
                      disabled={isOutOfStock}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (!isOutOfStock) openProduct(product);
                      }}
                      className="absolute right-3 bottom-3 left-3 rounded-full bg-purple px-4 py-3 text-[10px] font-bold tracking-wider text-white uppercase opacity-100 transition hover:bg-purple-dark md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 disabled:opacity-40"
                    >
                      {isOutOfStock ? "Out of Stock" : "Product details"}
                    </button>
                  </div>
                  <div className="pt-4">
                    <p className="text-[9px] font-bold tracking-[0.14em] text-purple uppercase">{product.category}</p>
                    <div className="mt-1 flex justify-between gap-3">
                      <h3 className="font-display text-lg leading-tight font-semibold md:text-xl">{product.name}</h3>
                      <p className="text-sm font-bold text-purple-dark">{product.price}</p>
                    </div>
                    <p className="mt-2 text-xs text-ink/50">{product.detail}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60] bg-purple-dark/45 backdrop-blur-sm" onClick={() => setCartOpen(false)}>
          <aside
            className="cart-drawer ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            aria-label="Shopping cart"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-purple/10 px-6 py-5">
              <div>
                <p className="text-[9px] font-bold tracking-[0.16em] text-purple uppercase">Your order</p>
                <h2 className="mt-1 font-display text-3xl font-semibold">Cart ({cartCount})</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-lilac text-purple" aria-label="Close cart">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {cartItems.length === 0 && !freeWashAdded ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-lilac text-purple"><BagIcon /></span>
                  <h3 className="mt-5 font-display text-2xl font-semibold">Your cart is ready</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink/50">Add any cosmetic to unlock your complimentary Duck Face Wash.</p>
                  <button onClick={() => { setCartOpen(false); chooseCategory("Cosmetics"); }} className="mt-6 rounded-full bg-purple px-6 py-3 text-[10px] font-bold tracking-wider text-white uppercase">Shop cosmetics</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartLines.map(({ product, quantity }) => (
                    <div key={product.name} className="flex gap-4 rounded-2xl bg-canvas p-3">
                      <div className="h-20 w-16 overflow-hidden rounded-xl"><ProductVisual product={product} compact /></div>
                      <div className="min-w-0 flex-1 py-1">
                        <p className="text-[8px] font-bold tracking-wider text-purple uppercase">{product.category}</p>
                        <h3 className="mt-1 truncate font-display text-base font-semibold">{product.name}</h3>
                        <div className="mt-2 flex items-center gap-2">
                          <button onClick={() => changeQuantity(product, -1)} className="grid h-6 w-6 place-items-center rounded-full border border-purple/15 text-xs">−</button>
                          <span className="min-w-4 text-center text-xs font-bold">{quantity}</span>
                          <button onClick={() => changeQuantity(product, 1)} className="grid h-6 w-6 place-items-center rounded-full border border-purple/15 text-xs">+</button>
                          <button onClick={() => {
                            const nextItems = cartItems.filter((item) => item.name !== product.name);
                            setCartItems(nextItems);
                            if (!nextItems.some((item) => item.category === "Cosmetics")) setFreeWashAdded(false);
                          }} className="ml-2 text-[8px] font-bold text-ink/35 underline">Remove</button>
                        </div>
                      </div>
                      <strong className="pt-1 text-sm">{product.price}</strong>
                    </div>
                  ))}
                  {freeWashAdded && promoActive && (
                    <div className="flex gap-4 rounded-2xl border border-dashed border-coral bg-blush p-3 items-center">
                      <div className="grid h-16 w-16 place-items-center rounded-xl bg-white text-center text-[8px] font-bold text-purple uppercase p-1">
                        <img src="https://images.unsplash.com/photo-1738892248212-80f7d1f5fc94?w=200" alt="Face Wash" className="h-9 w-9 object-cover rounded-lg mb-0.5" />
                        Gift
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-coral px-1.5 py-0.5 text-[8px] font-bold text-white uppercase">Limit 1</span>
                          <p className="text-[8px] font-bold tracking-wider text-coral uppercase">Complimentary Gift</p>
                        </div>
                        <h3 className="mt-1 font-display text-sm font-semibold">Daily Fresh Face Wash (150 ml)</h3>
                        <span className="text-[10px] text-ink/40 line-through">₹399.00</span>
                      </div>
                      <div className="text-right">
                        <strong className="block text-sm text-coral font-bold">₹0.00</strong>
                        <button
                          onClick={() => setFreeWashAdded(false)}
                          className="text-[9px] font-bold text-ink/40 hover:text-red-500 uppercase underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-purple/10 p-6">
              {promoActive && cosmeticsInCart && !freeWashAdded && (
                <div className="mb-5 rounded-2xl bg-blush p-4">
                  <p className="text-[9px] font-bold tracking-wider text-coral uppercase">Congratulations—gift unlocked</p>
                  <p className="mt-1 font-display text-lg font-semibold">Your complimentary face wash is ready.</p>
                  <button onClick={() => setFreeWashAdded(true)} className="mt-3 flex items-center gap-2 text-[10px] font-bold tracking-wider text-purple uppercase">Add free gift <ArrowIcon /></button>
                </div>
              )}
              {promoActive && !cosmeticsInCart && cartItems.length > 0 && (
                <button onClick={() => { setCartOpen(false); chooseCategory("Cosmetics"); }} className="mb-5 w-full rounded-2xl bg-lilac p-4 text-left">
                  <span className="text-[9px] font-bold tracking-wider text-purple uppercase">Special offer</span>
                  <span className="mt-1 block font-display text-lg font-semibold">Add any cosmetic, get a free face wash.</span>
                </button>
              )}

              {/* Promo Coupon Bar */}
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (e.g. DUCK15)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="flex-1 rounded-xl border border-purple/15 px-3 py-2 text-xs outline-none uppercase font-mono"
                />
                <button
                  onClick={handleApplyCoupon}
                  className="rounded-xl bg-purple px-4 py-2 text-[10px] font-bold text-white uppercase hover:bg-purple-dark"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="mb-2 text-[10px] font-semibold text-red-600">{couponError}</p>}
              {appliedCoupon && <p className="mb-2 text-[10px] font-semibold text-emerald-700">✓ Coupon {appliedCoupon} applied (-₹{couponDiscount})</p>}

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase">Subtotal</span>
                <strong className="font-display text-2xl">₹{subtotal.toLocaleString("en-IN")}</strong>
              </div>
              {couponDiscount > 0 && (
                <div className="mt-1 flex justify-between text-xs text-coral font-medium">
                  <span>Discount</span>
                  <span>-₹{couponDiscount}</span>
                </div>
              )}
              <div className="mt-1 flex justify-between text-[10px] text-ink/45">
                <span>Shipping</span>
                <span>{shippingFee === 0 ? "Free" : `₹${shippingFee}`}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-purple/10 pt-2 font-display text-lg font-bold">
                <span>Total</span>
                <span>₹{finalOrderTotal.toLocaleString("en-IN")}</span>
              </div>
              <button
                disabled={cartItems.length === 0}
                onClick={() => { setCartOpen(false); setCheckoutOpen(true); setCheckoutStep("address"); }}
                className="mt-5 w-full rounded-full bg-purple py-4 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-purple-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Secure checkout
              </button>
              <p className="mt-3 text-center text-[9px] text-ink/40">GST included · Secure Indian payments</p>
            </div>
          </aside>
        </div>
      )}

      {/* 3-Step Checkout Flow */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-[65] overflow-y-auto bg-canvas">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-purple/10 bg-white px-5 py-4 md:px-10">
            <img
              src={storeSettings.logoUrl || "/duck-logo.png"}
              onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }}
              alt="Duck"
              className="h-11 w-28 object-contain"
            />
            <div className="hidden items-center gap-3 text-[9px] font-bold tracking-wider uppercase sm:flex">
              {["address", "payment", "confirmed"].map((step, index) => (
                <span key={step} className={`flex items-center gap-2 ${checkoutStep === step ? "text-purple" : "text-ink/30"}`}>
                  <span className={`grid h-6 w-6 place-items-center rounded-full ${checkoutStep === step ? "bg-purple text-white" : "bg-lilac"}`}>{index + 1}</span>{step}
                </span>
              ))}
            </div>
            <button onClick={() => setCheckoutOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-lilac text-purple" aria-label="Close checkout">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" /></svg>
            </button>
          </header>

          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1fr_22rem] lg:py-12">
            <div className="rounded-3xl bg-white p-6 shadow-sm md:p-9">
              {checkoutError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-600">
                  ⚠ {checkoutError}
                </div>
              )}

              {checkoutStep === "address" && (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (/^[1-9][0-9]{5}$/.test(pinCode)) {
                      setPinChecked(true);
                      setCheckoutStep("payment");
                    }
                  }}
                >
                  <p className="text-[9px] font-bold tracking-[0.16em] text-purple uppercase">Step 1 of 3</p>
                  <h2 className="mt-2 font-display text-4xl font-semibold">Delivery address</h2>
                  <p className="mt-2 text-sm text-ink/50">Enter an Indian delivery address for this order.</p>
                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    <label className="sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase">Full name</span><input required value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Your full name" className="checkout-input" /></label>
                    <label><span className="mb-2 block text-[9px] font-bold uppercase">Mobile number</span><input required inputMode="tel" pattern="[6-9][0-9]{9}" value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="10-digit mobile number" className="checkout-input" /></label>
                    <label><span className="mb-2 block text-[9px] font-bold uppercase">Email address</span><input required type="email" value={custEmail} onChange={(e) => setCustEmail(e.target.value)} placeholder="you@example.com" className="checkout-input" /></label>
                    <label className="sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase">PIN code</span><input required value={pinCode} onChange={(event) => { setPinCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setPinChecked(false); }} inputMode="numeric" pattern="[1-9][0-9]{5}" placeholder="6-digit PIN code" className="checkout-input" /></label>
                    <label className="sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase">Flat, house number, building</span><input required value={custAddress1} onChange={(e) => setCustAddress1(e.target.value)} placeholder="House number and building" className="checkout-input" /></label>
                    <label className="sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase">Area, street, landmark</span><input required value={custAddress2} onChange={(e) => setCustAddress2(e.target.value)} placeholder="Area, street or nearby landmark" className="checkout-input" /></label>
                    <label><span className="mb-2 block text-[9px] font-bold uppercase">City</span><input required value={custCity} onChange={(e) => setCustCity(e.target.value)} placeholder="City" className="checkout-input" /></label>
                    <label><span className="mb-2 block text-[9px] font-bold uppercase">State</span><select value={custState} onChange={(e) => setCustState(e.target.value)} required className="checkout-input bg-white"><option>Gujarat</option><option>Maharashtra</option><option>Delhi</option><option>Karnataka</option><option>Tamil Nadu</option><option>Uttar Pradesh</option><option>West Bengal</option></select></label>
                  </div>
                  {pinCode.length === 6 && <p className="mt-4 text-xs font-semibold text-purple">Delivery available · Estimated 3–5 business days</p>}
                  <button type="submit" className="mt-7 w-full rounded-full bg-purple py-4 text-xs font-bold tracking-wider text-white uppercase">Continue to payment</button>
                </form>
              )}

              {checkoutStep === "payment" && (
                <form onSubmit={handlePlaceOrder}>
                  <p className="text-[9px] font-bold tracking-[0.16em] text-purple uppercase">Step 2 of 3</p>
                  <h2 className="mt-2 font-display text-4xl font-semibold">Choose payment</h2>
                  <p className="mt-2 text-sm text-ink/50">All transactions are encrypted and secured in India.</p>
                  <div className="mt-7 space-y-3">
                    {[
                      ["UPI", "Google Pay, PhonePe, Paytm or any UPI app"],
                      ["Card", "Visa, Mastercard and RuPay debit or credit cards"],
                      ["Stripe", "International & domestic cards powered by Stripe"],
                      ["Cash on Delivery", "Pay in cash when your order arrives"],
                    ].map(([method, note]) => (
                      <button type="button" key={method} onClick={() => setPaymentMethod(method)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${paymentMethod === method ? "border-purple bg-lilac/50" : "border-purple/10"}`}>
                        <span className={`grid h-5 w-5 place-items-center rounded-full border ${paymentMethod === method ? "border-purple" : "border-ink/20"}`}>{paymentMethod === method && <span className="h-2.5 w-2.5 rounded-full bg-purple" />}</span>
                        <span><strong className="block text-sm">{method}</strong><small className="mt-1 block text-ink/45">{note}</small></span>
                      </button>
                    ))}
                  </div>

                  <label className="mt-5 block">
                    <span className="mb-2 block text-[9px] font-bold uppercase">Delivery instructions / Special note</span>
                    <input
                      type="text"
                      placeholder="e.g. Ring bell twice, deliver before 5 PM"
                      value={custNotes}
                      onChange={(e) => setCustNotes(e.target.value)}
                      className="checkout-input"
                    />
                  </label>

                  <button type="submit" className="mt-7 w-full rounded-full bg-purple py-4 text-xs font-bold tracking-wider text-white uppercase">
                    {paymentMethod === "Cash on Delivery" ? `Confirm Cash on Delivery Order (₹${finalOrderTotal.toLocaleString("en-IN")})` : `Pay ₹${finalOrderTotal.toLocaleString("en-IN")} via ${paymentMethod}`}
                  </button>
                  <button type="button" onClick={() => setCheckoutStep("address")} className="mt-4 w-full text-[9px] font-bold tracking-wider text-purple uppercase">Back to address</button>
                </form>
              )}

              {checkoutStep === "confirmed" && placedOrder && (
                <div className="flex min-h-[30rem] flex-col items-center justify-center text-center">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-mint text-purple">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10" fill="none"><path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="1.8" /></svg>
                  </span>
                  <p className="mt-7 text-[9px] font-bold tracking-[0.16em] text-purple uppercase">Order {placedOrder.orderNumber} confirmed</p>
                  <h2 className="mt-3 font-display text-5xl font-semibold">Thank you for your order!</h2>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/60">
                    Your Duck Cosmetics order is saved in the database. Invoice reference: <strong>{placedOrder.invoiceNumber}</strong>. We’ve sent SMS/WhatsApp confirmations to {placedOrder.customerPhone}.
                  </p>
                  <div className="mt-6 rounded-2xl bg-lilac/50 p-5 text-left text-xs max-w-md w-full space-y-2">
                    <div className="flex justify-between"><span>Recipient:</span><strong>{placedOrder.customerName}</strong></div>
                    <div className="flex justify-between"><span>Payment Method:</span><strong>{placedOrder.paymentMethod} ({placedOrder.paymentStatus})</strong></div>
                    <div className="flex justify-between"><span>Total:</span><strong className="text-purple">₹{placedOrder.grandTotal.toLocaleString("en-IN")}</strong></div>
                    <div className="flex justify-between"><span>Delivery Estimate:</span><strong>3–5 business days</strong></div>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <button
                      onClick={() => {
                        setCheckoutOpen(false);
                        setAccountScreen("orders");
                      }}
                      className="rounded-full bg-purple px-7 py-3 text-xs font-bold text-white uppercase hover:bg-purple-dark"
                    >
                      Track Order in My Account
                    </button>
                    <button
                      onClick={() => {
                        setCheckoutOpen(false);
                      }}
                      className="rounded-full border border-purple px-6 py-3 text-xs font-bold text-purple uppercase hover:bg-lilac"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-3xl bg-purple-dark p-6 text-white lg:sticky lg:top-28">
              <p className="text-[9px] font-bold tracking-wider text-lilac uppercase">Order summary</p>
              <div className="mt-5 space-y-3">
                {cartLines.map(({ product, quantity }) => <div key={product.name} className="flex justify-between gap-4 text-xs"><span className="text-white/65">{product.name} × {quantity}</span><strong>{product.price}</strong></div>)}
                {freeWashAdded && promoActive && <div className="flex justify-between text-xs text-lilac"><span>Daily Fresh Face Wash (Free Gift)</span><strong className="text-coral">₹0.00 (Free)</strong></div>}
              </div>
              <div className="mt-6 space-y-2 border-t border-white/15 pt-5 text-xs">
                <div className="flex justify-between text-white/60"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-coral"><span>Discount</span><span>-₹{couponDiscount}</span></div>}
                <div className="flex justify-between text-white/60"><span>Shipping</span><span>{shippingFee === 0 ? "Free" : `₹${shippingFee}`}</span></div>
                <div className="mt-3 flex justify-between font-display text-xl"><span>Total</span><strong>₹{finalOrderTotal.toLocaleString("en-IN")}</strong></div>
              </div>
              <p className="mt-6 text-[9px] leading-relaxed text-white/35">Prices include applicable GST. Payments processed securely in India.</p>
            </aside>
          </div>
        </div>
      )}

      {/* Active Product Details Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-[55] overflow-y-auto bg-white" role="dialog" aria-modal="true" aria-label={`${activeProduct.name} product page`}>
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-purple/10 bg-white/95 px-5 py-4 backdrop-blur md:px-10">
            <button onClick={() => setActiveProduct(null)}>
              <img
                src={storeSettings.logoUrl || "/duck-logo.png"}
                onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }}
                alt="Duck"
                className="h-11 w-28 object-contain"
              />
            </button>
            <p className="hidden text-[9px] font-bold tracking-[0.15em] text-purple uppercase sm:block">Product details</p>
            <button onClick={() => setActiveProduct(null)} className="grid h-10 w-10 place-items-center rounded-full bg-lilac text-purple" aria-label="Close product page">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" /></svg>
            </button>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-6 md:px-10 md:py-10">
            <nav className="mb-6 flex items-center gap-2 text-[10px] text-ink/40"><button onClick={() => setActiveProduct(null)}>Home</button><span>→</span><button onClick={() => { setActiveProduct(null); chooseCategory(activeProduct.category); }}>{activeProduct.category}</button><span>→</span><strong className="text-purple">{activeProduct.name}</strong></nav>
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <section className="lg:sticky lg:top-28 lg:h-fit">
                <button onClick={() => setGalleryZoom(!galleryZoom)} className="group relative aspect-square w-full overflow-hidden rounded-3xl bg-lilac" aria-label="Zoom product image">
                  <div className={`h-full w-full transition duration-500 ${galleryZoom ? "scale-125" : "group-hover:scale-105"}`}><ProductVisual product={activeProduct} view={galleryView} /></div>
                  <span className="absolute right-4 bottom-4 rounded-full bg-white/90 px-4 py-2 text-[9px] font-bold tracking-wider text-purple uppercase shadow">{galleryZoom ? "Zoom out" : "Click to zoom"}</span>
                </button>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {["Front", "Back", "Texture", "Pack", "In use"].map((label, index) => (
                    <button key={label} onClick={() => { setGalleryView(index); setGalleryZoom(false); }} className={`overflow-hidden rounded-xl border p-1 transition ${galleryView === index ? "border-purple" : "border-purple/10 hover:border-purple/40"}`}>
                      <div className="aspect-square overflow-hidden rounded-lg"><ProductVisual product={activeProduct} compact view={index} /></div><span className="mt-1 block text-[8px] font-bold text-ink/45">{label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-[9px] font-bold tracking-[0.17em] text-purple uppercase">Duck {activeProduct.category}</p><h1 className="mt-3 font-display text-4xl leading-tight font-semibold text-purple-dark md:text-6xl">{activeProduct.name}</h1></div>
                  <button onClick={() => setWishlist((items) => items.includes(activeProduct.name) ? items.filter((item) => item !== activeProduct.name) : [...items, activeProduct.name])} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition ${wishlist.includes(activeProduct.name) ? "border-coral bg-blush text-coral" : "border-purple/15 text-purple"}`} aria-label="Add to wishlist">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill={wishlist.includes(activeProduct.name) ? "currentColor" : "none"}><path d="M12 20S4 15.4 4 9.3A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 8 2.3C20 15.4 12 20 12 20Z" stroke="currentColor" strokeWidth="1.6" /></svg>
                  </button>
                </div>
                <div className="mt-4 flex items-center gap-3"><span className="text-sm font-bold text-purple">4.8 / 5</span><button className="text-xs text-ink/45 underline">126 verified reviews</button></div>
                <p className="mt-5 text-sm leading-relaxed text-ink/60">Thoughtfully formulated for dependable everyday care with clear ingredients, simple directions, and family-friendly packaging.</p>

                <div className="mt-7 rounded-3xl bg-canvas p-5 md:p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-display text-4xl font-semibold">{activeProduct.price}</p>
                      <p className="mt-1 text-[9px] text-ink/40">MRP inclusive of all taxes</p>
                    </div>
                    <span className={`rounded-full px-3 py-2 text-[9px] font-bold uppercase ${
                      (activeProduct.stock ?? 10) > 0 ? "bg-mint text-purple-dark" : "bg-red-100 text-red-700"
                    }`}>
                      {(activeProduct.stock ?? 10) > 0 ? "In stock" : "Out of stock"}
                    </span>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold tracking-wider uppercase">Quantity</p>
                      <div className="mt-2 flex items-center rounded-full border border-purple/15 bg-white p-1">
                        <button onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-lilac">−</button>
                        <span className="w-10 text-center text-sm font-bold">{productQuantity}</span>
                        <button onClick={() => setProductQuantity(Math.min(10, productQuantity + 1))} className="grid h-9 w-9 place-items-center rounded-full hover:bg-lilac">+</button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold tracking-wider uppercase">Net quantity</p>
                      <p className="mt-2 text-sm font-semibold">{activeProduct.detail.split("·")[1]?.trim() || activeProduct.detail}</p>
                    </div>
                  </div>
                  <button
                    disabled={(activeProduct.stock ?? 10) === 0}
                    onClick={() => addProductQuantity(activeProduct)}
                    className="mt-6 w-full rounded-full bg-purple py-4 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-purple-dark disabled:opacity-40"
                  >
                    Add to bag
                  </button>
                  <button
                    disabled={(activeProduct.stock ?? 10) === 0}
                    onClick={() => addProductQuantity(activeProduct, true)}
                    className="mt-3 w-full rounded-full border border-purple py-4 text-xs font-bold tracking-wider text-purple uppercase transition hover:bg-lilac disabled:opacity-40"
                  >
                    Buy now
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-purple/10 p-5">
                  <p className="text-[9px] font-bold tracking-wider text-purple uppercase">Delivery information</p>
                  <div className="mt-3 flex gap-2">
                    <input value={pinCode} onChange={(event) => { setPinCode(event.target.value.replace(/\D/g, "").slice(0, 6)); setPinChecked(false); }} inputMode="numeric" placeholder="Enter 6-digit PIN code" className="checkout-input min-w-0 flex-1" />
                    <button onClick={checkPinCode} className="rounded-xl bg-purple px-5 text-[9px] font-bold text-white uppercase">Check</button>
                  </div>
                  {pinChecked ? <p className="mt-3 text-xs font-semibold text-purple">Delivery is available. Estimated 3–5 business days.</p> : pinCode.length === 6 && <p className="mt-3 text-xs font-semibold text-coral">Enter a valid Indian PIN code.</p>}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-[10px] text-ink/55"><p>Shipping: ₹79 or free above ₹999</p><p>Returns: unopened items within 7 days</p></div>
                </div>

                <div className="mt-8 divide-y divide-purple/10 border-y border-purple/10">
                  {[
                    ["Ingredients", productInformation[activeProduct.category]?.ingredients || ""],
                    ["Directions", productInformation[activeProduct.category]?.directions || ""],
                    ["Warnings & age guidance", (productInformation[activeProduct.category]?.warning || "") + (activeProduct.category === "Baby Care" ? " Review the pack label for age suitability before use." : "")],
                    ["Manufacturer & pack information", "Manufactured in India for Duck Care Private Limited. Batch number, manufacturing date, use-before date and customer-care details printed on retail pack."],
                  ].map(([title, copy]) => <details key={title} className="group py-5" open={title === "Ingredients"}><summary className="flex cursor-pointer list-none items-center justify-between text-xs font-bold tracking-wider uppercase">{title}<span className="text-lg text-purple group-open:rotate-45">+</span></summary><p className="mt-3 text-xs leading-relaxed text-ink/55">{copy}</p></details>)}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Promise Section */}
      <section id="promise" className="grid lg:grid-cols-2">
        <div className="relative min-h-[34rem] overflow-hidden">
          <img src="https://images.unsplash.com/photo-1642764733829-59e40ee5af5b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200" alt="Thoughtfully arranged clean care products" className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center bg-purple px-7 py-20 text-white md:px-16 lg:px-20">
          <p className="text-xs font-bold tracking-[0.18em] text-lilac uppercase">Care you can count on</p>
          <h2 className="mt-5 max-w-2xl font-display text-5xl leading-[0.98] font-semibold tracking-tight md:text-7xl">Made gently.<br />Made responsibly.</h2>
          <p className="mt-7 max-w-xl text-base leading-relaxed text-white/70">From a baby’s first bath to your nightly skin ritual, we make dependable care with carefully selected ingredients and no unnecessary fuss.</p>
          <div className="mt-10 grid grid-cols-2 gap-6 border-t border-white/20 pt-7 text-xs font-bold tracking-wider uppercase">
            <p>Clear labelling</p><p>Thoughtful formulas</p><p>Family focused</p><p>Batch traceability</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-canvas px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-[10px] font-bold tracking-[0.18em] text-gold uppercase">Contact Duck Cosmetics</p>
            <h2 className="mt-4 font-display text-5xl font-semibold tracking-tight text-purple-dark md:text-7xl">We’re here to help you care better.</h2>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/55">Have a question about our products, orders, or baby-care and skincare range? We’d love to hear from you. Contact our team, and we’ll be happy to assist you.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-3xl bg-purple-dark p-7 text-white md:p-10">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M7.2 3.5 10 8 7.8 9.8a15 15 0 0 0 6.4 6.4L16 14l4.5 2.8-1.1 3.1c-.3.8-1.1 1.3-2 1.2C9.6 20 4 14.4 2.9 6.6c-.1-.9.4-1.7 1.2-2l3.1-1.1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                  </span>
                  <div>
                    <p className="text-[9px] font-bold tracking-wider text-gold uppercase">Call us</p>
                    <div className="mt-2 flex flex-col gap-1 text-sm text-white/70">
                      <a href={`tel:${storeSettings.supportPhone1}`} className="transition hover:text-white">{storeSettings.supportPhone1}</a>
                      <a href={`tel:${storeSettings.supportPhone2}`} className="transition hover:text-white">{storeSettings.supportPhone2}</a>
                      <a href={`tel:${storeSettings.supportPhone3}`} className="transition hover:text-white">{storeSettings.supportPhone3}</a>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M3 5.5h18v13H3v-13Zm0 .5 9 7 9-7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                  </span>
                  <div>
                    <p className="text-[9px] font-bold tracking-wider text-gold uppercase">Email us</p>
                    <a href={`mailto:${storeSettings.supportEmail}`} className="mt-2 block text-sm text-white/70 transition hover:text-white">{storeSettings.supportEmail}</a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-gold">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth="1.5" /><circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" /></svg>
                  </span>
                  <div>
                    <p className="text-[9px] font-bold tracking-wider text-gold uppercase">Visit us</p>
                    <address className="mt-2 max-w-sm text-sm leading-relaxed text-white/70 not-italic">{storeSettings.address}</address>
                  </div>
                </div>
              </div>
              <p className="mt-10 border-t border-white/15 pt-7 font-display text-2xl text-lilac">Duck Cosmetics — Care for Every Little Moment.</p>
            </div>

            <div className="rounded-3xl border border-purple/10 bg-white p-7 md:p-10">
              <p className="text-[9px] font-bold tracking-[0.16em] text-purple uppercase">Send us a message</p>
              <h3 className="mt-2 font-display text-4xl font-semibold">How can we help?</h3>
              {contactSent ? (
                <div className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-2xl bg-lilac/50 p-8 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-purple text-white"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none"><path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="1.8" /></svg></span>
                  <h4 className="mt-5 font-display text-3xl font-semibold">Support ticket created.</h4>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/50">Thank you! Your message has been logged in our support CRM system. Our team will contact you shortly.</p>
                  <button onClick={() => setContactSent(false)} className="mt-6 text-[9px] font-bold tracking-wider text-purple uppercase">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label><span className="mb-2 block text-[9px] font-bold uppercase">Name</span><input name="name" required placeholder="Your full name" className="checkout-input" /></label>
                  <label><span className="mb-2 block text-[9px] font-bold uppercase">Email</span><input name="email" required type="email" placeholder="you@example.com" className="checkout-input" /></label>
                  <label><span className="mb-2 block text-[9px] font-bold uppercase">Phone</span><input name="phone" required inputMode="tel" pattern="[6-9][0-9]{9}" placeholder="10-digit mobile number" className="checkout-input" /></label>
                  <label><span className="mb-2 block text-[9px] font-bold uppercase">Subject</span><select name="subject" required className="checkout-input bg-white"><option value="">Choose a subject</option><option>Product information</option><option>Order support</option><option>Baby care guidance</option><option>Wholesale enquiry</option><option>Other</option></select></label>
                  <label className="sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase">Message</span><textarea name="message" required rows={5} placeholder="Tell us how we can help…" className="checkout-input resize-none" /></label>
                  <button type="submit" className="rounded-full bg-purple px-7 py-4 text-xs font-bold tracking-wider text-white uppercase transition hover:bg-purple-dark sm:col-span-2">Send message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="about" className="bg-purple-dark px-6 py-16 text-white md:px-12 md:py-20">
        <div className="grid gap-14 md:grid-cols-2">
          <div>
            <div className="inline-flex rounded-xl bg-white p-2">
              <img
                src={storeSettings.logoUrl || "/duck-logo.png"}
                onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }}
                alt="Duck"
                className="h-14 w-36 object-contain"
              />
            </div>
            <h2 className="mt-8 max-w-xl font-display text-4xl leading-tight font-semibold md:text-5xl">Care for every little moment.</h2>
            <div className="mt-7 flex flex-col gap-2 text-xs text-white/50">
              <a href={`mailto:${storeSettings.supportEmail}`} className="hover:text-white">{storeSettings.supportEmail}</a>
              <a href={`tel:${storeSettings.supportPhone1}`} className="hover:text-white">{storeSettings.supportPhone1}</a>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-lilac uppercase">Join the Duck family</p>
            <p className="mt-4 text-sm text-white/55">Useful care tips, new products, and 15% off your first order.</p>
            {subscribed ? (
              <p className="mt-8 border-b border-white/25 pb-4 font-display text-2xl text-lilac">Welcome to the family.</p>
            ) : (
              <form className="mt-6 flex border-b border-white/30" onSubmit={(event) => { event.preventDefault(); if (email.trim()) setSubscribed(true); }}>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" required aria-label="Email address" className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-white/35" />
                <button type="submit" className="px-2 text-lilac" aria-label="Subscribe"><ArrowIcon /></button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-16 flex flex-col justify-between gap-5 border-t border-white/10 pt-6 text-[10px] tracking-[0.14em] text-white/40 uppercase lg:flex-row">
          <p>© {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <button onClick={() => setPolicyOpen("privacy")}>Privacy</button>
            <button onClick={() => setPolicyOpen("terms")}>Terms</button>
            <button onClick={() => setPolicyOpen("shipping")}>Shipping</button>
            <button onClick={() => setPolicyOpen("returns")}>Returns</button>
            <button onClick={() => setPolicyOpen("faq")}>FAQ</button>
            <button onClick={() => scrollTo("contact")}>Contact</button>
            <button onClick={handleOpenStaffPortal} className="transition hover:text-white">Staff Portal</button>
          </div>
        </div>
      </footer>

      {/* Policies Modal */}
      {policyOpen && (
        <div className="fixed inset-0 z-[75] flex items-end justify-center bg-purple-dark/55 p-0 backdrop-blur-sm md:items-center md:p-6" onClick={() => setPolicyOpen(null)}>
          <section className="modal-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-7 shadow-2xl md:rounded-3xl md:p-10" role="dialog" aria-modal="true" aria-label={policyContent[policyOpen].title} onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-5">
              <div><p className="text-[9px] font-bold tracking-wider text-purple uppercase">Duck Cosmetics</p><h2 className="mt-2 font-display text-4xl font-semibold">{policyContent[policyOpen].title}</h2></div>
              <button onClick={() => setPolicyOpen(null)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lilac text-purple" aria-label="Close policy"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" /></svg></button>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-ink/55">{policyContent[policyOpen].intro}</p>
            <div className="mt-7 space-y-3">
              {policyContent[policyOpen].points.map((point, index) => <div key={point} className="flex gap-4 rounded-2xl bg-canvas p-4"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple text-[9px] font-bold text-white">0{index + 1}</span><p className="text-xs leading-relaxed text-ink/60">{point}</p></div>)}
            </div>
          </section>
        </div>
      )}

      {/* Ask Duck AI Floating Button */}
      <button
        onClick={() => setAiOpen(true)}
        className={`fixed right-4 bottom-4 z-40 flex items-center gap-3 rounded-full bg-purple p-3 text-white shadow-2xl transition hover:-translate-y-1 hover:bg-purple-dark md:right-7 md:bottom-7 md:px-5 ${aiOpen ? "pointer-events-none translate-y-3 opacity-0" : ""}`}
        aria-label="Open Duck AI Care Assistant"
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white text-purple">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
            <path d="M7 18.5 3.5 21v-5A8 8 0 1 1 7 18.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
            <path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-mint" />
        </span>
        <span className="hidden text-left md:block">
          <small className="block text-[8px] font-bold tracking-[0.15em] text-lilac uppercase">Ask Duck AI</small>
          <strong className="block text-xs">How can we help?</strong>
        </span>
      </button>

      {/* AI Assistant Modal */}
      {aiOpen && (
        <div className="fixed inset-0 z-[70] flex items-end bg-purple-dark/35 backdrop-blur-sm md:pointer-events-none md:items-end md:justify-end md:bg-transparent md:p-7 md:backdrop-blur-none" onClick={() => setAiOpen(false)}>
          <section
            className="ai-panel pointer-events-auto flex h-[82vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:h-[39rem] md:w-[25rem] md:rounded-3xl md:border md:border-purple/10"
            role="dialog"
            aria-modal="true"
            aria-label="Duck AI Care Assistant"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="relative overflow-hidden bg-purple p-5 text-white">
              <span className="absolute -top-10 -right-7 h-28 w-28 rounded-full border border-white/15" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white">
                    <img
                      src={storeSettings.logoUrl || "/duck-logo.png"}
                      onError={(e) => { (e.target as HTMLImageElement).src = "/duck-logo.png"; }}
                      alt=""
                      className="h-8 w-9 object-contain"
                    />
                  </span>
                  <div>
                    <p className="font-display text-xl font-semibold">Duck Care AI</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[9px] text-white/65"><span className="h-1.5 w-1.5 rounded-full bg-mint" /> Online and ready to help</p>
                  </div>
                </div>
                <button onClick={() => setAiOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:rotate-90 hover:bg-white/20" aria-label="Close AI assistant">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" /></svg>
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto bg-canvas p-4" aria-live="polite">
              {chatMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <p className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${message.role === "user" ? "rounded-br-md bg-purple text-white" : "rounded-bl-md border border-purple/10 bg-white text-ink/70 shadow-sm"}`}>
                    {message.text}
                  </p>
                </div>
              ))}
              {chatMessages.length === 1 && (
                <div className="pt-1">
                  <p className="mb-2 text-[8px] font-bold tracking-wider text-ink/35 uppercase">Popular questions</p>
                  <div className="flex flex-wrap gap-2">
                    {["Best baby product?", "How do I get free Face Wash?", "Tell me about Ortho Oil"].map((prompt) => (
                      <button key={prompt} onClick={() => askAssistant(prompt)} className="rounded-full border border-purple/15 bg-white px-3 py-2 text-[9px] font-semibold text-purple transition hover:border-purple hover:bg-lilac">
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form
              className="border-t border-purple/10 bg-white p-4"
              onSubmit={(event) => {
                event.preventDefault();
                askAssistant(aiInput);
              }}
            >
              <div className="flex items-center gap-2 rounded-full border border-purple/15 bg-canvas p-1.5 pl-4 focus-within:border-purple">
                <input value={aiInput} onChange={(event) => setAiInput(event.target.value)} placeholder="Ask about products or your order…" aria-label="Message Duck AI" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-ink/35" />
                <button type="submit" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-purple text-white transition hover:bg-purple-dark" aria-label="Send message"><ArrowIcon /></button>
              </div>
              <p className="mt-2 text-center text-[8px] leading-relaxed text-ink/35">Product guidance only. For medical advice, consult a qualified healthcare professional.</p>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
