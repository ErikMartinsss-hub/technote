"use client";

import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { toast } from "@/store/toast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("E-mail inválido", "Digite um e-mail válido para receber as ofertas.");
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setEmail("");
      toast.success(
        "Inscrição confirmada!",
        "Você vai receber nossas melhores ofertas e cupons exclusivos.",
      );
    }, 600);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Seu melhor e-mail"
            aria-label="Seu e-mail"
            className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-lime-400/70 focus:bg-white/15"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-lime-500 px-5 text-sm font-bold text-ink-950 transition hover:bg-lime-400 disabled:opacity-60"
        >
          {loading ? "Enviando..." : "Quero ofertas"}
          <ArrowRight className="size-4" />
        </button>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-white/40">
        Ao se inscrever, você concorda em receber e-mails da Tech Note. Cancele quando
        quiser.
      </p>
    </form>
  );
}
