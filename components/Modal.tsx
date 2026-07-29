"use client";

import { ReactNode } from "react";

/**
 * Simple reusable modal component using Tailwind CSS.
 * It renders its children in a centered dialog with a dark overlay.
 * Props:
 *  - open: boolean – whether the modal is visible
 *  - onClose: () => void – callback to close the modal
 *  - children: ReactNode – content of the modal
 */
export default function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      {/* Modal dialog */}
      <div
        className="relative max-w-lg max-h-[80vh] overflow-y-auto rounded-md border border-gray-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close icon at top‑right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
          aria-label="Close modal"
        >
          &times;
        </button>
        {children}
        {/* Optional footer close button for accessibility */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 rounded bg-gray-200 px-3 py-1.5 text-sm hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
