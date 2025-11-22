"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket"; //  ✔ initSocket emas!
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface Order {
  _id: string;
  orderId: number;
  OrderType: string;
  status: string;
  items: { name: string; qty: number; price: number }[];
}

// 🔢 Raqamni so‘zga aylantirish (Uzbek)
function numberToUzbekWords(num: number): string {
  const ones = [
    "",
    "bir",
    "ikki",
    "uch",
    "to‘rt",
    "besh",
    "olti",
    "yetti",
    "sakkiz",
    "to‘qqiz",
  ];
  const tens = [
    "",
    "o‘n",
    "yigirma",
    "o‘ttiz",
    "qirq",
    "ellik",
    "oltmish",
    "yetmish",
    "sakson",
    "to‘qson",
  ];

  if (num < 10) return ones[num];
  if (num < 100)
    return `${tens[Math.floor(num / 10)]} ${ones[num % 10]}`.trim();

  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return `${ones[hundred]} yuz ${
      rest > 0 ? numberToUzbekWords(rest) : ""
    }`.trim();
  }

  return num.toString();
}

export default function Ekran() {
  const [inProgress, setInProgress] = useState<Order[]>([]);
  const [doneOrders, setDoneOrders] = useState<Order[]>([]);
  const [online, setOnline] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 🔊 Ovoz chiqazish
  const playVoice = (text: string) => {
    if (!voiceEnabled) return;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "tr-TR";
    utter.rate = 0.9;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    const socket = getSocket();

    // Join specific room
    socket.emit("join_room", "ekran");

    // ONLINE HANDLING
    if (socket.connected) setOnline(true);

    const onConnect = () => setOnline(true);
    const onDisconnect = () => setOnline(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // 🔵 Barcha zakazlar
    const onAll = (data: Order[]) => {
      const zal = data.filter((o) => o.OrderType === "Zal");

      setInProgress(zal.filter((o) => o.status === "in_progress"));
      setDoneOrders(zal.filter((o) => o.status === "done"));
    };

    // 🆕 Yangi zakaz
    const onNew = (order: Order) => {
      if (order.OrderType !== "Zal") return;
      if (order.status === "in_progress") {
        setInProgress((prev) => [order, ...prev]);
      }
    };

    // 🟡 Yangilanish
    const onUpdate = (updated: Order) => {
      if (updated.OrderType !== "Zal") return;

      if (updated.status === "in_progress") {
        // done bo'lgan bo‘lsa qayta in_progress ga o'tdi
        setDoneOrders((prev) =>
          prev.filter((o) => o.orderId !== updated.orderId)
        );

        setInProgress((prev) => {
          const exist = prev.find((x) => x.orderId === updated.orderId);
          if (exist)
            return prev.map((x) =>
              x.orderId === updated.orderId ? updated : x
            );
          return [updated, ...prev];
        });
      }

      if (updated.status === "done") {
        setInProgress((prev) =>
          prev.filter((o) => o.orderId !== updated.orderId)
        );
        setDoneOrders((prev) => [updated, ...prev]);

        const words = numberToUzbekWords(updated.orderId);
        playVoice(`Zakaz ${words} tayyor bo‘ldi`);
      }
    };

    // 🗑 Delete event
    const onDelete = (orderId: number) => {
      setInProgress((p) => p.filter((x) => x.orderId !== orderId));
      setDoneOrders((p) => p.filter((x) => x.orderId !== orderId));
    };

    // ➕ Listenerlar
    socket.on("all_orders", onAll);
    socket.on("new_order", onNew);
    socket.on("order_updated", onUpdate);
    socket.on("order_deleted", onDelete);

    // Cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("all_orders", onAll);
      socket.off("new_order", onNew);
      socket.off("order_updated", onUpdate);
      socket.off("order_deleted", onDelete);
    };
  }, [voiceEnabled]);

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

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600">
          🍽️ Sakura Ekrani — ZAL
        </h1>

        <div className="flex items-center gap-3">
          <span className={online ? "text-green-600" : "text-red-500"}>
            {online ? "🟢 Online" : "🔴 Offline"}
          </span>

          {/* OVOZ TUGMASI */}
          {!voiceEnabled ? (
            <button
              onClick={() => {
                setVoiceEnabled(true);
                playVoice("Ovoz yoqildi");
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
            >
              🔊 Ovoz yoqish
            </button>
          ) : (
            <button
              onClick={() => {
                setVoiceEnabled(false);
                window.speechSynthesis.cancel();
              }}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400"
            >
              🔇 Ovoz o‘chirish
            </button>
          )}

          {/* FULLSCREEN */}
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
      </header>

      {/* 2 TA BLOK */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IN PROGRESS */}
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-lg font-bold text-yellow-600">
            🧑‍🍳 Tayyorlanayotgan
          </h2>

          {inProgress.length === 0 && (
            <p className="text-gray-500 mt-4 text-center">Zakaz yo‘q</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {inProgress.map((o) => (
              <div key={o._id} className="p-3 bg-yellow-50 border rounded">
                <h3 className="font-bold text-lg">#{o.orderId}</h3>
                {o.items.map((i, idx) => (
                  <p key={idx}>
                    {i.name} × {i.qty}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* DONE */}
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-lg font-bold text-green-600">✅ Tayyor</h2>

          {doneOrders.length === 0 && (
            <p className="text-gray-500 mt-4 text-center">Tayyor zakaz yo‘q</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {doneOrders.map((o) => (
              <div key={o._id} className="p-3 bg-green-50 border rounded">
                <h3 className="font-bold text-lg">#{o.orderId}</h3>
                {o.items.map((i, idx) => (
                  <p key={idx}>
                    {i.name} × {i.qty}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
