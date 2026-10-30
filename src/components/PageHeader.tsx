import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";
import { useTema } from "@/lib/theme";
import logo from "@/assets/logo-almoco-sesi.png";

export function PageHeader({ eyebrow, title, children }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode }) {
  const { dark, toggle } = useTema();
  return (
    <header className="relative overflow-hidden bg-hero text-header-foreground pt-safe print:hidden">
      <div className="pointer-events-none absolute inset-0 grid-pattern" />
      <div className="pointer-events-none absolute -left-16 top-6 h-48 w-48 rounded-full bg-primary/40 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-accent/40 blur-3xl animate-blob [animation-delay:-4s]" />
      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-4 md:px-6 md:pt-8">
        <div className="flex items-center gap-3 md:hidden">
          <div className="mr-auto rounded-2xl bg-header-foreground px-3 py-2.5 shadow-lg">
            <img src={logo} alt="SESI Almoço" className="h-6 w-auto" />
          </div>
          <button onClick={toggle} aria-label="Alternar tema" className="grid h-12 w-12 place-items-center rounded-2xl border border-header-foreground/15 bg-header-foreground/10 backdrop-blur">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
        <div className="mt-6 animate-rise md:mt-0">
          {eyebrow && <div className="inline-flex items-center gap-1.5 rounded-full bg-header-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur">{eyebrow}</div>}
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        </div>
        {children}
      </div>
    </header>
  );
}
