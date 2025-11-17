import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// 🧠 Foydalanuvchi tipi (bazadagi user schema bilan mos bo‘lishi kerak)
export interface AppUser extends DefaultUser {
  id: string;
  name: string | null;
  login: string;
  role: "admin" | "user";
}

// 🧩 Sessionni kengaytirish
declare module "next-auth" {
  interface Session {
    user: AppUser;
    accessToken?: string;
  }

  interface User extends AppUser {}
}

// 🔑 JWT tiplarini kengaytirish
declare module "next-auth/jwt" {
  interface JWT {
    user: AppUser;
    accessToken?: string;
  }
}
