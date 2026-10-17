import { useState, useEffect } from "react";
import { StoreSettings } from "../../../types";
import { db } from "../../../backend/db";
import { authService } from "../../../backend/authService";
import { clearAllDemoData } from "../../../backend/demoCleaner";
import { isFirebaseConfigured, getFirebaseConfigStatus } from "../../../lib/firebase";
import {
  fetchSiteSettingsFromFirestore,
  saveSiteSettingsToFirestore,
} from "../../../backend/firebaseService";
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
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingPromise, setIsUploadingPromise] = useState(false);

  const canManage = authService.can("settings:manage", currentStaff);
  const cloudinaryStatus = getCloudinaryConfig();

  useEffect(() => {
    let isMounted = true;
    if (isFirebaseConfigured()) {
      fetchSiteSettingsFromFirestore().then((remoteSettings) => {
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

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (isCloudinaryConfigured()) {
      setIsUploadingHero(true);
      try {
        const res = await uploadImageToCloudinary(file, "duck_hero");
        setFormState((prev) => ({ ...prev, heroImageUrl: res.url }));
        setFeedback("✓ Hero Product Showcase Graphic uploaded to Cloudinary CDN.");
      } catch (err: any) {
        console.error("Cloudinary hero upload error:", err);
        alert(`Cloudinary upload warning: ${err.message}. Using local file preview.`);
        const reader = new FileReader();
        reader.onload = () => {
          setFormState((prev) => ({ ...prev, heroImageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingHero(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setFormState((prev) => ({ ...prev, heroImageUrl: reader.result as string }));
        setFeedback("Hero graphic updated locally. Add Cloudinary credentials in .env to store on CDN.");
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handlePromiseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (isCloudinaryConfigured()) {
      setIsUploadingPromise(true);
      try {
        const res = await uploadImageToCloudinary(file, "duck_brand");
        setFormState((prev) => ({ ...prev, promiseImageUrl: res.url }));
        setFeedback("✓ Brand Promise graphic uploaded to Cloudinary CDN.");
      } catch (err: any) {
        console.error("Cloudinary promise upload error:", err);
        alert(`Cloudinary upload warning: ${err.message}. Using local file preview.`);
        const reader = new FileReader();
        reader.onload = () => {
          setFormState((prev) => ({ ...prev, promiseImageUrl: reader.result as string }));
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploadingPromise(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setFormState((prev) => ({ ...prev, promiseImageUrl: reader.result as string }));
        setFeedback("Brand Promise graphic updated locally. Add Cloudinary credentials in .env to store on CDN.");
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

    if (isFirebaseConfigured()) {
      try {
        await saveSiteSettingsToFirestore(updated);
        setFeedback("Store configuration and marketing banners saved to Google Firebase Firestore site_settings collection.");
      } catch (err: any) {
        console.error("Error saving site settings to Firestore:", err);
      }
    }

    db.saveSettings(updated, currentStaff.name, currentStaff.role);
    if (!isFirebaseConfigured()) {
      setFeedback("Store configuration and GST tax rules successfully saved.");
    }
  };

  const dbConfigStatus = getFirebaseConfigStatus();

  return (
    <div className="space-y-6">
      {/* Firebase Firestore Connection Status Bar */}
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
              ? `Site Settings Synced with Google Firebase Firestore (Project: ${dbConfigStatus.projectId})`
              : "Database Notice: Firebase credentials not found in environment."}
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
                  Select a PNG, SVG, or WEBP image. Uploads directly to Cloudinary and saves the CDN URL into Firestore site_settings.
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

        {/* Homepage Hero Right-Side Product Display Editor */}
        <section className="rounded-3xl border border-purple/15 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple/10 pb-4">
            <div>
              <span className="text-[9px] font-bold uppercase text-purple tracking-wider">Homepage Visuals</span>
              <h3 className="font-display text-xl font-bold text-purple-dark">Hero Section Product Display (Right Side)</h3>
              <p className="mt-1 text-xs text-ink/50">
                Customize the 3 product bottles shown on the hero section, or upload your own custom banner graphic.
              </p>
            </div>
            {formState.heroImageUrl && (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-bold text-sky-800 uppercase">
                Using Custom Hero Graphic
              </span>
            )}
          </div>

          {/* Master Custom Hero Graphic Option */}
          <div className="rounded-2xl border border-purple/15 bg-canvas/40 p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="h-28 w-28 shrink-0 rounded-2xl border border-purple/20 bg-white p-2 flex items-center justify-center overflow-hidden shadow-xs">
                {formState.heroImageUrl ? (
                  <img src={formState.heroImageUrl} alt="Hero Product Showcase" className="max-h-full max-w-full object-contain" />
                ) : (
                  <div className="text-center text-[10px] text-ink/40 font-bold uppercase px-2">
                    Default 3-Bottle Display Active
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2 text-left">
                <span className="block font-bold text-xs text-purple-dark">
                  Option 1: Upload Complete Hero Product Graphic (Replaces 3 bottles with single graphic)
                </span>
                <p className="text-[11px] text-ink/60">
                  Upload a high-resolution PNG, WEBP, or JPG showcasing your products. Uploads to Cloudinary CDN and updates the hero section instantly.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="cursor-pointer rounded-full bg-purple px-4 py-1.5 text-xs font-bold text-white uppercase hover:bg-purple-dark transition shadow-xs">
                    {isUploadingHero ? "⏳ Uploading to Cloudinary..." : "Upload Hero Graphic to Cloudinary"}
                    <input
                      type="file"
                      disabled={isUploadingHero}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleHeroImageUpload}
                      className="hidden"
                    />
                  </label>
                  {formState.heroImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, heroImageUrl: undefined })}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50"
                    >
                      Reset to 3 Bottles Display
                    </button>
                  )}
                </div>
              </div>
            </div>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Or Paste Image URL</span>
              <input
                value={formState.heroImageUrl || ""}
                onChange={(e) => setFormState({ ...formState, heroImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                className="w-full rounded-xl border border-purple/15 p-2 outline-none font-mono text-xs bg-white"
              />
            </label>
          </div>

          {/* Option 2: Customize The 3 Interactive Bottles */}
          <div className="space-y-3">
            <span className="block font-bold text-xs text-purple-dark">
              Option 2: Customize The 3 Product Bottles & Labels (Active when custom graphic is not set)
            </span>
            <p className="text-[11px] text-ink/50">
              Edit the names, categories, and subtitles of the 3 bottles shown in the hero graphic, or upload custom artwork for each bottle.
            </p>

            <div className="grid gap-4 md:grid-cols-3 text-xs">
              {/* Bottle 1 */}
              <div className="rounded-2xl border border-purple/15 bg-white p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-purple uppercase text-[10px]">Bottle 1 (Left - Ortho)</span>
                </div>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Top Category Label</span>
                  <input
                    value={formState.heroProduct1?.label || "ORTHO"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct1: {
                          ...(formState.heroProduct1 || { title: "PAIN OIL", subtitle: "Herbal comfort" }),
                          label: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-purple/15 p-2 outline-none font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Product Title</span>
                  <input
                    value={formState.heroProduct1?.title || "PAIN OIL"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct1: {
                          ...(formState.heroProduct1 || { label: "ORTHO", subtitle: "Herbal comfort" }),
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-purple/15 p-2 outline-none font-bold text-purple-dark"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Subtitle / Feature</span>
                  <input
                    value={formState.heroProduct1?.subtitle || "Herbal comfort"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct1: {
                          ...(formState.heroProduct1 || { label: "ORTHO", title: "PAIN OIL" }),
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-purple/15 p-2 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Custom Image URL (Optional)</span>
                  <input
                    value={formState.heroProduct1?.image || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct1: {
                          ...(formState.heroProduct1 || { label: "ORTHO", title: "PAIN OIL", subtitle: "Herbal comfort" }),
                          image: e.target.value,
                        },
                      })
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-purple/15 p-1.5 outline-none font-mono text-[10px]"
                  />
                </label>
              </div>

              {/* Bottle 2 */}
              <div className="rounded-2xl border border-purple/15 bg-white p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-purple uppercase text-[10px]">Bottle 2 (Center - Baby Care)</span>
                </div>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Top Category Label</span>
                  <input
                    value={formState.heroProduct2?.label || "BABY CARE"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct2: {
                          ...(formState.heroProduct2 || { title: "SOFT LOTION", subtitle: "Calendula + oat" }),
                          label: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-purple/15 p-2 outline-none font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Product Title</span>
                  <input
                    value={formState.heroProduct2?.title || "SOFT LOTION"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct2: {
                          ...(formState.heroProduct2 || { label: "BABY CARE", subtitle: "Calendula + oat" }),
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-purple/15 p-2 outline-none font-bold text-purple-dark"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Subtitle / Feature</span>
                  <input
                    value={formState.heroProduct2?.subtitle || "Calendula + oat"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct2: {
                          ...(formState.heroProduct2 || { label: "BABY CARE", title: "SOFT LOTION" }),
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-purple/15 p-2 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Custom Image URL (Optional)</span>
                  <input
                    value={formState.heroProduct2?.image || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct2: {
                          ...(formState.heroProduct2 || { label: "BABY CARE", title: "SOFT LOTION", subtitle: "Calendula + oat" }),
                          image: e.target.value,
                        },
                      })
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-purple/15 p-1.5 outline-none font-mono text-[10px]"
                  />
                </label>
              </div>

              {/* Bottle 3 */}
              <div className="rounded-2xl border border-purple/15 bg-white p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-bold text-purple uppercase text-[10px]">Bottle 3 (Right - Vapor Rub)</span>
                </div>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Top Category Label</span>
                  <input
                    value={formState.heroProduct3?.label || "VAPOR"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct3: {
                          ...(formState.heroProduct3 || { title: "COMFORT RUB", subtitle: "Eucalyptus + mint" }),
                          label: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-purple/15 p-2 outline-none font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Product Title</span>
                  <input
                    value={formState.heroProduct3?.title || "COMFORT RUB"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct3: {
                          ...(formState.heroProduct3 || { label: "VAPOR", subtitle: "Eucalyptus + mint" }),
                          title: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-purple/15 p-2 outline-none font-bold text-purple-dark"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Subtitle / Feature</span>
                  <input
                    value={formState.heroProduct3?.subtitle || "Eucalyptus + mint"}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct3: {
                          ...(formState.heroProduct3 || { label: "VAPOR", title: "COMFORT RUB" }),
                          subtitle: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-xl border border-purple/15 p-2 outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block font-bold uppercase text-ink/60 text-[9px]">Custom Image URL (Optional)</span>
                  <input
                    value={formState.heroProduct3?.image || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        heroProduct3: {
                          ...(formState.heroProduct3 || { label: "VAPOR", title: "COMFORT RUB", subtitle: "Eucalyptus + mint" }),
                          image: e.target.value,
                        },
                      })
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-purple/15 p-1.5 outline-none font-mono text-[10px]"
                  />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Promise Section Editor ("Made gently. Made responsibly.") */}
        <section className="rounded-3xl border border-purple/15 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple/10 pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-[0.16em] text-purple uppercase">Storefront Section Editor</span>
              <h3 className="font-display text-xl font-bold text-purple-dark">
                Brand Promise & Core Values Banner ("Made gently. Made responsibly.")
              </h3>
              <p className="mt-1 text-xs text-ink/50">
                Customize the high-impact split banner shown on the main homepage. Upload custom brand photography, edit the headline, description, and the 4 trust badges.
              </p>
            </div>
            <span className="rounded-full bg-lilac/70 px-3 py-1 text-[10px] font-bold text-purple tracking-wider uppercase w-fit">
              Homepage / #promise
            </span>
          </div>

          {/* Interactive Live Split-Screen Preview */}
          <div className="rounded-2xl border border-purple/20 overflow-hidden shadow-xs">
            <div className="bg-canvas/80 px-4 py-2 border-b border-purple/10 flex items-center justify-between text-[11px] font-bold text-purple-dark">
              <span>🖥️ Live Storefront Split-Screen Preview</span>
              <span className="text-[10px] text-ink/40 font-normal">Updates in real time as you edit below</span>
            </div>
            <div className="grid md:grid-cols-2 min-h-[220px]">
              {/* Left Image Preview */}
              <div className="relative min-h-[200px] bg-canvas overflow-hidden">
                <img
                  src={formState.promiseImageUrl || "https://images.unsplash.com/photo-1642764733829-59e40ee5af5b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200"}
                  alt="Promise Section Preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              {/* Right Content Preview */}
              <div className={`p-6 sm:p-8 text-white flex flex-col justify-center ${formState.promiseBgColor || "bg-purple"} transition-colors`}>
                <p className="text-[10px] font-bold tracking-[0.18em] text-lilac uppercase">
                  {formState.promiseEyebrow || "Care you can count on"}
                </p>
                <h4 className="mt-2 font-display text-2xl sm:text-3xl font-semibold leading-tight">
                  {formState.promiseHeadline1 || "Made gently."}
                  {formState.promiseHeadline2 && (
                    <>
                      <br />
                      {formState.promiseHeadline2}
                    </>
                  )}
                </h4>
                <p className="mt-3 text-xs leading-relaxed text-white/75 line-clamp-3">
                  {formState.promiseDescription || "From a baby’s first bath to your nightly skin ritual, we make dependable care with carefully selected ingredients and no unnecessary fuss."}
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/20 pt-4 text-[10px] font-bold tracking-wider uppercase text-white/90">
                  <p>✓ {formState.promiseFeature1 || "Clear labelling"}</p>
                  <p>✓ {formState.promiseFeature2 || "Thoughtful formulas"}</p>
                  <p>✓ {formState.promiseFeature3 || "Family focused"}</p>
                  <p>✓ {formState.promiseFeature4 || "Batch traceability"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls: Left Image */}
          <div className="space-y-4">
            <span className="block font-bold text-xs text-purple-dark">
              1. Left-Side Visual Media (Cloudinary CDN or Custom Image URL)
            </span>
            <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl border border-purple/15 bg-canvas/40 p-4">
              <div className="h-24 w-32 shrink-0 rounded-2xl border border-purple/20 bg-white overflow-hidden shadow-xs">
                <img
                  src={formState.promiseImageUrl || "https://images.unsplash.com/photo-1642764733829-59e40ee5af5b?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=1200"}
                  alt="Promise Preview Thumbnail"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2 text-left">
                <span className="block font-bold text-xs text-purple-dark">Brand Photography Graphic</span>
                <p className="text-[11px] text-ink/60">
                  Upload high-resolution photography of Duck care bottles, ingredients, or brand aesthetic. Uploads directly to Cloudinary CDN and updates the live site instantly.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <label className="cursor-pointer rounded-full bg-purple px-4 py-1.5 text-xs font-bold text-white uppercase hover:bg-purple-dark transition shadow-xs">
                    {isUploadingPromise ? "⏳ Uploading to CDN..." : "Upload Photo to Cloudinary"}
                    <input
                      type="file"
                      disabled={isUploadingPromise}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handlePromiseImageUpload}
                      className="hidden"
                    />
                  </label>
                  {formState.promiseImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormState({ ...formState, promiseImageUrl: undefined })}
                      className="rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50"
                    >
                      Reset to Default Image
                    </button>
                  )}
                </div>
              </div>
            </div>

            <label className="block text-xs">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Or Enter Direct Image URL</span>
              <input
                value={formState.promiseImageUrl || ""}
                onChange={(e) => setFormState({ ...formState, promiseImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                className="w-full rounded-xl border border-purple/15 p-2 outline-none font-mono text-xs bg-white"
              />
            </label>
          </div>

          {/* Controls: Right Copy & Features */}
          <div className="space-y-4 pt-2">
            <span className="block font-bold text-xs text-purple-dark">
              2. Right-Side Text Content & Core Brand Values
            </span>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <label className="block sm:col-span-2">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Top Eyebrow Tagline</span>
                <input
                  value={formState.promiseEyebrow || "Care you can count on"}
                  onChange={(e) => setFormState({ ...formState, promiseEyebrow: e.target.value })}
                  placeholder="e.g. Care you can count on"
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-semibold text-purple-dark"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Main Headline - Line 1</span>
                <input
                  value={formState.promiseHeadline1 || "Made gently."}
                  onChange={(e) => setFormState({ ...formState, promiseHeadline1: e.target.value })}
                  placeholder="e.g. Made gently."
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-bold text-purple-dark"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Main Headline - Line 2</span>
                <input
                  value={formState.promiseHeadline2 || "Made responsibly."}
                  onChange={(e) => setFormState({ ...formState, promiseHeadline2: e.target.value })}
                  placeholder="e.g. Made responsibly."
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none font-bold text-purple-dark"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Paragraph Body Description</span>
                <textarea
                  rows={3}
                  value={formState.promiseDescription || "From a baby’s first bath to your nightly skin ritual, we make dependable care with carefully selected ingredients and no unnecessary fuss."}
                  onChange={(e) => setFormState({ ...formState, promiseDescription: e.target.value })}
                  placeholder="Write a clear, trustworthy explanation of your brand standards..."
                  className="w-full rounded-xl border border-purple/15 p-2.5 outline-none text-xs leading-relaxed"
                />
              </label>
            </div>

            <span className="block font-bold text-[11px] text-purple uppercase tracking-wider pt-2">
              The 4 Trust Pillars / Feature Highlights
            </span>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <label className="block">
                <span className="mb-1 block font-bold text-ink/60 text-[9px] uppercase">Pillar 1 (Top Left)</span>
                <input
                  value={formState.promiseFeature1 || "Clear labelling"}
                  onChange={(e) => setFormState({ ...formState, promiseFeature1: e.target.value })}
                  placeholder="e.g. Clear labelling"
                  className="w-full rounded-xl border border-purple/15 p-2 outline-none font-semibold"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold text-ink/60 text-[9px] uppercase">Pillar 2 (Top Right)</span>
                <input
                  value={formState.promiseFeature2 || "Thoughtful formulas"}
                  onChange={(e) => setFormState({ ...formState, promiseFeature2: e.target.value })}
                  placeholder="e.g. Thoughtful formulas"
                  className="w-full rounded-xl border border-purple/15 p-2 outline-none font-semibold"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold text-ink/60 text-[9px] uppercase">Pillar 3 (Bottom Left)</span>
                <input
                  value={formState.promiseFeature3 || "Family focused"}
                  onChange={(e) => setFormState({ ...formState, promiseFeature3: e.target.value })}
                  placeholder="e.g. Family focused"
                  className="w-full rounded-xl border border-purple/15 p-2 outline-none font-semibold"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-bold text-ink/60 text-[9px] uppercase">Pillar 4 (Bottom Right)</span>
                <input
                  value={formState.promiseFeature4 || "Batch traceability"}
                  onChange={(e) => setFormState({ ...formState, promiseFeature4: e.target.value })}
                  placeholder="e.g. Batch traceability"
                  className="w-full rounded-xl border border-purple/15 p-2 outline-none font-semibold"
                />
              </label>
            </div>

            <label className="block text-xs pt-1">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Right Banner Background Tone</span>
              <select
                value={formState.promiseBgColor || "bg-purple"}
                onChange={(e) => setFormState({ ...formState, promiseBgColor: e.target.value })}
                className="w-full rounded-xl border border-purple/15 bg-white p-2.5 outline-none font-semibold"
              >
                <option value="bg-purple">Duck Signature Purple (Standard)</option>
                <option value="bg-purple-dark">Deep Royal Plum</option>
                <option value="bg-sage">Herbal Sage Green</option>
                <option value="bg-ink">Midnight Charcoal</option>
              </select>
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
            Configure your live cloud database credentials below (Google Firebase / Firestore, PostgreSQL, or MongoDB). 
            When you provide your keys, the system synchronizes product catalog, customer orders, inventory ledgers, and image uploads directly to your cloud instance.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 text-xs pt-2">
            <label className="block">
              <span className="mb-1 block font-bold uppercase text-purple text-[9px]">Database Provider</span>
              <select
                value={formState.productionDbConfig?.provider || "firebase"}
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
                <option value="firebase">Google Firebase / Cloud Firestore</option>
                <option value="postgresql">Direct PostgreSQL URI</option>
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
                      provider: formState.productionDbConfig?.provider || "firebase",
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
                      provider: formState.productionDbConfig?.provider || "firebase",
                      apiUrl: e.target.value,
                      apiKey: formState.productionDbConfig?.apiKey || "",
                      connected: true,
                    },
                  })
                }
                placeholder="e.g. https://your-project.firebaseio.com or postgresql://..."
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
                      provider: formState.productionDbConfig?.provider || "firebase",
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
                      provider: formState.productionDbConfig?.provider || "firebase",
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
