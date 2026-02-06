export const runtime = "nodejs";

import { ok } from "@/lib/api";

export async function POST() {
  return ok({ message: "Odjavljen." }, 200);
}
