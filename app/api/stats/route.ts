import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/lib/models/Complaint";

export async function GET() {
  await connectToDatabase();

  const [open, underReview, resolved] = await Promise.all([
    Complaint.countDocuments({ status: "OPEN" }),
    Complaint.countDocuments({ status: "UNDER_REVIEW" }),
    Complaint.countDocuments({ status: "RESOLVED" }),
  ]);

  return NextResponse.json({
    open,
    underReview,
    resolved,
    total: open + underReview + resolved,
  });
}
