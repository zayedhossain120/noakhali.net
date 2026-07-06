import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/lib/models/Complaint";
import { PUBLIC_STATUS_VALUES } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await connectToDatabase();

  const complaint = await Complaint.findOne({
    _id: id,
    status: { $in: PUBLIC_STATUS_VALUES },
  })
    .select("-reporterContact")
    .lean();

  if (!complaint) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: complaint });
}
