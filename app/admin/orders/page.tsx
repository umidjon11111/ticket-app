"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";

export default function KarzinaPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/karzina");
        const data = await res.json();
        const todayOrders = data.filter(
          (o: any) => o.deletedAt && o.deletedAt.startsWith(today)
        );
        setOrders(todayOrders);
      } catch (err) {
        console.error("❌ Ma’lumot olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🧾 Excel eksport
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      orders.map((o) => ({
        Zakaz_ID: o.orderId,
        Status: o.status,
        Jami_Som: o.items.reduce((s: number, i: any) => s + i.price * i.qty, 0),
        Mahsulotlar: o.items
          .map((i: any) => `${i.name} (${i.qty}x)`)
          .join(", "),
        Ochirildi: new Date(o.deletedAt).toLocaleString("uz-UZ"),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Karzina");
    XLSX.writeFile(wb, `karzina-${today}.xlsx`);
  };

  // 🗑️ Bittasini o‘chirish
  const deleteForever = async (id: string) => {
    if (!confirm("Rostdan ham bu zakazni o‘chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/karzina?id=${id}`, { method: "DELETE" });
      if (res.ok) setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("❌ O‘chirishda xatolik:", err);
    }
  };

  // 🧹 Hammasini o‘chirish
  const clearAll = async () => {
    if (!confirm("Barcha ma’lumotlarni o‘chirishni xohlaysizmi?")) return;
    try {
      const res = await fetch("/api/karzina", { method: "DELETE" });
      if (res.ok) setOrders([]);
    } catch (err) {
      console.error("❌ Karzinani tozalashda xatolik:", err);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600 text-lg">
        ⏳ Yuklanmoqda...
      </div>
    );

  const cancelled = orders.filter((o) => o.status === "cancelled");
  const sold = orders.filter((o) => o.status === "done");

  const totalSum = sold.reduce(
    (sum, o) =>
      sum + o.items.reduce((s: number, i: any) => s + i.price * i.qty, 0),
    0
  );

  // 📊 Sotilgan mahsulotlar statistikasi
  const productStats: Record<string, number> = {};
  sold.forEach((o) =>
    o.items.forEach((i: any) => {
      productStats[i.name] = (productStats[i.name] || 0) + i.qty;
    })
  );
  const sortedStats = Object.entries(productStats).sort((a, b) => b[1] - a[1]);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold text-orange-600">
          🗑️ Bugungi Karzina
        </h1>
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            📥 Excelga yuklash
          </Button>
          <Button
            onClick={clearAll}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            🧹 Hammasini o‘chirish
          </Button>
        </div>
      </div>

      {/* STATISTIKA */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <h2 className="text-lg font-bold text-gray-700">💰 Umumiy savdo</h2>
          <p className="text-2xl text-green-600 font-bold">
            {totalSum.toLocaleString()} so‘m
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <h2 className="text-lg font-bold text-gray-700">
            🧾 Sotilgan zakazlar
          </h2>
          <p className="text-2xl text-blue-600 font-bold">{sold.length} ta</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <h2 className="text-lg font-bold text-gray-700">
            ❌ Bekor qilinganlar
          </h2>
          <p className="text-2xl text-red-600 font-bold">
            {cancelled.length} ta
          </p>
        </div>
      </div>

      {/* ENG KO‘P SOTILGANLAR */}
      {sortedStats.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-3">
            🔝 Eng ko‘p sotilgan mahsulotlar
          </h2>
          <ul className="space-y-1 text-gray-600">
            {sortedStats.map(([name, qty]) => (
              <li key={name}>
                {name} — <b>{qty}</b> dona
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SOTILGAN VA BEKOR QILINGAN USTUNLAR */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ✅ Sotilganlar */}
        <div>
          <h2 className="text-xl font-bold text-green-600 mb-3">
            ✅ Sotilganlar
          </h2>
          {sold.length === 0 ? (
            <p className="text-gray-500">Sotilgan zakaz yo‘q</p>
          ) : (
            <div className="space-y-4">
              {sold.map((o) => (
                <div
                  key={o._id}
                  className="bg-white border rounded-lg shadow-sm p-4 relative"
                >
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    Zakaz #{o.orderId} —{" "}
                    <span className="text-green-600">Tayyor bo‘lgan</span>
                  </h3>

                  <ul className="text-sm mb-2">
                    {o.items.map((i: any, idx: number) => (
                      <li key={idx}>
                        🍔 {i.name} × {i.qty} —{" "}
                        {(i.price * i.qty).toLocaleString()} so‘m
                      </li>
                    ))}
                  </ul>

                  <p className="text-gray-700 font-semibold mb-2">
                    💵 Jami:{" "}
                    {o.items
                      .reduce((s: number, i: any) => s + i.price * i.qty, 0)
                      .toLocaleString()}{" "}
                    so‘m
                  </p>

                  <p className="text-xs text-gray-400">
                    🕓 {new Date(o.deletedAt).toLocaleTimeString("uz-UZ")}
                  </p>

                  <Button
                    variant="destructive"
                    className="absolute top-3 right-3"
                    onClick={() => deleteForever(o._id)}
                  >
                    🗑️ O‘chirish
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ❌ Bekor qilinganlar */}
        <div>
          <h2 className="text-xl font-bold text-red-600 mb-3">
            ❌ Bekor qilinganlar
          </h2>
          {cancelled.length === 0 ? (
            <p className="text-gray-500">Bekor qilingan zakaz yo‘q</p>
          ) : (
            <div className="space-y-4">
              {cancelled.map((o) => (
                <div
                  key={o._id}
                  className="bg-white border rounded-lg shadow-sm p-4 relative"
                >
                  <h3 className="font-bold text-lg text-gray-800 mb-2">
                    Zakaz #{o.orderId} —{" "}
                    <span className="text-red-600">Bekor qilingan</span>
                  </h3>

                  <ul className="text-sm mb-2">
                    {o.items.map((i: any, idx: number) => (
                      <li key={idx}>
                         {i.name} × {i.qty} —{" "}
                        {(i.price * i.qty).toLocaleString()} so‘m
                      </li>
                    ))}
                  </ul>

                  <p className="text-gray-700 font-semibold mb-2">
                    💵 Jami:{" "}
                    {o.items
                      .reduce((s: number, i: any) => s + i.price * i.qty, 0)
                      .toLocaleString()}{" "}
                    so‘m
                  </p>

                  <p className="text-xs text-gray-400">
                    🕓 {new Date(o.deletedAt).toLocaleTimeString("uz-UZ")}
                  </p>

                  <Button
                    variant="destructive"
                    className="absolute top-3 right-3"
                    onClick={() => deleteForever(o._id)}
                  >
                    🗑️ O‘chirish
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
