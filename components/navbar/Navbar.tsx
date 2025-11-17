import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Armchair, Truck, Package } from "lucide-react";

function Navbar() {
  const items = [
    { type: "zal", title: "Zal", icon: Armchair, href: "/" },
    { type: "dastavka", title: "Dastavka", icon: Truck, href: "/dastavka" },
    { type: "saboy", title: "Saboy", icon: Package, href: "/saboy" },
  ];

  return (
    <div
      className="
        grid
        grid-cols-1
        sm:grid-cols-2
        lg:grid-cols-3
        gap-8
        px-6
        sm:px-10
        md:px-14
        py-5
      "
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.type} href={item.href}>
            <Card
              className="
                h-48 sm:h-52 md:h-44 
                w-full 
                flex flex-col items-center justify-center 
                rounded-3xl 
                bg-white/70 backdrop-blur-md 
                border border-white/40 
                shadow-[0_8px_30px_rgb(0,0,0,0.08)]
                transition-all duration-300 
                cursor-pointer 
                hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]
                hover:scale-[1.04]
              "
            >
              {/* Icon badge */}
              <div
                className="
                  w-16 h-16
                  sm:w-18 sm:h-18
                  md:w-14 md:h-16
                  flex items-center justify-center 
                  rounded-full 
                  bg-gradient-to-br from-blue-500 to-indigo-600
                  text-white
                  shadow-lg
                "
              >
                <Icon size={38} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <p className="mt-3 text-xl sm:text-2xl font-semibold text-gray-800 tracking-wide">
                {item.title}
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default Navbar;
