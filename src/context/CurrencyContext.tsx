"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Currency = "INR" | "USD";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRateInrToUsd: number; // e.g. 0.012 (1 USD = 83.33 INR)
  formatPrice: (amountInInr: number) => string;
  currencySymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Default exchange rate: 1 USD = ~83 INR (0.01205 INR to USD)
const DEFAULT_INR_TO_USD_RATE = 0.01205;

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Per luxury brand rules, storefront defaults strictly to Indian Rupee (INR ₹)
  const [currency, setCurrencyState] = useState<Currency>("INR");
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_INR_TO_USD_RATE);

  useEffect(() => {
    let isMounted = true;

    // Default to INR (₹) for all visitors, carts, and checkouts
    setCurrencyState("INR");

    // Sync with Admin Global Settings if configured by atelier management
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data.success || !data.settings) return;
        if (data.settings.baseCurrency) {
          setCurrencyState(data.settings.baseCurrency);
        }
        if (data.settings.globalRouting?.usdToInrRate) {
          const rate = Number(data.settings.globalRouting.usdToInrRate);
          if (rate > 0) setExchangeRate(1 / rate);
        }
      })
      .catch(() => {
        // Fallback safely to INR
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("duck_currency", c);
    } catch {}
  };

  const formatPrice = (amountInInr: number): string => {
    if (isNaN(amountInInr) || amountInInr < 0) amountInInr = 0;

    if (currency === "INR") {
      // Formatted in Indian Rupees: ₹1,199
      return `₹${Math.round(amountInInr).toLocaleString("en-IN")}`;
    }

    // Convert to USD with luxury decimal precision: $14.50
    const usdAmount = amountInInr * exchangeRate;
    return `$${usdAmount.toFixed(2)}`;
  };

  const currencySymbol = currency === "INR" ? "₹" : "$";

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRateInrToUsd: exchangeRate,
        formatPrice,
        currencySymbol,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Return safe fallback if rendered outside provider
    return {
      currency: "INR" as Currency,
      setCurrency: () => {},
      exchangeRateInrToUsd: DEFAULT_INR_TO_USD_RATE,
      formatPrice: (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`,
      currencySymbol: "₹",
    };
  }
  return context;
}

/**
 * Subtle, minimalist luxury Currency Selector Dropdown component
 * Shows clean typography: e.g. "INR ₹ ⌄" or "USD $ ⌄" with no background pill box
 */
export function CurrencySelector({
  className = "",
  variant = "minimal",
}: {
  className?: string;
  variant?: "minimal" | "pill";
}) {
  const { currency, setCurrency } = useCurrency();

  if (variant === "pill") {
    return (
      <div className={`relative inline-flex items-center text-xs font-sans ${className}`}>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="appearance-none bg-white/90 hover:bg-lilac border border-gray-200 rounded-full px-3 py-1 pr-6 text-[11px] font-semibold tracking-wider uppercase text-text-dark focus:outline-none focus:border-primary cursor-pointer transition"
          aria-label="Select store currency"
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-text-muted">
          ⌄
        </span>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center text-xs font-sans select-none ${className}`}>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="appearance-none bg-transparent border-0 py-1 pl-1 pr-5 text-[12px] font-medium tracking-wider uppercase text-text-dark/90 hover:text-primary focus:outline-none cursor-pointer transition duration-200"
        aria-label="Select store currency"
      >
        <option value="INR" className="bg-white text-text-dark">
          INR ₹
        </option>
        <option value="USD" className="bg-white text-text-dark">
          USD $
        </option>
      </select>
      <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[11px] text-text-muted font-bold">
        ⌄
      </span>
    </div>
  );
}
