/**
 * Firebase Firestore & Auth Service Layer
 * Replaces Supabase PostgreSQL and Supabase Auth with Google Firebase.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateProfile,
  User,
} from "firebase/auth";
import { auth, firestoreDb, isFirebaseConfigured, googleProvider } from "../lib/firebase";
import { ProductItem, ProductReview, CategoryMeta, StoreSettings, Order, OrderItem, Address, PaymentMethod } from "../types";

/**
 * Recursively cleans an object for Firestore by removing all keys with `undefined` values.
 * Firestore strictly forbids `undefined` in documents and will throw:
 * "Unsupported field value: undefined" if any field contains undefined.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }

  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => cleanForFirestore(item)) as unknown as T;
  }

  if (typeof data === "object") {
    if (data instanceof Date) return data;

    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }

  return data;
}

// ==============================================================================
// 1. PRODUCTS (FIRESTORE)
// ==============================================================================

export async function fetchActiveProductsFromFirestore(): Promise<ProductItem[]> {
  if (!isFirebaseConfigured() || !firestoreDb) return [];

  try {
    const q = query(
      collection(firestoreDb, "products"),
      where("status", "==", "Active")
    );
    const snap = await getDocs(q);
    const items: ProductItem[] = [];
    snap.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    return items;
  } catch (err: any) {
    console.error("[Firestore] Error fetching active products:", err.message);
    return [];
  }
}

export async function fetchAdminProductsFromFirestore(): Promise<ProductItem[]> {
  if (!isFirebaseConfigured() || !firestoreDb) return [];

  try {
    const snap = await getDocs(collection(firestoreDb, "products"));
    const items: ProductItem[] = [];
    snap.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    return items;
  } catch (err: any) {
    console.error("[Firestore] Error fetching admin products:", err.message);
    return [];
  }
}

export async function saveProductToFirestore(product: ProductItem): Promise<ProductItem> {
  if (!isFirebaseConfigured() || !firestoreDb) {
    throw new Error("Firebase is not configured. Add credentials to your .env file or Vercel dashboard.");
  }

  const productId = product.id || `prd-${Date.now()}`;
  const docRef = doc(firestoreDb, "products", productId);

  // Clean all undefined fields (e.g. badge, images, mrp) before writing to Firestore
  const payload = cleanForFirestore({
    ...product,
    id: productId,
    updatedAt: new Date().toISOString(),
  });

  await setDoc(docRef, payload, { merge: true });
  return payload;
}

export async function deleteProductFromFirestore(id: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !firestoreDb) return false;

  try {
    await deleteDoc(doc(firestoreDb, "products", id));
    return true;
  } catch (err: any) {
    console.error("[Firestore] Error deleting product:", err.message);
    throw err;
  }
}

export async function addProductReviewToFirestore(productId: string, review: ProductReview): Promise<{ success: boolean; reviews?: ProductReview[]; rating?: number; reviewCount?: number }> {
  if (!isFirebaseConfigured() || !firestoreDb) return { success: false };

  try {
    const docRef = doc(firestoreDb, "products", productId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as ProductItem;
      const currentReviews = data.reviews || [];
      const updatedReviews = [cleanForFirestore(review), ...currentReviews];
      const newCount = (data.reviewCount || 0) + 1;
      const newRating = Number((((data.rating || 5) * (data.reviewCount || 1) + review.rating) / newCount).toFixed(1));

      await updateDoc(docRef, {
        reviews: updatedReviews,
        reviewCount: newCount,
        rating: newRating,
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        reviews: updatedReviews,
        rating: newRating,
        reviewCount: newCount,
      };
    }
  } catch (err: any) {
    console.error("[Firestore] Error adding review:", err.message);
  }
  return { success: false };
}

// ==============================================================================
// 2. CATEGORIES (FIRESTORE)
// ==============================================================================

export async function fetchCategoriesFromFirestore(): Promise<CategoryMeta[]> {
  if (!isFirebaseConfigured() || !firestoreDb) return [];

  try {
    const snap = await getDocs(collection(firestoreDb, "categories"));
    const list: CategoryMeta[] = [];
    snap.forEach((docSnap) => {
      list.push(docSnap.data() as CategoryMeta);
    });
    return list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (err: any) {
    console.error("[Firestore] Error fetching categories:", err.message);
    return [];
  }
}

export async function saveCategoryToFirestore(category: CategoryMeta): Promise<CategoryMeta> {
  if (!isFirebaseConfigured() || !firestoreDb) {
    throw new Error("Firebase is not configured.");
  }

  const catId = category.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const docRef = doc(firestoreDb, "categories", catId);
  const payload = cleanForFirestore(category);
  await setDoc(docRef, payload, { merge: true });
  return payload;
}

export async function deleteCategoryFromFirestore(categoryName: string): Promise<boolean> {
  if (!isFirebaseConfigured() || !firestoreDb) return false;

  const catId = categoryName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  await deleteDoc(doc(firestoreDb, "categories", catId));
  return true;
}

// ==============================================================================
// 3. SITE SETTINGS (FIRESTORE)
// ==============================================================================

export async function fetchSiteSettingsFromFirestore(): Promise<Partial<StoreSettings> | null> {
  if (!isFirebaseConfigured() || !firestoreDb) return null;

  try {
    const docRef = doc(firestoreDb, "site_settings", "default");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as Partial<StoreSettings>;
    }
    return null;
  } catch (err: any) {
    console.error("[Firestore] Error loading site settings:", err.message);
    return null;
  }
}

export async function saveSiteSettingsToFirestore(settings: StoreSettings): Promise<void> {
  if (!isFirebaseConfigured() || !firestoreDb) {
    throw new Error("Firebase is not configured.");
  }

  const docRef = doc(firestoreDb, "site_settings", "default");
  const payload = cleanForFirestore({ ...settings, updatedAt: new Date().toISOString() });
  await setDoc(docRef, payload, { merge: true });
}

// ==============================================================================
// 4. ORDERS & PROMOTIONS (FIRESTORE)
// ==============================================================================

export interface PlaceOrderInput {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: string;
  couponCode?: string;
  items: {
    productId: string;
    name: string;
    category: string;
    sku: string;
    image: string;
    quantity: number;
    mrp: number;
    price: number;
  }[];
}

export async function placeOrderToFirestore(input: PlaceOrderInput): Promise<{
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  message?: string;
}> {
  if (!isFirebaseConfigured() || !firestoreDb) {
    throw new Error("Firebase is not configured. Add credentials to .env.");
  }

  // 1. Check promotion settings
  let promoActive = true;
  try {
    const promoDoc = await getDoc(doc(firestoreDb, "promotions", "active_promo"));
    if (promoDoc.exists()) {
      promoActive = promoDoc.data().active ?? true;
    }
  } catch {
    promoActive = true;
  }

  // 2. Validate cosmetic eligibility
  const hasCosmetics = input.items.some((it) => it.category === "Cosmetics");

  // 3. Assemble order items
  const finalItems: OrderItem[] = input.items.map((it) => ({
    productId: it.productId,
    name: it.name,
    category: it.category as any,
    sku: it.sku,
    image: it.image,
    quantity: Math.max(1, it.quantity),
    mrp: it.mrp,
    price: it.price,
    discount: Math.max(0, it.mrp - it.price),
    gstRate: 18,
    taxAmount: Math.round(it.price * Math.max(1, it.quantity) * 0.18),
    total: it.price * Math.max(1, it.quantity),
  }));

  // 4. Server-Side Free Gift Injection: Strictly cap at 1 free face wash
  if (promoActive && hasCosmetics) {
    finalItems.push({
      productId: "prd-free-gift-wash",
      name: "Daily Fresh Face Wash (Free Gift)",
      category: "Face Wash" as any,
      sku: "DUCK-GIFT-WASH-150ML",
      image: "https://images.unsplash.com/photo-1617858123189-b26eb62d8eb4?w=600",
      quantity: 1, // Strictly capped to 1
      mrp: 349,
      price: 0,
      discount: 349,
      gstRate: 18,
      taxAmount: 0,
      total: 0,
    });
  }

  const subtotal = finalItems.reduce((acc, it) => acc + it.total, 0);
  const freeThreshold = 999;
  const shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : 79;
  const taxTotal = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shippingFee;
  const orderNumber = `DU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = `ord-${Date.now()}`;

  const orderData: Order = {
    id: orderId,
    orderNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerId: input.userId || "",
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress || input.shippingAddress,
    items: finalItems,
    subtotal,
    discountTotal: 0,
    couponCode: input.couponCode,
    shippingFee,
    taxTotal,
    cgst: Math.round(taxTotal / 2),
    sgst: Math.round(taxTotal / 2),
    grandTotal,
    paymentMethod: input.paymentMethod as PaymentMethod,
    paymentStatus: input.paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
    orderStatus: "New",
    shippingStatus: "Unfulfilled",
    timeline: [
      {
        id: `tl-1`,
        timestamp: new Date().toISOString(),
        status: "New",
        actor: input.customerName,
        actorRole: "Customer",
        note: "Order placed online.",
      },
    ],
  };

  const payload = cleanForFirestore(orderData);
  await setDoc(doc(firestoreDb, "orders", orderId), payload, { merge: true });

  return {
    success: true,
    orderId,
    orderNumber,
  };
}

export async function saveOrderToFirestore(order: Order): Promise<Order> {
  if (!isFirebaseConfigured() || !firestoreDb) {
    throw new Error("Firebase is not configured.");
  }
  const payload = cleanForFirestore(order);
  await setDoc(doc(firestoreDb, "orders", order.id), payload, { merge: true });
  return payload;
}

export async function fetchCustomerOrdersFromFirestore(userId: string, email?: string): Promise<Order[]> {
  if (!isFirebaseConfigured() || !firestoreDb) return [];

  try {
    const list: Order[] = [];
    const seen = new Set<string>();

    if (userId) {
      const q = query(
        collection(firestoreDb, "orders"),
        where("customerId", "==", userId)
      );
      const snap = await getDocs(q);
      snap.forEach((d) => {
        const order = d.data() as Order;
        if (!seen.has(order.id)) {
          seen.add(order.id);
          list.push(order);
        }
      });
    }

    if (email && email.trim()) {
      const qEmail = query(
        collection(firestoreDb, "orders"),
        where("customerEmail", "==", email.trim().toLowerCase())
      );
      const snapEmail = await getDocs(qEmail);
      snapEmail.forEach((d) => {
        const order = d.data() as Order;
        if (!seen.has(order.id)) {
          seen.add(order.id);
          list.push(order);
        }
      });
    }

    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err: any) {
    console.error("[Firestore] Error fetching customer orders:", err.message);
    return [];
  }
}

export async function fetchAllOrdersFromFirestore(): Promise<Order[]> {
  if (!isFirebaseConfigured() || !firestoreDb) return [];

  try {
    const snap = await getDocs(collection(firestoreDb, "orders"));
    const orders: Order[] = [];
    snap.forEach((d) => orders.push(d.data() as Order));
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err: any) {
    console.error("[Firestore] Error fetching all orders:", err.message);
    return [];
  }
}

// ==============================================================================
// 5. FIREBASE AUTH & USER PROFILES
// ==============================================================================

export async function signUpWithEmailPassword(email: string, pass: string, name?: string) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("Firebase is not configured. Add Firebase keys in .env or Vercel.");
  }

  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && cred.user) {
    await updateProfile(cred.user, { displayName: name });
  }

  // Create profile in Firestore
  if (cred.user && firestoreDb) {
    const role = email.toLowerCase() === "sutharpritesh7877@gmail.com" ? "admin" : "customer";
    await setDoc(doc(firestoreDb, "profiles", cred.user.uid), cleanForFirestore({
      id: cred.user.uid,
      email: cred.user.email,
      fullName: name || "",
      role,
      createdAt: new Date().toISOString(),
    }), { merge: true });
  }

  return { success: true, user: cred.user };
}

export async function loginWithEmailPassword(email: string, pass: string) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("Firebase is not configured.");
  }

  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return { success: true, user: cred.user };
}

export async function loginWithGoogle() {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("Firebase is not configured.");
  }

  const cred = await signInWithPopup(auth, googleProvider);
  if (cred.user && firestoreDb) {
    const role = cred.user.email?.toLowerCase() === "sutharpritesh7877@gmail.com" ? "admin" : "customer";
    await setDoc(doc(firestoreDb, "profiles", cred.user.uid), cleanForFirestore({
      id: cred.user.uid,
      email: cred.user.email,
      fullName: cred.user.displayName || "",
      avatarUrl: cred.user.photoURL || "",
      role,
      updatedAt: new Date().toISOString(),
    }), { merge: true });
  }

  return { success: true, user: cred.user };
}

export async function sendEmailMagicLink(email: string) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error("Firebase is not configured.");
  }

  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem("emailForSignIn", email);
  return { success: true, message: `Magic sign-in link sent to ${email}. Check your inbox!` };
}

export async function completeEmailMagicLink(email: string, href: string) {
  if (!isFirebaseConfigured() || !auth) return { success: false };

  if (isSignInWithEmailLink(auth, href)) {
    const res = await signInWithEmailLink(auth, email, href);
    window.localStorage.removeItem("emailForSignIn");
    return { success: true, user: res.user };
  }
  return { success: false };
}

export async function fetchUserProfileFromFirestore(userId: string) {
  if (!isFirebaseConfigured() || !firestoreDb || !userId) return null;

  try {
    const snap = await getDoc(doc(firestoreDb, "profiles", userId));
    return snap.exists() ? snap.data() : null;
  } catch (err: any) {
    console.error("[Firestore] Error fetching profile:", err.message);
    return null;
  }
}

export async function saveUserProfileToFirestore(userId: string, data: any) {
  if (!isFirebaseConfigured() || !firestoreDb || !userId) return;

  const payload = cleanForFirestore({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  await setDoc(doc(firestoreDb, "profiles", userId), payload, { merge: true });
}

export async function signOutFirebase() {
  if (!auth) return;
  await signOut(auth);
}
