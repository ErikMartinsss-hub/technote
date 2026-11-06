import Link from "next/link";

const brands = [
  { name: "Apple", label: "apple", href: "/catalogo?marca=Apple" },
  { name: "Samsung", label: "SAMSUNG", href: "/catalogo?marca=Samsung" },
  { name: "Motorola", label: "motorola", href: "/catalogo?marca=Motorola" },
  { name: "Dell", label: "DELL", href: "/catalogo?marca=Dell" },
  { name: "JBL", label: "JBL", href: "/catalogo?marca=JBL" },
];

export function Brands() {
  return (
    <section className="pb-12">
      <div className="container-page">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400">
          As marcas que você ama, com preço de seminovo
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              href={brand.href}
              className="group flex h-16 items-center justify-center rounded-xl border border-ink-200/70 bg-white text-ink-400 transition hover:border-brand-200 hover:text-ink-800 hover:shadow-soft"
            >
              <span className="font-display text-lg font-bold tracking-tight">
                {brand.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
