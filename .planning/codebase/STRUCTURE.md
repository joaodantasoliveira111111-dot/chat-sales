# Estrutura de Diretórios

**Data:** 2026-05-02

## Layout de Alto Nível
```text
chatfy/
├── src/
│   ├── app/                # Next.js App Router (Rotas, Páginas, APIs)
│   ├── components/         # Componentes React reutilizáveis
│   ├── lib/                # Utilitários, serviços, wrappers de API
│   └── types/              # Interfaces TypeScript e tipos globais
├── supabase/
│   └── migrations/         # Migrações de esquema SQL do Supabase
├── .planning/              # Pasta interna de planejamento GSD
├── package.json
└── tailwind.config.ts
```

## Módulos Principais

### `src/app/`
- **`/admin`**: O painel (dashboard) SaaS B2B. Contém sub-rotas para `/products`, `/pages`, `/flows`, `/orders`, `/inventory`, e `/settings`. Frequentemente dividido em um Server Component (`page.tsx`) e Client Component (`*Content.tsx`).
- **`/p/[slug]`**: Rotas dinâmicas voltadas ao público que renderizam o funil de vendas conversacional para os usuários finais.
- **`/api`**: Endpoints de backend. Inclui:
  - `/payments/`: Geração de checkout e manipuladores de webhooks.
  - `/orders/`: Verificação de status de pedidos e lógica de entrega manual.
  - `/setup-themes/`: Endpoint de preenchimento (seed) para temas de UI.

### `src/components/`
- **`/ui`**: Componentes base de UI Neumórfica (`Button.tsx`, `Cards.tsx`, `Input.tsx`, `Modal.tsx`, `Toast.tsx`).
- **`/admin`**: Wrappers de layout do dashboard e navegação lateral.
- **`/chat`**: Componentes do motor para páginas públicas (`PublicChatPage.tsx`, `ChatMessageBubble.tsx`, `CheckoutCard.tsx`, `PixPaymentCard.tsx`).
- **`/flow-editor`**: Canvas do React Flow e nós customizados para construir a lógica conversacional.

### `src/lib/`
- **`/supabase`**: Contém cliente SSR (`server.ts`), cliente de browser (`client.ts`), e middleware.
- **`/payment`**: Fábrica de abstração `paymentProvider.ts` e provedores reais como `amploPayProvider.ts` e `pushinPayProvider.ts`.
- **`/utils`**: `utils.ts` para formatação simples, slugificação e manipulação de strings.
