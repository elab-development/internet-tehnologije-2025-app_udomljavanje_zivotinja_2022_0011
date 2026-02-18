"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { apiFetch } from "@/lib/apiFetch";

type Role = "ADMIN" | "VOLONTER" | "UDOMITELJ";

type Me = {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  datumRodjenja: string | null;
  role: Role;
};

type ZivotinjaLite = {
  id: number;
  ime: string;
  vrsta: string;
  starost: number;
  pol: string;
  lokacija: string;
  status: string;
  slikaUrl: string | null;
};

type ZivotinjaFull = ZivotinjaLite & {
  opis?: string | null;
  postavljeno?: string | null;
  korisnik?: { id: number; ime: string; prezime: string } | null;
};

type ZahtevMoj = {
  id: number;
  kontakt: string;
  motivacija: string;
  status: string;
  vremePodnosenjaZahteva: string;
  komentarVolontera: string | null;
  zivotinja: ZivotinjaLite;
};

type ZahtevZaMojuZivotinju = {
  id: number;
  kontakt: string;
  motivacija: string;
  status: string;
  vremePodnosenjaZahteva: string;
  komentarVolontera: string | null;
  korisnik: { id: number; ime: string; prezime: string; email: string };
  zivotinja: { id: number; ime: string; slikaUrl: string | null; status: string };
};

type Dashboard = {
  mojeZivotinje: Array<{
    id: number;
    ime: string;
    vrsta: string;
    starost: number;
    pol: string;
    lokacija: string;
    status: string;
    slikaUrl: string | null;
    postavljeno: string;
  }>;
  zahteviZaMojeZivotinje: ZahtevZaMojuZivotinju[];
};

function fmtDatum(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("sr-RS");
}

function formatStatusZahteva(status: string) {
  const s = String(status || "").toUpperCase();
  const map: Record<string, string> = {
    NA_CEKANJU: "Na čekanju",
    ODOBREN: "Odobren",
    ODBIJEN: "Odbijen",
    OTKAZAN: "Otkazan",
  };
  return map[s] ?? status;
}

function formatStatusZivotinje(status: string) {
  const s = String(status || "").toUpperCase();
  const map: Record<string, string> = {
    AKTIVNA: "Aktivna",
    UDOMLJENA: "Udomljena",
    PAUZIRANA: "Pauzirana",
  };
  return map[s] ?? status;
}

function statusBadgeClass(status: string) {
  const s = String(status || "").toUpperCase();
  const base = "inline-flex rounded-full border px-2 py-0.5 text-xs";
  if (s === "ODOBREN") return `${base} border-green-300`;
  if (s === "ODBIJEN") return `${base} border-red-300`;
  if (s === "NA_CEKANJU") return `${base} border-yellow-300`;
  if (s === "OTKAZAN") return `${base} border-gray-300`;
  if (s === "AKTIVNA") return `${base} border-blue-300`;
  if (s === "UDOMLJENA") return `${base} border-purple-300`;
  if (s === "PAUZIRANA") return `${base} border-gray-300`;
  return base;
}

export default function ProfilPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);


  const [me, setMe] = useState<Me | null>(null);
  const [mojiZahtevi, setMojiZahtevi] = useState<ZahtevMoj[]>([]);
  const [dash, setDash] = useState<Dashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [openZivotinjaModal, setOpenZivotinjaModal] = useState(false);
  const [zivotinjaDetalji, setZivotinjaDetalji] = useState<ZivotinjaFull | null>(null);
  const [zivotinjaLoading, setZivotinjaLoading] = useState(false);


  const [openZahtevModal, setOpenZahtevModal] = useState(false);
  const [zahtevDetalji, setZahtevDetalji] = useState<ZahtevZaMojuZivotinju | null>(null);


  const [openIzmenaModal, setOpenIzmenaModal] = useState(false);
  const [editZivotinja, setEditZivotinja] = useState<ZivotinjaFull | null>(null);
  const [editForm, setEditForm] = useState({
    ime: "",
    vrsta: "",
    pol: "",
    lokacija: "",
    opis: "",
    starost: "",
    status: "",
    slikaUrl: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  async function ucitajSve() {
    try {
      setLoading(true);
      setErr(null);

      const meData = await apiFetch<Me>("/me", { cache: "no-store" });
      setMe(meData);

      const moji = await apiFetch<ZahtevMoj[]>("/me/zahtevi-usvajanje", { cache: "no-store" });
      setMojiZahtevi(moji);

      if (meData.role === "VOLONTER" || meData.role === "ADMIN") {
        const d = await apiFetch<Dashboard>("/me/dashboard", { cache: "no-store" });
        setDash(d);
      } else {
        setDash(null);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Greška.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  if (!token) return;
    ucitajSve();
  }, [token]);


  async function otvoriZivotinju(zivotinjaId: number) {
    try {
      setOpenZivotinjaModal(true);
      setZivotinjaLoading(true);
      setZivotinjaDetalji(null);

      
      const data = await apiFetch<ZivotinjaFull>(`/zivotinje/${zivotinjaId}`, { cache: "no-store" });
      setZivotinjaDetalji(data);
    } catch (e: any) {
      setErr(e?.message ?? "Greška pri učitavanju detalja životinje.");
      setOpenZivotinjaModal(false);
    } finally {
      setZivotinjaLoading(false);
    }
  }

  function otvoriZahtev(r: ZahtevZaMojuZivotinju) {
    setZahtevDetalji(r);
    setOpenZahtevModal(true);
  }

  async function promeniStatus(
  zahtevId: number,
  status: "ODOBREN" | "ODBIJEN",
  komentarVolontera?: string
) {
  try {
    await apiFetch(`/zahtevi-usvajanje/${zahtevId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        komentarVolontera: komentarVolontera?.trim() || undefined,
      }),
    });

    await ucitajSve();
  } catch (e: any) {
    alert(e?.message ?? "Greška pri promeni statusa.");
  }
}


  async function otvoriIzmenuZivotinje(zivotinjaId: number) {
    try {
      setOpenIzmenaModal(true);
      setSavingEdit(false);
      setEditZivotinja(null);

      const full = await apiFetch<ZivotinjaFull>(`/zivotinje/${zivotinjaId}`, { cache: "no-store" });
      setEditZivotinja(full);
      setEditForm({
        ime: full.ime ?? "",
        vrsta: full.vrsta ?? "",
        pol: full.pol ?? "",
        lokacija: full.lokacija ?? "",
        opis: (full as any)?.opis ?? "",
        starost: String(full.starost ?? ""),
        status: full.status ?? "",
        slikaUrl: full.slikaUrl ?? "",
      });
    } catch (e: any) {
      alert(e?.message ?? "Greška pri učitavanju životinje za izmenu.");
      setOpenIzmenaModal(false);
    }
  }

  async function sacuvajIzmenu() {
    if (!editZivotinja) return;

    try {
      setSavingEdit(true);

      const payload: any = {
        ime: editForm.ime.trim(),
        vrsta: editForm.vrsta.trim(),
        pol: editForm.pol.trim(),
        lokacija: editForm.lokacija.trim(),
        opis: editForm.opis.trim(),
        status: editForm.status.trim(),
        slikaUrl: editForm.slikaUrl.trim() || null,
      };

      const starostNum = Number(editForm.starost);
      if (!Number.isFinite(starostNum)) {
        alert("Starost mora biti broj.");
        return;
      }
      payload.starost = starostNum;

      
      await apiFetch(`/zivotinje/${editZivotinja.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setOpenIzmenaModal(false);
      await ucitajSve();
    } catch (e: any) {
      alert(e?.message ?? "Greška pri čuvanju izmene.");
    } finally {
      setSavingEdit(false);
    }
  }

  if (!token) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="mt-3">Moraš da se uloguješ da bi videla profil.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold">Profil</h1>

      {loading && <p className="mt-3">Učitavanje…</p>}
      {err && (
        <div className="mt-4 rounded-xl border p-4">
          <p className="font-semibold">Greška</p>
          <p className="text-sm opacity-80">{err}</p>
        </div>
      )}

      {!loading && me && (
        <>
          {/* Moji podaci */}
          <section className="mt-6 rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">Moji podaci</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="text-xs opacity-70">Ime i prezime</p>
                <p className="font-medium">
                  {me.ime} {me.prezime}
                </p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs opacity-70">Email</p>
                <p className="font-medium">{me.email}</p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs opacity-70">Datum rođenja</p>
                <p className="font-medium">{fmtDatum(me.datumRodjenja)}</p>
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs opacity-70">Uloga</p>
                <p className="font-medium">{me.role}</p>
              </div>
            </div>
          </section>

          {/* Moji zahtevi */}
          <section className="mt-6 rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">Moji zahtevi za udomljavanje</h2>

            {mojiZahtevi.length === 0 ? (
              <p className="mt-3 text-sm opacity-80">Nemaš poslatih zahteva.</p>
            ) : (
              <div className="mt-4 grid gap-4">
                {mojiZahtevi.map((z) => (
                  <button
                    key={z.id}
                    type="button"
                    className="rounded-2xl border p-4 text-left transition hover:shadow-sm"
                    onClick={() => otvoriZivotinju(z.zivotinja.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-xl border">
                          <Image
                            src={z.zivotinja.slikaUrl || "/user.png"}
                            alt={z.zivotinja.ime}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{z.zivotinja.ime}</p>
                          <p className="text-xs opacity-70">
                            {z.zivotinja.vrsta} • {z.zivotinja.starost} god • {z.zivotinja.lokacija}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={statusBadgeClass(z.status)}>{formatStatusZahteva(z.status)}</span>
                        <p className="mt-1 text-xs opacity-70">{fmtDatum(z.vremePodnosenjaZahteva)}</p>
                      </div>
                    </div>

                    {z.komentarVolontera && (
                      <p className="mt-3 text-sm">
                        <span className="font-semibold">Komentar: </span>
                        {z.komentarVolontera}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* VOLONTER/ADMIN sekcije */}
          {(me.role === "VOLONTER" || me.role === "ADMIN") && dash && (
            <>
              <section className="mt-6 rounded-2xl border p-6">
                <h2 className="text-lg font-semibold">Životinje koje sam postavio/la</h2>

                {dash.mojeZivotinje.length === 0 ? (
                  <p className="mt-3 text-sm opacity-80">Nema postavljenih životinja.</p>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {dash.mojeZivotinje.map((a) => (
                      <div key={a.id} className="rounded-2xl border p-4">
                        
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => otvoriZivotinju(a.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-14 overflow-hidden rounded-xl border">
                              <Image
                                src={a.slikaUrl || "/user.png"}
                                alt={a.ime}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold">{a.ime}</p>
                              <p className="text-xs opacity-70">
                                {a.vrsta} • {a.starost} • {a.lokacija}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <span className={statusBadgeClass(a.status)}>{formatStatusZivotinje(a.status)}</span>
                            <span className="text-xs opacity-70">{fmtDatum(a.postavljeno)}</span>
                          </div>
                        </button>

                        {/* akcije */}
                        <div className="mt-3 flex gap-2">
                          <Button
                            className="w-fit px-4 py-2"
                            onClick={(e: any) => {
                              e?.stopPropagation?.();
                              otvoriIzmenuZivotinje(a.id);
                            }}
                          >
                            Izmeni oglas
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-6 rounded-2xl border p-6">
                <h2 className="text-lg font-semibold">Zahtevi za moje životinje</h2>

                {dash.zahteviZaMojeZivotinje.length === 0 ? (
                  <p className="mt-3 text-sm opacity-80">Nema zahteva.</p>
                ) : (
                  <div className="mt-4 grid gap-4">
                    {dash.zahteviZaMojeZivotinje.map((r) => (
                      <div key={r.id} className="rounded-2xl border p-4">
                        
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => otvoriZahtev(r)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-12 overflow-hidden rounded-xl border">
                                <Image
                                  src={r.zivotinja.slikaUrl || "/placeholder.png"}
                                  alt={r.zivotinja.ime}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-semibold">{r.zivotinja.ime}</p>
                                <p className="text-xs opacity-70">
                                  Podnosilac: {r.korisnik.ime} {r.korisnik.prezime} • {r.korisnik.email}
                                </p>
                                <p className="mt-1 text-xs opacity-70">Kontakt: {r.kontakt}</p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={statusBadgeClass(r.status)}>{formatStatusZahteva(r.status)}</span>
                              <p className="mt-1 text-xs opacity-70">{fmtDatum(r.vremePodnosenjaZahteva)}</p>
                            </div>
                          </div>

                          <p className="mt-3 text-sm">
                            <span className="font-semibold">Motivacija: </span>
                            {r.motivacija}
                          </p>
                        </button>

                        {(r.status === "NA_CEKANJU") && (
                          <div className="mt-4 flex gap-2">
                            <Button className="w-fit px-4 py-2" onClick={() => promeniStatus(r.id, "ODOBREN")}>
                              Odobri
                            </Button>
                            <Button className="w-fit px-4 py-2" onClick={() => promeniStatus(r.id, "ODBIJEN")}>
                              Odbij
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          <Modal
            open={openZivotinjaModal}
            onClose={() => setOpenZivotinjaModal(false)}
            title={zivotinjaDetalji ? zivotinjaDetalji.ime : "Detalji"}
          >
            {zivotinjaLoading && <p>Učitavanje…</p>}

            {!zivotinjaLoading && zivotinjaDetalji && (
              <div className="space-y-3">
                <div className="relative w-full overflow-hidden rounded-2xl border bg-gray-50">
                  <div className="aspect-[4/3] w-full">
                    {zivotinjaDetalji.slikaUrl ? (
                      <img
                        src={zivotinjaDetalji.slikaUrl}
                        alt={zivotinjaDetalji.ime}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm opacity-70">
                        Nema slike
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">Vrsta:</span>
                    <span>{zivotinjaDetalji.vrsta}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">Pol:</span>
                    <span>{zivotinjaDetalji.pol}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">Starost:</span>
                    <span>{zivotinjaDetalji.starost}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">Lokacija:</span>
                    <span>{zivotinjaDetalji.lokacija}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">Status:</span>
                    <span className={statusBadgeClass(zivotinjaDetalji.status)}>
                      {formatStatusZivotinje(zivotinjaDetalji.status)}
                    </span>
                  </div>

                  {(zivotinjaDetalji as any)?.korisnik && (
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">Postavio/la:</span>
                      <span>
                        {(zivotinjaDetalji as any).korisnik?.ime} {(zivotinjaDetalji as any).korisnik?.prezime}
                      </span>
                    </div>
                  )}

                  {(zivotinjaDetalji as any)?.opis && (
                    <div className="pt-2">
                      <p className="font-semibold">Opis:</p>
                      <p className="mt-1 whitespace-pre-wrap opacity-90">{(zivotinjaDetalji as any).opis}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal>

          {/* MODAL: detalji zahteva */}
          <Modal
            open={openZahtevModal}
            onClose={() => setOpenZahtevModal(false)}
            title={zahtevDetalji ? `Zahtev za: ${zahtevDetalji.zivotinja.ime}` : "Zahtev"}
          >
            {!zahtevDetalji ? (
              <p>—</p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className={statusBadgeClass(zahtevDetalji.status)}>
                    {formatStatusZahteva(zahtevDetalji.status)}
                  </span>
                </div>

                <div className="rounded-xl border p-3">
                  <p className="font-semibold">Podnosilac</p>
                  <p className="mt-1">
                    {zahtevDetalji.korisnik.ime} {zahtevDetalji.korisnik.prezime}
                  </p>
                  <p className="opacity-80">{zahtevDetalji.korisnik.email}</p>
                  <p className="mt-1 opacity-80">Kontakt: {zahtevDetalji.kontakt}</p>
                </div>

                <div className="rounded-xl border p-3">
                  <p className="font-semibold">Motivacija</p>
                  <p className="mt-1 whitespace-pre-wrap opacity-90">{zahtevDetalji.motivacija}</p>
                </div>

                {zahtevDetalji.komentarVolontera && (
                  <div className="rounded-xl border p-3">
                    <p className="font-semibold">Komentar volontera</p>
                    <p className="mt-1 whitespace-pre-wrap opacity-90">{zahtevDetalji.komentarVolontera}</p>
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* MODAL: izmena životinje */}
          <Modal
            open={openIzmenaModal}
            onClose={() => setOpenIzmenaModal(false)}
            title={editZivotinja ? `Izmeni oglas: ${editZivotinja.ime}` : "Izmena oglasa"}
          >
            {!editZivotinja ? (
              <p>Učitavanje…</p>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border p-3">
                    <p className="text-xs opacity-70">Ime</p>
                    <input
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      value={editForm.ime}
                      onChange={(e) => setEditForm((p) => ({ ...p, ime: e.target.value }))}
                    />
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs opacity-70">Vrsta</p>
                    <input
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      value={editForm.vrsta}
                      onChange={(e) => setEditForm((p) => ({ ...p, vrsta: e.target.value }))}
                    />
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs opacity-70">Pol</p>
                    <input
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      value={editForm.pol}
                      onChange={(e) => setEditForm((p) => ({ ...p, pol: e.target.value }))}
                    />
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs opacity-70">Lokacija</p>
                    <input
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      value={editForm.lokacija}
                      onChange={(e) => setEditForm((p) => ({ ...p, lokacija: e.target.value }))}
                    />
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs opacity-70">Starost</p>
                    <input
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      value={editForm.starost}
                      onChange={(e) => setEditForm((p) => ({ ...p, starost: e.target.value }))}
                    />
                  </div>

                  <div className="rounded-xl border p-3">
                    <p className="text-xs opacity-70">Status</p>
                    <select
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      value={editForm.status}
                      onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    >
                      <option value="AKTIVNA">Aktivna</option>
                      <option value="PAUZIRANA">Pauzirana</option>
                      <option value="UDOMLJENA">Udomljena</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border p-3">
                  <p className="text-xs opacity-70">Opis</p>
                  <textarea
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    rows={4}
                    value={editForm.opis}
                    onChange={(e) => setEditForm((p) => ({ ...p, opis: e.target.value }))}
                  />
                </div>

                <div className="rounded-xl border p-3">
                  <p className="text-xs opacity-70">Slika URL (opciono)</p>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                    value={editForm.slikaUrl}
                    onChange={(e) => setEditForm((p) => ({ ...p, slikaUrl: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button className="w-fit px-4 py-2" onClick={sacuvajIzmenu} disabled={savingEdit}>
                    {savingEdit ? "Čuvanje..." : "Sačuvaj"}
                  </Button>
                  <Button className="w-fit px-4 py-2" onClick={() => setOpenIzmenaModal(false)} disabled={savingEdit}>
                    Otkaži
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </>
      )}
    </main>
  );
}
