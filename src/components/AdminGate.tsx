import { useState, type ReactNode } from "react";
import { Loader2, Lock, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";

export function AdminGate({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAdmin();
  if (loading)
    return (
      <div className="grid min-h-[60dvh] place-items-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  if (!session) return <LoginForm />;
  if (!isAdmin)
    return (
      <div className="mx-auto flex min-h-[60dvh] max-w-sm flex-col items-center justify-center px-6 text-center">
        <ShieldX className="h-12 w-12 text-accent" />
        <p className="mt-4 text-lg font-bold">Sem permissão de administrador</p>
        <p className="mt-1 text-sm text-muted-foreground">{session.user.email} não tem acesso a esta área.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 h-12 w-full rounded-2xl border bg-card font-semibold">
          Sair
        </button>
      </div>
    );
  return <>{children}</>;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setEnviando(false);
    if (error) toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
  };

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-10">
      <form onSubmit={entrar} className="w-full max-w-sm rounded-3xl border bg-card p-6 shadow-glow animate-rise">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-on text-primary-foreground shadow-glow">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-center text-2xl font-extrabold">Área restrita</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Entre com seu e-mail e senha de administrador.</p>
        <label className="mt-6 block text-sm font-semibold" htmlFor="email">E-mail</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-2xl border bg-muted px-4 text-base outline-none focus:bg-card focus:ring-2 focus:ring-ring/40" />
        <label className="mt-4 block text-sm font-semibold" htmlFor="senha">Senha</label>
        <input id="senha" type="password" required autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)}
          className="mt-1.5 h-12 w-full rounded-2xl border bg-muted px-4 text-base outline-none focus:bg-card focus:ring-2 focus:ring-ring/40" />
        <button disabled={enviando} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cta font-bold text-accent-foreground shadow-glow-accent disabled:opacity-60">
          {enviando && <Loader2 className="h-5 w-5 animate-spin" />} Entrar
        </button>
      </form>
    </div>
  );
}
