"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export default function BalancePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/balance");
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">📦 Qoldiq (Остатки)</h1>
      <Card className="p-4">
        {loading ? (
          <p>Yuklanmoqda...</p>
        ) : (
          <table className="w-full border-collapse text-[15px]">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border">Maxsulot</th>
                <th className="p-2 border">Sklad</th>
                <th className="p-2 border">Kirim</th>
                <th className="p-2 border">Sarf</th>
                <th className="p-2 border">Qoldiq</th>
              </tr>
            </thead>

            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border">
                  <td className="p-2 border">{row.product}</td>
                  <td className="p-2 border">{row.sklad}</td>
                  <td className="p-2 border">
                    {row.income} {row.unit}
                  </td>
                  <td className="p-2 border text-red-600">
                    {row.usage} {row.unit}
                  </td>
                  <td
                    className={`p-2 border font-bold ${
                      row.balance < 0 ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {row.balance} {row.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
