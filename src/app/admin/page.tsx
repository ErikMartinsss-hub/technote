import type { Metadata } from "next";
import { AdminView } from "@/components/admin/AdminView";

export const metadata: Metadata = {
  title: "Área do admin | Tech Note",
  description: "Painel de demonstração para cadastrar produtos com fotos direto pelo site.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminView />;
}
