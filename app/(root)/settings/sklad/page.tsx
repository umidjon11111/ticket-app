"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function SkladSettings() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);

  const load = async () => {
    setList(await (await fetch("/api/sklad")).json());
  };

  const add = async () => {
    if (!name.trim()) return;

    setLoadingAdd(true);

    await fetch("/api/sklad", {
      method: "POST",
      body: JSON.stringify({ name }),
    });

    setName("");
    await load();

    setLoadingAdd(false);
  };

  const del = async (id: string) => {
    await fetch(`/api/sklad/${id}`, { method: "DELETE" });
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-4">📦 Skladlar</h1>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Yangi sklad"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button onClick={add} disabled={loadingAdd} className="w-32">
          {loadingAdd ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Qo‘shilmoqda...
            </div>
          ) : (
            "Qo‘shish"
          )}
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-white shadow-sm">
        {list.map((s: any) => (
          <div
            key={s._id}
            className="flex justify-between border-b py-2 text-lg"
          >
            <span>{s.name}</span>
            <Button variant="destructive" onClick={() => del(s._id)}>
              🗑
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
