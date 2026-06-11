"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { gqlFetch } from "@/lib/gqlFetch";
import Link from "next/link";

type Product = { id: number; name: string; price: number };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const { cartId, setItems } = useCart();

  const fetchProducts = async () => {
    const data = await gqlFetch(`{ products { id name price } }`);
    setProducts(data.products);
  };

  useEffect(() => { fetchProducts(); }, []);

  const addProduct = async () => {
    await gqlFetch(`mutation($name:String!,$price:Float!){addProduct(name:$name,price:$price){id}}`, { name, price: parseFloat(price) });
    setName(""); setPrice(""); fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    await gqlFetch(`mutation($id:Int!){deleteProduct(id:$id){id}}`, { id });
    fetchProducts();
  };

  const startEdit = (p: Product) => { setEditId(p.id); setName(p.name); setPrice(String(p.price)); };

  const updateProduct = async () => {
    await gqlFetch(`mutation($id:Int!,$name:String,$price:Float){updateProduct(id:$id,name:$name,price:$price){id}}`, { id: editId, name, price: parseFloat(price) });
    setEditId(null); setName(""); setPrice(""); fetchProducts();
  };

  const addToCart = async (productId: number) => {
    await gqlFetch(`mutation($cartId:Int!,$productId:Int!){addToCart(cartId:$cartId,productId:$productId){id quantity product{id name price}}}`, { cartId, productId });
    const data = await gqlFetch(`query($cartId:Int!){cart(cartId:$cartId){items{id quantity product{id name price}}}}`, { cartId });
    setItems(data.cart?.items || []);
  };

  return (
    <div>
      <h1>🛍 Products</h1>
      <Link href="/cart"> View Cart</Link>

      <div style={{ marginTop: 20 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} />
        {editId ? (
          <button onClick={updateProduct}>Update</button>
        ) : (
          <button onClick={addProduct}>Add Product</button>
        )}
      </div>

      <table >
        <thead>
          <tr><th>ID</th><th>Name</th><th>Price</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>
                <button onClick={() => addToCart(p.id)}>Add to Cart</button>
                <button onClick={() => startEdit(p)} >Edit</button>
                <button onClick={() => deleteProduct(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
