"use client";

import { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

export default function KitchenPage() {
  const [online, setOnline] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [zalOrders, setZalOrders] = useState<any[]>([]);
  const [dastavkaOrders, setDastavkaOrders] = useState<any[]>([]);
  const [saboyOrders, setSaboyOrders] = useState<any[]>([]);

  useEffect(() => {
    const socket = initSocket("oshxona");

    socket.on("connect", () => setOnline(true));
    socket.on("disconnect", () => setOnline(false));

    socket.on("all_orders", (data: any[]) => {
      const filtered = data.filter((o) => o.status === "in_progress");
      categorize(filtered);
    });

    socket.on("new_order", (order: any) => {
      if (order.status === "in_progress") {
        if (order.OrderType === "Zal") setZalOrders((p) => [order, ...p]);
        if (order.OrderType === "Dastavka")
          setDastavkaOrders((p) => [order, ...p]);
        if (order.OrderType === "Saboy") setSaboyOrders((p) => [order, ...p]);
      }
    });

    socket.on("order_updated", (updated: any) => {
      if (updated.status !== "in_progress") {
        removeFromAll(updated.orderId);
        return;
      }
      updateOrder(updated);
    });

    return () => {
      socket.off("all_orders");
      socket.off("new_order");
      socket.off("order_updated");
    };
  }, []);

  const categorize = (orders: any[]) => {
    setZalOrders(orders.filter((o) => o.OrderType === "Zal"));
    setDastavkaOrders(orders.filter((o) => o.OrderType === "Dastavka"));
    setSaboyOrders(orders.filter((o) => o.OrderType === "Saboy"));
  };

  const updateOrder = (updated: any) => {
    if (updated.OrderType === "Zal")
      setZalOrders((p) =>
        p.map((o) => (o.orderId === updated.orderId ? updated : o))
      );

    if (updated.OrderType === "Dastavka")
      setDastavkaOrders((p) =>
        p.map((o) => (o.orderId === updated.orderId ? updated : o))
      );

    if (updated.OrderType === "Saboy")
      setSaboyOrders((p) =>
        p.map((o) => (o.orderId === updated.orderId ? updated : o))
      );
  };

  const removeFromAll = (id: number) => {
    setZalOrders((p) => p.filter((o) => o.orderId !== id));
    setDastavkaOrders((p) => p.filter((o) => o.orderId !== id));
    setSaboyOrders((p) => p.filter((o) => o.orderId !== id));
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const OrderCard = ({ o }: any) => (
    <div className="border border-yellow-400 bg-white rounded-lg p-4 shadow-md">
      <h2 className="font-bold text-orange-600 text-lg">Zakaz #{o.orderId}</h2>

      <ul className="mt-3 space-y-1 text-sm">
        {o.items.map((i: any, idx: number) => (
          <li key={idx}>
            {i.name} × {i.qty} — {i.price.toLocaleString()} so‘m
          </li>
        ))}
      </ul>

      <p className="mt-3 font-semibold">
        Jami:{" "}
        {o.items
          .reduce((sum: number, i: any) => sum + i.qty * i.price, 0)
          .toLocaleString()}{" "}
        so‘m
      </p>
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-yellow-50">
      {/* HEADER */}
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

      {/* 3ta bo‘lim — BORDER bilan qat'iy ajratilgan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* ZAL BLOCK */}
        <div className="border-2 border-blue-400 rounded-xl p-4 bg-white shadow-lg">
          <h2 className="text-xl font-bold text-blue-600 border-b pb-2 mb-3">
            🟦 Zal
          </h2>
          <div className="space-y-3">
            {zalOrders.length === 0 ? (
              <p className="text-gray-500 text-center">Buyurtma yo‘q</p>
            ) : (
              zalOrders.map((o) => <OrderCard key={o._id} o={o} />)
            )}
          </div>
        </div>

        {/* DASTAVKA BLOCK */}
        <div className="border-2 border-green-400 rounded-xl p-4 bg-white shadow-lg">
          <h2 className="text-xl font-bold text-green-600 border-b pb-2 mb-3">
            🟩 Dastavka
          </h2>
          <div className="space-y-3">
            {dastavkaOrders.length === 0 ? (
              <p className="text-gray-500 text-center">Buyurtma yo‘q</p>
            ) : (
              dastavkaOrders.map((o) => <OrderCard key={o._id} o={o} />)
            )}
          </div>
        </div>

        {/* SABOY BLOCK */}
        <div className="border-2 border-orange-400 rounded-xl p-4 bg-white shadow-lg">
          <h2 className="text-xl font-bold text-orange-600 border-b pb-2 mb-3">
            🟧 Saboy
          </h2>
          <div className="space-y-3">
            {saboyOrders.length === 0 ? (
              <p className="text-gray-500 text-center">Buyurtma yo‘q</p>
            ) : (
              saboyOrders.map((o) => <OrderCard key={o._id} o={o} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
