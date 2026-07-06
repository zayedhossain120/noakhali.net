import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/lib/models/Complaint";
import AdminNav from "@/components/AdminNav";
import DashboardPendingList from "./DashboardPendingList";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  await connectToDatabase();

  const [pending, open, underReview, resolved, rejected, recentPending] =
    await Promise.all([
      Complaint.countDocuments({ status: "PENDING" }),
      Complaint.countDocuments({ status: "OPEN" }),
      Complaint.countDocuments({ status: "UNDER_REVIEW" }),
      Complaint.countDocuments({ status: "RESOLVED" }),
      Complaint.countDocuments({ status: "REJECTED" }),
      Complaint.find({ status: "PENDING" })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

  const total = pending + open + underReview + resolved + rejected;

  return {
    counts: { pending, open, underReview, resolved, rejected, total },
    recentPending: JSON.parse(JSON.stringify(recentPending)),
  };
}

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { counts, recentPending } = await getDashboardData();

  const cards = [
    { label: "Pending", value: counts.pending, highlight: true },
    { label: "Open", value: counts.open },
    { label: "Under Review", value: counts.underReview },
    { label: "Resolved", value: counts.resolved },
    { label: "Rejected", value: counts.rejected },
    { label: "Total", value: counts.total },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav adminName={admin.name} role={admin.role} />

      <h1 className="text-2xl font-bold text-brand-dark">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-xl border p-5 text-center shadow-sm ${
              c.highlight
                ? "border-purple-300 bg-purple-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <div
              className={`text-2xl font-bold ${
                c.highlight ? "text-purple-700" : "text-brand-dark"
              }`}
            >
              {c.value}
            </div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {c.label}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 border-b-2 border-brand-mint pb-2 text-lg font-semibold text-brand-dark">
        Needs review
      </h2>

      <DashboardPendingList initialItems={recentPending} />
    </section>
  );
}
