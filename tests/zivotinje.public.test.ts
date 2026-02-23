import { describe, it, expect } from "vitest";


import { GET } from "../src/app/api/zivotinje/route";

describe("GET /api/zivotinje (public)", () => {
  it("vraca 200 i json", async () => {
    const req = new Request("http://localhost/api/zivotinje", {
      method: "GET",
    });

    const res = await GET(req);

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("data");
  });
});