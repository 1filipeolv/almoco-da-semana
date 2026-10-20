import { describe, it, expect } from "vitest";
import { segundaDaSemana } from "@/lib/almoco-data";
import { bloqueioDoDia, prazoEncerrado } from "@/lib/prazo";

const cfg = { prazo_hora: "09:30:00", prazo_dias_antes: 0, dias_sem_almoco: ["2026-10-23"] };

describe("semana", () => {
  it("wednesday maps to monday of same week", () => {
    expect(segundaDaSemana(new Date(2026, 9, 21)).getDate()).toBe(19);
  });
  it("saturday maps to next monday", () => {
    expect(segundaDaSemana(new Date(2026, 9, 24)).getDate()).toBe(26);
  });
});

describe("prazo limite (horário de São Paulo)", () => {
  it("same day before 09:30 SP is still open", () => {
    // 12:29 UTC = 09:29 SP
    expect(prazoEncerrado("2026-10-21", cfg, new Date("2026-10-21T12:29:00Z"))).toBe(false);
  });
  it("same day at 09:30 SP is closed", () => {
    expect(prazoEncerrado("2026-10-21", cfg, new Date("2026-10-21T12:30:00Z"))).toBe(true);
  });
  it("with 1 day ahead, closes the previous day at 09:30", () => {
    expect(prazoEncerrado("2026-10-22", { ...cfg, prazo_dias_antes: 1 }, new Date("2026-10-21T12:31:00Z"))).toBe(true);
  });
  it("day without lunch is blocked", () => {
    expect(bloqueioDoDia("2026-10-23", cfg, new Date("2026-10-19T10:00:00Z"))).toBe("sem-almoco");
  });
});
