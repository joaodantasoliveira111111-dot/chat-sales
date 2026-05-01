alter table public.chat_steps
  add column if not exists media_type text not null default 'none'
    check (media_type in ('none', 'image', 'video')),
  add column if not exists media_url text,
  add column if not exists media_alt text,
  add column if not exists node_id text,
  add column if not exists position_x integer not null default 80,
  add column if not exists position_y integer not null default 80,
  add column if not exists next_step_id uuid references public.chat_steps(id) on delete set null,
  add column if not exists secondary_step_id uuid references public.chat_steps(id) on delete set null;

create index if not exists idx_chat_steps_next_step_id on public.chat_steps(next_step_id);
create index if not exists idx_chat_steps_secondary_step_id on public.chat_steps(secondary_step_id);

update public.chat_steps
set
  node_id = coalesce(node_id, 'node-' || step_order::text),
  position_x = case
    when position_x = 80 then 80 + ((step_order - 1) * 300)
    else position_x
  end,
  position_y = case
    when position_y = 80 then 80
    else position_y
  end,
  next_step_id = coalesce(
    next_step_id,
    (
      select next_step.id
      from public.chat_steps next_step
      where next_step.product_id = chat_steps.product_id
        and next_step.step_order = chat_steps.step_order + 1
      limit 1
    )
  )
where product_id = '00000000-0000-4000-8000-000000000001';

insert into public.admin_settings (key, value)
values (
  'payment_gateway',
  jsonb_build_object(
    'activeProvider', 'mock',
    'mode', 'production',
    'webhookUrl', 'https://chat-sales.vercel.app/api/payments/webhook',
    'qrImageApiUrl', 'https://api.qrserver.com/v1/create-qr-code/',
    'pushinpayApiKey', '',
    'amplopayPublicKey', '',
    'amplopaySecretKey', ''
  )
)
on conflict (key) do nothing;
