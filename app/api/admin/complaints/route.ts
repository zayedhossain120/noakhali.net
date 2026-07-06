import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/lib/models/Complaint";
import { STATUS_VALUES } from "@/lib/validation";
import { parsePagination, buildPaginationMeta } from "@/lib/pagination";

// GET /api/admin/complaints — list ALL complaints (any status), for the admin table
export async function GET(request: NextRequest) {
  await connectToDatabase();

  const searchParams = request.nextUrl.searchParams;
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();

  const filter: Record<string, unknown> = {};

  if (status && (STATUS_VALUES as readonly string[]).includes(status)) {
    filter.status = status;
  }

  if (category) {
    filter.category = category;
  }

  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { area: { $regex: q, $options: "i" } },
      { reporterName: { $regex: q, $options: "i" } },
    ];
  }

  const [data, total] = await Promise.all([
    Complaint.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Complaint.countDocuments(filter),
  ]);

  return NextResponse.json({
    data,
    ...buildPaginationMeta(total, page, limit),
  });
}
