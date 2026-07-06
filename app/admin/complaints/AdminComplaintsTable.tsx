"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES, STATUS_VALUES } from "@/lib/validation";
import StatusBadge from "@/components/StatusBadge";
import Pagination from "@/components/Pagination";

interface AdminComplaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  area: string;
  reporterName?: string;
  reporterContact?: string;
  status: string;
  adminNote?: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending Approval",
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  REJECTED: "Rejected",
};

function TableInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [data, setData] = useState<AdminComplaint[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (searchParams.get("q")) params.set("q", searchParams.get("q") as string);

    const res = await fetch(`/api/admin/complaints?${params.toString()}`);
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.total || 0);
    setTotalPages(json.totalPages || 1);
    setLoading(false);
  }, [page, status, category, searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("q", q);
  }

  async function updateStatus(id: string, newStatus: string) {
    let adminNote: string | undefined;
    if (newStatus === "REJECTED") {
      const reason = window.prompt("Reason for rejecting this complaint:");
      if (!reason) return;
      adminNote = reason;
    }
    if (newStatus === "RESOLVED") {
      const note = window.prompt("Optional resolution note:") || undefined;
      adminNote = note;
    }

    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      if (res.ok) fetchData();
    } finally {
      setBusyId(null);
    }
  }

  async function deleteComplaint(id: string) {
    if (!window.confirm("Delete this complaint permanently? This cannot be undone.")) {
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/complaints/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-6">
      <form
        onSubmit={handleSearchSubmit}
        className="grid gap-4 sm:grid-cols-[1fr_auto_auto]"
      >
        <input
          type="text"
          placeholder="Search by title, area, description..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
        >
          <option value="">All statuses</option>
          {STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </form>

      <div className="mt-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500">No complaints match your filters.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">{total} complaint(s) found</p>
            <div className="space-y-3">
              {data.map((c) => (
                <div
                  key={c._id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-brand-dark">{c.title}</h3>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {c.category} · {c.area}
                        {c.reporterName ? ` · ${c.reporterName}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}
                      className="shrink-0 text-sm font-medium text-brand-dark underline"
                    >
                      {expandedId === c._id ? "Hide details" : "View details"}
                    </button>
                  </div>

                  {expandedId === c._id && (
                    <div className="mt-4 rounded-md bg-brand-cream p-4 text-sm text-gray-700">
                      <p className="whitespace-pre-wrap">{c.description}</p>
                      {c.reporterContact && (
                        <p className="mt-2 text-gray-500">Contact: {c.reporterContact}</p>
                      )}
                      {c.adminNote && (
                        <p className="mt-2 text-gray-500">
                          <strong>Admin note:</strong> {c.adminNote}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {c.status === "PENDING" && (
                      <>
                        <ActionButton
                          label="Approve"
                          busy={busyId === c._id}
                          onClick={() => updateStatus(c._id, "OPEN")}
                          variant="primary"
                        />
                        <ActionButton
                          label="Reject"
                          busy={busyId === c._id}
                          onClick={() => updateStatus(c._id, "REJECTED")}
                          variant="danger"
                        />
                      </>
                    )}
                    {(c.status === "OPEN" || c.status === "UNDER_REVIEW") && (
                      <>
                        {c.status === "OPEN" && (
                          <ActionButton
                            label="Mark under review"
                            busy={busyId === c._id}
                            onClick={() => updateStatus(c._id, "UNDER_REVIEW")}
                            variant="secondary"
                          />
                        )}
                        <ActionButton
                          label="Mark resolved"
                          busy={busyId === c._id}
                          onClick={() => updateStatus(c._id, "RESOLVED")}
                          variant="primary"
                        />
                      </>
                    )}
                    <ActionButton
                      label="Delete"
                      busy={busyId === c._id}
                      onClick={() => deleteComplaint(c._id)}
                      variant="ghost-danger"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  busy,
  variant,
}: {
  label: string;
  onClick: () => void;
  busy: boolean;
  variant: "primary" | "secondary" | "danger" | "ghost-danger";
}) {
  const styles: Record<string, string> = {
    primary: "bg-brand-mint text-brand-dark hover:bg-brand-mintDark",
    secondary: "border border-gray-300 text-brand-dark hover:bg-gray-50",
    danger: "border border-red-300 text-red-600 hover:bg-red-50",
    "ghost-danger": "text-red-500 hover:underline",
  };

  return (
    <button
      disabled={busy}
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-semibold disabled:opacity-50 ${styles[variant]}`}
    >
      {label}
    </button>
  );
}

export default function AdminComplaintsTable() {
  return (
    <Suspense fallback={<p className="mt-6 text-gray-500">Loading...</p>}>
      <TableInner />
    </Suspense>
  );
}
