"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import io from "socket.io-client";
import { Button } from "../ui/button";

const formatPrice = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);

export default function CreateOrderClient({
  orderType,
  categories,
  products,
}: any) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  // ============================
  // SOCKET INIT
  // ============================
  useEffect(() => {
    const s = io("https://sakura-socket-tr04.onrender.com");
    setSocket(s);

    s.emit("join_room", "kassa");

    s.on("order_confirmed", (order: any) => {
      console.log("ORDER CONFIRMED:", order);
      clearForm();
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // ============================
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p: any) => p.category?.name === activeCategory);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        return prev.map((p) =>
          p._id === product._id ? { ...p, qty: p.qty + 1 } : p
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  interface CartItem {
    _id: string;
    name: string;
    qty: number;
    price: number;
    category?: { name: string };
    image?: string;
  }

  interface Customer {
    name: string;
    phone: string;
    address: string;
  }

  interface PrinterPayload {
    check_number: number;
    date_time: string;
    items: Array<{
      name: string;
      quantity: number;
      total_price: number;
    }>;
    subtotal: number;
    total: number;
    orderType: string;
    payment_type: string;
    customer: Customer | null;
  }

  const minusFromCart = (id: string): void => {
    setCart((prev: CartItem[]) =>
      prev
        .map((p: CartItem) => (p._id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p: CartItem) => p.qty > 0)
    );
  };

  const total: number = cart.reduce(
    (s: number, i: CartItem) => s + i.qty * i.price,
    0
  );

  // ============================
  // PRINTER PAYLOAD (faqat cart'dan)
  // ============================
  const sendToPrinter = async (
    cartData: CartItem[],
    orderType: string,
    name: string,
    phone: string,
    address: string
  ): Promise<void> => {
    if (!cartData || cartData.length === 0) {
      console.error("❌ CART bo'sh");
      return;
    }

    const payload: PrinterPayload = {
      check_number: Date.now(),
      date_time: new Date().toLocaleString("uz-UZ"),

      items: cartData.map((item: CartItem) => ({
        name: item.name,
        quantity: item.qty,
        total_price: item.qty * item.price,
      })),

      subtotal: cartData.reduce(
        (s: number, i: CartItem) => s + i.qty * i.price,
        0
      ),
      total: cartData.reduce(
        (s: number, i: CartItem) => s + i.qty * i.price,
        0
      ),

      orderType,
      payment_type: "naqd",

      customer:
        orderType === "Dastavka" || orderType === "Saboy"
          ? { name, phone, address }
          : null,
    };

    await fetch("https://192.168.1.4:8080/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  // ============================
  const clearForm = (): void => {
    setCart([]);
    setCustomerName("");
    setPhone("");
    setAddress("");
    setSending(false);
  };

  // ============================
  const handleSubmit = (): void => {
    if (!socket) return alert("Serverga ulanilmadi!");
    if (sending) return;
    if (cart.length === 0) return alert("Mahsulot qo‘shing!");

    if (orderType === "Dastavka") {
      if (!customerName || !phone || !address)
        return alert("Ism, telefon, manzilni kiriting!");
    }

    if (orderType === "Saboy" && !customerName) return alert("Ismni kiriting!");

    const payload = {
      orderType,
      cart: cart.map((c) => ({
        name: c.name,
        qty: c.qty,
        price: c.price,
      })),
      customer: {
        name: customerName || "",
        phone: phone || "",
        address: address || "",
      },
    };

    // 🔥 1) Orderni serverga yuborish
    socket.emit("create_order", payload);

    // 🔥 2) Printerga DARHOL jo‘natish
    sendToPrinter(cart, orderType, customerName, phone, address);

    // 🔥 3) UI tozalash
    clearForm();

    setSending(true);
  };

  // ============================
  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 md:p-6 gap-6">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 overflow-y-auto pb-20">
        <div className="mb-4 text-xl font-semibold">
          Buyurtma turi: <span className="text-blue-600">{orderType}</span>
        </div>

        {(orderType === "Dastavka" || orderType === "Saboy") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              className="border p-3 rounded-xl"
              placeholder="Ism"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            {orderType === "Dastavka" && (
              <>
                <input
                  className="border p-3 rounded-xl"
                  placeholder="Telefon"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <input
                  className="border p-3 rounded-xl md:col-span-2"
                  placeholder="Manzil"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </>
            )}
          </div>
        )}

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveCategory("all")}
            className={`p-3 rounded-xl border shadow-sm ${
              activeCategory === "all" ? "bg-blue-100 border-blue-500" : ""
            }`}
          >
            Hammasi
          </button>

          {categories.map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat.name)}
              className={`p-3 rounded-xl border shadow-sm ${
                activeCategory === cat.name ? "bg-blue-100 border-blue-500" : ""
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p: any) => (
            <div
              key={p._id}
              onClick={() => addToCart(p)}
              className="p-4 border rounded-xl shadow cursor-pointer hover:bg-gray-50"
            >
              <Image
                src={p.image || "/noimg.png"}
                alt={p.name}
                width={140}
                height={140}
                className="rounded-lg mx-auto"
              />
              <h3 className="mt-2 text-center font-semibold">{p.name}</h3>
              <p className="text-center text-gray-600">
                {formatPrice(p.price)} so'm
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT CART */}
      <div className="w-full lg:w-1/3 bg-white shadow-xl rounded-2xl p-6 flex flex-col justify-between sticky top-6 h-[50vh] lg:h-[90vh]">
        <div className="overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Buyurtma</h2>

          {cart.length === 0 && (
            <p className="text-gray-500 text-center mt-10">
              Mahsulot qo‘shing...
            </p>
          )}

          <div className="flex flex-col gap-4">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center border-b pb-2"
              >
                <p className="font-medium flex-1">
                  {item.name} × {item.qty}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => minusFromCart(item._id)}
                    className="px-3 py-2 bg-red-100 text-red-600"
                  >
                    –
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => addToCart(item)}
                    className="px-3 py-2 bg-green-100 text-green-600"
                  >
                    +
                  </Button>
                </div>

                <p className="w-24 text-right font-semibold">
                  {formatPrice(item.price * item.qty)} so'm
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-lg font-bold mt-4">
            <p>Jami:</p>
            <p>{formatPrice(total)} so'm</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={sending}
            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg font-semibold disabled:opacity-50"
          >
            {sending ? "Yuborilmoqda..." : "Buyurtma berish"}
          </button>
        </div>
      </div>
    </div>
  );
}
