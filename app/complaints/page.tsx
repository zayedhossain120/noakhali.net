"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES, PUBLIC_STATUS_VALUES } from "@/lib/validation";
import ComplaintCard, { ComplaintCardData } from "@/components/ComplaintCard";
import Pagination from "@/components/Pagination";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
};

function ComplaintsListInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [data, setData] = useState<ComplaintCardData[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const status = searchParams.get("status") || "";
  const category = searchParams.get("category") || "";

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (searchParams.get("q")) params.set("q", searchParams.get("q") as string);

    const res = await fetch(`/api/complaints?${params.toString()}`);
    const json = await res.json();
    setData(json.data || []);
    setTotal(json.total || 0);
    setTotalPages(json.totalPages || 1);
    setLoading(false);
  }, [page, status, category, searchParams]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

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

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="border-b-2 border-brand-mint pb-2 text-2xl font-bold text-brand-dark">
        All complaints
      </h1>

      <form
        onSubmit={handleSearchSubmit}
        className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto_auto]"
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
          {PUBLIC_STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </form>

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-500">No complaints match your filters.</p>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-500">{total} complaint(s) found</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.map((c) => (
                <ComplaintCard key={c._id} complaint={c} />
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </section>
  );
}

export default function ComplaintsPage() {
  return (
    <Suspense fallback={<div className="px-6 py-12 text-center text-gray-500">Loading...</div>}>
      <ComplaintsListInner />
    </Suspense>
  );
}
