"use client";
import { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface Order {
  _id: string;
  orderId: number;
  OrderType: string;
  status: string;
  items: { name: string; qty: number; price: number }[];
}

// 🔢 Raqamni so‘zga aylantirish
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

  // 🔊 Ovoz
  const playVoice = (text: string) => {
    if (!voiceEnabled) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "tr-TR";
    utter.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    const socket = initSocket("ekran"); // ekran xonasi

    socket.on("connect", () => setOnline(true));
    socket.on("disconnect", () => setOnline(false));

    // 🔵 Barcha zakazlar keladi — faqat ZAL filtrlab olamiz
    socket.on("all_orders", (data: Order[]) => {
      const zalOrders = data.filter((o) => o.OrderType === "Zal");

      setInProgress(zalOrders.filter((o) => o.status === "in_progress"));
      setDoneOrders(zalOrders.filter((o) => o.status === "done"));
    });

    // 🆕 Yangi zakaz — faqat ZAL bo‘lsa
    socket.on("new_order", (order: Order) => {
      if (order.OrderType !== "Zal") return;
      if (order.status === "in_progress") {
        setInProgress((prev) => [order, ...prev]);
      }
    });

    // 🟡 Status yangilansa — faqat ZAL bo‘lsa
    socket.on("order_updated", (updated: Order) => {
      if (updated.OrderType !== "Zal") return;

      if (updated.status === "in_progress") {
        setInProgress((prev) => {
          const exists = prev.find((o) => o.orderId === updated.orderId);
          if (exists)
            return prev.map((o) =>
              o.orderId === updated.orderId ? updated : o
            );

          return [updated, ...prev];
        });
        setDoneOrders((prev) =>
          prev.filter((o) => o.orderId !== updated.orderId)
        );
      }

      if (updated.status === "done") {
        setInProgress((prev) =>
          prev.filter((o) => o.orderId !== updated.orderId)
        );
        setDoneOrders((prev) => [updated, ...prev]);

        const words = numberToUzbekWords(updated.orderId);
        playVoice(`Zakaz ${words} tayyor bo‘ldi`);
      }
    });

    // 🗑 O‘chirilgan ZAL zakazlari
    socket.on("order_deleted", (orderId: number) => {
      setInProgress((prev) => prev.filter((o) => o.orderId !== orderId));
      setDoneOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    });

    return () => {
      socket.off("all_orders");
      socket.off("new_order");
      socket.off("order_updated");
      socket.off("order_deleted");
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
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600">
          🍽️ Sakura Ekrani — ZAL
        </h1>
        <div>
          <span className={online ? "text-green-600" : "text-red-500"}>
            {online ? "🟢 Online" : "🔴 Offline"}
          </span>
          {/* 🔊 Ovoz tugmasi */}{" "}
          {!voiceEnabled ? (
            <button
              onClick={() => {
                setVoiceEnabled(true);
                playVoice("Ovoz yoqildi");
              }}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
            >
              {" "}
              🔊 Ovoz yoqish{" "}
            </button>
          ) : (
            <button
              onClick={() => {
                setVoiceEnabled(false);
                window.speechSynthesis.cancel();
              }}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-400"
            >
              {" "}
              🔇 Ovoz o‘chirish{" "}
            </button>
          )}{" "}
          {/* 🖥️ Fullscreen tugmasi */}{" "}
          <Button
            variant="outline"
            onClick={toggleFullscreen}
            title={
              isFullscreen
                ? "Chiqish (Fullscreen rejimdan)"
                : "Fullscreen rejimga o‘tish"
            }
          >
            {" "}
            {isFullscreen ? (
              <>
                {" "}
                <Minimize2 className="w-4 h-4 mr-2" /> Chiqish{" "}
              </>
            ) : (
              <>
                {" "}
                <Maximize2 className="w-4 h-4 mr-2" /> Fullscreen{" "}
              </>
            )}{" "}
          </Button>
        </div>
      </header>

      {/* --- UI --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* In Progress */}
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
                <h3 className="font-bold">#{o.orderId}</h3>
                {o.items.map((i, idx) => (
                  <p key={idx}>
                    {i.name} × {i.qty}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Done */}
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-lg font-bold text-green-600">✅ Tayyor</h2>

          {doneOrders.length === 0 && (
            <p className="text-gray-500 mt-4 text-center">Tayyor zakaz yo‘q</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {doneOrders.map((o) => (
              <div key={o._id} className="p-3 bg-green-50 border rounded">
                <h3 className="font-bold">#{o.orderId}</h3>
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
