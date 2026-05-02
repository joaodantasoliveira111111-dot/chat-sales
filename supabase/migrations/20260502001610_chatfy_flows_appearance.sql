alter table public.products
  add column if not exists status text
    check (status is null or status in ('active', 'inactive')),
  add column if not exists public_title text,
  add column if not exists public_subtitle text;

update public.products
set
  status = coalesce(status, case when is_active then 'active' else 'inactive' end),
  public_title = coalesce(public_title, 'CapCut Pro por menos'),
  public_subtitle = coalesce(
    public_subtitle,
    'Acesso digital para quem edita vídeos no celular e quer usar mais recursos sem pagar caro.'
  )
where slug = 'capcut-pro';

create table if not exists public.flows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  product_id uuid not null references public.products(id) on delete cascade,
  theme_id text not null default 'dark_premium'
    check (theme_id in ('dark_premium', 'whatsapp_inspired', 'instagram_dm', 'minimal_chat')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  start_node_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  unique (slug)
);

create table if not exists public.flow_nodes (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  type text not null check (
    type in (
      'start',
      'text_message',
      'button_message',
      'media_message',
      'input',
      'condition',
      'faq',
      'checkout',
      'pix_payment',
      'wait_payment',
      'delivery',
      'support',
      'action',
      'redirect',
      'end'
    )
  ),
  title text not null,
  position_x integer not null default 80,
  position_y integer not null default 80,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flow_edges (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  source_node_id uuid not null references public.flow_nodes(id) on delete cascade,
  source_handle text not null default 'next',
  target_node_id uuid not null references public.flow_nodes(id) on delete cascade,
  condition jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.flow_versions (
  id uuid primary key default gen_random_uuid(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (flow_id, version)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'flows_start_node_id_fkey'
  ) then
    alter table public.flows
      add constraint flows_start_node_id_fkey
      foreign key (start_node_id) references public.flow_nodes(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_flows_product_status on public.flows(product_id, status);
create index if not exists idx_flow_nodes_flow_id on public.flow_nodes(flow_id);
create index if not exists idx_flow_edges_flow_id on public.flow_edges(flow_id);
create index if not exists idx_flow_edges_source on public.flow_edges(source_node_id);

drop trigger if exists set_flows_updated_at on public.flows;
create trigger set_flows_updated_at
before update on public.flows
for each row execute function public.set_updated_at();

drop trigger if exists set_flow_nodes_updated_at on public.flow_nodes;
create trigger set_flow_nodes_updated_at
before update on public.flow_nodes
for each row execute function public.set_updated_at();

alter table public.flows enable row level security;
alter table public.flow_nodes enable row level security;
alter table public.flow_edges enable row level security;
alter table public.flow_versions enable row level security;

drop policy if exists "Public can read published flows" on public.flows;
create policy "Public can read published flows"
on public.flows for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public can read nodes from published flows" on public.flow_nodes;
create policy "Public can read nodes from published flows"
on public.flow_nodes for select
to anon, authenticated
using (
  exists (
    select 1 from public.flows
    where flows.id = flow_nodes.flow_id
      and flows.status = 'published'
  )
);

drop policy if exists "Public can read edges from published flows" on public.flow_edges;
create policy "Public can read edges from published flows"
on public.flow_edges for select
to anon, authenticated
using (
  exists (
    select 1 from public.flows
    where flows.id = flow_edges.flow_id
      and flows.status = 'published'
  )
);

drop policy if exists "Anon can manage flows through admin routes" on public.flows;
create policy "Anon can manage flows through admin routes"
on public.flows for all
to anon
using (true)
with check (true);

drop policy if exists "Anon can manage flow nodes through admin routes" on public.flow_nodes;
create policy "Anon can manage flow nodes through admin routes"
on public.flow_nodes for all
to anon
using (true)
with check (true);

drop policy if exists "Anon can manage flow edges through admin routes" on public.flow_edges;
create policy "Anon can manage flow edges through admin routes"
on public.flow_edges for all
to anon
using (true)
with check (true);

drop policy if exists "Anon can manage flow versions through admin routes" on public.flow_versions;
create policy "Anon can manage flow versions through admin routes"
on public.flow_versions for all
to anon
using (true)
with check (true);

drop policy if exists "Anon can read appearance settings" on public.admin_settings;
create policy "Anon can read appearance settings"
on public.admin_settings for select
to anon
using (key like 'appearance_%');

drop policy if exists "Anon can manage appearance settings" on public.admin_settings;
create policy "Anon can manage appearance settings"
on public.admin_settings for all
to anon
using (key like 'appearance_%')
with check (key like 'appearance_%');

insert into public.flows (
  id, name, slug, product_id, theme_id, status, start_node_id, published_at
)
values (
  '00000000-0000-4000-8000-000000001001',
  'Funil CapCut Pro',
  'capcut-pro',
  '00000000-0000-4000-8000-000000000001',
  'dark_premium',
  'published',
  null,
  now()
)
on conflict (slug) do update set
  name = excluded.name,
  product_id = excluded.product_id,
  theme_id = excluded.theme_id,
  status = excluded.status,
  published_at = coalesce(public.flows.published_at, excluded.published_at);

insert into public.flow_nodes (id, flow_id, type, title, position_x, position_y, config)
values
('00000000-0000-4000-8000-000000001101','00000000-0000-4000-8000-000000001001','start','Inicio',80,160,'{"name":"Inicio","next_node_id":"00000000-0000-4000-8000-000000001102"}'),
('00000000-0000-4000-8000-000000001102','00000000-0000-4000-8000-000000001001','button_message','Dor direta',390,80,'{"message_text":"Você usa CapCut e vive encontrando efeito, template ou recurso bom… mas ele está bloqueado no Pro?","delay_ms":500,"show_typing":true,"buttons":[{"label":"Sim, acontece comigo","action_type":"go_to_node","target_node_id":"00000000-0000-4000-8000-000000001103"}]}'),
('00000000-0000-4000-8000-000000001103','00000000-0000-4000-8000-000000001001','button_message','Identificacao',700,80,'{"message_text":"É bem chato.\n\nVocê grava o vídeo, começa a editar, tenta deixar mais bonito para postar no Instagram, TikTok ou Reels… e justamente o recurso que faria diferença aparece como Pro.","delay_ms":650,"show_typing":true,"buttons":[{"label":"Quero resolver isso","action_type":"go_to_node","target_node_id":"00000000-0000-4000-8000-000000001104"}]}'),
('00000000-0000-4000-8000-000000001104','00000000-0000-4000-8000-000000001001','button_message','Solucao',1010,80,'{"message_text":"Com o acesso CapCut Pro, você edita com mais liberdade e consegue usar mais recursos para deixar seus vídeos com aparência melhor, sem ficar preso só no básico.","delay_ms":650,"show_typing":true,"buttons":[{"label":"Como funciona?","action_type":"go_to_node","target_node_id":"00000000-0000-4000-8000-000000001105"}]}'),
('00000000-0000-4000-8000-000000001105','00000000-0000-4000-8000-000000001001','button_message','Como funciona',1320,80,'{"message_text":"Funciona de forma simples:\n\nVocê compra, faz o pagamento e, assim que for confirmado, recebe os dados e instruções de acesso aqui mesmo na tela.\n\nSem complicação.","delay_ms":700,"show_typing":true,"buttons":[{"label":"Entendi","action_type":"go_to_node","target_node_id":"00000000-0000-4000-8000-000000001106"}]}'),
('00000000-0000-4000-8000-000000001106','00000000-0000-4000-8000-000000001001','button_message','Para quem e',1630,80,'{"message_text":"Serve para quem cria vídeos para Instagram, TikTok, Reels, anúncios, status, loja, trabalho ou conteúdo próprio.\n\nSe você já usa CapCut e quer editar melhor pagando menos, faz sentido para você.","delay_ms":650,"show_typing":true,"buttons":[{"label":"Serve para mim","action_type":"go_to_node","target_node_id":"00000000-0000-4000-8000-000000001107"}]}'),
('00000000-0000-4000-8000-000000001107','00000000-0000-4000-8000-000000001001','button_message','Oferta',1940,80,'{"message_text":"Hoje você pode adquirir o acesso CapCut Pro por:\n\nR$ 27,90\n\nEntrega digital após confirmação do pagamento.\nVocê recebe os dados de acesso aqui mesmo, dentro desta conversa.\nSuporte em caso de dúvida ou problema de acesso.","delay_ms":750,"show_typing":true,"buttons":[{"label":"Comprar agora","action_type":"open_checkout","target_node_id":"00000000-0000-4000-8000-000000001109"},{"label":"Tenho dúvidas","action_type":"open_faq","target_node_id":"00000000-0000-4000-8000-000000001108"}]}'),
('00000000-0000-4000-8000-000000001108','00000000-0000-4000-8000-000000001001','faq','FAQ',2250,300,'{"faqs":[{"question":"O que eu recebo?","answer":"Você recebe os dados de acesso e as instruções para usar."},{"question":"A entrega é rápida?","answer":"Sim. Após a confirmação do pagamento, a entrega é feita de forma digital dentro desta própria conversa."},{"question":"Tem suporte?","answer":"Sim. Se tiver algum problema de acesso, você pode chamar o suporte."},{"question":"É para uso pessoal?","answer":"Sim. Essa oferta é para quem quer usar o CapCut Pro nos próprios vídeos."}],"final_button_text":"Comprar CapCut Pro por R$ 27,90","final_button_target_node_id":"00000000-0000-4000-8000-000000001109"}'),
('00000000-0000-4000-8000-000000001109','00000000-0000-4000-8000-000000001001','checkout','Checkout',2250,80,'{"product_id":"00000000-0000-4000-8000-000000000001","required_fields":["name","email","whatsapp"],"summary_title":"Resumo da compra","summary_text":"Após a confirmação do pagamento, seus dados de acesso serão liberados aqui mesmo na tela.","button_text":"Gerar Pix","next_node_id":"00000000-0000-4000-8000-000000001110"}'),
('00000000-0000-4000-8000-000000001110','00000000-0000-4000-8000-000000001001','pix_payment','Pix',2560,80,'{"payment_provider":"mock","expiration_minutes":30,"success_target_node_id":"00000000-0000-4000-8000-000000001111","pending_text":"Pix gerado.\n\nCopie o código Pix abaixo ou escaneie o QR Code. Assim que o pagamento for confirmado, seu acesso será liberado automaticamente aqui nesta conversa.","button_paid_text":"Já paguei"}'),
('00000000-0000-4000-8000-000000001111','00000000-0000-4000-8000-000000001001','delivery','Entrega',2870,80,'{"product_id":"00000000-0000-4000-8000-000000000001","support_button_text":"Preciso de suporte","buy_again_button_text":"Comprar outro acesso"}')
on conflict (id) do update set
  type = excluded.type,
  title = excluded.title,
  position_x = excluded.position_x,
  position_y = excluded.position_y,
  config = excluded.config;

update public.flows
set start_node_id = '00000000-0000-4000-8000-000000001101'
where id = '00000000-0000-4000-8000-000000001001';

insert into public.flow_edges (id, flow_id, source_node_id, source_handle, target_node_id, condition)
values
('00000000-0000-4000-8000-000000001200','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001101','next','00000000-0000-4000-8000-000000001102',null),
('00000000-0000-4000-8000-000000001201','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001102','button:0','00000000-0000-4000-8000-000000001103',null),
('00000000-0000-4000-8000-000000001202','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001103','button:0','00000000-0000-4000-8000-000000001104',null),
('00000000-0000-4000-8000-000000001203','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001104','button:0','00000000-0000-4000-8000-000000001105',null),
('00000000-0000-4000-8000-000000001204','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001105','button:0','00000000-0000-4000-8000-000000001106',null),
('00000000-0000-4000-8000-000000001205','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001106','button:0','00000000-0000-4000-8000-000000001107',null),
('00000000-0000-4000-8000-000000001206','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001107','button:0','00000000-0000-4000-8000-000000001109',null),
('00000000-0000-4000-8000-000000001207','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001107','button:1','00000000-0000-4000-8000-000000001108',null),
('00000000-0000-4000-8000-000000001208','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001108','final','00000000-0000-4000-8000-000000001109',null),
('00000000-0000-4000-8000-000000001209','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001109','next','00000000-0000-4000-8000-000000001110',null),
('00000000-0000-4000-8000-000000001210','00000000-0000-4000-8000-000000001001','00000000-0000-4000-8000-000000001110','success','00000000-0000-4000-8000-000000001111',null)
on conflict (id) do update set
  source_handle = excluded.source_handle,
  target_node_id = excluded.target_node_id,
  condition = excluded.condition;

insert into public.admin_settings (key, value)
values (
  'appearance_00000000-0000-4000-8000-000000000001',
  '{
    "publicOfferName": "CapCut Pro por menos",
    "publicSubtitle": "Acesso digital para quem edita vídeos no celular e quer usar mais recursos sem pagar caro.",
    "template": "dark_premium",
    "avatarUrl": null,
    "showHeader": true,
    "showTopSupport": false,
    "showMicroCredibility": true,
    "microCredibilityText": "Entrega digital após pagamento • Suporte de acesso • Uso pessoal",
    "primaryColor": "#00D1FF",
    "secondaryColor": "#7B61FF",
    "background": "#0B0F14",
    "bubbleStyle": "rounded",
    "buttonStyle": "gradient",
    "font": "geist"
  }'::jsonb
)
on conflict (key) do nothing;
