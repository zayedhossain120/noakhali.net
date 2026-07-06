import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME, verifyAdminToken, AdminTokenPayload } from "@/lib/auth";

/** Reads and verifies the admin JWT cookie on the server. Returns null if absent/invalid. */
export async function getCurrentAdmin(): Promise<AdminTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
