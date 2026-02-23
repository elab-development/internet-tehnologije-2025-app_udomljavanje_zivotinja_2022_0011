import { describe, it, expect } from "vitest";
import { POST } from "../src/app/api/zivotinje/route";

describe("POST /api/zivotinje - auth", () => {
  it("bez Authorization headera vraca 401", async () => {
    const req = new Request("http://localhost/api/zivotinje", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ime: "Test",
        vrsta: "PAS",
        pol: "M",
        lokacija: "Beograd",
        opis: "Opis",
        starost: 2,
        slikaUrl: "https://example.com/slika.jpg",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});