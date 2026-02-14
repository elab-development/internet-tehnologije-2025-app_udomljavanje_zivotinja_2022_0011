"use client";

import { useEffect, useMemo, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import AnimalCard, { AnimalItem } from "@/components/animals/AnimalCard";
import { apiFetch } from "@/lib/apiFetch";
import Link from "next/link";

type ZivotinjaDetalji = {
  id: number;
  ime: string;
  vrsta: string;
  starost: number;
  pol: string;
  lokacija: string;
  status: string;
  opis: string;
  korisnik: { id: number; ime: string; prezime: string };
};

type FilterState = {
  q: string;
  vrsta: "" | "pas" | "mačka";
  pol: "" | "M" | "Ž";
  lokacija: string;
  minStarost: string;
  maxStarost: string;
  sort: "newest" | "oldest" | "name";
};

export default function UdomljavanjePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 👇 NOVO: role iz localStorage
  const [role, setRole] = useState<"ADMIN" | "VOLONTER" | "UDOMITELJ" | null>(null);

  useEffect(() => {
    // probaj prvo "user", pa "korisnik" (za svaki slučaj)
    const raw = localStorage.getItem("user") || localStorage.getItem("korisnik");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const r = parsed?.role as any;
      if (r === "ADMIN" || r === "VOLONTER" || r === "UDOMITELJ") setRole(r);
    } catch {
      // ignore
    }
  }, []);

  const [filter, setFilter] = useState<FilterState>({
    q: "",
    vrsta: "",
    pol: "",
    lokacija: "",
    minStarost: "",
    maxStarost: "",
    sort: "newest",
  });

  const [zivotinje, setZivotinje] = useState<AnimalItem[]>([]);
  const [selected, setSelected] = useState<ZivotinjaDetalji | null>(null);
  const [openDetalji, setOpenDetalji] = useState(false);
  const [openUdomi, setOpenUdomi] = useState(false);

  const [kontakt, setKontakt] = useState("");
  const [motivacija, setMotivacija] = useState("");

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("status", "AKTIVNA");

    if (filter.q) sp.set("q", filter.q);
    if (filter.vrsta) sp.set("vrsta", filter.vrsta);
    if (filter.pol) sp.set("pol", filter.pol);
    if (filter.lokacija) sp.set("lokacija", filter.lokacija);
    if (filter.minStarost) sp.set("minStarost", filter.minStarost);
    if (filter.maxStarost) sp.set("maxStarost", filter.maxStarost);

    return sp.toString();
  }, [
    filter.q,
    filter.vrsta,
    filter.pol,
    filter.lokacija,
    filter.minStarost,
    filter.maxStarost,
  ]);

  function sortLocal(list: AnimalItem[]) {
    const copy = [...list];
    if (filter.sort === "name") copy.sort((a, b) => a.ime.localeCompare(b.ime));
    if (filter.sort === "oldest") copy.reverse();
    return copy;
  }

  async function ucitajListu() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<AnimalItem[]>(`/zivotinje?${queryString}`, {
        method: "GET",
      });

      setZivotinje(sortLocal(Array.isArray(data) ? data : []));
    } catch (e: any) {
      setError(e?.message ?? "Greška pri učitavanju.");
    } finally {
      setLoading(false);
    }
  }

  async function ucitajDetalje(id: number) {
    setError(null);
    const data = await apiFetch<ZivotinjaDetalji>(`/zivotinje/${id}`, { method: "GET" });
    setSelected(data);
  }

  useEffect(() => {
    ucitajListu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString, filter.sort]);

  async function onOpenDetalji(id: number) {
    setSuccessMsg(null);
    setOpenDetalji(true);
    try {
      await ucitajDetalje(id);
    } catch (e: any) {
      setError(e?.message ?? "Greška pri učitavanju detalja.");
    }
  }

  async function onOpenUdomi(id: number) {
    setSuccessMsg(null);
    setKontakt("");
    setMotivacija("");
    setOpenUdomi(true);
    try {
      await ucitajDetalje(id);
    } catch (e: any) {
      setError(e?.message ?? "Greška pri učitavanju detalja.");
    }
  }

  async function posaljiZahtev() {
    setError(null);
    setSuccessMsg(null);

    if (!selected?.id) return;
    if (!kontakt.trim() || !motivacija.trim()) {
      setError("Popuni kontakt i motivaciju.");
      return;
    }

    try {
      await apiFetch(`/zahtevi-usvajanje`, {
        method: "POST",
        body: JSON.stringify({
          zivotinjaId: selected.id,
          kontakt,
          motivacija,
        }),
      });

      setOpenUdomi(false);
      setSuccessMsg(
        "Zahtev je poslat. (Kasnije ubacujemo slanje mejla preko eksternog API-ja.)"
      );
      await ucitajListu();
    } catch (e: any) {
      setError(e?.message ?? "Greška pri slanju zahteva.");
    }
  }

  function resetFilter() {
    setFilter({
      q: "",
      vrsta: "",
      pol: "",
      lokacija: "",
      minStarost: "",
      maxStarost: "",
      sort: "newest",
    });
  }

  const mozeDaPostavi = role === "VOLONTER" || role === "ADMIN";

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Udomljavanje</h1>
          <p className="text-sm text-gray-600">
            Pronađi životinju i pošalji zahtev za udomljavanje.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* 👇 NOVO dugme samo za VOLONTER/ADMIN */}
          {mozeDaPostavi && (
            <Link
              href="/volonter"
              className="rounded-xl bg-black px-4 py-2 text-sm text-white transition hover:opacity-90"
            >
              + Postavi životinju
            </Link>
          )}

          <div className="text-sm text-gray-600">
            {loading ? "Učitavanje..." : `${zivotinje.length} rezultata`}
          </div>

          <select
            className="rounded-xl border bg-white px-3 py-2 text-sm"
            value={filter.sort}
            onChange={(e) => setFilter((p) => ({ ...p, sort: e.target.value as any }))}
          >
            <option value="newest">Sort: Najnovije</option>
            <option value="oldest">Sort: Najstarije</option>
            <option value="name">Sort: Ime A–Z</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}

      {/* Layout: sidebar + grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Filteri</h2>
            <button className="text-xs text-gray-600 hover:underline" onClick={resetFilter}>
              Clear all
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Pretraga</label>
              <Input
                placeholder="Ime..."
                value={filter.q}
                onChange={(e) => setFilter((p) => ({ ...p, q: e.target.value }))}
                label={""}
                name={""}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Vrsta</label>
              <select
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={filter.vrsta}
                onChange={(e) => setFilter((p) => ({ ...p, vrsta: e.target.value as any }))}
              >
                <option value="">Sve</option>
                <option value="pas">Pas</option>
                <option value="mačka">Mačka</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Pol</label>
              <select
                className="w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={filter.pol}
                onChange={(e) => setFilter((p) => ({ ...p, pol: e.target.value as any }))}
              >
                <option value="">Sve</option>
                <option value="M">M</option>
                <option value="Ž">Ž</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Lokacija</label>
              <Input
                placeholder="npr. Beograd"
                value={filter.lokacija}
                onChange={(e) => setFilter((p) => ({ ...p, lokacija: e.target.value }))}
                label={""}
                name={""}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Min starost</label>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  type="number"
                  min={0}
                  value={filter.minStarost}
                  onChange={(e) => setFilter((p) => ({ ...p, minStarost: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Max starost</label>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  type="number"
                  min={0}
                  value={filter.maxStarost}
                  onChange={(e) => setFilter((p) => ({ ...p, maxStarost: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button onClick={ucitajListu}>Primeni</Button>
              <button
                className="rounded-xl border px-4 py-2 text-sm hover:opacity-80"
                onClick={resetFilter}
              >
                Reset
              </button>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <section>
          {loading ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
              Učitavanje...
            </div>
          ) : zivotinje.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
              Nema rezultata za izabrane filtere.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {zivotinje.map((z) => (
                <AnimalCard
                  key={z.id}
                  zivotinja={z}
                  onOpen={() => onOpenDetalji(z.id)}
                  onAdopt={() => onOpenUdomi(z.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal detalji */}
      <Modal open={openDetalji} onClose={() => setOpenDetalji(false)} title={selected ? selected.ime : "Detalji"}>
        {!selected ? (
          <div className="text-sm text-gray-600">Učitavanje...</div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><b>Vrsta:</b> {selected.vrsta}</div>
              <div><b>Pol:</b> {selected.pol}</div>
              <div><b>Starost:</b> {selected.starost}</div>
              <div><b>Status:</b> {selected.status}</div>
            </div>

            <div><b>Lokacija:</b> {selected.lokacija}</div>
            <div><b>Postavio:</b> {selected.korisnik.ime} {selected.korisnik.prezime}</div>

            <div className="pt-2">
              <b>Opis:</b>
              <div className="mt-1 whitespace-pre-wrap text-gray-700">{selected.opis}</div>
            </div>

            <div className="pt-3">
              <Button onClick={() => { setOpenDetalji(false); setOpenUdomi(true); }}>
                Udomi
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal forma */}
      <Modal open={openUdomi} onClose={() => setOpenUdomi(false)} title={selected ? `Udomi: ${selected.ime}` : "Udomi"}>
        <div className="space-y-3">
          <Input
            placeholder="Kontakt (telefon/email)"
            value={kontakt}
            onChange={(e) => setKontakt(e.target.value)}
            label={""}
            name={""}
          />
          <textarea
            className="w-full rounded-xl border p-3 text-sm"
            rows={5}
            placeholder="Motivacija (zašto želiš da udomiš?)"
            value={motivacija}
            onChange={(e) => setMotivacija(e.target.value)}
          />
          <Button onClick={posaljiZahtev}>Pošalji zahtev</Button>
        </div>
      </Modal>
    </main>
  );
}
