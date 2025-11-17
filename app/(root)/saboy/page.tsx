"use client";

import { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type OrderItem = { name: string; qty: number; price: number };
type Order = {
  _id: string;
  orderId: number;
  OrderType: string;
  items: OrderItem[];
  status: string;
};

export default function DastavkaPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const socket = initSocket("Saboy");

    // online check
    socket.on("connect", () => setOnline(true));
    socket.on("disconnect", () => setOnline(false));

    // 🔵 Server join_room jo‘natganida → all_orders keladi
    socket.on("all_orders", (data: Order[]) => {
      const filtered = data.filter(
        (o) => o.OrderType === "Saboy" && o.status === "in_progress"
      );
      setOrders(filtered);
    });

    // 🔴 Yangi zakaz real-time
    socket.on("new_order", (order: Order) => {
      if (order.OrderType === "Saboy") {
        setOrders((prev) => [order, ...prev]);
      }
    });

    // 🟡 Status o‘zgarganda
    socket.on("order_updated", (updated: Order) => {
      if (updated.OrderType !== "Saboy") return;

      if (updated.status !== "in_progress") {
        // done yoki cancelled → olib tashlanadi
        setOrders((prev) => prev.filter((o) => o.orderId !== updated.orderId));
      } else {
        // faqat yangilash
        setOrders((prev) =>
          prev.map((o) => (o.orderId === updated.orderId ? updated : o))
        );
      }
    });

    // ❌ O‘chirilgan zakaz
    socket.on("order_deleted", (orderId: number) => {
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <Link href="/create-order?type=Saboy">
          <Button>Sazdat</Button>
        </Link>

        <span
          className={`text-sm font-semibold ${
            online ? "text-green-600" : "text-red-500"
          }`}
        >
          {online ? "Online" : "Offline"}
        </span>
      </div>

      <h2 className="text-xl font-bold mb-4">Saboy zakazlari</h2>

      {/* EMPTY */}
      {orders.length === 0 && (
        <p className="text-gray-500">Hozircha zakaz yo‘q...</p>
      )}

      {/* ORDER LIST */}
      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <div
            key={o.orderId}
            className="border p-4 rounded-xl shadow bg-white"
          >
            <p className="font-semibold text-lg text-blue-600">
              🚚 Zakaz № {o.orderId}
            </p>

            <div className="mt-2 text-gray-700">
              {o.items.map((i, idx) => (
                <p key={idx}>
                  {i.name} × {i.qty} —{" "}
                  {(i.price * i.qty).toLocaleString("uz-UZ")} so‘m
                </p>
              ))}
            </div>

            <p className="mt-3 font-medium">
              Status: <span className="text-orange-600">{o.status}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
