import { describe, it, expect, afterAll } from "vitest";
import { POST } from "../src/app/api/zivotinje/route";
import { napraviTestKorisnika, ocistiZivotinjeOdTestKorisnika } from "./_helpers";

let korisnikId: number | null = null;

describe("POST /api/zivotinje - create", () => {
  afterAll(async () => {
    if (korisnikId != null) {
      await ocistiZivotinjeOdTestKorisnika(korisnikId);
    }
  });

  it("VOLONTER moze da doda zivotinju -> 201", async () => {
    const { user, token } = await napraviTestKorisnika("VOLONTER");
    korisnikId = user.id;

    const req = new Request("http://localhost/api/zivotinje", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ime: `TestZivotinja_${Date.now()}`,
        vrsta: "PAS",
        pol: "M",
        lokacija: "Beograd",
        opis: "Test opis",
        starost: 3,
        slikaUrl: "https://example.com/slika.jpg",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body).toHaveProperty("data");
    expect(body.data).toHaveProperty("id");
    expect(body.data).toHaveProperty("status");
  });
});