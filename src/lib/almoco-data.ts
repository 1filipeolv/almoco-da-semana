export interface Pessoa {
  id: string;
  nif: string;
  nome: string;
  grupo: string;
}

export const NOMES_DIA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
export const TAGS = ["Vegetariano", "Sem glúten", "Sem lactose", "Leve"] as const;
export const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/** Monday of the current week; on Sat/Sun returns next week's Monday. */
export function segundaDaSemana(hoje = new Date()): Date {
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dow = d.getDay();
  const diff = dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

export function somarSemanas(seg: Date, n: number): Date {
  const d = new Date(seg);
  d.setDate(d.getDate() + n * 7);
  return d;
}

export function diasDaSemana(seg: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(seg);
    d.setDate(seg.getDate() + i);
    return d;
  });
}
