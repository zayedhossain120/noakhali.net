import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import Complaint from "@/lib/models/Complaint";
import ComplaintCard from "@/components/ComplaintCard";

export const dynamic = "force-dynamic";

async function getHomeData() {
  await connectToDatabase();

  const [open, underReview, resolved, recent] = await Promise.all([
    Complaint.countDocuments({ status: "OPEN" }),
    Complaint.countDocuments({ status: "UNDER_REVIEW" }),
    Complaint.countDocuments({ status: "RESOLVED" }),
    Complaint.find({ status: { $in: ["OPEN", "UNDER_REVIEW", "RESOLVED"] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-reporterContact")
      .lean(),
  ]);

  return {
    stats: { open, underReview, resolved, total: open + underReview + resolved },
    recent: JSON.parse(JSON.stringify(recent)),
  };
}

export default async function HomePage() {
  const { stats, recent } = await getHomeData();

  const statCards = [
    { label: "Open", value: stats.open, color: "text-status-open" },
    { label: "Under Review", value: stats.underReview, color: "text-status-review" },
    { label: "Resolved", value: stats.resolved, color: "text-status-resolved" },
    { label: "Total", value: stats.total, color: "text-brand-dark" },
  ];

  return (
    <>
      <section className="bg-brand-dark px-6 py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold text-white sm:text-5xl">
          Noakhali <span className="text-brand-mint">Community</span> Voice
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/80">
          Report neighborhood issues directly to authorities. Track every complaint
          until it&rsquo;s resolved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/submit"
            className="rounded-md bg-brand-mint px-6 py-3 font-semibold text-brand-dark transition-colors hover:bg-brand-mintDark"
          >
            Submit a complaint
          </Link>
          <Link
            href="/complaints"
            className="rounded-md border border-white/60 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10"
          >
            View all complaints
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white py-8 text-center shadow-sm"
            >
              <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {card.label}
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 border-b-2 border-brand-mint pb-2 text-lg font-semibold text-brand-dark">
          Recent complaints
        </h2>

        {recent.length === 0 ? (
          <p className="mt-6 text-gray-500">No complaints have been approved yet.</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {recent.map((c: any) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
