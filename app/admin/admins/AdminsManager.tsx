"use client";

import { useEffect, useState, FormEvent } from "react";

interface AdminRow {
  _id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN";
  createdAt: string;
}

const initialForm = { name: "", email: "", password: "", role: "ADMIN" as "ADMIN" | "SUPER_ADMIN" };

export default function AdminsManager({ currentAdminId }: { currentAdminId: string }) {
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function fetchAdmins() {
    setLoading(true);
    const res = await fetch("/api/admin/admins");
    const json = await res.json();
    setAdmins(json.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (form.name.trim().length < 2) {
      setFormError("Name is required");
      return;
    }
    if (form.password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Could not create admin");
        return;
      }

      setForm(initialForm);
      fetchAdmins();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeAdmin(id: string) {
    if (!window.confirm("Remove this admin account?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        window.alert(data.error || "Could not remove admin");
        return;
      }
      fetchAdmins();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Existing admins
        </h2>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-3">
            {admins.map((a) => (
              <div
                key={a._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-semibold text-brand-dark">{a.name}</p>
                  <p className="text-sm text-gray-500">{a.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      a.role === "SUPER_ADMIN"
                        ? "bg-brand-mint text-brand-dark"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {a.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
                  </span>
                  {a._id !== currentAdminId && (
                    <button
                      disabled={busyId === a._id}
                      onClick={() => removeAdmin(a._id)}
                      className="text-sm font-medium text-red-500 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Add new admin
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Temporary password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
            <select
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({ ...f, role: e.target.value as "ADMIN" | "SUPER_ADMIN" }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
            >
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
          </div>

          {formError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-brand-mint px-4 py-2.5 font-semibold text-brand-dark hover:bg-brand-mintDark disabled:opacity-60"
          >
            {submitting ? "Adding..." : "Add admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
