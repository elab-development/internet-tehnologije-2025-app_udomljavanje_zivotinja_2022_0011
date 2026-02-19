export const runtime = "nodejs";

import { openapiSpec } from "@/lib/openapi";

export async function GET() {
  return Response.json(openapiSpec, { status: 200 });
}
