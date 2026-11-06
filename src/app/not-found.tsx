import Link from "next/link";
import { ArrowRight, Compass, Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[62vh] flex-col items-center justify-center py-16 text-center">
      <span className="grid size-16 place-items-center rounded-3xl bg-brand-50 text-brand-600">
        <SearchX className="size-7" />
      </span>
      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-600">
        Erro 404
      </p>
      <h1 className="mt-2 max-w-lg font-display text-3xl font-extrabold tracking-[-0.035em] text-ink-950 sm:text-4xl">
        Essa página saiu de linha.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">
        O link pode ter mudado ou o produto não está mais disponível. Que tal
        explorar o catálogo e encontrar um achado seminovo?
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-5 text-sm font-bold text-ink-800 transition hover:border-brand-300 hover:text-brand-700"
        >
          <Home className="size-4" />
          Voltar ao início
        </Link>
        <Link
          href="/catalogo"
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-bold text-white transition hover:bg-brand-700"
        >
          <Compass className="size-4" />
          Explorar catálogo
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
