"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function ProductsSettings() {
  const [list, setList] = useState([]);
  const [sklads, setSklads] = useState([]);

  const [name, setName] = useState("");
  const [unit, setUnit] = useState("kg");
  const [warehouse, setWarehouse] = useState("");

  const [loadingAdd, setLoadingAdd] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState("");

  const load = async () => {
    setList(await (await fetch("/api/products")).json());
    setSklads(await (await fetch("/api/sklad")).json());
  };

  const add = async () => {
    if (!name.trim() || !unit || !warehouse) return;
    setLoadingAdd(true);

    await fetch("/api/products", {
      method: "POST",
      body: JSON.stringify({ name, unit, warehouse }),
    });

    setName("");
    setWarehouse("");
    await load();

    setLoadingAdd(false);
  };

  const del = async (id: string) => {
    setDeleteLoadingId(id);

    await fetch(`/api/products/${id}`, { method: "DELETE" });
    await load();

    setDeleteLoadingId("");
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-4">🍣 Maxsulotlar</h1>

      {/* FORM */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Maxsulot nomi"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          className="border rounded-lg px-2"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        >
          <option value="kg">kg</option>
          <option value="gr">gr</option>
          <option value="l">litr</option>
          <option value="dona">dona</option>
        </select>

        <select
          className="border rounded-lg px-2"
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
        >
          <option value="">Sklad tanlash</option>
          {sklads.map((s: any) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>

        <Button disabled={loadingAdd} onClick={add} className="w-32">
          {loadingAdd ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Qo‘shilmoqda...
            </div>
          ) : (
            "Qo‘shish"
          )}
        </Button>
      </div>

      {/* LIST */}
      <div className="bg-white p-4 shadow rounded-lg">
        {list.map((p: any) => (
          <div key={p._id} className="flex justify-between border-b py-2">
            <span>
              {p.name} ({p.unit}) — {p?.warehouse?.name}
            </span>

            <Button
              variant="destructive"
              onClick={() => del(p._id)}
              disabled={deleteLoadingId === p._id}
              className="w-20"
            >
              {deleteLoadingId === p._id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "🗑"
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
