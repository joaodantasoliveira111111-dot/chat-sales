create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  is_active boolean not null default true,
  delivery_type text not null default 'digital_credential'
    check (delivery_type in ('digital_credential', 'file', 'link', 'custom_text')),
  image_url text,
  support_text text,
  default_instructions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_steps (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  step_order integer not null check (step_order > 0),
  message_text text not null,
  primary_button_text text,
  primary_button_action text not null default 'next_step'
    check (primary_button_action in ('next_step', 'open_checkout', 'open_faq', 'external_link', 'support')),
  secondary_button_text text,
  secondary_button_action text
    check (secondary_button_action is null or secondary_button_action in ('next_step', 'open_checkout', 'open_faq', 'external_link', 'support')),
  delay_ms integer not null default 600 check (delay_ms >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, step_order)
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  question text not null,
  answer text not null,
  "order" integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text,
  access_email text,
  access_password text,
  access_url text,
  extra_instructions text,
  status text not null default 'available'
    check (status in ('available', 'reserved', 'delivered', 'disabled', 'replaced')),
  assigned_order_id uuid,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  session_id text not null,
  customer_name text not null,
  customer_email text not null,
  customer_whatsapp text,
  amount numeric(10,2) not null check (amount >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'delivered', 'expired', 'cancelled', 'refunded', 'paid_pending_stock')),
  gateway_payment_id text,
  pix_code text,
  qr_code_url text,
  delivered_item_id uuid references public.inventory_items(id),
  paid_at timestamptz,
  delivered_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_items
  add constraint inventory_items_assigned_order_id_fkey
  foreign key (assigned_order_id) references public.orders(id);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  inventory_item_id uuid references public.inventory_items(id),
  delivery_payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  provider text not null,
  event_type text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  customer_name text,
  customer_email text,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_gateway_payment_id on public.orders(gateway_payment_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_session_id on public.orders(session_id);
create index if not exists idx_inventory_items_status on public.inventory_items(status);
create index if not exists idx_inventory_items_product_status on public.inventory_items(product_id, status);
create index if not exists idx_inventory_items_assigned_order on public.inventory_items(assigned_order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_chat_steps_updated_at on public.chat_steps;
create trigger set_chat_steps_updated_at
before update on public.chat_steps
for each row execute function public.set_updated_at();

drop trigger if exists set_faqs_updated_at on public.faqs;
create trigger set_faqs_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();

drop trigger if exists set_inventory_items_updated_at on public.inventory_items;
create trigger set_inventory_items_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists set_support_requests_updated_at on public.support_requests;
create trigger set_support_requests_updated_at
before update on public.support_requests
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.chat_steps enable row level security;
alter table public.faqs enable row level security;
alter table public.inventory_items enable row level security;
alter table public.orders enable row level security;
alter table public.deliveries enable row level security;
alter table public.payment_events enable row level security;
alter table public.support_requests enable row level security;
alter table public.admin_settings enable row level security;

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active chat steps" on public.chat_steps;
create policy "Public can read active chat steps"
on public.chat_steps for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Public can read active faqs" on public.faqs;
create policy "Public can read active faqs"
on public.faqs for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Authenticated admin read products" on public.products;
create policy "Authenticated admin read products"
on public.products for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admin read chat steps" on public.chat_steps;
create policy "Authenticated admin read chat steps"
on public.chat_steps for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admin read faqs" on public.faqs;
create policy "Authenticated admin read faqs"
on public.faqs for all
to authenticated
using (true)
with check (true);
