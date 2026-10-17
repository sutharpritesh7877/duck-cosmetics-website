import { useState, useEffect } from "react";
import { StoreSettings } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";
import { clearAllDemoData } from "../../../backend/demoCleaner";
import { isSupabaseConfigured, getSupabaseConfigStatus } from "../../../lib/supabaseClient";
import {
  fetchSiteSettingsFromSupabase,
  saveSiteSettingsToSupabase,
} from "../../../backend/supabaseService";
import {
  uploadImageToCloudinary,
  isCloudinaryConfigured,
  getCloudinaryConfig,
} from "../../../lib/cloudinaryClient";

export function WebsiteSettingsModule() {
  const currentStaff = authService.getCurrentUser();
  const settings = db.getSettings();

  const [formState, setFormState] = useState<StoreSettings>({ ...settings });
  const [pinCodesString, setPinCodesString] = useState(settings.serviceablePinCodes.join(", "));
  const [feedback, setFeedback] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const canManage = authService.can("settings:manage", currentStaff);
  const cloudinaryStatus = getCloudinaryConfig();

  useEffect(() => {
    let isMounted = true;
    if (isSupabaseConfigured()) {
      fetchSiteSettingsFromSupabase().then((remoteSettings) => {
        if (isMounted && remoteSettings) {
          setFormState((prev) => ({
            ...prev,
            ...remoteSettings,
          }));
          if (remoteSettings.serviceablePinCodes) {
            setPinCodesString(remoteSettings.serviceablePinCodes.join(", "));
          }
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, SVG, JPG, WEBP).");
      return;
    }

    if (isCloudinaryConfigured()) {
      setIsUploadingLogo(true);
      try {
        const res = await uploadImageToCloudinary(file, "duck_branding");
        setFormState((prev) => ({ ...prev, logoUrl: res.url }));
        setFeedback("✓ Store Logo uploaded to Cloudinary CDN successfully.");
      } catch (err: any) {
        console.error("Cloudinary logo upload failed:", err);
        alert(`Cloudinary upload warning: ${err.message}. Using local file preview.`);
        const reader = new FileReader();
        reader.onload = () => {
          setFormState((prev) => ({ ...prev, logoUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingLogo(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setFormState((prev) => ({ ...prev, logoUrl: reader.result as string }));
        setFeedback("Logo updated locally. Configure Cloudinary in .env to store on global CDN.");
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManage) return;

    const parsedPinCodes = pinCodesString
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const updated: StoreSettings = {
      ...formState,
      serviceablePinCodes: parsedPinCodes,
    };

    if (isSupabaseConfigured()) {
      try {
        await saveSiteSettingsToSupabase(updated);
        setFeedback("Store configuration and marketing banners saved to Supabase site_settings table.");
      } catch (err: any) {
        console.error("Error saving site settings to Supabase:", err);
      }
    }

    db.saveSettings(updated, currentStaff.name, currentStaff.role);
    if (!isSupabaseConfigured()) {
      setFeedback("Store configuration and GST tax rules successfully saved.");
    }
  };

  const dbConfigStatus = getSupabaseConfigStatus();

  return (
    <div className="space-y-6">
      {/* Supabase Connection Status Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold ${
          dbConfigStatus.configured
            ? "border-emerald-200 bg-emerald-50/80 text-emerald-900"
            : "border-amber-200 bg-amber-50/80 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              dbConfigStatus.configured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span>
            {dbConfigStatus.configured
              ? `Site Settings Synced with Supabase PostgreSQL: ${dbConfigStatus.url}`
              : "Database Notice: Supabase credentials not found in environment."}
          </span>
        </div>
        {!dbConfigStatus.configured && (
          <span className="text-[10px] text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full">
            Missing: {dbConfigStatus.missingFields.join(", ")}
          </span>
        )}
      </div>

      {/* Cloudinary CDN Image Storage Status Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs font-semibold ${
          cloudinaryStatus.configured
            ? "border-sky-200 bg-sky-50/80 text-sky-900"
            : "border-purple/15 bg-white text-purple-dark"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              cloudinaryStatus.configured ? "bg-sky-500 animate-pulse" : "bg-amber-400"
            }`}
          />
          <div>
            <span>
              {cloudinaryStatus.configured
                ? `Cloudinary CDN Active: Storing logo & banners on cloud "${cloudinaryStatus.cloudName}" (Preset: ${cloudinaryStatus.uploadPreset})`
                : "Cloudinary CDN Storage: Set VITE_CLOUDINARY_CLOUD_NAME & VITE_CLOUDINARY_UPLOAD_PRESET for image CDN storage."}
            </span>
            {isUploadingLogo && (
              <span className="ml-2 font-bold text-purple animate-pulse">Uploading logo to Cloudinary CDN...</span>
            )}
          </div>
        </div>
        {!cloudinaryStatus.configured ? (
          <span className="text-[10px] text-purple bg-purple/10 px-2.5 py-1 rounded-full font-bold">
            Cloudinary Ready
          </span>
        ) : (
          <span className="text-[10px] text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full font-bold">
            CDN Active
          </span>
        )}
      </div>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">System Configuration</span>
          <h2 className="font-display text-3xl font-semibold text-purple-dark">Store Settings & Compliance</h2>
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl bg-mint p-3 text-xs font-semibold text-purple-dark">
          ✓ {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brand Assets & Cloudinary Media */}
        <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm space-y-5">
          <div>
            <span className="text-[9px] font-bold uppercase text-purple tracking-wider">Cloudinary CDN Assets</span>
            <h3 className="font-display text-xl font-bold text-purple-dark">Store Logo & Homepage Banners</h3>
            <p className="mt-1 text-xs text-ink/50">Manage your brand logo, homepage banner slogans, and hero titles.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 text-xs">
            {/* Logo Uploader */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-purple/15 bg-canvas/40 p-4">
              <div className="h-20 w-20 shrink-0 rounded-2xl border border-purple/20 bg-white p-2 flex items-center justify-center shadow-xs">
                {formState.logoUrl ? (
                  <img src={formState.logoUrl} alt="Store Logo" className="max-h-full max-w-full object-contain" />
                ) : (
                  <img src="/duck-logo.png" alt="Duck Logo" className="max-h-full max-w-full object-contain" />
                )}
              </div>
              <div className="flex-1 space-y-2 text-left">
                <span className="block font-bold text-xs text-purple-dark">Brand Logo (Cloudinary CDN)</span>
                <p className="text-[11px] text-ink/60">
                  Select a PNG, SVG, or WEBP image. Uploads directly to Cloudinary and saves the CDN URL into Supabase site_settings.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="cursor-pointer rounded-full bg-purple px-4 py-1.5 text-xs font-bold text-white uppercase hover:bg-purple-dark transition shadow-xs">
                    {isUploadingLogo ? "⏳ Uploading..." : "Upload Logo to Cloudinary"}
                    <input
                      type="file"
                      disabled={isUploadingLogo}
                      accept="image/png, image/svg+xml, image/jpeg, image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {formState.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, logoUrl: undefined })}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50"
                    >
                      Reset to Default Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Hero Headline</span>
              <input
                value={formState.heroHeadline || ""}
                onChange={(e) => setFormState({ ...formState, heroHeadline: e.target.value })}
                placeholder="e.g. Skin so healthy, it practically quacks."
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold text-xs"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Hero Subtitle</span>
              <input
                value={formState.heroSubtitle || ""}
                onChange={(e) => setFormState({ ...formState, heroSubtitle: e.target.value })}
                placeholder="e.g. Clinical Ayurvedic Botanicals · Zero Harsh Chemicals"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold text-xs"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Promo Banner Slogan (Complimentary Face Wash)</span>
              <input
                value={formState.promoBannerText || ""}
                onChange={(e) => setFormState({ ...formState, promoBannerText: e.target.value })}
                placeholder="e.g. Buy Any Cosmetic, Get a 150ml Daily Fresh Face Wash FREE"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none text-xs"
              />
            </label>
          </div>
        </section>

        {/* Business Identity */}
        <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-purple-dark">Business Identity & Contact Details</h3>
          <p className="mt-1 text-xs text-ink/50">Details printed on official invoices, customer receipts, and shipping labels.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs">
            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Store Display Name</span>
              <input
                value={formState.storeName}
                onChange={(e) => setFormState({ ...formState, storeName: e.target.value })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Legal Registered Entity Name</span>
              <input
                value={formState.legalEntityName}
                onChange={(e) => setFormState({ ...formState, legalEntityName: e.target.value })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold"
              />
            </label>

            <label className="sm:col-span-2 block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Registered Office & Warehouse Address</span>
              <input
                value={formState.address}
                onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Customer Support Email</span>
              <input
                type="email"
                value={formState.supportEmail}
                onChange={(e) => setFormState({ ...formState, supportEmail: e.target.value })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Primary Phone Line</span>
              <input
                value={formState.supportPhone1}
                onChange={(e) => setFormState({ ...formState, supportPhone1: e.target.value })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Secondary Phone Line</span>
              <input
                value={formState.supportPhone2}
                onChange={(e) => setFormState({ ...formState, supportPhone2: e.target.value })}
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Third Phone Line</span>
              <input
                value={formState.supportPhone3}
                onChange={(e) => setFormState({ ...formState, supportPhone3: e.target.value })}
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>
          </div>
        </section>

        {/* Indian Tax & Financial Configuration */}
        <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-purple-dark">Indian E-Commerce & GST Compliance</h3>
          <p className="mt-1 text-xs text-ink/50">Mandatory statutory tax and invoicing parameters for India.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3 text-xs">
            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">GSTIN Number</span>
              <input
                value={formState.gstin}
                onChange={(e) => setFormState({ ...formState, gstin: e.target.value })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono font-bold uppercase"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">PAN Card Number</span>
              <input
                value={formState.pan}
                onChange={(e) => setFormState({ ...formState, pan: e.target.value })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono font-bold uppercase"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">State GST Code (e.g. 24 for Gujarat)</span>
              <input
                value={formState.stateCode}
                onChange={(e) => setFormState({ ...formState, stateCode: e.target.value })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Store Currency</span>
              <input
                value={formState.currency}
                disabled
                className="w-full rounded-xl border border-purple/15 bg-canvas p-2.5 font-bold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Standard Shipping Fee (₹)</span>
              <input
                type="number"
                value={formState.standardShippingFee}
                onChange={(e) => setFormState({ ...formState, standardShippingFee: Number(e.target.value) })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Free Shipping Threshold (₹)</span>
              <input
                type="number"
                value={formState.freeShippingThreshold}
                onChange={(e) => setFormState({ ...formState, freeShippingThreshold: Number(e.target.value) })}
                required
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold"
              />
            </label>
          </div>
        </section>

        {/* PIN Code Serviceability & Returns Policy */}
        <section className="rounded-3xl border border-purple/10 bg-white p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold text-purple-dark">Delivery & Return Rules</h3>

          <div className="mt-5 space-y-4 text-xs">
            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Return Window Allowed (Days)</span>
              <input
                type="number"
                value={formState.returnWindowDays}
                onChange={(e) => setFormState({ ...formState, returnWindowDays: Number(e.target.value) })}
                className="w-32 rounded-xl border border-purple/15 p-2.5 outline-none font-semibold"
              />
            </label>

            <div className="flex items-center justify-between rounded-2xl border border-purple/15 bg-canvas/50 p-4">
              <div>
                <strong className="block text-purple-dark text-xs font-bold">Complimentary Face Wash Promotional Offer</strong>
                <p className="text-[11px] text-ink/50 mt-0.5">
                  Automatically grants a free 150ml Face Wash ($0.00 / ₹0.00) when customers order any Cosmetic product.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormState({ ...formState, autoFreeFaceWashOffer: !formState.autoFreeFaceWashOffer })}
                className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase transition ${
                  formState.autoFreeFaceWashOffer ? "bg-mint text-purple-dark" : "bg-red-100 text-red-700"
                }`}
              >
                {formState.autoFreeFaceWashOffer ? "Promotion Active" : "Promotion Disabled"}
              </button>
            </div>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Serviceable PIN Codes (Comma-separated)</span>
              <textarea
                rows={3}
                value={pinCodesString}
                onChange={(e) => setPinCodesString(e.target.value)}
                className="w-full rounded-xl border border-purple/15 p-2.5 font-mono text-xs outline-none"
              />
              <small className="text-ink/40">These PIN codes are validated when customers check pin code delivery availability.</small>
            </label>
          </div>
        </section>

        {/* Production Database & Cloud Infrastructure Credentials */}
        <section className="rounded-3xl border border-purple/15 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple/10 pb-3">
            <div>
              <span className="text-[9px] font-bold uppercase text-purple tracking-wider">Live Infrastructure</span>
              <h3 className="font-display text-xl font-bold text-purple-dark">Production Database & Cloud API Credentials</h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Ready For Live Deployment
            </span>
          </div>

          <p className="text-xs text-ink/60 leading-relaxed">
            Configure your live cloud database credentials below (Supabase, PostgreSQL, Firebase, or MongoDB). 
            When you provide your keys, the system synchronizes product catalog, customer orders, inventory ledgers, and image uploads directly to your cloud instance.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 text-xs pt-2">
            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Database Provider</span>
              <select
                value={formState.productionDbConfig?.provider || "supabase"}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    productionDbConfig: {
                      provider: e.target.value as any,
                      apiUrl: formState.productionDbConfig?.apiUrl || "",
                      apiKey: formState.productionDbConfig?.apiKey || "",
                      databaseName: formState.productionDbConfig?.databaseName || "duck_cosmetics_prod",
                      storageBucket: formState.productionDbConfig?.storageBucket || "duck-product-images",
                      connected: true,
                    },
                  })
                }
                className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none font-semibold"
              >
                <option value="supabase">Supabase (PostgreSQL + Storage)</option>
                <option value="postgresql">Direct PostgreSQL / Supabase URI</option>
                <option value="firebase">Google Firebase / Firestore</option>
                <option value="mongodb">MongoDB Atlas</option>
                <option value="custom_rest">Custom REST API / Node.js Backend</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Database / Cloud Project Name</span>
              <input
                value={formState.productionDbConfig?.databaseName || "duck_cosmetics_prod"}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    productionDbConfig: {
                      ...formState.productionDbConfig,
                      provider: formState.productionDbConfig?.provider || "supabase",
                      apiUrl: formState.productionDbConfig?.apiUrl || "",
                      apiKey: formState.productionDbConfig?.apiKey || "",
                      databaseName: e.target.value,
                      connected: true,
                    },
                  })
                }
                placeholder="e.g. duck-cosmetics-production"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Database URL / Endpoint</span>
              <input
                value={formState.productionDbConfig?.apiUrl || ""}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    productionDbConfig: {
                      ...formState.productionDbConfig,
                      provider: formState.productionDbConfig?.provider || "supabase",
                      apiUrl: e.target.value,
                      apiKey: formState.productionDbConfig?.apiKey || "",
                      connected: true,
                    },
                  })
                }
                placeholder="e.g. https://xyzcompany.supabase.co or postgresql://postgres:password@db.xxx:5432/postgres"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono text-[11px]"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">API Key / Secret Token</span>
              <input
                type="password"
                value={formState.productionDbConfig?.apiKey || ""}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    productionDbConfig: {
                      ...formState.productionDbConfig,
                      provider: formState.productionDbConfig?.provider || "supabase",
                      apiUrl: formState.productionDbConfig?.apiUrl || "",
                      apiKey: e.target.value,
                      connected: true,
                    },
                  })
                }
                placeholder="Enter database service_role key, API secret, or JWT token..."
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono text-[11px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Image / Media Storage Bucket</span>
              <input
                value={formState.productionDbConfig?.storageBucket || "duck-product-images"}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    productionDbConfig: {
                      ...formState.productionDbConfig,
                      provider: formState.productionDbConfig?.provider || "supabase",
                      apiUrl: formState.productionDbConfig?.apiUrl || "",
                      apiKey: formState.productionDbConfig?.apiKey || "",
                      storageBucket: e.target.value,
                      connected: true,
                    },
                  })
                }
                placeholder="e.g. duck-product-images or Cloudinary folder"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono text-[11px]"
              />
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Payment Gateway Provider</span>
              <select
                value={formState.paymentGatewayConfig?.provider || "razorpay"}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    paymentGatewayConfig: {
                      provider: e.target.value as any,
                      keyId: formState.paymentGatewayConfig?.keyId || "",
                      keySecret: formState.paymentGatewayConfig?.keySecret || "",
                      active: true,
                    },
                  })
                }
                className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none font-semibold"
              >
                <option value="razorpay">Razorpay (Cards, UPI, Netbanking)</option>
                <option value="stripe">Stripe (International & Indian Cards / Wallets)</option>
                <option value="phonepe">PhonePe Payment Gateway</option>
                <option value="cashfree">Cashfree Payments</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Gateway Key ID / Publishable Key</span>
              <input
                value={formState.paymentGatewayConfig?.keyId || ""}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    paymentGatewayConfig: {
                      provider: formState.paymentGatewayConfig?.provider || "razorpay",
                      keyId: e.target.value,
                      keySecret: formState.paymentGatewayConfig?.keySecret || "",
                      active: true,
                    },
                  })
                }
                placeholder="rzp_live_xxxxxxxxxxxxxxxx or pk_live_xxxxxxxxxxxxxxxx"
                className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-mono text-[11px]"
              />
            </label>
          </div>
        </section>

        {/* Production Clean Slate */}
        <section className="rounded-3xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-[0.16em] text-red-600 uppercase">Pre-Launch Production Slate</span>
              <h3 className="font-display text-xl font-bold text-red-900">Clear All Demo Data</h3>
              <p className="mt-1 text-xs text-red-700/80">
                Wipe all mock/demo products, orders, test customers, and demo tickets so you can enter your real store catalog. Master Super Admin credentials and GST store settings are 100% preserved.
              </p>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => {
                  const confirmed = confirm(
                    "Are you sure you want to clear all demo products, demo orders, and demo accounts? This will give you a clean production catalog. Your Master Super Admin login (sutharpritesh7877@gmail.com) and store settings will remain intact."
                  );
                  if (confirmed) {
                    const res = clearAllDemoData(currentStaff.name, currentStaff.role);
                    if (res.success) {
                      setFeedback(res.message);
                    } else {
                      alert(res.message);
                    }
                  }
                }}
                className="shrink-0 rounded-full border border-red-300 bg-red-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-red-700 transition"
              >
                🧹 Clear All Demo Data
              </button>
            )}
          </div>
        </section>

        {canManage && (
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="rounded-full bg-purple px-8 py-3.5 text-xs font-bold tracking-wider text-white uppercase hover:bg-purple-dark shadow-md transition"
            >
              Save Store Configuration & Credentials
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
