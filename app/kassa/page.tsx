"use client";
import { useCallback, useEffect, useState } from "react";
import socket, { initSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Monitor } from "lucide-react";

export default function KassaPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [online, setOnline] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // === SOCKET ===
  useEffect(() => {
    const socket = initSocket("kassa");
    socket.on("connect", () => setOnline(true));
    socket.on("disconnect", () => setOnline(false));

    socket.on("all_orders", (data) => setOrders(data));
    socket.on("new_order", (order) => setOrders((p) => [order, ...p]));
    socket.on("order_updated", (u) =>
      setOrders((p) => p.map((o) => (o.orderId === u.orderId ? u : o)))
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  // === STATUS ===
  const updateStatus = (id: number, s: string) => {
    const socket = initSocket("kassa");
    socket.emit("update_order_status", { orderId: id, status: s });
  };
  const markAsDone = (orderId: number) => {
    const socket = initSocket("oshxona");
    socket.emit("update_order_status", { orderId, status: "done" });
  };

  // === DELETE ORDER ===
  const deleteOrder = async (order: any) => {
    try {
      socket.emit("delete_order", { orderId: order.orderId });
      setOrders((prev) => prev.filter((o) => o.orderId !== order.orderId));
      const res = await fetch("/api/karzina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...order,
          deletedAt: new Date(),
          deletedFrom: "kassa",
        }),
      });

      if (!res.ok) alert("❌ Karzinaga saqlab bo‘lmadi");
    } catch (err) {
      console.error("❌ O‘chirishda xatolik:", err);
    }
  };

  // === FULLSCREEN ===
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen xatosi:", err);
    }
  };

  // === EKRANGA ULANISH ===
  const openEkranWindow = useCallback(() => {
    const ekranWin = window.open(
      "/ekran",
      "EkranWindow",
      "width=1920,height=1080"
    );
    if (ekranWin) {
      ekranWin.focus();
      setTimeout(() => {
        // ba'zi brauzerlarda yangi oynada fullscreen qilish uchun biron-bir foydalanuvchi ustunligi kerak bo'ladi
        try {
          ekranWin.document.documentElement.requestFullscreen?.();
        } catch (err) {
          // ignore
        }
      }, 800);
    } else {
      alert("⚠️ Brauzer pop-up oynalarni bloklagan. Ruxsat bering!");
    }
  }, []);

  const total = orders
    .filter((o) => o.status === "done")
    .reduce(
      (sum, o) =>
        sum + o.items.reduce((s: number, i: any) => s + i.price * i.qty, 0),
      0
    );

  // === UI ===
  return (
    <div className="p-6 min-h-screen bg-gray-50 transition-all">
      {/* === HEADER === */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            💰 Kassa — Real-time zakazlar{" "}
            {online ? (
              <span className="text-green-600">(onlayn)</span>
            ) : (
              <span className="text-red-500">(oflayn)</span>
            )}
          </h1>
        </div>

        <div className="flex gap-2">
          {/* 🖥️ Ekran tugmasi */}
          <Button
            onClick={openEkranWindow}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Monitor className="w-4 h-4 mr-2" /> Ekranga ulanish
          </Button>

          {/* 🖥️ Fullscreen tugmasi */}
          <Button
            variant="outline"
            onClick={toggleFullscreen}
            title={
              isFullscreen
                ? "Chiqish (Fullscreen rejimdan)"
                : "Fullscreen rejimga o‘tish"
            }
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 mr-2" /> Chiqish
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 mr-2" /> Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* === ZAKAZLAR === */}
      {orders.length === 0 ? (
        <p className="text-gray-500">Hozircha zakazlar yo‘q</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o._id}
              className={`border rounded-lg p-4 shadow-sm relative transition-all ${
                o.status === "done"
                  ? "bg-green-50 border-green-500"
                  : o.status === "in_progress"
                  ? "bg-yellow-50 border-yellow-500"
                  : o.status === "cancelled"
                  ? "bg-red-50 border-red-500"
                  : "bg-white border-gray-300"
              }`}
            >
              <h2 className="font-bold text-lg">
                Zakaz #{o.orderId} —{" "}
                <span
                  className={`${
                    o.status === "done"
                      ? "text-green-600"
                      : o.status === "in_progress"
                      ? "text-yellow-600"
                      : o.status === "cancelled"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {o.status === "new"
                    ? "Yangi"
                    : o.status === "in_progress"
                    ? "Tayyorlanmoqda"
                    : o.status === "done"
                    ? "Tayyor"
                    : "Bekor qilingan"}
                </span>
              </h2>

              <ul className="mt-2 text-sm">
                {o.items.map((i: any, k: any) => (
                  <li key={k}>
                    {i.name} × {i.qty} — {i.price.toLocaleString()} so‘m
                  </li>
                ))}
              </ul>

              <p className="mt-2 font-semibold">
                💵 Jami:{" "}
                {o.items
                  .reduce((s: number, i: any) => s + i.price * i.qty, 0)
                  .toLocaleString()}{" "}
                so‘m
              </p>

              {/* === TUGMALAR === */}
              {o.status === "new" && (
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => updateStatus(o.orderId, "in_progress")}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✅ Qabul qilish
                  </Button>
                  <Button
                    onClick={() => updateStatus(o.orderId, "cancelled")}
                    variant="destructive"
                  >
                    ❌ Bekor qilish
                  </Button>
                </div>
              )}

              {o.status === "in_progress" && (
                <div className="flex gap-2 mt-3">
                  <Button
                    onClick={() => markAsDone(o.orderId)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✅ Tayyor
                  </Button>
                </div>
              )}

              {(o.status === "done" || o.status === "cancelled") && (
                <Button
                  onClick={() => deleteOrder(o)}
                  className="absolute top-3 right-3 text-red-600 hover:text-red-800"
                  variant="outline"
                  title="O‘chirish (karzinaga saqlanadi)"
                >
                  🗑️
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* === PASTKI PANEL === */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between">
        <b>Umumiy tushum:</b>{" "}
        <span className="text-green-600 font-bold">
          {total.toLocaleString()} so‘m
        </span>
      </div>
    </div>
  );
}
