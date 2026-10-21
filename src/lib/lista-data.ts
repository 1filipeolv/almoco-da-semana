import { PESSOAS, type Pessoa } from "./almoco-data";

export type Status = "vai" | "nao" | "sem";
export interface Linha extends Pessoa {
  status: Status;
}

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/** Lunch list for a weekday (0–4). Uses real local marks when present, otherwise deterministic fake data. */
export function listaDoDia(semanaKey: string, dia: number, ler?: (k: string) => string | null): Linha[] {
  return PESSOAS.map((p) => {
    const salvo = ler?.(`almoco:${semanaKey}:${p.nif}`);
    let status: Status;
    if (salvo) status = (JSON.parse(salvo) as boolean[])[dia] ? "vai" : "nao";
    else {
      const h = hash(p.nif + semanaKey);
      status = h % 7 === 0 ? "sem" : hash(p.nif + dia) % 4 === 0 ? "nao" : "vai";
    }
    return { ...p, status };
  }).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export function totais(l: Linha[]) {
  const vai = l.filter((x) => x.status === "vai");
  return {
    total: vai.length,
    funcionarios: vai.filter((x) => x.grupo === "Colaboradores").length,
    alunos: vai.filter((x) => x.grupo === "Robótica").length,
    sem: l.filter((x) => x.status === "sem").length,
  };
}
