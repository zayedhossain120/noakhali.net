import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { adminLoginSchema } from "@/lib/validation";
import { signAdminToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { isRateLimited } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(`login:${ip}`)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  await connectToDatabase();

  const admin = await Admin.findOne({ email: parsed.data.email.toLowerCase() });

  // Same generic error whether the email or the password is wrong,
  // to avoid leaking which admin accounts exist.
  const genericError = NextResponse.json(
    { error: "Invalid email or password" },
    { status: 401 }
  );

  if (!admin) return genericError;

  const passwordMatches = await bcrypt.compare(parsed.data.password, admin.password);
  if (!passwordMatches) return genericError;

  const token = await signAdminToken({
    adminId: admin._id.toString(),
    email: admin.email,
    role: admin.role,
    name: admin.name,
  });

  const response = NextResponse.json({
    success: true,
    admin: { id: admin._id.toString(), name: admin.name, email: admin.email, role: admin.role },
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60, // 8 hours, matches token expiry
  });

  return response;
}
