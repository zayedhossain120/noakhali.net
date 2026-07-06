import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/getCurrentAdmin";
import AdminNav from "@/components/AdminNav";
import AdminsManager from "./AdminsManager";

export default async function AdminAdminsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (admin.role !== "SUPER_ADMIN") redirect("/admin/dashboard");

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <AdminNav adminName={admin.name} role={admin.role} />
      <h1 className="text-2xl font-bold text-brand-dark">Manage admins</h1>
      <AdminsManager currentAdminId={admin.adminId} />
    </section>
  );
}
