import type { Metadata } from "next";
import { AccountView } from "@/components/account/AccountView";

export const metadata: Metadata = {
  title: "Minha conta",
  description:
    "Acompanhe pedidos, trocas de aparelhos, favoritos e tire dúvidas na central de ajuda da Tech Note.",
  robots: { index: false, follow: true },
};

interface AccountPageProps {
  searchParams: Promise<{ aba?: string | string[] }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const params = await searchParams;
  const tab = Array.isArray(params.aba) ? params.aba[0] : params.aba;
  return <AccountView initialTab={tab} />;
}
