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

  // Accept any raw text (or JSON) payload
  const rawBody = await request.text().catch(() => null);
  if (!rawBody) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  // If the payload is JSON, try to parse it; otherwise treat it as plain text
  let parsedData: any;
  try {
    parsedData = JSON.parse(rawBody);
  } catch {
    parsedData = { description: rawBody };
  }

  // Simple honeypot check: if a "website" field exists, pretend success
  if (parsedData.website) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  await connectToDatabase();

  const complaint = await Complaint.create({
    title: parsedData.title || "User Submission",
    description: parsedData.description || parsedData.body || rawBody,
    // Preserve optional fields if present
    category: parsedData.category,
    area: parsedData.area,
    reporterName: parsedData.reporterName || undefined,
    reporterContact: parsedData.reporterContact || undefined,
    status: "PENDING",
  });

  return NextResponse.json(
    { success: true, id: complaint._id.toString() },
    { status: 201 },
  );
}
