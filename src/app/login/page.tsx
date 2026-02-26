"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";

type FormState = {
  email: string;
  password: string;
  remember: boolean;
};

type AuthUser = {
  id: number;
  ime: string;
  prezime?: string;
  email: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    remember: true,
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("remember_email");
    if (saved) {
      setForm((p) => ({ ...p, email: saved }));
    }
  }, []);

  useEffect(() => {
    if (errors.general) {
      setErrors((p) => ({ ...p, general: undefined }));
    }
    if (successMsg) setSuccessMsg(null);
  }, [form.email, form.password]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validate() {
    const next: typeof errors = {};

    if (!form.email.trim()) next.email = "Email je obavezan.";
    else if (!form.email.includes("@")) next.email = "Unesi ispravan email.";

    if (!form.password) next.password = "Lozinka je obavezna.";
    else if (form.password.length < 6)
      next.password = "Lozinka mora imati bar 6 karaktera.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          lozinka: form.password, 
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrors((p) => ({
          ...p,
          general: data?.error?.message ?? "Pogrešan email ili lozinka.",
        }));
        return;
      }

    
      const token: string | undefined = data?.data?.token ?? data?.token;
      const user: AuthUser | undefined = data?.data?.user ?? data?.user;

      if (token) {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }

      if (user?.email) {
        localStorage.setItem("role", user.role);
        localStorage.setItem("auth_user", JSON.stringify(user));
        localStorage.setItem("auth_logged_in", "true");
      } else {
        localStorage.removeItem("role");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_logged_in");
      }

      
      if (form.remember) {
        localStorage.setItem("remember_email", form.email);
      } else {
        localStorage.removeItem("remember_email");
      }

      
      setSuccessMsg(
        user?.ime
          ? `Uspešno ste prijavljeni. Zdravo, ${user.ime}!`
          : "Uspešno ste prijavljeni."
      );

      
      setTimeout(() => {
        window.location.href = "/";
      }, 900);
    } catch {
      setErrors((p) => ({
        ...p,
        general: "Došlo je do greške. Pokušaj ponovo.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 bg-neutral-50" />
      <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.16),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.12),transparent_45%)]" />

      <section className="w-full max-w-sm">
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-neutral-200 shadow-xl p-7">
          <div className="flex justify-center mb-4">
            <Image
              src="/logofinal.png"
              alt="ResQ Collective logo"
              width={120}
              height={120}
              priority
            />
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-neutral-900">
            Zdravo,
            <br />
            Dobrodošao/la nazad
          </h1>

          <p className="mt-2 text-sm text-neutral-600">
            Uloguj se da bi pregledao/la životinje i podneo/la zahtev za udomljavanje.
          </p>

          {successMsg && (
            <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMsg}
            </div>
          )}

          {errors.general && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email adresa"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="npr. ime@gmail.com"
              error={errors.email}
              required
            />

            <Input
              label="Lozinka"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Unesi lozinku"
              error={errors.password}
              required
            />

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
                />
                Zapamti me
              </label>

              <button
                type="button"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
                onClick={() => alert("Reset lozinke")}
              >
                Zaboravljena lozinka?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl py-3 font-semibold transition bg-[#C3E7FD] hover:bg-[#AEDCF9] text-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Prijavljivanje..." : "Prijavi se"}
            </button>

            <p className="pt-2 text-center text-sm text-neutral-600">
              Nemaš nalog?{" "}
              <button
                type="button"
                className="font-semibold text-sky-500 hover:text-sky-600"
                onClick={() => router.push("/register")}
              >
                Registruj se
              </button>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
