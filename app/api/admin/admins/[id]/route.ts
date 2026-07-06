import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Admin from "@/lib/models/Admin";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

const updateSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN"]).optional(),
  name: z.string().trim().min(2).max(120).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Verify user is logged in
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in first." },
      { status: 401 },
    );
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const updated = await Admin.findByIdAndUpdate(id, parsed.data, { new: true })
    .select("-password")
    .lean();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Verify user is logged in
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in first." },
      { status: 401 },
    );
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (currentAdmin?.adminId === id) {
    return NextResponse.json(
      { error: "You cannot delete your own account while logged in" },
      { status: 400 },
    );
  }

  await connectToDatabase();

  // Prevent deleting the last remaining super admin.
  const target = await Admin.findById(id).lean<{ role: string } | null>();
  if (target?.role === "SUPER_ADMIN") {
    const superAdminCount = await Admin.countDocuments({ role: "SUPER_ADMIN" });
    if (superAdminCount <= 1) {
      return NextResponse.json(
        { error: "At least one Super Admin must remain" },
        { status: 400 },
      );
    }
  }

  const deleted = await Admin.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
