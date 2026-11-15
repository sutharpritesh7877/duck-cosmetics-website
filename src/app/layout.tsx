import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { CookieConsent } from "@/components/ui/CookieConsent";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ExitIntentModal } from "@/components/ui/ExitIntentModal";
import { WhatsAppWidget } from "@/components/ui/WhatsAppWidget";
import { ConciergeChatWidget } from "@/components/concierge/ConciergeChatWidget";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://duckcosmetics.com";
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Duck Cosmetics | Redefine Your Glow · Pre-Launch Haute Skincare",
    template: "%s | Duck Cosmetics",
  },
  description:
    "Unveiling premium, playful & sophisticated beauty. 100% cruelty-free, dermatologically tested botanical elixirs, classical Ayurvedic nectars, and pediatric Baby Care.",
  keywords: [
    "Duck Cosmetics",
    "Haute Skincare",
    "Cruelty-Free Beauty",
    "Dermatologically Tested",
    "Pre-Launch Luxury",
    "Glow Serums",
    "Kumkumadi Elixir",
    "Baby Care",
    "Clean Beauty Atelier",
    "Ahmedabad Maison",
  ],
  authors: [{ name: "Duck Cosmetics Atelier" }],
  creator: "Duck Cosmetics Inc.",
  publisher: "Duck Cosmetics Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Duck Cosmetics | Redefine Your Glow · Pre-Launch VIP Access",
    description:
      "Unveiling premium, playful & sophisticated beauty. 100% cruelty-free conscious botanicals and pure Ayurvedic nectars.",
    url: APP_URL,
    siteName: "Duck Cosmetics",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Duck Cosmetics · Redefine Your Glow Pre-Launch Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Duck Cosmetics | Redefine Your Glow",
    description:
      "Unveiling premium, playful & sophisticated beauty. 100% cruelty-free conscious botanicals.",
    images: ["/og-image.jpg"],
    creator: "@duckcosmetics",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BeautyBrand",
              name: "Duck Cosmetics",
              url: APP_URL,
              logo: `${APP_URL}/duck-logo.webp`,
              image: `${APP_URL}/og-image.jpg`,
              description:
                "Haute skincare, Ayurvedic botanical elixirs, and pediatric-tested infant care in pre-launch.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Level 4, Signature Towers, SG Highway, Bodakdev",
                addressLocality: "Ahmedabad",
                addressRegion: "Gujarat",
                postalCode: "380054",
                addressCountry: "IN",
              },
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-79-4001-8899",
                contactType: "customer concierge",
                email: "concierge@duckcosmetics.com",
                availableLanguage: ["English", "Hindi", "Gujarati"],
              },
              sameAs: [
                "https://instagram.com/duckcosmetics",
                "https://tiktok.com/@duckcosmetics",
              ],
            }),
          }}
        />

        {/* Google Analytics 4 (GA4) Tracking Script */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}

        {/* Meta Pixel Tracking Script */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </head>
      <body className="min-h-screen bg-white text-text-dark font-sans flex flex-col antialiased">
        <CurrencyProvider>
          <ToastProvider>
            <CartProvider>
              {children}
              <CartDrawer />
              <ExitIntentModal />
              <CookieConsent />
              <WhatsAppWidget />
              <ConciergeChatWidget />
            </CartProvider>
          </ToastProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}