"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function IncomesSettings() {
  const [products, setProducts] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [sklads, setSklads] = useState([]);

  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);

  const load = async () => {
    setProducts(await (await fetch("/api/products")).json());
    setIncomes(await (await fetch("/api/incomes")).json());
    setSklads(await (await fetch("/api/sklad")).json());
  };

  const add = async () => {
    if (!product || !quantity || !price || !warehouse) return;

    setLoadingAdd(true);

    await fetch("/api/incomes", {
      method: "POST",
      body: JSON.stringify({ product, quantity, price, warehouse }),
    });

    setQuantity("");
    setPrice("");
    setLoadingAdd(false);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-4">📥 Kirimlar</h1>

      <div className="flex gap-2 mb-4">
        {/* Mahsulot */}
        <select
          className="border px-2 rounded-lg"
          onChange={(e) => setProduct(e.target.value)}
        >
          <option value="">Mahsulot</option>
          {products.map((p: any) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Miqdor */}
        <Input
          placeholder="Miqdor"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {/* Narxi */}
        <Input
          placeholder="Narxi"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* Sklad */}
        <select
          className="border px-2 rounded-lg"
          onChange={(e) => setWarehouse(e.target.value)}
        >
          <option value="">Sklad</option>
          {sklads.map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <Button disabled={loadingAdd} onClick={add} className="w-20">
          {loadingAdd ? <Loader2 className="w-5 h-5 animate-spin" /> : "➕"}
        </Button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        {incomes.map((i: any) => (
          <div key={i._id} className="border-b py-2">
            {i.product?.name} — {i.quantity} × {i.price} so‘m (
            {i.warehouse?.name})
          </div>
        ))}
      </div>
    </div>
  );
}
