import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/lib/models/Complaint";
import { STATUS_VALUES } from "@/lib/validation";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

const updateSchema = z.object({
  status: z.enum(STATUS_VALUES),
  adminNote: z.string().trim().max(2000).optional().or(z.literal("")),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Verify user is logged in
  const admin = await getCurrentAdmin();
  if (!admin) {
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

  if (parsed.data.status === "REJECTED" && !parsed.data.adminNote) {
    return NextResponse.json(
      { error: "A reason is required when rejecting a complaint" },
      { status: 400 },
    );
  }

  await connectToDatabase();

  const complaint = await Complaint.findByIdAndUpdate(
    id,
    {
      status: parsed.data.status,
      ...(parsed.data.adminNote ? { adminNote: parsed.data.adminNote } : {}),
      reviewedBy: admin?.adminId,
      reviewedAt: new Date(),
    },
    { new: true },
  ).lean();

  if (!complaint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: complaint });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Verify user is logged in
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in first." },
      { status: 401 },
    );
  }

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await connectToDatabase();
  const deleted = await Complaint.findByIdAndDelete(id).lean();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
