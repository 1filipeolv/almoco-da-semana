import { describe, it, expect } from "vitest";
import { segundaDaSemana, buscarPessoas, PESSOAS } from "@/lib/almoco-data";

describe("almoco data", () => {
  it("has 30 people in 2 groups", () => {
    expect(PESSOAS.length).toBe(30);
    expect(new Set(PESSOAS.map((p) => p.grupo)).size).toBe(2);
  });
  it("wednesday maps to monday of same week", () => {
    expect(segundaDaSemana(new Date(2026, 9, 21)).getDate()).toBe(19);
  });
  it("saturday maps to next monday", () => {
    expect(segundaDaSemana(new Date(2026, 9, 24)).getDate()).toBe(26);
  });
  it("search ignores accents", () => {
    expect(buscarPessoas("fabio")[0]?.nome).toBe("Fábio Martins");
  });
});
