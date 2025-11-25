"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Armchair,
  Truck,
  Package,
  FileChartColumn,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSocket } from "@/lib/socket";

interface OrderTypeStats {
  total: number;
  canceled: number;
  count: number;
}

interface Report {
  date: string;
  total: number;
  canceled: number;
  ordersCount: number;
  deliverySum: number;
  cash: number;
  types?: {
    Zal: OrderTypeStats;
    Dastavka: OrderTypeStats;
    Saboy: OrderTypeStats;
  };
}

export default function Navbar() {
  const pages = [
    { name: "Zal", icon: Armchair, href: "/" },
    { name: "Dastavka", icon: Truck, href: "/dastavka" },
    { name: "Saboy", icon: Package, href: "/saboy" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  const [report, setReport] = useState<Report | null>(null);
  const [open, setOpen] = useState(false);

  // 🔥 modalni qayta render qilish uchun trigger
  const [modalRefresh, setModalRefresh] = useState(0);

  const socket = getSocket();

  const loadReport = async () => {
    const res = await fetch("/api/daily-report");
    const data = await res.json();
    setReport(data);
  };

  // REAL-TIME HISOBOT LISTENER
  useEffect(() => {
    loadReport();

    socket.on("daily_report_closed", (msg) => {
      console.log("📡 Real-time hisobot keldi:", msg);
      loadReport();
      setModalRefresh(Date.now()); // 🔥 modal uchun re-render
    });

    return () => {
      socket.off("daily_report_closed");
    };
  }, []);

  const sendDailyReport = async () => {
    if (!report) return;

    socket.emit("printer_kunlik_check", report);

    const res = await fetch("/api/close-day", { method: "POST" });
    const result = await res.json();

    if (result.ok) {
      alert("Kunlik hisob yakunlandi!");
      setOpen(false);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="flex w-full mx-2 mt-2 gap-3">
        {pages.map((p) => (
          <Link key={p.name} href={p.href} className="w-full">
            <Card
              className="flex flex-col items-center justify-center gap-1 
              bg-white rounded-xl py-4 px-2 shadow-md border hover:shadow-lg 
              active:scale-[0.97] transition cursor-pointer text-center"
            >
              <p.icon size={32} className="text-gray-700" />
              <span className="text-[15px] font-medium">{p.name}</span>
            </Card>
          </Link>
        ))}

        {/* HISOBOT */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Card
              className="flex flex-col items-center justify-center gap-1 
              bg-red-500 text-white rounded-xl py-4 px-2 shadow-md 
              hover:bg-red-600 active:scale-[0.97] transition cursor-pointer text-center w-full"
            >
              <FileChartColumn size={32} />
              <span className="text-[15px] font-medium">Hisobot</span>
            </Card>
          </DialogTrigger>

          {/* 🔥 key={modalRefresh} modalni real-time yangilab turadi */}
          <DialogContent className="max-w-md">
            <div key={modalRefresh}>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  📊 Kunlik Hisobot
                </DialogTitle>
              </DialogHeader>

              {!report ? (
                <p>Yuklanmoqda...</p>
              ) : (
                <div className="space-y-3 text-[16px]">
                  <p>
                    <b>Sana:</b> {report.date}
                  </p>
                  <p>
                    <b>Umumiy savdo:</b> {report.total} so‘m
                  </p>
                  <p>
                    <b>Bekor:</b> {report.canceled} so‘m
                  </p>
                  <p>
                    <b>Buyurtmalar:</b> {report.ordersCount} ta
                  </p>
                  <p>
                    <b>Dastavka:</b> {report.deliverySum} so‘m
                  </p>
                  <p>
                    <b>Naqd:</b> {report.cash} so‘m
                  </p>

                  {report.types && (
                    <div className="p-3 rounded-lg border bg-gray-50 space-y-2">
                      <p className="font-semibold">🔎 Yo‘nalishlar:</p>
                      {Object.entries(report.types).map(([key, stats]) => (
                        <div
                          key={key}
                          className="flex justify-between text-[15px]"
                        >
                          <span>{key}:</span>
                          <span>
                            {stats.count} ta — {stats.total} so‘m
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={sendDailyReport}
                    className="w-full py-5 text-[16px] bg-blue-600 hover:bg-blue-700"
                  >
                    🖨 Printerga yuborish
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
