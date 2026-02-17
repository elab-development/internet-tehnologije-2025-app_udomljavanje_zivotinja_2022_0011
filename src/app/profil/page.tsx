"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

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

function statusBadge(status: string) {
  const s = status.toUpperCase();
  const base = "inline-flex rounded-full border px-2 py-0.5 text-xs";
  if (s === "ODOBREN") return `${base} border-green-300`;
  if (s === "ODBIJEN") return `${base} border-red-300`;
  if (s === "NA_CEKANJU") return `${base} border-yellow-300`;
  if (s === "OTKAZAN") return `${base} border-gray-300`;
  return base;
}

export default function ProfilPage() {
  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const [me, setMe] = useState<Me | null>(null);
  const [mojiZahtevi, setMojiZahtevi] = useState<ZahtevMoj[]>([]);
  const [dash, setDash] = useState<Dashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function apiGet<T>(url: string): Promise<T> {
    if (!token) throw new Error("Nisi ulogovana (nema tokena).");
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error?.message ?? "Greška.");
    return json?.data as T;
  }

  async function ucitajSve() {
    try {
      setLoading(true);
      setErr(null);

      const meData = await apiGet<Me>("/api/me");
      setMe(meData);

      const moji = await apiGet<ZahtevMoj[]>("/api/me/zahtevi-usvajanje");
      setMojiZahtevi(moji);

      if (meData.role === "VOLONTER" || meData.role === "ADMIN") {
        const d = await apiGet<Dashboard>("/api/me/dashboard");
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
    ucitajSve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function promeniStatus(zahtevId: number, status: "ODOBREN" | "ODBIJEN") {
    try {
      if (!token) return;

      const res = await fetch(`/api/zahtevi-usvajanje/${zahtevId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error?.message ?? "Greška pri promeni statusa.");

      await ucitajSve();
    } catch (e: any) {
      alert(e?.message ?? "Greška.");
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
                  <div key={z.id} className="rounded-2xl border p-4">
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
                        <span className={statusBadge(z.status)}>{z.status}</span>
                        <p className="mt-1 text-xs opacity-70">{fmtDatum(z.vremePodnosenjaZahteva)}</p>
                      </div>
                    </div>

                    {z.komentarVolontera && (
                      <p className="mt-3 text-sm">
                        <span className="font-semibold">Komentar: </span>
                        {z.komentarVolontera}
                      </p>
                    )}
                  </div>
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
                        <div className="flex items-center gap-3">
                          <div className="relative h-14 w-14 overflow-hidden rounded-xl border">
                            <Image
                              src={a.slikaUrl || "/placeholder.png"}
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
                          <span className={statusBadge(a.status)}>{a.status}</span>
                          <span className="text-xs opacity-70">{fmtDatum(a.postavljeno)}</span>
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
                            <span className={statusBadge(r.status)}>{r.status}</span>
                            <p className="mt-1 text-xs opacity-70">{fmtDatum(r.vremePodnosenjaZahteva)}</p>
                          </div>
                        </div>

                        <p className="mt-3 text-sm">
                          <span className="font-semibold">Motivacija: </span>
                          {r.motivacija}
                        </p>

                        {(r.status === "NA_CEKANJU") && (
                          <div className="mt-4 flex gap-2">
                            <Button
                              className="w-fit px-4 py-2"
                              onClick={() => promeniStatus(r.id, "ODOBREN")}
                            >
                              Odobri
                            </Button>
                            <Button
                              className="w-fit px-4 py-2"
                              onClick={() => promeniStatus(r.id, "ODBIJEN")}
                            >
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
        </>
      )}
    </main>
  );
}
