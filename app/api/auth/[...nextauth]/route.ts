import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { dbConnect } from "@/lib/db";
import UserCollection from "@/models/User";
import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Email", type: "text" },
        parol: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        const user = await UserCollection.findOne({
          login: credentials?.login,
        });

        if (!user) throw new Error("Foydalanuvchi topilmadi!");
        const isValid = await bcrypt.compare(credentials!.parol, user.parol);
        if (!isValid) throw new Error("Parol noto‘g‘ri!");

        // 🔹 Token ichiga kiritiladigan foydalanuvchi
        return {
          id: user._id.toString(),
          name: user.name,
          login: user.login,
          role: user.role, // <-- "admin" yoki "user"
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = {
          id: user.id,
          name: user.name || "",
          login: user.login,
          role: user.role || "user",
        };
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET || "super-secret-key",
});

export { handler as GET, handler as POST };
