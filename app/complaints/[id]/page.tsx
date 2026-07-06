import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/lib/models/Complaint";
import StatusBadge from "@/components/StatusBadge";
import { PUBLIC_STATUS_VALUES } from "@/lib/validation";

export const dynamic = "force-dynamic";

async function getComplaint(id: string) {
  if (!mongoose.isValidObjectId(id)) return null;
  await connectToDatabase();
  const complaint = await Complaint.findOne({
    _id: id,
    status: { $in: PUBLIC_STATUS_VALUES },
  })
    .select("-reporterContact")
    .lean();
  return complaint ? JSON.parse(JSON.stringify(complaint)) : null;
}

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const complaint = await getComplaint(id);

  if (!complaint) notFound();

  const date = new Date(complaint.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-brand-dark">{complaint.title}</h1>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
          <span>
            Category: <strong className="text-brand-dark">{complaint.category}</strong>
          </span>
          <span>
            Area: <strong className="text-brand-dark">{complaint.area}</strong>
          </span>
          <span>Submitted: {date}</span>
        </div>

        <p className="mt-6 whitespace-pre-wrap leading-relaxed text-gray-700">
          {complaint.description}
        </p>

        {complaint.status === "RESOLVED" && complaint.adminNote && (
          <div className="mt-6 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
            <strong>Resolution note:</strong> {complaint.adminNote}
          </div>
        )}
      </div>
    </section>
  );
}
