export const runtime = "nodejs";

import { ok, fail } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = String(searchParams.get("q") ?? "").trim();
    if (!q) return fail("Nedostaje q.", 400, "VALIDATION");

    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "ResQ-collective/1.0 (seminarski)",
        "Accept-Language": "sr",
      },
    });

    if (!res.ok) return fail("Geocoding servis je nedostupan.", 502, "UPSTREAM");

    const data = (await res.json()) as any[];
    if (!data?.length) return ok(null, 200);

    return ok(
      { lat: Number(data[0].lat), lon: Number(data[0].lon), displayName: String(data[0].display_name ?? "") },
      200
    );
  } catch (e: any) {
    console.error("GEOCODE ERROR:", e);
    return fail("Greška na serveru.", 500, "SERVER_ERROR");
  }
}
