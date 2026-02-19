"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

type Status = { tip: "success" | "error"; poruka: string } | null;

export default function KontaktPage() {
  const [ime, setIme] = useState("");
  const [email, setEmail] = useState("");
  const [poruka, setPoruka] = useState("");

  const [salje, setSalje] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setSalje(true);

    try {
      const res = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ime,
          email,
          poruka,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          json?.error?.message || "Došlo je do greške. Pokušaj ponovo.";
        setStatus({ tip: "error", poruka: msg });
        return;
      }

      setStatus({
        tip: "success",
        poruka: json?.data?.message || "Poruka je poslata!",
      });

      // reset forme
      setIme("");
      setEmail("");
      setPoruka("");
    } catch (err) {
      setStatus({
        tip: "error",
        poruka: "Greška u mreži. Proveri internet i pokušaj ponovo.",
      });
    } finally {
      setSalje(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Kontakt</h1>
      <p className="mt-2 text-sm opacity-80">
        Imaš pitanje, predlog ili želiš da se uključiš kao volonter? Slobodno
        nam se javi.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Ime i prezime</label>
          <input
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            type="text"
            placeholder="Unesi ime i prezime"
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Email adresa</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="npr. ime@email.com"
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Poruka</label>
          <textarea
            value={poruka}
            onChange={(e) => setPoruka(e.target.value)}
            rows={5}
            placeholder="Napiši svoju poruku ovde..."
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <Button type="submit" className="mt-4 w-fit px-6" disabled={salje}>
          {salje ? "Šaljem..." : "Pošalji poruku"}
        </Button>

        {status && (
          <div
            className={`text-sm ${
              status.tip === "success" ? "text-green-700" : "text-red-600"
            }`}
          >
            {status.poruka}
          </div>
        )}
      </form>

      {/* KONTAKT INFO */}
      <section className="mt-12 rounded-2xl border p-6">
        <h2 className="font-semibold">Kontakt informacije</h2>
        <ul className="mt-3 text-sm opacity-80">
          <li>Beograd, Srbija</li>
          <li>resqcollectivebelgrade0@gmail.com</li>
        </ul>
      </section>
    </main>
  );
}
