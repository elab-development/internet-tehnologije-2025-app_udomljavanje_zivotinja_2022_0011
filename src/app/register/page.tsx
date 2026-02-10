"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Input from "@/components/ui/Input";

type FormState = {
  ime: string;
  prezime: string;
  datumRodjenja: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    ime: "",
    prezime: "",
    datumRodjenja: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<{
    ime?: string;
    prezime?: string;
    datumRodjenja?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (errors.general) {
      setErrors((p) => ({ ...p, general: undefined }));
    }
  }, [form.ime, form.prezime, form.datumRodjenja, form.email, form.password, form.confirmPassword, form.acceptTerms]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  function validate() {
    const next: typeof errors = {};

    if (!form.ime.trim()) next.ime = "Ime je obavezno.";
    if (!form.prezime.trim()) next.prezime = "Prezime je obavezno.";
    if (!form.datumRodjenja) next.datumRodjenja = "Datum rođenja je obavezan.";

    if (!form.email.trim()) next.email = "Email je obavezan.";
    else if (!form.email.includes("@")) next.email = "Unesi ispravan email.";

    if (!form.password) next.password = "Lozinka je obavezna.";
    else if (form.password.length < 6) next.password = "Lozinka mora imati bar 6 karaktera.";

    if (!form.confirmPassword) next.confirmPassword = "Potvrda lozinke je obavezna.";
    else if (form.confirmPassword !== form.password) next.confirmPassword = "Lozinke se ne poklapaju.";

    if (!form.acceptTerms) next.acceptTerms = "Moraš da prihvatiš uslove korišćenja.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ime: form.ime,
          prezime: form.prezime,
          datumRodjenja: form.datumRodjenja,
          email: form.email,
          lozinka: form.password, 
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrors((p) => ({
          ...p,
          general: data?.error?.message ?? "Registracija nije uspela. Pokušaj ponovo.",
        }));
        return;
      }

      
      router.push("/");
    } catch (err) {
      setErrors((p) => ({ ...p, general: "Došlo je do greške. Pokušaj ponovo." }));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 bg-neutral-50" />
      <div className="absolute inset-0 -z-10 opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.16),transparent_40%),radial-gradient(circle_at_50%_90%,rgba(16,185,129,0.12),transparent_45%)]" />

      <section className="w-full max-w-sm">
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-neutral-200 shadow-xl p-7">
          
          <div className="flex justify-center mb-4">
            <Image src="/logofinal.png" alt="ResQ Collective logo" width={130} height={130} priority />
          </div>

          <h1 className="text-4xl font-extrabold text-neutral-900">Napravi nalog</h1>

          <p className="mt-2 text-sm text-neutral-600">
            Registruj se da bi mogao/la da udomiš ili pomogneš životinjama.
          </p>

          {errors.general && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.general}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Ime"
              name="ime"
              value={form.ime}
              onChange={handleChange}
              placeholder="Pera"
              error={errors.ime}
              required
            />

            <Input
              label="Prezime"
              name="prezime"
              value={form.prezime}
              onChange={handleChange}
              placeholder="Perić"
              error={errors.prezime}
              required
            />

            <Input
              label="Datum rođenja"
              name="datumRodjenja"
              type="date"
              value={form.datumRodjenja}
              onChange={handleChange}
              error={errors.datumRodjenja}
              required
            />

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
              placeholder="Kreiraj lozinku"
              error={errors.password}
              required
            />

            <Input
              label="Potvrdi lozinku"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Ponovi lozinku"
              error={errors.confirmPassword}
              required
            />

            <label className="flex items-start gap-2 pt-1 text-sm text-neutral-700">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={form.acceptTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
              />
              <span>
                Prihvatam uslove korišćenja i politiku privatnosti.
                {errors.acceptTerms && <span className="block mt-1 text-red-600">{errors.acceptTerms}</span>}
              </span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl py-3 font-semibold transition bg-[#C3E7FD] hover:bg-[#AEDCF9] text-neutral-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Kreiranje naloga..." : "Registruj se"}
            </button>

            <p className="pt-2 text-center text-sm text-neutral-600">
              Već imaš nalog?{" "}
              <button
                type="button"
                className="font-semibold text-sky-500 hover:text-sky-600"
                onClick={() => router.push("/login")}
              >
                Prijavi se
              </button>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
