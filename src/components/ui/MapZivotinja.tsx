"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

type Zivotinja = {
  id: number;
  ime: string;
  vrsta: string;
  lokacija: string;
  status: "AKTIVNA" | "UDOMLJENA" | "PAUZIRANA";
};

type MarkerItem = Zivotinja & { lat: number; lon: number };

export default function MapZivotinja() {
  const [markeri, setMarkeri] = useState<MarkerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fix za Leaflet ikonice u Next okruzenju (da marker ne bude "prazan")
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // uzmi SVE životinje (i udomljene)
        const res = await fetch("/api/zivotinje");
        const json = await res.json();
        const lista: Zivotinja[] = json?.data ?? [];

        const result: MarkerItem[] = [];

        for (const z of lista) {
          // geocode lokacije (tekst u koordinate)
          const r = await fetch(`/api/geocode?q=${encodeURIComponent(z.lokacija)}`);
          const j = await r.json();
          const geo = j?.data as { lat: number; lon: number } | null;

          if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lon)) {
            result.push({ ...z, lat: geo.lat, lon: geo.lon });
          }
        }

        setMarkeri(result);
      } catch (e: any) {
        console.error("MAPA ERROR:", e);
        setError("Greška pri učitavanju mape.");
        setMarkeri([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const center = useMemo<[number, number]>(() => {
    if (markeri.length > 0) return [markeri[0].lat, markeri[0].lon];
    return [44.8176, 20.4633]; // Beograd
  }, [markeri]);

  const stats = useMemo(() => {
    const s = { AKTIVNA: 0, UDOMLJENA: 0, PAUZIRANA: 0 };
    for (const m of markeri) s[m.status]++;
    return s;
  }, [markeri]);

  return (
    <section className="rounded-2xl border bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Mapa uticaja</h2>
          <p className="mt-1 text-sm opacity-80">
            Na prikazanoj mapi možete videti naša dosadašnja uspešna udomljenja, ali i sve životinje koje i dalje čekaju svoj dom. Istražite mapu i podržite naš cilj, da svaka životinja dobije dom kakav zaslužuje!
          </p>
        </div>

        <div className="text-sm opacity-80">
          {loading ? (
            "Učitavanje..."
          ) : (
            <div className="flex flex-wrap gap-3">
              <span>Aktivne: <b>{stats.AKTIVNA}</b></span>
              <span>Udomljene: <b>{stats.UDOMLJENA}</b></span>
              <span>Pauzirane: <b>{stats.PAUZIRANA}</b></span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 h-[520px] overflow-hidden rounded-2xl border">
        <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
          {/* Eksterni API 1: OpenStreetMap tiles */}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markeri.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lon]}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{m.ime}</div>
                  <div>Vrsta: {m.vrsta}</div>
                  <div>Lokacija: {m.lokacija}</div>
                  <div>Status: <b>{m.status}</b></div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="mt-3 text-xs opacity-70">
        * Mapa koristi OpenStreetMap tile servis, a koordinate lokacije dobijamo preko Nominatim geocoding API-ja.
      </p>
    </section>
  );
}
