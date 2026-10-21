import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Status = "vai" | "nao" | "sem";

export interface PessoaAdmin {
  id: string;
  nif: string;
  nome: string;
  ativo: boolean;
  grupo_id: string;
  grupo: string;
  tipo: string;
}

export function usePessoas() {
  return useQuery({
    queryKey: ["pessoas"],
    queryFn: async (): Promise<PessoaAdmin[]> => {
      const { data, error } = await supabase.from("pessoas").select("id, nif, nome, ativo, grupo_id, grupos(nome, tipo)").order("nome");
      if (error) throw error;
      return data.map((p) => ({ id: p.id, nif: p.nif, nome: p.nome, ativo: p.ativo, grupo_id: p.grupo_id, grupo: p.grupos?.nome ?? "", tipo: p.grupos?.tipo ?? "funcionario" }));
    },
  });
}

export function useGrupos() {
  return useQuery({
    queryKey: ["grupos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("grupos").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useMarcacoes(inicio: string, fim: string) {
  return useQuery({
    queryKey: ["marcacoes", inicio, fim],
    queryFn: async () => {
      const { data, error } = await supabase.from("marcacoes").select("pessoa_id, data, vai, origem").gte("data", inicio).lte("data", fim);
      if (error) throw error;
      return data;
    },
  });
}
