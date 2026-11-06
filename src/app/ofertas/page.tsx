import { redirect } from "next/navigation";

export default function OffersPage() {
  redirect("/catalogo?ofertas=1");
}
