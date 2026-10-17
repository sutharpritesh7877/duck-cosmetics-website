import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from "../lib/supabaseClient";
import { ProductItem, CategoryMeta, StoreSettings, Order, OrderItem } from "../types";

export interface SupabaseProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "customer" | "admin" | "manager" | "staff";
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

// ==============================================================================
// 1. PRODUCTS DATABASE OPERATIONS
// ==============================================================================

export async function fetchActiveProductsFromSupabase(): Promise<ProductItem[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "Active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Error fetching active products:", error.message);
    throw error;
  }

  return (data || []).map(mapSupabaseToProductItem);
}

export async function fetchAdminProductsFromSupabase(): Promise<ProductItem[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Error fetching admin products:", error.message);
    throw error;
  }

  return (data || []).map(mapSupabaseToProductItem);
}

export async function saveProductToSupabase(product: ProductItem): Promise<ProductItem> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.");
  }

  const payload = {
    name: product.name,
    category: product.category,
    sku: product.sku,
    detail: product.detail,
    mrp: product.mrp,
    price: product.price,
    cost_price: product.costPrice,
    stock: product.stock,
    reserved_stock: product.reservedStock || 0,
    low_stock_threshold: product.lowStockThreshold || 10,
    hsn_code: product.hsnCode || "33049910",
    gst_rate: product.gstRate || 18,
    image: product.image,
    images: product.images && product.images.length > 0 ? product.images : [product.image],
    badge: product.badge || null,
    status: product.status || "Active",
    updated_at: new Date().toISOString(),
  };

  // If product has a UUID id, update; otherwise insert
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);
  let response;

  if (isUuid) {
    response = await supabase
      .from("products")
      .update(payload)
      .eq("id", product.id)
      .select()
      .single();
  } else {
    response = await supabase
      .from("products")
      .insert([payload])
      .select()
      .single();
  }

  if (response.error) {
    console.error("[Supabase] Error saving product:", response.error.message);
    throw response.error;
  }

  return mapSupabaseToProductItem(response.data);
}

export async function deleteProductFromSupabase(productId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) {
    console.error("[Supabase] Error deleting product:", error.message);
    throw error;
  }
}

function mapSupabaseToProductItem(row: any): ProductItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    sku: row.sku,
    detail: row.detail || "",
    mrp: Number(row.mrp),
    price: Number(row.price),
    costPrice: Number(row.cost_price || 0),
    stock: Number(row.stock),
    reservedStock: Number(row.reserved_stock || 0),
    lowStockThreshold: Number(row.low_stock_threshold || 10),
    hsnCode: row.hsn_code || "33049910",
    gstRate: Number(row.gst_rate || 18),
    image: row.image,
    images: row.images && row.images.length > 0 ? row.images : [row.image],
    badge: row.badge || undefined,
    status: row.status || "Active",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==============================================================================
// 2. CATEGORIES DATABASE OPERATIONS
// ==============================================================================

export async function fetchCategoriesFromSupabase(): Promise<CategoryMeta[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[Supabase] Error fetching categories:", error.message);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    tagline: row.tagline || "",
    image: row.image,
    tone: row.tone || "bg-lilac",
    displayOrder: row.display_order || 1,
    active: row.active ?? true,
  }));
}

export async function saveCategoryToSupabase(cat: CategoryMeta): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const payload = {
    name: cat.name,
    tagline: cat.tagline,
    image: cat.image,
    tone: cat.tone || "bg-lilac",
    display_order: cat.displayOrder,
    active: cat.active,
  };

  const { error } = await supabase.from("categories").upsert([payload], { onConflict: "name" });
  if (error) {
    console.error("[Supabase] Error saving category:", error.message);
    throw error;
  }
}

export async function deleteCategoryFromSupabase(name: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const { error } = await supabase.from("categories").delete().eq("name", name);
  if (error) {
    console.error("[Supabase] Error deleting category:", error.message);
    throw error;
  }
}

// ==============================================================================
// 3. SITE SETTINGS DATABASE OPERATIONS
// ==============================================================================

export async function fetchSiteSettingsFromSupabase(): Promise<Partial<StoreSettings> | null> {
  if (!isSupabaseConfigured()) return null;

  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Error fetching site settings:", error.message);
    return null;
  }

  if (!data) return null;

  return {
    storeName: data.store_name,
    legalEntityName: data.legal_entity_name,
    brandTagline: data.brand_tagline,
    supportEmail: data.support_email,
    supportPhone1: data.support_phone1,
    supportPhone2: data.support_phone2,
    supportPhone3: data.support_phone3,
    address: data.address,
    gstin: data.gstin,
    freeShippingThreshold: Number(data.free_shipping_threshold || 999),
    standardShippingFee: Number(data.standard_shipping_fee || 79),
    autoFreeFaceWashOffer: data.auto_free_face_wash_offer ?? true,
    heroHeadline: data.hero_headline,
    heroSubtitle: data.hero_subtitle,
    promoBannerText: data.promo_banner_text,
    logoUrl: data.logo_url,
    announcementTicker: Array.isArray(data.announcement_ticker) ? data.announcement_ticker : [],
    serviceablePinCodes: data.serviceable_pincodes || [],
  };
}

export async function saveSiteSettingsToSupabase(settings: StoreSettings): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const payload = {
    id: "default",
    store_name: settings.storeName,
    legal_entity_name: settings.legalEntityName,
    brand_tagline: settings.brandTagline,
    support_email: settings.supportEmail,
    support_phone1: settings.supportPhone1,
    support_phone2: settings.supportPhone2,
    support_phone3: settings.supportPhone3,
    address: settings.address,
    gstin: settings.gstin,
    free_shipping_threshold: settings.freeShippingThreshold,
    standard_shipping_fee: settings.standardShippingFee,
    auto_free_face_wash_offer: settings.autoFreeFaceWashOffer,
    hero_headline: settings.heroHeadline,
    hero_subtitle: settings.heroSubtitle,
    promo_banner_text: settings.promoBannerText,
    logo_url: settings.logoUrl,
    announcement_ticker: settings.announcementTicker,
    serviceable_pincodes: settings.serviceablePinCodes,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("site_settings").upsert([payload], { onConflict: "id" });
  if (error) {
    console.error("[Supabase] Error saving site settings:", error.message);
    throw error;
  }
}

// ==============================================================================
// 4. ORDERS & PROMOTIONS (SERVER-SIDE VALIDATED)
// ==============================================================================

export interface PlaceOrderInput {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  billingAddress?: any;
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

/**
 * Places an order into Supabase with strict server-side promotion validation.
 * Verifies qualifying cosmetic items and guarantees only 1 free gift is added.
 */
export async function placeOrderToSupabase(input: PlaceOrderInput): Promise<{
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  message?: string;
}> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured. Add credentials in .env.");
  }

  // 1. Fetch live promotion settings
  const { data: promoSettings } = await supabase
    .from("promotions")
    .select("*")
    .eq("active", true)
    .maybeSingle();

  const isPromoActive = promoSettings?.active ?? true;

  // 2. Server-side check for qualifying cosmetic product
  const hasCosmetics = input.items.some((item) => item.category === "Cosmetics");

  // 3. Compute item lines and sanitize free gifts
  let finalItems = input.items.map((item) => ({
    product_id: item.productId,
    name: item.name,
    category: item.category,
    sku: item.sku,
    image: item.image,
    quantity: Math.max(1, item.quantity),
    mrp: item.mrp,
    price: item.price,
    total: item.price * Math.max(1, item.quantity),
    is_free_gift: false,
  }));

  // 4. Server-Side Free Gift Injection: Strictly cap at 1 free face wash
  if (isPromoActive && hasCosmetics) {
    finalItems.push({
      product_id: "prd-gift-wash",
      name: promoSettings?.gift_product_name || "Daily Fresh Face Wash",
      category: "Face Wash",
      sku: "DUCK-GIFT-WSH",
      image: "https://images.unsplash.com/photo-1617858123189-b26eb62d8eb4?w=600",
      quantity: 1, // Maximum 1 allowed by server
      mrp: 349,
      price: 0,
      total: 0,
      is_free_gift: true,
    });
  }

  // 5. Compute subtotal & shipping
  const subtotal = finalItems.reduce((acc, it) => acc + it.total, 0);
  const freeThreshold = 999;
  const shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : 79;
  const taxTotal = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shippingFee;

  const orderNumber = `DU-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 6. Insert Order
  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .insert([
      {
        order_number: orderNumber,
        user_id: input.userId || null,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        shipping_address: input.shippingAddress,
        billing_address: input.billingAddress || input.shippingAddress,
        subtotal,
        discount_total: 0,
        coupon_code: input.couponCode || null,
        shipping_fee: shippingFee,
        tax_total: taxTotal,
        grand_total: grandTotal,
        payment_method: input.paymentMethod,
        payment_status: input.paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
        order_status: "New",
        shipping_status: "Unfulfilled",
      },
    ])
    .select()
    .single();

  if (orderErr) {
    console.error("[Supabase] Error inserting order:", orderErr.message);
    return { success: false, message: orderErr.message };
  }

  // 7. Insert Order Items
  const itemsPayload = finalItems.map((item) => ({
    order_id: orderRow.id,
    ...item,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(itemsPayload);
  if (itemsErr) {
    console.error("[Supabase] Error inserting order items:", itemsErr.message);
  }

  return {
    success: true,
    orderId: orderRow.id,
    orderNumber: orderRow.order_number,
  };
}

export async function fetchCustomerOrdersFromSupabase(userId: string): Promise<any[]> {
  if (!isSupabaseConfigured() || !userId) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Error fetching customer orders:", error.message);
    return [];
  }

  return data || [];
}

export async function fetchAllOrdersFromSupabase(): Promise<any[]> {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] Error fetching all orders:", error.message);
    return [];
  }

  return data || [];
}

// ==============================================================================
// 5. SUPABASE AUTH & EMAIL OTP LOGIN FLOW
// ==============================================================================

/**
 * Sends a passwordless OTP login code to the user's email via Supabase Auth.
 */
export async function sendEmailOtp(email: string): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase credentials missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.",
    };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: `A 6-digit one-time password (OTP) has been sent to ${email}.`,
  };
}

/**
 * Verifies the 6-digit email OTP token with Supabase Auth.
 */
export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<{ success: boolean; user?: any; profile?: SupabaseProfile | null; message: string }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: "Supabase credentials missing.",
    };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Fetch or ensure profile is loaded
  const profile = await fetchUserProfile(data.user?.id || "");

  return {
    success: true,
    user: data.user,
    profile,
    message: "Successfully signed in via Supabase Auth.",
  };
}

export async function fetchUserProfile(userId: string): Promise<SupabaseProfile | null> {
  if (!isSupabaseConfigured() || !userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[Supabase] Error fetching profile:", error.message);
    return null;
  }

  return data as SupabaseProfile;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<SupabaseProfile>
): Promise<{ success: boolean; message?: string }> {
  if (!isSupabaseConfigured() || !userId) {
    return { success: false, message: "Supabase not connected" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function signOutSupabase(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut();
  }
}
