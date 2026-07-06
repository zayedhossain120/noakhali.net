const STYLES: Record<string, string> = {
  PENDING: "bg-purple-100 text-purple-700",
  OPEN: "bg-amber-100 text-amber-700",
  UNDER_REVIEW: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};

const LABELS: Record<string, string> = {
  PENDING: "Pending Approval",
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        STYLES[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {LABELS[status] ?? status}
    </span>
  );
}
