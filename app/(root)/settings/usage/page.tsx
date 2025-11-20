"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function UsagePage() {
  const [products, setProducts] = useState([]);
  const [list, setList] = useState([]);

  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("daily");

  const [loadingAdd, setLoadingAdd] = useState(false);

  const load = async () => {
    setProducts(await (await fetch("/api/products")).json());
    setList(await (await fetch("/api/stock-usage")).json());
  };

  const add = async () => {
    if (!product || !amount) return;

    setLoadingAdd(true);

    await fetch("/api/stock-usage", {
      method: "POST",
      body: JSON.stringify({ product, amount, reason }),
    });

    setAmount("");
    setLoadingAdd(false);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-4">🧾 Sarf</h1>

      <div className="flex gap-2 mb-4">
        <select
          className="border rounded-lg px-2"
          onChange={(e) => setProduct(e.target.value)}
        >
          <option>Tanlang</option>
          {products.map((p: any) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <Input
          placeholder="Miqdor"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          className="border rounded-lg px-2"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="daily">Ishlatilgan</option>
          <option value="waste">Chiqindi</option>
          <option value="manual">Qo‘lda</option>
        </select>

        <Button disabled={loadingAdd} onClick={add} className="w-20">
          {loadingAdd ? <Loader2 className="h-5 w-5 animate-spin" /> : "➕"}
        </Button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        {list.map((u: any) => (
          <div key={u._id} className="border-b py-2">
            {u.product.name} — {u.amount} ({u.reason})
          </div>
        ))}
      </div>
    </div>
  );
}
