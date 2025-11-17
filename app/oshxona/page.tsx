"use client";

import { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [online, setOnline] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const socket = initSocket("oshxona");

    socket.on("connect", () => setOnline(true));
    socket.on("disconnect", () => setOnline(false));

    // Barcha zakazlar kelganda
    socket.on("all_orders", (data) => {
      const filtered = data.filter((o: any) => o.status === "in_progress");
      setOrders(filtered);
    });

    // Yangi zakaz
    socket.on("new_order", (order) => {
      if (order.status === "in_progress") {
        setOrders((prev) => [order, ...prev]);
      }
    });

    // Status yangilansa
    socket.on("order_updated", (updated) => {
      if (updated.status !== "in_progress") {
        // done → oshxona kartadan o‘chadi
        setOrders((prev) => prev.filter((o) => o.orderId !== updated.orderId));
      } else {
        // inner update
        setOrders((prev) =>
          prev.map((o) => (o.orderId === updated.orderId ? updated : o))
        );
      }
    });

    return () => {
      socket.off("all_orders");
      socket.off("new_order");
      socket.off("order_updated");
    };
  }, []);
  // FULLSCREEN
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-yellow-50">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          🍳 Oshxona — Buyurtmalar{" "}
          {online ? (
            <span className="text-green-600">(online)</span>
          ) : (
            <span className="text-red-600">(offline)</span>
          )}
        </h1>

        <Button variant="outline" onClick={toggleFullscreen}>
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

      {/* ORDER CARDLAR */}
      {orders.length === 0 ? (
        <p className="text-gray-500 mt-6">Hozircha buyurtma yo‘q</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {orders.map((o) => (
            <div
              key={o._id}
              className="border border-yellow-400 bg-white rounded-lg p-4 shadow-md"
            >
              <h2 className="font-bold text-orange-600 text-lg">
                Zakaz #{o.orderId}
              </h2>

              <ul className="mt-3 space-y-1 text-sm">
                {o.items.map((i: any, idx: number) => (
                  <li key={idx}>
                    {i.name} × {i.qty} — {i.price.toLocaleString("uz-UZ")} so‘m
                  </li>
                ))}
              </ul>

              <p className="mt-3 font-semibold">
                Jami:{" "}
                {o.items
                  .reduce((s: number, i: any) => s + i.qty * i.price, 0)
                  .toLocaleString()}{" "}
                so‘m
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
