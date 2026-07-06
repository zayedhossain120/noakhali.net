import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "Missing JWT_SECRET environment variable. Add it to your .env file (see .env.example)."
  );
}

const secretKey = new TextEncoder().encode(JWT_SECRET);
const ALGORITHM = "HS256";
const EXPIRY = "8h";

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  name: string;
}

/** Sign a JWT for an authenticated admin. */
export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(secretKey);
}

/** Verify a JWT and return its payload, or null if invalid/expired. */
export async function verifyAdminToken(
  token: string
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: [ALGORITHM],
    });
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = "noakhali_admin_token";
