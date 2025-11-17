"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";

export default function KarzinaTable() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/karzina");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("❌ Karzina ma’lumotlarini olishda xatolik:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🗑️ Bittasini o‘chirish
  const deleteOrder = async (id: string) => {
    if (!confirm("Rostdan ham bu zakazni o‘chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/karzina?id=${id}`, { method: "DELETE" });
      if (res.ok) setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("❌ O‘chirishda xatolik:", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-12 text-gray-600">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Yuklanmoqda...
      </div>
    );

  if (orders.length === 0)
    return (
      <div className="text-center py-10 text-gray-500">
        🗑️ Karzina hozircha bo‘sh
      </div>
    );

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg p-4 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">🗑️ Karzina jadvali</h2>
        <Button
          variant="destructive"
          onClick={async () => {
            if (!confirm("Barcha ma’lumotlarni o‘chirmoqchimisiz?")) return;
            await fetch("/api/karzina", { method: "DELETE" });
            setOrders([]);
          }}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Hammasini o‘chirish
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px] text-center">#</TableHead>
              <TableHead>Zakaz ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Mahsulotlar</TableHead>
              <TableHead>Jami summa</TableHead>
              <TableHead>O‘chirilgan sana</TableHead>
              <TableHead className="text-right">Amal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o, idx) => (
              <TableRow key={o._id}>
                <TableCell className="text-center font-semibold">
                  {idx + 1}
                </TableCell>
                <TableCell>#{o.orderId}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      o.status === "cancelled"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }
                  >
                    {o.status === "cancelled"
                      ? "Bekor qilingan"
                      : "Tayyor bo‘lgan"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {o.items.map((i: any, id: number) => (
                    <div key={id}>
                      {i.name} × {i.qty}
                    </div>
                  ))}
                </TableCell>
                <TableCell className="font-semibold text-gray-800">
                  {o.items
                    .reduce((sum: number, i: any) => sum + i.price * i.qty, 0)
                    .toLocaleString()}{" "}
                  so‘m
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {new Date(o.deletedAt).toLocaleString("uz-UZ")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteOrder(o._id)}
                    className="text-red-600 border-red-200 hover:bg-red-100"
                  >
                    🗑️ O‘chirish
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
