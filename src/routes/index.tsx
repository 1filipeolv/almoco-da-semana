import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Moon, Sun, Search, X, Check, UtensilsCrossed, CalendarCheck, Eraser, ArrowLeft } from "lucide-react";
import { buscarPessoas, diasDaSemana, segundaDaSemana, type Pessoa } from "@/lib/almoco-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Almoço SESI — Confirme seu almoço da semana" },
      { name: "description", content: "Confirme rapidamente em quais dias da semana você vai almoçar no SESI." },
      { property: "og:title", content: "Almoço SESI" },
      { property: "og:description", content: "Confirmação de almoço para colaboradores e alunos de extracurriculares." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const NOMES_DIA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

function Index() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [marcas, setMarcas] = useState<boolean[]>([false, false, false, false, false]);
  const [sucesso, setSucesso] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const seg = useMemo(() => segundaDaSemana(), []);
  const dias = useMemo(() => diasDaSemana(seg), [seg]);
  const semanaKey = seg.toISOString().slice(0, 10);
  const sugestoes = useMemo(() => buscarPessoas(query), [query]);
  const total = marcas.filter(Boolean).length;

  useEffect(() => {
    setDark(localStorage.getItem("tema") === "dark");
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const toggleTema = () => {
    const n = !dark;
    setDark(n);
    localStorage.setItem("tema", n ? "dark" : "light");
  };

  const escolher = (p: Pessoa) => {
    setPessoa(p);
    setQuery("");
    inputRef.current?.blur();
    const salvo = localStorage.getItem(`almoco:${semanaKey}:${p.nif}`);
    setMarcas(salvo ? JSON.parse(salvo) : [false, false, false, false, false]);
  };

  const confirmar = () => {
    if (!pessoa) return;
    localStorage.setItem(`almoco:${semanaKey}:${pessoa.nif}`, JSON.stringify(marcas));
    setSucesso(true);
  };

  const recomecar = () => {
    setSucesso(false);
    setPessoa(null);
  };

  return (
    <div className="min-h-dvh-screen flex flex-col bg-background">
      <header className="bg-header text-header-foreground pt-safe">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-2 border-dashed border-header-foreground/40 text-[10px] font-semibold uppercase opacity-80">
            Logo
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold leading-tight">
              Almoço <span className="text-accent">SESI</span>
            </h1>
            <p className="truncate text-sm opacity-80">
              Semana de {fmt(dias[0])} a {fmt(dias[4])}
            </p>
          </div>
          <button
            onClick={toggleTema}
            aria-label="Alternar tema"
            className="grid h-12 w-12 place-items-center rounded-xl bg-header-foreground/10 transition hover:bg-header-foreground/20"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {sucesso && pessoa ? (
        <Sucesso pessoa={pessoa} total={total} marcas={marcas} dias={dias} onVoltar={recomecar} />
      ) : (
        <main className={cn("mx-auto w-full max-w-3xl flex-1 px-4 py-5", pessoa && "pb-36")}>
          {/* Busca */}
          <div className="relative">
            <label htmlFor="busca" className="mb-2 block text-sm font-semibold text-muted-foreground">
              Quem vai almoçar?
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="busca"
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Digite seu nome ou NIF"
                autoComplete="off"
                enterKeyHint="search"
                className="h-14 w-full rounded-2xl border border-input bg-card pl-12 pr-12 text-base text-card-foreground shadow-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/20"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                  className="absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-muted-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {focused && query.trim() && (
              <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border bg-card shadow-xl">
                {sugestoes.length === 0 ? (
                  <li className="px-4 py-4 text-sm text-muted-foreground">Ninguém encontrado.</li>
                ) : (
                  sugestoes.map((p) => (
                    <li key={p.nif}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => escolher(p)}
                        className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-muted"
                      >
                        <Avatar nome={p.nome} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-card-foreground">{p.nome}</p>
                          <p className="text-xs text-muted-foreground">NIF {p.nif}</p>
                        </div>
                        <GrupoTag grupo={p.grupo} />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {!pessoa ? (
            <div className="mt-10 flex flex-col items-center text-center text-muted-foreground">
              <div className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <UtensilsCrossed className="h-9 w-9" />
              </div>
              <p className="max-w-xs text-sm">Busque seu nome ou NIF para marcar os dias em que vai almoçar nesta semana.</p>
            </div>
          ) : (
            <>
              <div className="mt-5 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
                <Avatar nome={pessoa.nome} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{pessoa.nome}</p>
                  <p className="text-xs text-muted-foreground">NIF {pessoa.nif}</p>
                </div>
                <GrupoTag grupo={pessoa.grupo} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMarcas([true, true, true, true, true])}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-secondary px-3 text-sm font-semibold text-secondary-foreground transition active:scale-[.98]"
                >
                  <CalendarCheck className="h-4 w-4" /> Marcar semana toda
                </button>
                <button
                  onClick={() => setMarcas([false, false, false, false, false])}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border bg-card px-3 text-sm font-semibold transition active:scale-[.98]"
                >
                  <Eraser className="h-4 w-4" /> Limpar
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {dias.map((d, i) => {
                  const on = marcas[i];
                  return (
                    <button
                      key={i}
                      role="switch"
                      aria-checked={on}
                      onClick={() => setMarcas((m) => m.map((v, j) => (j === i ? !v : v)))}
                      className={cn(
                        "flex min-h-20 items-center gap-4 rounded-2xl border-2 p-4 text-left transition active:scale-[.98] lg:flex-col lg:items-start",
                        on ? "border-primary bg-primary text-primary-foreground shadow-lg" : "border-border bg-card",
                      )}
                    >
                      <div className="flex-1">
                        <p className="font-bold">{NOMES_DIA[i]}</p>
                        <p className={cn("text-sm", on ? "opacity-80" : "text-muted-foreground")}>{fmt(d)}</p>
                      </div>
                      <span
                        className={cn(
                          "flex h-12 min-w-36 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold lg:w-full lg:min-w-0",
                          on ? "bg-primary-foreground/15" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {on ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        {on ? "Vou almoçar" : "Não vou"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </main>
      )}

      {pessoa && !sucesso && !focused && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur pb-safe">
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pt-3">
            <div className="shrink-0">
              <p className="text-xl font-extrabold leading-none">{total} de 5</p>
              <p className="text-xs text-muted-foreground">dias marcados</p>
            </div>
            <button
              onClick={confirmar}
              className="h-14 flex-1 rounded-2xl bg-accent px-4 text-base font-bold text-accent-foreground shadow-lg transition hover:opacity-95 active:scale-[.98]"
            >
              Confirmar marcação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ nome }: { nome: string }) {
  const ini = nome.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("");
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
      {ini}
    </div>
  );
}

function GrupoTag({ grupo }: { grupo: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold",
        grupo === "Robótica" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary",
      )}
    >
      {grupo}
    </span>
  );
}

function Sucesso({
  pessoa, total, marcas, dias, onVoltar,
}: { pessoa: Pessoa; total: number; marcas: boolean[]; dias: Date[]; onVoltar: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-10 text-center pb-safe">
      <div className="animate-pop grid h-28 w-28 place-items-center rounded-full bg-success text-success-foreground shadow-xl">
        <svg viewBox="0 0 24 24" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <path className="animate-check" d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
      <h2 className="mt-6 text-2xl font-extrabold animate-in fade-in slide-in-from-bottom-2 duration-500">Marcação confirmada!</h2>
      <p className="mt-2 text-muted-foreground animate-in fade-in duration-700">
        {pessoa.nome.split(" ")[0]}, você vai almoçar em <strong className="text-foreground">{total} de 5 dias</strong>.
      </p>
      <div className="mt-6 flex gap-2 animate-in fade-in slide-in-from-bottom-3 duration-700">
        {dias.map((d, i) => (
          <div
            key={i}
            className={cn(
              "flex w-12 flex-col items-center rounded-xl py-2 text-xs font-semibold",
              marcas[i] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {NOMES_DIA[i].slice(0, 3)}
            <span className="font-normal opacity-80">{d.getDate()}</span>
          </div>
        ))}
      </div>
      <button
        onClick={onVoltar}
        className="mt-10 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary font-bold text-primary-foreground"
      >
        <ArrowLeft className="h-5 w-5" /> Nova marcação
      </button>
    </main>
  );
}
