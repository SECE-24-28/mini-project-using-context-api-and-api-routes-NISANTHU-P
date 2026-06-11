"use client";
import { useCart } from "@/context/CartContext";
import { gqlFetch } from "@/lib/gqlFetch";
import Link from "next/link";
import { useEffect } from "react";

export default function CartPage() {
  const { cartId, items, setItems } = useCart();

  const fetchCart = async () => {
    const data = await gqlFetch(`query($cartId:Int!){cart(cartId:$cartId){items{id quantity product{id name price}}}}`, { cartId });
    setItems(data.cart?.items || []);
  };

  useEffect(() => { fetchCart(); }, []);

  const remove = async (cartItemId: number) => {
    await gqlFetch(`mutation($cartItemId:Int!){removeFromCart(cartItemId:$cartItemId){id}}`, { cartItemId });
    fetchCart();
  };

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <div style={{ padding: 20 }}>
      <h1> Cart</h1>
      <Link href="/"> Back to Products</Link>
      {items.length === 0 ? <p>Cart is empty</p> : (
        <table >
          <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th>Action</th></tr></thead>
          <tbody>
            {items.map(i => (
              <tr key={i.id}>
                <td>{i.product.name}</td>
                <td>${i.product.price}</td>
                <td>{i.quantity}</td>
                <td>${(i.product.price * i.quantity).toFixed(2)}</td>
                <td><button onClick={() => remove(i.id)} >Remove</button></td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><td colSpan={3}><strong>Total</strong></td><td colSpan={2}><strong>${total.toFixed(2)}</strong></td></tr></tfoot>
        </table>
      )}
    </div>
  );
}
