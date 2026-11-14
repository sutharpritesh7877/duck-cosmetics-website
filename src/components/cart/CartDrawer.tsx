"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";

export function CartDrawer() {
  const {
    items,
    cartCount,
    subtotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    freeShippingThreshold,
  } = useCart();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleCheckout = () => {
    closeCart();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Your Shopping Bag"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={closeCart}
          />

          {/* Slide-over Drawer */}
          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="font-serif text-lg font-bold text-text-dark">
                    Your Beauty Ritual Bag
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lilac text-primary">
                    {cartCount}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="p-2 rounded-full text-text-gray hover:text-text-dark hover:bg-lilac transition duration-200"
                  aria-label="Close cart drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress Indicator */}
              <div className="px-6 py-3.5 bg-lilac/40 border-b border-lilac-border">
                <div className="flex items-center justify-between text-xs font-sans mb-1.5">
                  {amountToFreeShipping > 0 ? (
                    <span className="text-text-gray">
                      Add <strong className="text-primary font-bold">{formatPrice(amountToFreeShipping)}</strong> for Complimentary Atelier Shipping
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Complimentary Atelier Delivery Unlocked</span>
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-text-muted">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Body: Items or Empty State */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  /* Elegant Empty State */
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-5">
                    <div className="w-16 h-16 rounded-3xl bg-lilac flex items-center justify-center text-primary/70 border border-lilac-border shadow-inner">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-serif text-xl font-bold text-text-dark">
                        Your beauty ritual awaits.
                      </h3>
                      <p className="font-sans text-xs text-text-gray max-w-xs leading-relaxed">
                        Your bag is currently unallocated. Explore our haute botanical, Ayurvedic, and pediatric formulations to begin your glow ritual.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        closeCart();
                        router.push("/shop");
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Explore Our Collections</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Items List */
                  <div className="space-y-4 divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                        {/* Thumbnail */}
                        <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-lilac/40 shrink-0 border border-gray-100">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>

                        {/* Title, Category & Price */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted block">
                            {item.categoryName || "Haute Formulation"}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-text-dark truncate">
                            {item.title}
                          </h4>
                          <span className="text-xs font-bold text-primary mt-0.5 block">
                            {formatPrice(item.price)}
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-2.5">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-lilac text-text-gray hover:text-text-dark transition"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-text-dark">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-lilac text-text-gray hover:text-text-dark transition"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-text-muted hover:text-rose-600 transition p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Checkout Summary (Only if items exist) */}
              {items.length > 0 && (
                <div className="p-6 bg-[#F8F6FA] border-t border-lilac-border space-y-4">
                  <div className="space-y-1.5 font-sans text-xs">
                    <div className="flex justify-between text-text-gray">
                      <span>Subtotal</span>
                      <span className="font-semibold text-text-dark">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-text-gray">
                      <span>Estimated Shipping</span>
                      <span className="font-semibold text-text-dark">
                        {amountToFreeShipping === 0 ? "Complimentary" : formatPrice(120)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-text-dark pt-2 border-t border-gray-200">
                      <span>Total Ritual Value</span>
                      <span className="text-primary text-base">
                        {formatPrice(subtotal + (amountToFreeShipping === 0 ? 0 : 120))}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-primary text-white font-sans text-xs font-semibold uppercase tracking-wider hover:bg-primary-hover transition shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span>Proceed to Luxury Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Trust Micro-Row */}
                  <div className="flex items-center justify-between text-[10px] text-text-muted font-sans pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      <span>256-bit SSL</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-primary" />
                      <span>Ahmedabad Dispatch</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-primary" />
                      <span>14-Day Returns</span>
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
