"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/validation";

const initialForm = {
  reporterName: "",
  reporterContact: "",
  title: "",
  category: "",
  area: "",
  description: "",
  website: "", // honeypot
};

export default function SubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setServerError("");

    if (form.title.trim().length < 5) {
      setErrors((e) => ({ ...e, title: "Title must be at least 5 characters" }));
      return;
    }
    if (!form.category) {
      setErrors((e) => ({ ...e, category: "Please select a category" }));
      return;
    }
    if (form.area.trim().length < 2) {
      setErrors((e) => ({ ...e, area: "Please enter an area / ward" }));
      return;
    }
    if (form.description.trim().length < 20) {
      setErrors((e) => ({
        ...e,
        description: "Please describe the issue in at least 20 characters",
      }));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
      setForm(initialForm);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-10">
          <h1 className="text-2xl font-bold text-brand-dark">Complaint submitted</h1>
          <p className="mt-3 text-gray-600">
            Your complaint has been submitted and is pending review. Once an admin
            approves it, it will appear in the public complaints list.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setSubmitted(false)}
              className="rounded-md bg-brand-mint px-5 py-2.5 font-semibold text-brand-dark hover:bg-brand-mintDark"
            >
              Submit another
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-md border border-gray-300 px-5 py-2.5 font-semibold text-brand-dark hover:bg-gray-50"
            >
              Back to home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="border-b-2 border-brand-mint pb-2 text-2xl font-bold text-brand-dark">
        Submit a complaint
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
      >
        {/* Honeypot field — hidden from real users */}
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={(e) => updateField("website", e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Your name
            </label>
            <input
              type="text"
              placeholder="Full name (optional)"
              value={form.reporterName}
              onChange={(e) => updateField("reporterName", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Phone / email
            </label>
            <input
              type="text"
              placeholder="For follow-up (optional)"
              value={form.reporterContact}
              onChange={(e) => updateField("reporterContact", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Complaint title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Brief summary of the issue"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Area / ward <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Sadar, Companiganj..."
              value={form.area}
              onChange={(e) => updateField("area", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
            />
            {errors.area && <p className="mt-1 text-sm text-red-600">{errors.area}</p>}
          </div>
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Full description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            placeholder="Describe the issue in as much detail as possible..."
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full resize-y rounded-md border border-gray-300 px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {serverError && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
            {serverError}
          </p>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-brand-mint px-6 py-2.5 font-semibold text-brand-dark transition-colors hover:bg-brand-mintDark disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit complaint"}
          </button>
        </div>
      </form>
    </section>
  );
}
