create table if not exists public.funnel_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  session_id text not null,
  event_type text not null check (
    event_type in ('view', 'step', 'checkout', 'pix_generated', 'paid')
  ),
  step_id uuid references public.chat_steps(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_funnel_events_product_id on public.funnel_events(product_id);
create index if not exists idx_funnel_events_session_id on public.funnel_events(session_id);
create index if not exists idx_funnel_events_event_type on public.funnel_events(event_type);
create index if not exists idx_funnel_events_created_at on public.funnel_events(created_at);

alter table public.funnel_events enable row level security;

drop policy if exists "Anon can insert funnel events" on public.funnel_events;
create policy "Anon can insert funnel events"
on public.funnel_events for insert
to anon
with check (true);
