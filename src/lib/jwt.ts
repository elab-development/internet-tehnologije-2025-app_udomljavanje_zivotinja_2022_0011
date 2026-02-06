import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET nije podešen u .env");
  return new TextEncoder().encode(secret);
};

export type JwtPayload = {
  userId: number;
  role: "ADMIN" | "VOLONTER" | "UDOMITELJ";
};

export async function napraviToken(payload: JwtPayload) {
  const secret = getSecret();

  // token važi 7 dana (možeš promeniti)
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function procitajTokenIzRequesta(req: Request): Promise<JwtPayload> {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new Error("Nedostaje Authorization Bearer token.");
  }

  const token = match[1];
  const secret = getSecret();

  const { payload } = await jwtVerify(token, secret);
  const userId = Number(payload.userId);
  const role = String(payload.role) as JwtPayload["role"];

  if (!userId || !role) {
    throw new Error("Neispravan token payload.");
  }

  return { userId, role };
}

export function dozvoljeneUloge(userRole: JwtPayload["role"], dozvoljene: JwtPayload["role"][]) {
  return dozvoljene.includes(userRole);
}
