import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import AdminNav from "@/components/AdminNav";
import AdminComplaintsTable from "./AdminComplaintsTable";

export default async function AdminComplaintsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav adminName={admin.name} role={admin.role} />
      <h1 className="text-2xl font-bold text-brand-dark">Manage complaints</h1>
      <AdminComplaintsTable />
    </section>
  );
}
