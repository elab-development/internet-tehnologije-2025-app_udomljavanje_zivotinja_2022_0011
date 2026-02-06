import { fail } from "@/lib/api";
import { procitajTokenIzRequesta, dozvoljeneUloge } from "@/lib/jwt";
import type { JwtPayload } from "@/lib/jwt";

export async function requireAuth(req: Request): Promise<JwtPayload | Response> {
  try {
    return await procitajTokenIzRequesta(req);
  } catch (e: any) {
    return fail(e?.message ?? "Neautorizovano.", 401, "UNAUTHORIZED");
  }
}

export function requireRole(
  auth: JwtPayload,
  roles: JwtPayload["role"][]
): Response | null {
  if (!dozvoljeneUloge(auth.role, roles)) {
    return fail("Nemate dozvolu za ovu akciju.", 403, "FORBIDDEN");
  }
  return null;
}
