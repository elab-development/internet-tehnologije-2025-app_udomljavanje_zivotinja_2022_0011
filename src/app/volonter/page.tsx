"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { apiFetch } from "@/lib/apiFetch";

export default function VolonterZahtevPage() {
  const [iskustvo, setIskustvo] = useState("");
  const [motivacija, setMotivacija] = useState("");
  const [greska, setGreska] = useState<string | null>(null);
  const [uspeh, setUspeh] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function podnesi(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setGreska(null);
    setUspeh(null);

    const i = iskustvo.trim();
    const m = motivacija.trim();

    if (!i || !m) {
      setGreska("Iskustvo i motivacija su obavezni.");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/zahtevi-volontera", {
        method: "POST",
        body: JSON.stringify({ iskustvo: i, motivacija: m }),
      });

      setUspeh("Zahtev je uspešno poslat!");
      setIskustvo("");
      setMotivacija("");
    } catch (e: any) {
      setGreska(e?.message ?? "Greška pri slanju zahteva.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">Zahtev za volontera</h1>
      <p className="mt-2 text-sm opacity-80">
        Unesi iskustvo i motivaciju. Zahtev će biti vezan za tvoj nalog.
      </p>

      {uspeh && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {uspeh}
        </div>
      )}

      {greska && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {greska}
        </div>
      )}

      <form onSubmit={podnesi} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Iskustvo</label>
          <textarea
            className="w-full rounded-lg border p-3 text-sm"
            rows={4}
            value={iskustvo}
            onChange={(e) => setIskustvo(e.target.value)}
            placeholder="Npr. rad sa psima, volontiranje, šetnje, nega..."
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Motivacija</label>
          <textarea
            className="w-full rounded-lg border p-3 text-sm"
            rows={5}
            value={motivacija}
            onChange={(e) => setMotivacija(e.target.value)}
            placeholder="Zašto želiš da postaneš volonter?"
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Slanje..." : "Podnesi zahtev"}
        </Button>
      </form>
    </main>
  );
}
