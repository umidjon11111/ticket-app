"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function OrdersMoth() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [dayOrders, setDayOrders] = useState<any[]>([]);
  const [dayLoading, setDayLoading] = useState(false);

  // 👉 OYLIK umumiy summa
  const monthlyTotal = list.reduce((sum, d) => sum + (d.totalSum || 0), 0);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/moth-orders");
    const json = await res.json();
    setList(json);
    setLoading(false);
  };

  const loadDayOrders = async (date: string) => {
    console.log(date);
    setDayLoading(true);
    const res = await fetch(`/api/moth-orders/${date}`);
    const json = await res.json();
    setDayOrders(json);
    setDayLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">📅 Oylik Buyurtmalar</h1>

      {/* 🔵 OYLIK YIG'INDI KARTA */}
      <Card className="p-4 bg-green-50 border border-green-300 shadow text-xl">
        <p className="font-bold text-green-800">
          🟢 Oyning umumiy savdosi:{" "}
          <span className="text-2xl">{monthlyTotal.toLocaleString()} so‘m</span>
        </p>
      </Card>

      {/* 🔵 OYLIK RO‘YXAT TABLE */}
      <Card className="p-4 bg-white shadow">
        {loading ? (
          <p>Yuklanmoqda...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Buyurtmalar</TableHead>
                <TableHead>Bekor</TableHead>
                <TableHead>Savdo</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {list.map((d, i) => (
                <TableRow key={i}>
                  <TableCell>{d.date}</TableCell>
                  <TableCell>{d.totalOrders} ta</TableCell>
                  <TableCell className="text-red-600">
                    {d.cancelled} ta
                  </TableCell>
                  <TableCell className="text-green-700 font-bold">
                    {d.totalSum.toLocaleString()} so‘m
                  </TableCell>

                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDate(d.date);
                            loadDayOrders(d.date);
                          }}
                        >
                          Ko‘rish →
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            📅 {d.date} — Kunlik buyurtmalar
                          </DialogTitle>
                        </DialogHeader>

                        {dayLoading ? (
                          <p>Yuklanmoqda...</p>
                        ) : dayOrders.length === 0 ? (
                          <p>Bu kunda buyurtma yo‘q</p>
                        ) : (
                          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                            {dayOrders.map((o: any, idx: number) => (
                              <Card
                                key={idx}
                                className="p-3 border shadow-sm bg-gray-50"
                              >
                                <p className="font-semibold">
                                  🧾 Zakaz #{o.orderId} —{" "}
                                  <span
                                    className={`${
                                      o.status === "cancelled"
                                        ? "text-red-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {o.status}
                                  </span>
                                </p>

                                <ul className="text-sm mt-2">
                                  {o.items.map((i: any, n: number) => (
                                    <li key={n}>
                                      {i.name} × {i.qty} —{" "}
                                      {(i.qty * i.price).toLocaleString()} so‘m
                                    </li>
                                  ))}
                                </ul>

                                <p className="mt-2 font-bold">
                                  Jami:{" "}
                                  {o.items
                                    .reduce(
                                      (s: number, i: any) =>
                                        s + i.qty * i.price,
                                      0
                                    )
                                    .toLocaleString()}{" "}
                                  so‘m
                                </p>
                              </Card>
                            ))}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
