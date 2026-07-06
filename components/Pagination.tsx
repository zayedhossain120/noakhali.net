"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1
  );

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        Prev
      </button>

      {pageNumbers.map((n, idx) => {
        const prev = pageNumbers[idx - 1];
        const showEllipsis = prev !== undefined && n - prev > 1;
        return (
          <span key={n} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-gray-400">…</span>}
            <button
              onClick={() => goTo(n)}
              aria-current={n === page ? "page" : undefined}
              className={`h-8 w-8 rounded-md text-sm font-medium ${
                n === page
                  ? "bg-brand-dark text-white"
                  : "border border-gray-300 bg-white text-brand-dark hover:bg-gray-50"
              }`}
            >
              {n}
            </button>
          </span>
        );
      })}

      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
