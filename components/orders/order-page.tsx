"use client";

import { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket";
import Link from "next/link";
import { Button } from "../ui/button";

export default function OrderPage({ type }: { type: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    const room = type.toLowerCase();
    const socket = initSocket(room);

    const onConnect = () => setOnline(true);
    const onDisconnect = () => setOnline(false);

    const onAll = (data: any[]) => {
      const filtered = data.filter((o) => o.OrderType === type);
      setOrders(filtered);
    };

    const onNew = (order: any) => {
      if (order.OrderType === type) {
        setOrders((prev) => [order, ...prev]);
      }
    };

    const onUpdate = (updated: any) => {
      if (updated.OrderType !== type) return;

      setOrders((prev) =>
        prev.map((o) => (o.orderId === updated.orderId ? updated : o))
      );
    };

    const onDelete = (orderId: number) => {
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("all_orders", onAll);
    socket.on("new_order", onNew);
    socket.on("order_updated", onUpdate);
    socket.on("order_deleted", onDelete);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("all_orders", onAll);
      socket.off("new_order", onNew);
      socket.off("order_updated", onUpdate);
      socket.off("order_deleted", onDelete);
    };
  }, [type]);

  const markAsDone = (orderId: number) => {
    const socket = initSocket("oshxona");
    socket.emit("update_order_status", { orderId, status: "done" });
  };

  const deleteOrder = async (order: any) => {
    const socket = initSocket("kassa");

    // 🟡 1) Bazaga saqlaymiz
    await fetch("/api/karzina", {
      method: "POST",
      body: JSON.stringify({
        orderId: order.orderId,
        status: order.status,
        items: order.items,
        OrderType: order.OrderType,
      }),
    });

    // 🔴 2) Asosiy zakazlar ro‘yxatidan o‘chiramiz (serverga)
    socket.emit("delete_order", { orderId: order.orderId });

    // 🟢 3) UI dan o‘chiramiz
    setOrders((prev) => prev.filter((o) => o.orderId !== order.orderId));
  };

  const updateStatus = (id: number, s: string) => {
    const socket = initSocket("kassa");

    // 🔥 darrov UI da o'zgartiramiz
    setOrders((prev) =>
      prev.map((o) => (o.orderId === id ? { ...o, status: s } : o))
    );

    // 🔥 serverga yuboramiz
    socket.emit("update_order_status", { orderId: id, status: s });
  };

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <Link href={`/create-order?type=${type}`}>
          <Button className="px-6 py-3 text-lg">➕ Sazdat</Button>
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">{type} zakazlari</h2>

      {orders.length === 0 && (
        <p className="text-gray-500 text-lg">Hozircha zakaz yo‘q...</p>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((o) => (
          <div
            key={o.orderId}
            className={`border w-full p-4 rounded-xl shadow text-lg transition-all
    ${
      o.status === "done"
        ? "bg-green-100 border-green-400"
        : o.status === "cancelled"
        ? "bg-gray-200 border-gray-400 text-gray-600"
        : "bg-white"
    }`}
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-xl text-blue-600">
                🧾 Zakaz № {o.orderId}
              </p>
              {(o.status == "done" || o.status == "cancelled") && (
                <Button
                  onClick={() => deleteOrder(o)}
                  className=" text-red-600 hover:text-red-800"
                  variant="outline"
                  title="O‘chirish (karzinaga saqlanadi)"
                >
                  🗑️
                </Button>
              )}
            </div>

            <div className="mt-2 text-gray-700">
              {o.items.map((i: any, idx: number) => (
                <p key={idx}>
                  {i.name} × {i.qty} —{" "}
                  {(i.qty * i.price).toLocaleString("uz-UZ")} so‘m
                </p>
              ))}
            </div>

            <p className="mt-3 font-medium">
              Status:
              <span
                className={
                  o.status === "done" ? "text-green-600" : "text-orange-600"
                }
              >
                {" "}
                {o.status}
              </span>
            </p>

            <div className=" w-full">
              {o.status === "in_progress" && (
                <div className=" border">
                  <Button
                    onClick={() => updateStatus(o.orderId, "cancelled")}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    ❌ Bekor qilish
                  </Button>
                  <Button
                    onClick={() => markAsDone(o.orderId)}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓ Tayyor
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
