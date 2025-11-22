"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import Link from "next/link";
import { Button } from "../ui/button";
import OrderSkeleton from "@/components/skeleton/OrderSkeleton";

export default function OrderPage({ type }: { type: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const socket = getSocket();

    // ⚡ SOCKET ALLAQACHON ULANGAN BO'LSA
    if (socket.connected) setOnline(true);

    const onConnect = () => setOnline(true);
    const onDisconnect = () => setOnline(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // ROOM JOIN
    const room = type.toLowerCase();
    socket.emit("join_room", room);

    // EVENTS
    const onAll = (data: any[]) => {
      const filtered = data.filter((o) => o.OrderType === type);
      setOrders(filtered);
      setLoading(false); // DATA KELGANDAN KEYIN LOADING O‘CHADI
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

    const onDelete = (id: number) => {
      setOrders((prev) => prev.filter((o) => o.orderId !== id));
    };

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

  // =============================
  // ORDER ACTIONS
  // =============================
  const markAsDone = (orderId: number) => {
    getSocket().emit("update_order_status", { orderId, status: "done" });
  };

  const deleteOrder = async (order: any) => {
    const socket = getSocket();

    await fetch("/api/karzina", {
      method: "POST",
      body: JSON.stringify({
        orderId: order.orderId,
        status: order.status,
        items: order.items,
        OrderType: order.OrderType,
      }),
    });

    socket.emit("delete_order", { orderId: order.orderId });

    setOrders((prev) => prev.filter((o) => o.orderId !== order.orderId));
  };

  const updateStatus = (id: number, status: string) => {
    const socket = getSocket();

    setOrders((prev) =>
      prev.map((o) => (o.orderId === id ? { ...o, status } : o))
    );

    socket.emit("update_order_status", { orderId: id, status });
  };

  // =============================
  // RENDER
  // =============================

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link href={`/create-order?type=${type}`}>
          <Button className="px-6 py-3 text-lg">➕ Sazdat</Button>
        </Link>

        {online ? (
          <div className="flex items-center border h-full gap-2 text-green-600 font-medium px-2 py-1 rounded">
            <p className="bg-green-500 rounded-full w-3 h-3"></p>
            <p>online</p>
          </div>
        ) : (
          <div className="flex items-center border h-full gap-2 text-red-600 font-medium px-2 py-1 rounded">
            <p className="bg-red-500 rounded-full w-3 h-3"></p>
            <p>offline</p>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">{type} zakazlari</h2>

      {/* 🔥 SKELETONS */}
      {loading && (
        <div className="flex flex-col gap-4">
          <OrderSkeleton />
          <OrderSkeleton />
          <OrderSkeleton />
        </div>
      )}

      {/* 🔥 ZAKAZ YO‘Q */}
      {!loading && orders.length === 0 && (
        <p className="text-gray-500 text-lg">Hozircha zakaz yo‘q...</p>
      )}

      {/* 🔥 REAL ORDER LIST */}
      {!loading && orders.length > 0 && (
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

                {(o.status === "done" || o.status === "cancelled") && (
                  <Button
                    onClick={() => deleteOrder(o)}
                    className="text-red-600 hover:text-red-800"
                    variant="outline"
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

              {o.status === "in_progress" && (
                <div className="mt-3">
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
          ))}
        </div>
      )}
    </div>
  );
}
