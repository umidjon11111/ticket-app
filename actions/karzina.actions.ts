import { dbConnect } from "@/lib/db";
import Karzina from "@/models/karzina";

type OrderType = "Zal" | "Dastavka" | "Saboy";

export async function getDailyReport() {
  await dbConnect();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const orders = await Karzina.find({
    deletedAt: { $gte: startOfDay },
  }).lean();

  let total = 0;
  let canceled = 0;
  let deliverySum = 0;
  let ordersCount = orders.length;

  const types: Record<
    OrderType,
    { total: number; canceled: number; count: number }
  > = {
    Zal: { total: 0, canceled: 0, count: 0 },
    Dastavka: { total: 0, canceled: 0, count: 0 },
    Saboy: { total: 0, canceled: 0, count: 0 },
  };

  orders.forEach((order) => {
    const orderTotal = order.items.reduce(
      (sum: number, item: any) => sum + item.qty * item.price,
      0
    );

    const t = order.OrderType as OrderType;

    if (types[t]) {
      types[t].count++;

      if (order.status === "cancel") {
        types[t].canceled += orderTotal;
      } else {
        types[t].total += orderTotal;
      }
    }

    if (order.status === "cancel") {
      canceled += orderTotal;
    } else {
      total += orderTotal;
    }

    if (t === "Dastavka") {
      deliverySum += orderTotal;
    }
  });

  return {
    total,
    canceled,
    deliverySum,
    ordersCount,
    cash: total - canceled,
    date: new Date().toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),

    types,
  };
}
