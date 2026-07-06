import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { adminCreateSchema } from "@/lib/validation";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

// GET /api/admin/admins — list all admin accounts (logged-in users only)
export async function GET() {
  // Verify user is logged in
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in first." },
      { status: 401 },
    );
  }

  await connectToDatabase();
  const admins = await Admin.find()
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ data: admins });
}

// POST /api/admin/admins — create a new admin account (authorized users only)
export async function POST(request: NextRequest) {
  // Verify user is logged in
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in first." },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = adminCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectToDatabase();

  const existing = await Admin.findOne({
    email: parsed.data.email.toLowerCase(),
  });
  if (existing) {
    return NextResponse.json(
      { error: "An admin with this email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const admin = await Admin.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    password: passwordHash,
    role: parsed.data.role,
    createdBy: currentAdmin?.adminId || null,
  });

  return NextResponse.json(
    {
      data: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    },
    { status: 201 },
  );
}
