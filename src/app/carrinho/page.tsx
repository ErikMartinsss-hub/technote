import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Meu carrinho",
  description:
    "Revise os itens do seu carrinho, calcule o frete e finalize sua compra com Pix ou cartão em até 21x.",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return <CartView />;
}
