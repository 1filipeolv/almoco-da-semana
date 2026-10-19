export type Grupo = "Colaboradores" | "Robótica";
export interface Pessoa {
  nif: string;
  nome: string;
  grupo: Grupo;
}

const colab = [
  "Ana Paula Souza", "Bruno Henrique Lima", "Carla Mendes", "Daniel Ferreira", "Eduarda Rocha",
  "Fábio Martins", "Gabriela Nunes", "Helena Carvalho", "Igor Santos", "Juliana Alves",
  "Leonardo Costa", "Marina Oliveira", "Natália Ribeiro", "Otávio Pereira", "Patrícia Gomes",
  "Rafael Barbosa", "Sandra Dias", "Thiago Araújo",
];
const robo = [
  "Arthur Moreira", "Beatriz Cardoso", "Caio Teixeira", "Davi Correia", "Elisa Pinto",
  "Felipe Azevedo", "Giovanna Lopes", "Heitor Freitas", "Isabela Monteiro", "João Pedro Vieira",
  "Laura Cunha", "Miguel Ramos",
];

export const PESSOAS: Pessoa[] = [
  ...colab.map((nome, i) => ({ nome, nif: String(1040210 + i * 37), grupo: "Colaboradores" as Grupo })),
  ...robo.map((nome, i) => ({ nome, nif: String(2085300 + i * 41), grupo: "Robótica" as Grupo })),
];

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function buscarPessoas(q: string, limit = 6): Pessoa[] {
  const t = norm(q.trim());
  if (!t) return [];
  return PESSOAS.filter((p) => norm(p.nome).includes(t) || p.nif.includes(t)).slice(0, limit);
}

/** Monday of the current week; on Sat/Sun returns next week's Monday. */
export function segundaDaSemana(hoje = new Date()): Date {
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dow = d.getDay();
  const diff = dow === 0 ? 1 : dow === 6 ? 2 : 1 - dow;
  d.setDate(d.getDate() + diff);
  return d;
}

export function diasDaSemana(seg: Date): Date[] {
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(seg);
    d.setDate(seg.getDate() + i);
    return d;
  });
}
