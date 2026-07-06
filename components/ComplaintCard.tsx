import Link from "next/link";
import StatusBadge from "./StatusBadge";

export interface ComplaintCardData {
  _id: string;
  title: string;
  description: string;
  category: string;
  area: string;
  status: string;
  createdAt: string;
}

export default function ComplaintCard({ complaint }: { complaint: ComplaintCardData }) {
  const date = new Date(complaint.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/complaints/${complaint._id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="font-semibold text-brand-dark">{complaint.title}</h3>
        <StatusBadge status={complaint.status} />
      </div>
      <p className="mb-3 line-clamp-2 text-sm text-gray-600">{complaint.description}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span className="rounded-full bg-brand-cream px-2.5 py-1 font-medium text-brand-dark">
          {complaint.category}
        </span>
        <span>{complaint.area}</span>
        <span>{date}</span>
      </div>
    </Link>
  );
}
