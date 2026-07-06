"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";

interface PendingComplaint {
  _id: string;
  title: string;
  category: string;
  area: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function DashboardPendingList({
  initialItems,
}: {
  initialItems: PendingComplaint[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(id: string, status: "OPEN" | "REJECTED") {
    let adminNote: string | undefined;
    if (status === "REJECTED") {
      const reason = window.prompt("Reason for rejecting this complaint:");
      if (!reason) return;
      adminNote = reason;
    }

    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i._id !== id));
        router.refresh();
      }
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return <p className="mt-6 text-gray-500">No complaints are waiting for review.</p>;
  }

  return (
    <div className="mt-6 space-y-3">
      {items.map((item) => (
        <div
          key={item._id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-brand-dark">{item.title}</h3>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-gray-500">
              {item.category} · {item.area}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              disabled={busyId === item._id}
              onClick={() => updateStatus(item._id, "OPEN")}
              className="rounded-md bg-brand-mint px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-mintDark disabled:opacity-50"
            >
              Approve
            </button>
            <button
              disabled={busyId === item._id}
              onClick={() => updateStatus(item._id, "REJECTED")}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
