-- Roles
create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.grant_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_first_admin after insert on auth.users
for each row execute function public.grant_first_admin();

create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  tipo text not null default 'funcionario' check (tipo in ('funcionario','aluno')),
  created_at timestamptz not null default now()
);
grant select on public.grupos to anon, authenticated;
grant insert, update, delete on public.grupos to authenticated;
grant all on public.grupos to service_role;
alter table public.grupos enable row level security;
create policy "grupos public read" on public.grupos for select to anon, authenticated using (true);
create policy "grupos admin write" on public.grupos for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.pessoas (
  id uuid primary key default gen_random_uuid(),
  nif text not null unique,
  nome text not null,
  grupo_id uuid not null references public.grupos(id) on delete restrict,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.pessoas to authenticated;
grant all on public.pessoas to service_role;
alter table public.pessoas enable row level security;
create policy "pessoas admin all" on public.pessoas for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.cardapio (
  data date primary key,
  prato text not null default '',
  acompanhamento text not null default '',
  sobremesa text not null default '',
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);
grant select on public.cardapio to anon, authenticated;
grant insert, update, delete on public.cardapio to authenticated;
grant all on public.cardapio to service_role;
alter table public.cardapio enable row level security;
create policy "cardapio public read" on public.cardapio for select to anon, authenticated using (true);
create policy "cardapio admin write" on public.cardapio for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.configuracoes (
  id int primary key default 1 check (id = 1),
  prazo_hora time not null default '09:30',
  prazo_dias_antes int not null default 0 check (prazo_dias_antes between 0 and 7),
  dias_sem_almoco date[] not null default '{}',
  updated_at timestamptz not null default now()
);
grant select on public.configuracoes to anon, authenticated;
grant update on public.configuracoes to authenticated;
grant all on public.configuracoes to service_role;
alter table public.configuracoes enable row level security;
create policy "config public read" on public.configuracoes for select to anon, authenticated using (true);
create policy "config admin update" on public.configuracoes for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.configuracoes(id) values (1);

create table public.marcacoes (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references public.pessoas(id) on delete cascade,
  data date not null,
  vai boolean not null,
  origem text not null default 'usuario' check (origem in ('usuario','admin')),
  updated_at timestamptz not null default now(),
  unique (pessoa_id, data)
);
grant select, insert, update, delete on public.marcacoes to authenticated;
grant all on public.marcacoes to service_role;
alter table public.marcacoes enable row level security;
create policy "marcacoes admin all" on public.marcacoes for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
alter table public.marcacoes replica identity full;
alter publication supabase_realtime add table public.marcacoes;

create or replace function public.sem_acento(t text) returns text language sql immutable as $$
  select lower(translate(t, 'áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ', 'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'))
$$;

create or replace function public.prazo_encerrado(_data date)
returns boolean language sql stable security definer set search_path = public as $$
  select (now() at time zone 'America/Sao_Paulo') >= ((_data - c.prazo_dias_antes) + c.prazo_hora)
  from public.configuracoes c where c.id = 1
$$;

create or replace function public.buscar_pessoas(_q text)
returns table(id uuid, nif text, nome text, grupo text)
language sql stable security definer set search_path = public as $$
  select p.id, p.nif, p.nome, g.nome
  from public.pessoas p join public.grupos g on g.id = p.grupo_id
  where p.ativo and length(trim(_q)) >= 2
    and (public.sem_acento(p.nome) like '%' || public.sem_acento(trim(_q)) || '%' or p.nif like trim(_q) || '%')
  order by p.nome limit 8
$$;

create or replace function public.minhas_marcacoes(_pessoa uuid, _inicio date, _fim date)
returns table(data date, vai boolean)
language sql stable security definer set search_path = public as $$
  select m.data, m.vai from public.marcacoes m
  where m.pessoa_id = _pessoa and m.data between _inicio and _fim
$$;

create or replace function public.salvar_marcacoes(_pessoa uuid, _datas date[], _vai boolean[])
returns int language plpgsql security definer set search_path = public as $$
declare i int; n int := 0; sem date[];
begin
  if array_length(_datas,1) is distinct from array_length(_vai,1) or array_length(_datas,1) > 10 then
    raise exception 'Dados inválidos';
  end if;
  if not exists (select 1 from public.pessoas where id = _pessoa and ativo) then
    raise exception 'Pessoa não encontrada';
  end if;
  select dias_sem_almoco into sem from public.configuracoes where id = 1;
  for i in 1..coalesce(array_length(_datas,1),0) loop
    if extract(isodow from _datas[i]) > 5 or _datas[i] = any(sem) or public.prazo_encerrado(_datas[i]) then
      continue;
    end if;
    insert into public.marcacoes(pessoa_id, data, vai, origem) values (_pessoa, _datas[i], _vai[i], 'usuario')
    on conflict (pessoa_id, data) do update set vai = excluded.vai, origem = 'usuario', updated_at = now();
    n := n + 1;
  end loop;
  return n;
end $$;

grant execute on function public.buscar_pessoas(text) to anon, authenticated;
grant execute on function public.minhas_marcacoes(uuid, date, date) to anon, authenticated;
grant execute on function public.salvar_marcacoes(uuid, date[], boolean[]) to anon, authenticated;
grant execute on function public.prazo_encerrado(date) to anon, authenticated;

-- Seed
insert into public.grupos(nome, tipo) values ('Colaboradores','funcionario'), ('Robótica','aluno');
insert into public.pessoas(nif, nome, grupo_id)
select v.nif, v.nome, g.id from (values
 ('1040210','Ana Paula Souza','Colaboradores'),('1040247','Bruno Henrique Lima','Colaboradores'),
 ('1040284','Carla Mendes','Colaboradores'),('1040321','Daniel Ferreira','Colaboradores'),
 ('1040358','Eduarda Rocha','Colaboradores'),('1040395','Fábio Martins','Colaboradores'),
 ('1040432','Gabriela Nunes','Colaboradores'),('1040469','Helena Carvalho','Colaboradores'),
 ('1040506','Igor Santos','Colaboradores'),('1040543','Juliana Alves','Colaboradores'),
 ('1040580','Leonardo Costa','Colaboradores'),('1040617','Marina Oliveira','Colaboradores'),
 ('1040654','Natália Ribeiro','Colaboradores'),('1040691','Otávio Pereira','Colaboradores'),
 ('1040728','Patrícia Gomes','Colaboradores'),('1040765','Rafael Barbosa','Colaboradores'),
 ('1040802','Sandra Dias','Colaboradores'),('1040839','Thiago Araújo','Colaboradores'),
 ('2085300','Arthur Moreira','Robótica'),('2085341','Beatriz Cardoso','Robótica'),
 ('2085382','Caio Teixeira','Robótica'),('2085423','Davi Correia','Robótica'),
 ('2085464','Elisa Pinto','Robótica'),('2085505','Felipe Azevedo','Robótica'),
 ('2085546','Giovanna Lopes','Robótica'),('2085587','Heitor Freitas','Robótica'),
 ('2085628','Isabela Monteiro','Robótica'),('2085669','João Pedro Vieira','Robótica'),
 ('2085710','Laura Cunha','Robótica'),('2085751','Miguel Ramos','Robótica')
) v(nif,nome,grupo) join public.grupos g on g.nome = v.grupo;

insert into public.cardapio(data, prato, acompanhamento, sobremesa, tags)
select (date_trunc('week', current_date)::date + (w*7) + d), m.prato, m.acomp, m.sobremesa, m.tags
from generate_series(0,1) w
cross join lateral (values
 (0,'Frango grelhado ao limão','Arroz, feijão e legumes no vapor','Gelatina de morango', array['Sem glúten','Leve']),
 (1,'Lasanha de berinjela','Salada verde e arroz integral','Salada de frutas', array['Vegetariano']),
 (2,'Strogonoff de carne','Arroz branco e batata palha','Pudim de leite', array[]::text[]),
 (3,'Peixe assado com ervas','Purê de mandioquinha e salada','Mousse de maracujá', array['Sem glúten']),
 (4,'Grão-de-bico ao curry','Arroz basmati e legumes','Melancia', array['Vegetariano','Sem glúten','Sem lactose'])
) m(d,prato,acomp,sobremesa,tags);

insert into public.marcacoes(pessoa_id, data, vai)
select p.id, date_trunc('week', current_date)::date + d, (abs(hashtext(p.nif || d)) % 4) <> 0
from public.pessoas p cross join generate_series(0,4) d
where abs(hashtext(p.nif)) % 6 <> 0;
