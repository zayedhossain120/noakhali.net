import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/lib/models/Complaint";
import { complaintInputSchema, PUBLIC_STATUS_VALUES } from "@/lib/validation";
import { parsePagination, buildPaginationMeta } from "@/lib/pagination";
import { isRateLimited } from "@/lib/rateLimit";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";

// GET /api/complaints — list publicly-visible complaints (approved, non-rejected)
export async function GET(request: NextRequest) {
  // Check if user is authenticated admin
  const currentAdmin = await getCurrentAdmin();
  const isAdmin = !!currentAdmin;

  await connectToDatabase();

  const searchParams = request.nextUrl.searchParams;
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.trim();

  const filter: Record<string, unknown> = {
    status: { $in: PUBLIC_STATUS_VALUES },
  };

  if (status && (PUBLIC_STATUS_VALUES as readonly string[]).includes(status)) {
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
    ];
  }

  const query = Complaint.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Only exclude reporterContact if user is not an admin
  if (!isAdmin) {
    query.select("-reporterContact");
  }

  const [data, total] = await Promise.all([
    query.lean(),
    Complaint.countDocuments(filter),
  ]);

  return NextResponse.json({
    data,
    ...buildPaginationMeta(total, page, limit),
  });
}

// POST /api/complaints — submit a new complaint (goes into PENDING status)
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(`submit:${ip}`)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again in a minute." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const parsed = complaintInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Honeypot triggered — silently pretend success to not tip off bots.
  if (parsed.data.website) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  await connectToDatabase();

  const complaint = await Complaint.create({
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    area: parsed.data.area,
    reporterName: parsed.data.reporterName || undefined,
    reporterContact: parsed.data.reporterContact || undefined,
    status: "PENDING",
  });

  return NextResponse.json(
    { success: true, id: complaint._id.toString() },
    { status: 201 },
  );
}
