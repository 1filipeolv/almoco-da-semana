export interface ConfigPrazo {
  prazo_hora: string; // "HH:MM[:SS]"
  prazo_dias_antes: number;
  dias_sem_almoco: string[]; // ISO dates
}

/** Local-date ISO string (YYYY-MM-DD) without timezone shifting. */
export function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function deIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

/** Current date/time in São Paulo as sortable strings. */
export function agoraSP(agora = new Date()): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(agora).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** Date D closes at (D - dias_antes) at prazo_hora, São Paulo time. Mirrors public.prazo_encerrado. */
export function limiteDe(dataISO: string, cfg: Pick<ConfigPrazo, "prazo_hora" | "prazo_dias_antes">): string {
  const d = deIso(dataISO);
  d.setDate(d.getDate() - cfg.prazo_dias_antes);
  return `${iso(d)}T${cfg.prazo_hora.slice(0, 5)}`;
}

export function prazoEncerrado(dataISO: string, cfg: Pick<ConfigPrazo, "prazo_hora" | "prazo_dias_antes">, agora = new Date()): boolean {
  return agoraSP(agora) >= limiteDe(dataISO, cfg);
}

export type Bloqueio = "livre" | "prazo" | "sem-almoco";
export function bloqueioDoDia(dataISO: string, cfg: ConfigPrazo | null | undefined, agora = new Date()): Bloqueio {
  if (!cfg) return "livre";
  if (cfg.dias_sem_almoco.includes(dataISO)) return "sem-almoco";
  return prazoEncerrado(dataISO, cfg, agora) ? "prazo" : "livre";
}
