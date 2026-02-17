"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

type Zahtev = {
  id: number;
  iskustvo: string;
  motivacija: string;
  status: "NA_CEKANJU" | "ODOBREN" | "ODBIJEN" | "OTKAZAN";
  vremePodnosenjaZahteva: string;
  korisnik: {
    id: number;
    ime: string;
    prezime?: string;
    email: string;
    role: string;
  };
};

const statusi: Zahtev["status"][] = ["NA_CEKANJU", "ODOBREN", "ODBIJEN", "OTKAZAN"];

function statusLabel(s: Zahtev["status"]) {
  switch (s) {
    case "NA_CEKANJU":
      return "Na čekanju";
    case "ODOBREN":
      return "Odobren";
    case "ODBIJEN":
      return "Odbijen";
    case "OTKAZAN":
      return "Otkazan";
  }
}

function statusBadgeClass(s: Zahtev["status"]) {
  switch (s) {
    case "ODOBREN":
      return "border-green-200 bg-green-50 text-green-700";
    case "ODBIJEN":
      return "border-red-200 bg-red-50 text-red-700";
    case "OTKAZAN":
      return "border-neutral-200 bg-neutral-50 text-neutral-700";
    default:
      return "border-amber-200 bg-amber-50 text-amber-800";
  }
}

export default function AdminVolonteriPage() {
  const [data, setData] = useState<Zahtev[]>([]);
  const [loading, setLoading] = useState(true);
  const [greska, setGreska] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function ucitaj() {
    setLoading(true);
    setGreska(null);
    try {
      // apiFetch vraca PODATKE (json.data), ne Response
      const lista = await apiFetch<Zahtev[]>("/zahtevi-volontera", { method: "GET" });
      setData(Array.isArray(lista) ? lista : []);
    } catch (e: any) {
      setGreska(e?.message ?? "Greška pri učitavanju.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  async function promeniStatus(id: number, status: Zahtev["status"]) {
    setGreska(null);
    setBusyId(id);

    try {
      // apiFetch ce baciti error ako nije ok, pa ne radimo res.ok / res.json
      await apiFetch(`/zahtevi-volontera/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      // lokalno osvezi UI
      setData((prev) => prev.map((z) => (z.id === id ? { ...z, status } : z)));
    } catch (e: any) {
      setGreska(e?.message ?? "Greška pri izmeni statusa.");
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    ucitaj();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-2xl bg-white border border-neutral-200 shadow-lg">
          <div className="p-8">
            <div className="flex items-center justify-between gap-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
                Admin – Zahtevi za volontera
              </h1>

              <button
                type="button"
                onClick={ucitaj}
                disabled={loading}
                className="shrink-0 rounded-xl bg-[#C3E7FD] px-6 py-2 text-sm font-semibold text-neutral-800 hover:bg-[#AEDCF9] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Učitavanje..." : "Osveži"}
              </button>
            </div>

            {greska && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {greska}
              </div>
            )}

            <div className="mt-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    <th className="px-8 py-5 text-left">Korisnik</th>
                    <th className="px-8 py-5 text-left">Email</th>
                    <th className="px-8 py-5 text-left">Iskustvo</th>
                    <th className="px-8 py-5 text-left">Motivacija</th>
                    <th className="px-8 py-5 text-left">Status</th>
                    <th className="px-8 py-5 text-right">Akcija</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-200">
                  {loading ? (
                    <tr>
                      <td className="px-8 py-10 text-neutral-600" colSpan={6}>
                        Učitavanje...
                      </td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td className="px-8 py-10 text-neutral-600" colSpan={6}>
                        Nema zahteva.
                      </td>
                    </tr>
                  ) : (
                    data.map((z) => (
                      <tr key={z.id} className="hover:bg-neutral-50/60">
                        <td className="px-8 py-7 align-middle">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-neutral-900 leading-snug">
                              {z.korisnik.ime} {z.korisnik.prezime ?? ""}
                            </span>
                            <span className="text-xs text-neutral-500">ID: {z.korisnik.id}</span>
                          </div>
                        </td>

                        <td className="px-8 py-7 align-middle text-neutral-700">
                          <span className="leading-relaxed">{z.korisnik.email}</span>
                        </td>

                        <td className="px-8 py-7 align-middle text-neutral-700">
                          <div className="max-w-[260px] whitespace-pre-wrap break-words leading-relaxed">
                            {z.iskustvo}
                          </div>
                        </td>

                        <td className="px-8 py-7 align-middle text-neutral-700">
                          <div className="max-w-[360px] whitespace-pre-wrap break-words leading-relaxed">
                            {z.motivacija}
                          </div>
                        </td>

                        <td className="px-8 py-7 align-middle">
                          <span
                            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold ${statusBadgeClass(
                              z.status
                            )}`}
                          >
                            {statusLabel(z.status)}
                          </span>
                        </td>

                        <td className="px-8 py-7 align-middle text-right">
                          <select
                            className="h-11 w-[180px] rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-800 focus:outline-none disabled:opacity-60"
                            value={z.status}
                            disabled={busyId === z.id}
                            onChange={(e) => promeniStatus(z.id, e.target.value as Zahtev["status"])}
                          >
                            {statusi.map((s) => (
                              <option key={s} value={s}>
                                {statusLabel(s)}
                              </option>
                            ))}
                          </select>

                          {busyId === z.id && (
                            <div className="mt-2 text-xs text-neutral-500">Menjam status...</div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
