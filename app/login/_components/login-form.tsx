"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { signIn } from "next-auth/react";

type LoginFormValues = {
  login: string;
  parol: string;
};

export function LoginForm() {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormValues): Promise<void> => {
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      login: data.login,
      parol: data.parol,
      redirect: false,
    });

    if (!res) {
      setError("Server bilan aloqa yo‘q!");
      setLoading(false);
      return;
    }

    if (!res.ok) {
      setError(res.error || "Login yoki parol noto‘g‘ri");
      setLoading(false);
      return;
    }

    // 🔹 Agar muvaffaqiyatli bo‘lsa, localStorage'ga zaxira uchun yozamiz
    localStorage.setItem(
      "user",
      JSON.stringify({ login: data.login, role: "admin" })
    );

    router.push("/admin");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-center">Login</h1>

      <Input
        type="email"
        placeholder="Email kiriting"
        required
        {...register("login")}
      />
      <Input
        type="password"
        placeholder="Parol kiriting"
        required
        {...register("parol")}
      />

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Button disabled={loading} type="submit" className="mt-2">
        <Icon
          icon={loading ? "eos-icons:loading" : "mdi:login"}
          className={loading ? "mr-2 animate-spin" : "mr-2"}
        />
        {loading ? "Kirish..." : "Kirish"}
      </Button>
    </form>
  );
}
