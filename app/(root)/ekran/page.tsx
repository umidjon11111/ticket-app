"use client";
import { useEffect, useState } from "react";
import { initSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface Order {
  _id: string;
  orderId: number;
  status: string;
  items: { name: string; qty: number; price: number }[];
}

// 🔢 Raqamni o‘zbekcha so‘zga aylantiruvchi funksiya
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

  if (num === 0) return "nol";
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
  // 🔊 Barqaror ovoz funksiyasi (SpeechSynthesis)
  const playVoice = (text: string) => {
    if (!voiceEnabled) return;
    try {
      if ("speechSynthesis" in window) {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "tr-TR"; // o‘zbekchaga eng yaqin talaffuz
        utter.pitch = 1;
        utter.rate = 0.9;
        utter.volume = 1;
        window.speechSynthesis.cancel(); // eski navbatni tozalaydi
        window.speechSynthesis.speak(utter);
      } else {
        alert("Sizning brauzeringiz ovoz funksiyasini qo‘llamaydi.");
      }
    } catch (err) {
      console.error("Ovoz chiqarishda xatolik:", err);
    }
  };
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
  useEffect(() => {
    const socket = initSocket("oshxona");

    socket.on("connect", () => setOnline(true));
    socket.on("disconnect", () => setOnline(false));

    socket.on("all_orders", (data: Order[]) => {
      setInProgress(data.filter((o) => o.status === "in_progress"));
      setDoneOrders(data.filter((o) => o.status === "done"));
    });

    socket.on("new_order", (order: Order) => {
      if (order.status === "in_progress") {
        setInProgress((prev) => [order, ...prev]);
      }
    });

    socket.on("order_updated", (updated: Order) => {
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
      } else if (updated.status === "done") {
        setInProgress((prev) =>
          prev.filter((o) => o.orderId !== updated.orderId)
        );
        setDoneOrders((prev) => [updated, ...prev]);
        const orderInWords = numberToUzbekWords(updated.orderId);
        playVoice(`Zakaz ${orderInWords} tayyor bo‘ldi`);
      } else {
        setInProgress((prev) =>
          prev.filter((o) => o.orderId !== updated.orderId)
        );
        setDoneOrders((prev) =>
          prev.filter((o) => o.orderId !== updated.orderId)
        );
      }
    });

    // 🗑️ Yangi: order_deleted eventini tinglash
    socket.on("order_deleted", (orderId: number) => {
      setInProgress((prev) => prev.filter((o) => o.orderId !== orderId));
      setDoneOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    });

    return () => {
      socket.off("all_orders");
      socket.off("new_order");
      socket.off("order_updated");
      socket.off("order_deleted"); // 🧹 yangi eventni ham tozalaymiz
    };
  }, [voiceEnabled]);

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600">🍽️ Sakura Ekrani</h1>
        <div className="flex items-center gap-4">
          <div>
            {online ? (
              <span className="text-green-600 font-semibold">🟢 Online</span>
            ) : (
              <span className="text-red-600 font-semibold">🔴 Offline</span>
            )}
          </div>

          {/* 🔊 Ovoz tugmasi */}
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
      </header>

      {/* 2 ustunli layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tayyorlanayotgan */}
        <div className="bg-white shadow-lg rounded-lg p-4 border-t-4 border-yellow-400">
          <h2 className="text-xl font-bold mb-3 text-yellow-600">
            🧑‍🍳 Tayyorlanayotgan zakazlar
          </h2>
          {inProgress.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Tayyorlanayotgan zakaz yo‘q
            </p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3">
              {inProgress.map((o) => (
                <div
                  key={o._id}
                  className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg shadow-sm"
                >
                  <h3 className="font-bold text-lg text-gray-800">
                    Zakaz #{o.orderId}
                  </h3>
                  <ul className="mt-2 text-sm space-y-1">
                    {o.items.map((i, idx) => (
                      <li key={idx}>
                        {i.name} × {i.qty}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-gray-600">
                    💰{" "}
                    {o.items
                      .reduce((sum: number, i: any) => sum + i.price * i.qty, 0)
                      .toLocaleString()}{" "}
                    so‘m
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tayyor bo‘lgan */}
        <div className="bg-white shadow-lg rounded-lg p-4 border-t-4 border-green-500">
          <h2 className="text-xl font-bold mb-3 text-green-600">
            ✅ Tayyor bo‘lgan zakazlar
          </h2>
          {doneOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Hozircha tayyor zakaz yo‘q
            </p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3">
              {doneOrders.map((o) => (
                <div
                  key={o._id}
                  className="p-3 bg-green-50 border border-green-300 rounded-lg shadow-sm"
                >
                  <h3 className="font-bold text-lg text-gray-800">
                    Zakaz #{o.orderId}
                  </h3>
                  <ul className="mt-2 text-sm space-y-1">
                    {o.items.map((i, idx) => (
                      <li key={idx}>
                        {i.name} × {i.qty}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-gray-600">
                    💵{" "}
                    {o.items
                      .reduce((sum: number, i: any) => sum + i.price * i.qty, 0)
                      .toLocaleString()}{" "}
                    so‘m
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
