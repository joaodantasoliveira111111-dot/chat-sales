# AcessoPro

Microsaas para venda automatizada de produtos digitais legitimos, acessos autorizados, licencas e entregaveis permitidos pelo fornecedor/proprietario.

O MVP inicial vende **CapCut Pro - Acesso Digital** com funil em chat, checkout Pix mock, confirmacao via admin/webhook e entrega automatica no proprio chat.

## Stack

- Next.js App Router, React e TypeScript
- Tailwind CSS
- Supabase/PostgreSQL e Supabase Auth
- API Routes do Next.js
- Vercel
- Camada generica `src/lib/payment/paymentProvider.ts`

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

Configure na Vercel:

```bash
PAYMENT_PROVIDER=pixup
PAYMENT_API_URL=
PAYMENT_API_KEY=
PAYMENT_SECRET=
WEBHOOK_SECRET=
PAYMENT_WEBHOOK_URL=https://seu-dominio.com/api/payments/webhook
```

Depois ajuste o payload de criacao/consulta conforme PixUp, SuitPay, HorsePay, Mercado Pago ou outro gateway escolhido.

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
