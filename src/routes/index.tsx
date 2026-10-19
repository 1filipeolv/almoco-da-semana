import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Moon, Sun, Search, X, Check, CalendarCheck, Eraser, ArrowLeft, Sparkles, UtensilsCrossed, ChevronRight } from "lucide-react";
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
const mesmoDia = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const VAZIO = [false, false, false, false, false];

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function Index() {
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [marcas, setMarcas] = useState<boolean[]>(VAZIO);
  const [sucesso, setSucesso] = useState(false);
  const [hoje, setHoje] = useState<Date | null>(null);
  const [ola, setOla] = useState("Olá");
  const inputRef = useRef<HTMLInputElement>(null);

  const seg = useMemo(() => segundaDaSemana(), []);
  const dias = useMemo(() => diasDaSemana(seg), [seg]);
  const semanaKey = seg.toISOString().slice(0, 10);
  const sugestoes = useMemo(() => buscarPessoas(query), [query]);
  const total = marcas.filter(Boolean).length;

  useEffect(() => {
    setDark(localStorage.getItem("tema") === "dark");
    setHoje(new Date());
    setOla(saudacao());
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
    setMarcas(salvo ? JSON.parse(salvo) : VAZIO);
  };

  const confirmar = () => {
    if (!pessoa) return;
    localStorage.setItem(`almoco:${semanaKey}:${pessoa.nif}`, JSON.stringify(marcas));
    setSucesso(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh-screen flex flex-col bg-background">
      {/* HERO */}
      <header className="relative overflow-hidden bg-hero text-header-foreground pt-safe">
        <div className="pointer-events-none absolute inset-0 grid-pattern" />
        <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-primary/40 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/40 blur-3xl animate-blob [animation-delay:-4s]" />

        <div className="relative mx-auto max-w-3xl px-4 pb-20 pt-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-dashed border-header-foreground/40 bg-header-foreground/5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
              Logo
            </div>
            <p className="flex-1 text-sm font-semibold tracking-wide opacity-90">
              Almoço <span className="text-accent">SESI</span>
            </p>
            <button
              onClick={toggleTema}
              aria-label="Alternar tema"
              className="grid h-12 w-12 place-items-center rounded-2xl border border-header-foreground/15 bg-header-foreground/10 backdrop-blur transition hover:bg-header-foreground/20 active:scale-95"
            >
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-8 animate-rise">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-header-foreground/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Semana {fmt(dias[0]!)} – {fmt(dias[4]!)}
            </p>
            <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              {ola}! <br />
              <span className="bg-gradient-to-r from-header-foreground to-header-foreground/60 bg-clip-text text-transparent">
                Vai almoçar com a gente?
              </span>
            </h1>
          </div>

          {/* Mini calendário */}
          <div className="mt-6 grid grid-cols-5 gap-2 animate-rise [animation-delay:120ms]">
            {dias.map((d, i) => {
              const isHoje = hoje && mesmoDia(d, hoje);
              const on = pessoa && marcas[i];
              return (
                <div
                  key={i}
                  className={cn(
                    "relative flex flex-col items-center rounded-2xl border py-2.5 backdrop-blur transition-all duration-300",
                    on ? "border-transparent bg-header-foreground text-primary scale-105" : "border-header-foreground/15 bg-header-foreground/5",
                  )}
                >
                  <span className="text-[11px] font-semibold uppercase opacity-70">{NOMES_DIA[i]!.slice(0, 3)}</span>
                  <span className="text-lg font-extrabold">{d.getDate()}</span>
                  {isHoje && <span className="absolute -top-1 right-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-header" />}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {sucesso && pessoa ? (
        <Sucesso pessoa={pessoa} total={total} marcas={marcas} dias={dias} onVoltar={() => { setSucesso(false); setPessoa(null); }} />
      ) : (
        <main className={cn("relative mx-auto -mt-12 w-full max-w-3xl flex-1 px-4", pessoa ? "pb-40" : "pb-10")}>
          {/* Busca */}
          <div className="relative z-20 rounded-3xl border bg-card p-2 shadow-glow animate-rise [animation-delay:200ms]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
              <input
                id="busca"
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder={pessoa ? "Trocar pessoa…" : "Seu nome ou NIF"}
                aria-label="Buscar por nome ou NIF"
                autoComplete="off"
                enterKeyHint="search"
                className="h-14 w-full rounded-2xl bg-muted pl-12 pr-12 text-base font-medium text-card-foreground outline-none transition placeholder:text-muted-foreground focus:bg-card focus:ring-2 focus:ring-ring/40"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="Limpar busca" className="absolute right-1 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {focused && query.trim() && (
              <ul className="mt-2 max-h-80 overflow-y-auto">
                {sugestoes.length === 0 ? (
                  <li className="px-4 py-5 text-center text-sm text-muted-foreground">Ninguém encontrado 🤔</li>
                ) : (
                  sugestoes.map((p, idx) => (
                    <li key={p.nif} className="animate-rise" style={{ animationDelay: `${idx * 35}ms` }}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => escolher(p)}
                        className="group flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-muted active:scale-[.99]"
                      >
                        <Avatar nome={p.nome} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-card-foreground">{p.nome}</p>
                          <p className="text-xs text-muted-foreground">NIF {p.nif} · {p.grupo}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-0.5" />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {!pessoa ? (
            <div className="mt-12 flex flex-col items-center text-center animate-rise [animation-delay:300ms]">
              <div className="relative mb-5">
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ring" />
                <div className="relative grid h-24 w-24 place-items-center rounded-full bg-on text-primary-foreground shadow-glow">
                  <UtensilsCrossed className="h-10 w-10" />
                </div>
              </div>
              <p className="text-lg font-bold">Comece pela busca</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">Encontre seu nome e marque os dias em segundos.</p>
            </div>
          ) : (
            <div key={pessoa.nif}>
              <div className="mt-5 flex items-center gap-3 rounded-3xl border bg-card p-4 animate-rise">
                <Avatar nome={pessoa.nome} big />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold leading-tight">{pessoa.nome}</p>
                  <p className="text-sm text-muted-foreground">NIF {pessoa.nif}</p>
                </div>
                <GrupoTag grupo={pessoa.grupo} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 animate-rise [animation-delay:60ms]">
                <button
                  onClick={() => setMarcas([true, true, true, true, true])}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-secondary px-3 text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/70 active:scale-[.97]"
                >
                  <CalendarCheck className="h-4 w-4" /> Semana toda
                </button>
                <button
                  onClick={() => setMarcas(VAZIO)}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl border bg-card px-3 text-sm font-semibold transition hover:bg-muted active:scale-[.97]"
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
                      style={{ animationDelay: `${100 + i * 60}ms` }}
                      className={cn(
                        "group relative flex min-h-24 items-center gap-4 overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300 animate-rise active:scale-[.97] lg:min-h-48 lg:flex-col lg:items-stretch lg:justify-between",
                        on ? "border-transparent bg-on text-primary-foreground shadow-glow" : "bg-card hover:border-primary/40",
                      )}
                    >
                      <span className={cn("pointer-events-none absolute -right-6 -top-6 text-7xl font-black transition-opacity duration-300", on ? "opacity-15" : "opacity-[.04]")}>
                        {d.getDate()}
                      </span>
                      <div className="relative flex-1">
                        <p className="text-lg font-bold">{NOMES_DIA[i]}</p>
                        <p className={cn("text-sm", on ? "opacity-80" : "text-muted-foreground")}>
                          {on ? "Vou almoçar 🍽️" : "Não vou"}
                        </p>
                      </div>
                      {/* Toggle */}
                      <span
                        className={cn(
                          "relative flex h-12 w-24 shrink-0 items-center rounded-full p-1 transition-colors duration-300",
                          on ? "bg-primary-foreground/25" : "bg-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-10 w-10 place-items-center rounded-full shadow-md transition-all duration-300 ease-[cubic-bezier(.3,1.5,.5,1)]",
                            on ? "translate-x-12 bg-primary-foreground text-primary" : "translate-x-0 bg-card text-muted-foreground",
                          )}
                        >
                          {on ? <Check className="h-5 w-5" strokeWidth={3} /> : <X className="h-5 w-5" />}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      )}

      {pessoa && !sucesso && !focused && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-safe animate-rise">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-3xl border bg-glass p-2.5 pl-3 shadow-2xl backdrop-blur-xl">
            <ProgressRing value={total} />
            <div className="hidden shrink-0 min-[400px]:block">
              <p className="text-base font-extrabold leading-none">{total} de 5 dias</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{total === 0 ? "nenhum marcado" : total === 5 ? "semana completa!" : "marcados"}</p>
            </div>
            <button
              onClick={confirmar}
              className="shimmer h-14 flex-1 rounded-2xl bg-cta px-4 text-base font-bold text-accent-foreground shadow-glow-accent transition active:scale-[.97]"
            >
              Confirmar marcação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 20, c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-12 w-12 shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" strokeWidth="5" className="stroke-muted" />
        <circle
          cx="24" cy="24" r={r} fill="none" strokeWidth="5" strokeLinecap="round"
          className="stroke-primary transition-all duration-500"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 5}
        />
      </svg>
      <span className="text-sm font-extrabold">{value}/5</span>
    </div>
  );
}

function Avatar({ nome, big }: { nome: string; big?: boolean }) {
  const ini = nome.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("");
  return (
    <div className={cn("grid shrink-0 place-items-center rounded-2xl bg-on font-bold text-primary-foreground", big ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm")}>
      {ini}
    </div>
  );
}

function GrupoTag({ grupo }: { grupo: string }) {
  return (
    <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold", grupo === "Robótica" ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary")}>
      {grupo === "Robótica" ? "🤖 Robótica" : "Colaborador"}
    </span>
  );
}

const CONFETE_CORES = ["bg-accent", "bg-primary", "bg-success", "bg-header-foreground"];

function Sucesso({ pessoa, total, marcas, dias, onVoltar }: { pessoa: Pessoa; total: number; marcas: boolean[]; dias: Date[]; onVoltar: () => void }) {
  const confete = useMemo(
    () => Array.from({ length: 28 }, (_, i) => {
      const ang = (i / 28) * Math.PI * 2;
      const dist = 110 + (i % 4) * 30;
      return { x: Math.cos(ang) * dist, y: Math.sin(ang) * dist - 40, cor: CONFETE_CORES[i % 4]!, d: (i % 5) * 40 };
    }),
    [],
  );
  return (
    <main className="relative mx-auto -mt-12 w-full max-w-md flex-1 px-4 pb-safe">
      <div className="flex flex-col items-center rounded-3xl border bg-card px-6 py-10 text-center shadow-glow animate-rise">
        <div className="relative">
          {confete.map((c, i) => (
            <span
              key={i}
              className={cn("absolute left-1/2 top-1/2 h-2.5 w-1.5 rounded-sm animate-confetti", c.cor)}
              style={{ "--x": `${c.x}px`, "--y": `${c.y}px`, animationDelay: `${300 + c.d}ms` } as CSSProperties}
            />
          ))}
          <div className="absolute inset-0 rounded-full bg-success/40 animate-ring" />
          <div className="animate-pop relative grid h-28 w-28 place-items-center rounded-full bg-success text-success-foreground shadow-xl">
            <svg viewBox="0 0 24 24" className="h-14 w-14" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path className="animate-check" d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
        </div>
        <h2 className="mt-8 text-3xl font-extrabold tracking-tight animate-rise [animation-delay:400ms]">Tudo certo!</h2>
        <p className="mt-2 text-muted-foreground animate-rise [animation-delay:500ms]">
          {pessoa.nome.split(" ")[0]}, sua marcação foi confirmada para <strong className="text-foreground">{total} de 5 dias</strong>.
        </p>
        <div className="mt-6 grid w-full grid-cols-5 gap-2">
          {dias.map((d, i) => (
            <div
              key={i}
              style={{ animationDelay: `${600 + i * 80}ms` }}
              className={cn("flex flex-col items-center rounded-2xl py-2.5 text-xs font-semibold animate-rise", marcas[i] ? "bg-on text-primary-foreground shadow-glow" : "bg-muted text-muted-foreground")}
            >
              {NOMES_DIA[i]!.slice(0, 3)}
              <span className="text-base font-extrabold">{d.getDate()}</span>
              {marcas[i] ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" />}
            </div>
          ))}
        </div>
        <button onClick={onVoltar} className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-on font-bold text-primary-foreground shadow-glow transition active:scale-[.97]">
          <ArrowLeft className="h-5 w-5" /> Nova marcação
        </button>
      </div>
    </main>
  );
}
