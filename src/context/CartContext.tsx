"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type CartItem = { id: number; quantity: number; product: { id: number; name: string; price: number } };
type CartCtx = { cartId: number; items: CartItem[]; setItems: (items: CartItem[]) => void };

const CartContext = createContext<CartCtx>({ cartId: 1, items: [], setItems: () => {} });

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  return <CartContext.Provider value={{ cartId: 1, items, setItems }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
