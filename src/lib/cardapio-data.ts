export type Tag = "Vegetariano" | "Sem glúten" | "Sem lactose" | "Leve";
export interface Refeicao {
  prato: string;
  acompanhamento: string;
  sobremesa: string;
  tags: Tag[];
}

const PRATOS: Refeicao[] = [
  { prato: "Frango grelhado ao limão", acompanhamento: "Arroz, feijão e legumes no vapor", sobremesa: "Gelatina de morango", tags: ["Sem glúten", "Leve"] },
  { prato: "Strogonoff de carne", acompanhamento: "Arroz branco e batata palha", sobremesa: "Pudim de leite", tags: [] },
  { prato: "Lasanha de berinjela", acompanhamento: "Salada verde e arroz integral", sobremesa: "Salada de frutas", tags: ["Vegetariano"] },
  { prato: "Peixe assado com ervas", acompanhamento: "Purê de mandioquinha e salada", sobremesa: "Mousse de maracujá", tags: ["Sem glúten"] },
  { prato: "Feijoada light", acompanhamento: "Arroz, couve e farofa", sobremesa: "Laranja", tags: ["Sem lactose"] },
  { prato: "Escondidinho de carne seca", acompanhamento: "Arroz e salada de tomate", sobremesa: "Doce de abóbora", tags: ["Sem glúten"] },
  { prato: "Risoto de cogumelos", acompanhamento: "Salada caprese", sobremesa: "Brownie", tags: ["Vegetariano"] },
  { prato: "Carne de panela", acompanhamento: "Arroz, feijão e polenta", sobremesa: "Banana caramelada", tags: ["Sem lactose"] },
  { prato: "Grão-de-bico ao curry", acompanhamento: "Arroz basmati e legumes", sobremesa: "Melancia", tags: ["Vegetariano", "Sem glúten", "Sem lactose"] },
  { prato: "Macarrão à bolonhesa", acompanhamento: "Salada mista", sobremesa: "Sorvete de creme", tags: [] },
];

/** Fictitious menu for a given week offset (0 = current week). */
export function cardapioDaSemana(offset: number): Refeicao[] {
  const base = (((offset * 3) % PRATOS.length) + PRATOS.length) % PRATOS.length;
  return Array.from({ length: 5 }, (_, i) => PRATOS[(base + i * 2 + (i > 2 ? 1 : 0)) % PRATOS.length]!);
}
