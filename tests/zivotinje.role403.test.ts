import { describe, it, expect } from "vitest";
import { napraviToken } from "../src/lib/jwt";
import { POST } from "../src/app/api/zivotinje/route";

describe("POST /api/zivotinje - role", () => {
  it("UDOMITELJ ne sme da dodaje zivotinju -> 403", async () => {
    const token = await napraviToken({ userId: 999999, role: "UDOMITELJ" });

    const req = new Request("http://localhost/api/zivotinje", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
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
    expect(res.status).toBe(403);
  });
});