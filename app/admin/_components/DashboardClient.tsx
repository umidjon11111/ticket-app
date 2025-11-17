"use client";

import { signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardClient({ stats }: { stats: any }) {
  return (
    <div className="mx-2 mb-2 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">📊 Admin Dashboard</h1>
          <p className="text-gray-600">Xush kelibsiz, bugungi statistika:</p>
        </div>

        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          variant="destructive"
          className="mt-3 sm:mt-0 flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </Button>
      </div>

      {/* STATISTIKA KARTLAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-all border-blue-200">
          <CardHeader>
            <CardTitle>📦 Mahsulotlar soni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.productCount}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-green-200">
          <CardHeader>
            <CardTitle>🏷️ Kategoriyalar soni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.categoryCount}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all border-red-200">
          <CardHeader>
            <CardTitle>🗑️ Bugungi karzina</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stats.todayKarzina}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
