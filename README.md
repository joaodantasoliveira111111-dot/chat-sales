# Chatfy

Microsaas para criar paginas de venda em formato de conversa, com checkout Pix e entrega automatica de produtos digitais legitimos apos pagamento confirmado.

O MVP inicial vende **CapCut Pro - Acesso Digital** com fluxo visual, templates de chat, checkout Pix mock, confirmacao via admin/webhook e entrega automatica no proprio chat.

## Stack

- Next.js App Router, React e TypeScript
- Tailwind CSS
- Supabase/PostgreSQL e Supabase Auth
- API Routes do Next.js
- Vercel
- Camada generica `src/lib/payment/paymentProvider.ts`

## Novas areas Chatfy

- `/p/[slug]`: pagina publica por produto/fluxo publicado.
- `/admin/flows`: lista e cria fluxos visuais.
- `/admin/flows/[id]`: canvas com blocos conectados, drag manual, editor lateral e publicacao.
- `/admin/appearance`: templates Dark Premium, WhatsApp Inspired, Instagram DM e Minimal Chat.
- `/admin/settings/payments`: gateway ativo Mock, PushinPay ou AmploPay.

## Rodar local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Acesse `http://localhost:3000`.

Sem variaveis Supabase, o app usa um store mock em memoria para desenvolvimento. Para persistencia real, configure o Supabase.

## Configurar Supabase

1. Abra o projeto Supabase `CHAT-SALES`.
2. Rode `supabase/migrations/20260501190000_init_acessopro.sql` no SQL Editor.
3. Rode `supabase/seed.sql` no SQL Editor.
4. Crie um usuario admin em Supabase Auth.
5. Configure no `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PAYMENT_PROVIDER=mock
```

Use `SUPABASE_SERVICE_ROLE_KEY` apenas no backend/Vercel. Nunca exponha essa chave no navegador.

## Fluxo do comprador

1. Entra em `/` ou `/capcut-pro`.
2. Avanca pelas 6 mensagens do funil.
3. Clica em comprar.
4. Informa nome, e-mail e WhatsApp opcional.
5. Gera Pix mock.
6. Aguarda confirmacao.
7. Recebe o acesso dentro da conversa.

## Fluxo visual e midias

Em `/admin/chat-steps`, cada mensagem virou um nó visual:

- pode ter só texto
- pode ter só imagem/video
- pode ter texto + imagem/video
- o botão principal pode apontar para outro nó
- o botão secundário pode apontar para outro nó
- `position_x` e `position_y` organizam o canvas estilo n8n

Campos novos no banco:

- `media_type`: `none`, `image`, `video`
- `media_url`
- `media_alt`
- `node_id`
- `position_x`
- `position_y`
- `next_step_id`
- `secondary_step_id`

## Testar pagamento mock

1. Gere um Pix pela landing.
2. Acesse `/admin/orders`.
3. Clique em `Simular aprovado` no pedido pendente.
4. Volte ao chat e clique em `Ja paguei` ou aguarde a consulta automatica.
5. O chat exibira a entrega se houver estoque disponivel.

## Adicionar produto

Use `/admin/products` para cadastrar nome, slug, preco, status, tipo de entrega e instrucoes padrao.

## Adicionar entregaveis

Use `/admin/inventory`.

Importacao CSV aceita:

```csv
product_slug,email,password,access_url,extra_instructions
capcut-pro,acesso@example.com,Senha123,https://www.capcut.com,Use apenas conforme orientacoes.
```

## Gateway Pix real

O arquivo `src/lib/payment/paymentProvider.ts` centraliza a integracao:

- `createPixPayment(order)`
- `getPaymentStatus(paymentId)`
- `handleWebhook(payload)`

Gateways suportados:

- `mock`
- `pushinpay`
- `amplopay`

No painel `/admin/settings/payments` voce escolhe qual gateway fica ativo e salva as chaves reais de PushinPay ou AmploPay. Variaveis de ambiente ainda podem ser usadas como fallback tecnico, mas o fluxo recomendado e cadastrar as credenciais no proprio painel admin:

```bash
PAYMENT_PROVIDER=mock
PAYMENT_PROVIDER_MODE=production
WEBHOOK_SECRET=
PAYMENT_WEBHOOK_URL=https://seu-dominio.com/api/payments/webhook
QR_IMAGE_API_URL=https://api.qrserver.com/v1/create-qr-code/

PUSHINPAY_BASE_URL=https://api.pushinpay.com.br/api

AMPLOPAY_BASE_URL=https://app.amplopay.com/api/v1
```

O QR Code exibido no checkout e gerado por uma API de imagem a partir do Pix copia e cola, evitando depender do `qr_code_base64` retornado pelo gateway.

## Webhook

Endpoint:

```text
POST /api/payments/webhook
```

Quando o webhook normaliza status `paid`, o sistema:

1. Localiza o pedido por `gateway_payment_id`.
2. Atualiza o pedido para `paid`.
3. Chama `deliverDigitalItem(orderId)`.
4. Reserva/entrega um item disponivel com update condicional.
5. Cria uma linha em `deliveries`.
6. Marca o pedido como `delivered`.

Se nao houver estoque, o pedido vira `paid_pending_stock`.

## Endpoints principais

- `POST /api/payments/create`
- `POST /api/payments/webhook`
- `GET /api/orders/[id]/status`
- `GET /api/orders/[id]/delivery`
- `POST /api/admin/orders/[id]/simulate-payment`

## Deploy Vercel

1. Crie o repositorio GitHub.
2. Importe o repo na Vercel.
3. Configure as variaveis de ambiente.
4. Deploy.

O app esta pronto para Git integration da Vercel. O build local deve passar com:

```bash
npm run build
```
