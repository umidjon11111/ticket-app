"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import io from "socket.io-client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  // ============================
  // SOCKET INIT
  // ============================
  useEffect(() => {
    const s = io("https://sakura-socket-tr04.onrender.com", {
      transports: ["websocket"],
    });

    setSocket(s);

    s.emit("join_room", "kassa");

    s.on("order_confirmed", () => {
      clearForm();

      if (orderType === "Zal") router.push("/");
      if (orderType === "Dastavka") router.push("/dastavka");
      if (orderType === "Saboy") router.push("/saboy");
    });

    // ✔ To'g‘ri cleanup
    return () => {
      s.disconnect();
    };
  }, []);

  // ============================
  // FILTER PRODUCTS
  // ============================
  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p: any) => p.category?.name === activeCategory);

  // ============================
  // CART FUNCTIONS
  // ============================
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

  const minusFromCart = (id: string) => {
    setCart((prev) =>
      prev
        .map((p) => (p._id === id ? { ...p, qty: p.qty - 1 } : p))
        .filter((p) => p.qty > 0)
    );
  };

  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  // ============================
  // CLEAR FORM
  // ============================
  const clearForm = () => {
    setCart([]);
    setCustomerName("");
    setPhone("");
    setAddress("");
    setSending(false);
  };

  // ============================
  // HANDLE SUBMIT
  // ============================
  const handleSubmit = () => {
    if (!socket) return alert("Serverga ulanilmadi!");
    if (sending) return;
    if (cart.length === 0) return alert("Mahsulot qo‘shing!");

    if (orderType === "Dastavka" && (!customerName || !phone || !address))
      return alert("Ism, telefon va manzilni to‘ldiring!");

    if (orderType === "Saboy" && !customerName)
      return alert("Ismni to‘ldiring!");

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

    socket.emit("create_order", payload);
    setSending(true);
  };

  // ============================
  // UI (PLANSHEET OPTIMIZED)
  // ============================
  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 md:p-8 gap-6">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6 overflow-y-auto pb-20">
        <div className="mb-4 text-2xl font-bold">
          Buyurtma turi: <span className="text-blue-600">{orderType}</span>
        </div>

        {/* Customer Info */}
        {(orderType === "Dastavka" || orderType === "Saboy") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              className="border p-4 rounded-xl text-lg"
              placeholder="Ism"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />

            {orderType === "Dastavka" && (
              <>
                <input
                  className="border p-4 rounded-xl text-lg"
                  placeholder="Telefon"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <input
                  className="border p-4 rounded-xl md:col-span-2 text-lg"
                  placeholder="Manzil"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </>
            )}
          </div>
        )}

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
          <button
            onClick={() => setActiveCategory("all")}
            className={`p-4 rounded-xl border text-lg font-semibold shadow-sm ${
              activeCategory === "all" ? "bg-blue-100 border-blue-500" : ""
            }`}
          >
            Hammasi
          </button>

          {categories.map((cat: any) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat.name)}
              className={`p-4 rounded-xl border text-lg font-semibold shadow-sm ${
                activeCategory === cat.name ? "bg-blue-100 border-blue-500" : ""
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((p: any) => (
            <div
              key={p._id}
              onClick={() => addToCart(p)}
              className="p-5 border rounded-xl shadow-lg cursor-pointer bg-white hover:bg-gray-50"
            >
              <Image
                src={p.image || "/noimg.png"}
                alt={p.name}
                width={150}
                height={150}
                className="rounded-lg mx-auto"
              />
              <h3 className="mt-3 text-center font-semibold text-xl">
                {p.name}
              </h3>
              <p className="text-center text-gray-700 text-lg">
                {formatPrice(p.price)} so'm
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT (CART) */}
      <div className="w-full lg:w-1/3 bg-white shadow-xl rounded-2xl p-6 flex flex-col justify-between sticky top-4 h-[55vh] lg:h-[90vh]">
        <div className="overflow-y-auto">
          <h2 className="text-3xl font-bold mb-6">Buyurtma</h2>

          {cart.length === 0 && (
            <p className="text-gray-500 text-center text-xl mt-10">
              Mahsulot qo‘shing...
            </p>
          )}

          <div className="flex flex-col gap-5">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between items-center pb-3 border-b"
              >
                <p className="font-semibold text-xl flex-1">
                  {item.name} × {item.qty}
                </p>

                <div className="flex items-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => minusFromCart(item._id)}
                    className="px-4 py-2 bg-red-100 text-red-600 text-xl"
                  >
                    –
                  </Button>

                  <Button
                    size="lg"
                    onClick={() => addToCart(item)}
                    className="px-4 py-2 bg-green-100 text-green-600 text-xl"
                  >
                    +
                  </Button>
                </div>

                <p className="w-28 text-right font-bold text-xl">
                  {formatPrice(item.price * item.qty)} so'm
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-2xl font-bold mt-4">
            <p>Jami:</p>
            <p>{formatPrice(total)} so'm</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={sending}
            className="w-full mt-5 py-4 bg-blue-600 text-white rounded-xl text-2xl font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {sending ? "Yuborilmoqda..." : "Buyurtma berish"}
          </button>
        </div>
      </div>
    </div>
  );
}
