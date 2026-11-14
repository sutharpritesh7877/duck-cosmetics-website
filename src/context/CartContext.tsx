"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/Toast";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  sellingPrice?: number;
  imageUrl: string;
  categoryName?: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: {
    id: string;
    title: string;
    price: number;
    sellingPrice?: number;
    imageUrl: string;
    categoryName?: string;
  }, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  freeShippingThreshold: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { success: toastSuccess } = useToast();

  const freeShippingThreshold = 800; // Free delivery over ₹800

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("duck_cart_items");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // ignore JSON parse error
    }
  }, []);

  // Sync cart to localStorage
  const saveItems = (updated: CartItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem("duck_cart_items", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const addItem = (
    product: {
      id: string;
      title: string;
      price: number;
      sellingPrice?: number;
      imageUrl: string;
      categoryName?: string;
    },
    quantity: number = 1
  ) => {
    const effectivePrice = product.sellingPrice ?? product.price;
    const existingIndex = items.findIndex((i) => i.id === product.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [
        ...items,
        {
          id: product.id,
          title: product.title,
          price: effectivePrice,
          sellingPrice: effectivePrice,
          imageUrl: product.imageUrl,
          categoryName: product.categoryName,
          quantity,
        },
      ];
    }

    saveItems(updated);
    toastSuccess(`Added "${product.title}" to your beauty ritual bag.`);
    setIsCartOpen(true);
  };

  const removeItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    saveItems(updated);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    const updated = items.map((i) => (i.id === id ? { ...i, quantity } : i));
    saveItems(updated);
  };

  const clearCart = () => {
    saveItems([]);
  };

  const cartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        freeShippingThreshold,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return {
      items: [],
      cartCount: 0,
      subtotal: 0,
      isCartOpen: false,
      openCart: () => {},
      closeCart: () => {},
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      freeShippingThreshold: 800,
    };
  }
  return context;
}
