insert into public.products (
  id, name, slug, description, price, is_active, delivery_type, support_text, default_instructions
) values (
  '00000000-0000-4000-8000-000000000001',
  'CapCut Pro - Acesso Digital',
  'capcut-pro',
  'Acesso digital autorizado para uso pessoal, com entrega automatizada apos confirmacao do pagamento.',
  27.90,
  true,
  'digital_credential',
  'Suporte disponivel em caso de duvida ou problema de acesso.',
  '1. Abra o CapCut.
2. Faça login com os dados acima.
3. Não altere e-mail, senha ou dados de segurança.
4. Use conforme as orientações recebidas.
5. Se tiver dificuldade, clique no botão de suporte.'
) on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  is_active = excluded.is_active,
  delivery_type = excluded.delivery_type,
  support_text = excluded.support_text,
  default_instructions = excluded.default_instructions;

insert into public.chat_steps (
  id, product_id, step_order, message_text, primary_button_text, primary_button_action,
  secondary_button_text, secondary_button_action, delay_ms, is_active
) values
('00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001',1,'Você usa CapCut e vive encontrando efeito, template ou recurso bom… mas ele está bloqueado no Pro?','Sim, acontece comigo','next_step',null,null,550,true),
('00000000-0000-4000-8000-000000000102','00000000-0000-4000-8000-000000000001',2,'É bem chato.

Você grava o vídeo, começa a editar, tenta deixar mais bonito para postar no Instagram, TikTok ou Reels… e justamente o recurso que faria diferença aparece como Pro.','Quero resolver isso','next_step',null,null,650,true),
('00000000-0000-4000-8000-000000000103','00000000-0000-4000-8000-000000000001',3,'Com o acesso CapCut Pro, você edita com mais liberdade e consegue usar mais recursos para deixar seus vídeos com aparência melhor, sem ficar preso só no básico.','Como funciona?','next_step',null,null,650,true),
('00000000-0000-4000-8000-000000000104','00000000-0000-4000-8000-000000000001',4,'Funciona de forma simples:

Você compra, faz o pagamento e, assim que for confirmado, recebe os dados e instruções de acesso aqui mesmo na tela.

Sem complicação.','Entendi','next_step',null,null,700,true),
('00000000-0000-4000-8000-000000000105','00000000-0000-4000-8000-000000000001',5,'Serve para quem cria vídeos para Instagram, TikTok, Reels, anúncios, status, loja, trabalho ou conteúdo próprio.

Se você já usa CapCut e quer editar melhor pagando menos, faz sentido para você.','Serve para mim','next_step',null,null,650,true),
('00000000-0000-4000-8000-000000000106','00000000-0000-4000-8000-000000000001',6,'Hoje você pode adquirir o acesso CapCut Pro por:

R$ 27,90

Entrega digital após confirmação do pagamento.
Você recebe os dados de acesso aqui mesmo, dentro desta conversa.
Suporte em caso de dúvida ou problema de acesso.','Comprar agora','open_checkout','Tenho dúvidas','open_faq',750,true)
on conflict (product_id, step_order) do update set
  message_text = excluded.message_text,
  primary_button_text = excluded.primary_button_text,
  primary_button_action = excluded.primary_button_action,
  secondary_button_text = excluded.secondary_button_text,
  secondary_button_action = excluded.secondary_button_action,
  delay_ms = excluded.delay_ms,
  is_active = excluded.is_active;

insert into public.faqs (id, product_id, question, answer, "order", is_active) values
('00000000-0000-4000-8000-000000000201','00000000-0000-4000-8000-000000000001','O que eu recebo?','Você recebe os dados de acesso e as instruções para usar.',1,true),
('00000000-0000-4000-8000-000000000202','00000000-0000-4000-8000-000000000001','A entrega é rápida?','Sim. Após a confirmação do pagamento, a entrega é feita de forma digital dentro desta própria conversa.',2,true),
('00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000001','Tem suporte?','Sim. Se tiver algum problema de acesso, você pode chamar o suporte.',3,true),
('00000000-0000-4000-8000-000000000204','00000000-0000-4000-8000-000000000001','É para uso pessoal?','Sim. Essa oferta é para quem quer usar o CapCut Pro nos próprios vídeos.',4,true)
on conflict (id) do update set
  question = excluded.question,
  answer = excluded.answer,
  "order" = excluded."order",
  is_active = excluded.is_active;

insert into public.inventory_items (
  product_id, title, access_email, access_password, access_url, extra_instructions, status
) values (
  '00000000-0000-4000-8000-000000000001',
  'CapCut Pro - Demo',
  'demo.capcut@example.com',
  'SenhaDemo123',
  'https://www.capcut.com',
  'Entregavel demonstrativo para testar o fluxo. Substitua por um acesso autorizado real no painel.',
  'available'
) on conflict do nothing;
