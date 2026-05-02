# Tecnologias do Código (Stack)

**Data:** 2026-05-02

## Tecnologias Principais
- **Framework:** Next.js 16.2.4 (App Router)
- **Biblioteca:** React 19.2.4
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS v4, variáveis CSS customizadas para Neumorfismo (`src/app/globals.css`)
- **Gerenciamento de Estado:** Zustand (`zustand`), React Hooks
- **Validação de Formulários:** React Hook Form (`react-hook-form`), Zod (`zod`)

## Principais Dependências
- **Componentes de UI:** Primitivos Radix UI (`@radix-ui/react-*`), Lucide React (`lucide-react`)
- **Editor Visual de Fluxos:** React Flow (`@xyflow/react`, `reactflow`)
- **Banco de Dados/Autenticação:** Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Utilitários:** `date-fns`, `papaparse`, `qrcode`, `uuid`, `clsx`, `tailwind-merge`

## Arquitetura & Convenções
- **App Router:** `src/app/` abriga as rotas do Next.js.
- **Biblioteca de Componentes:** Sistema de design Neumórfico / Glassmorphism centralizado em `src/components/ui/` (`Cards.tsx`, `Button.tsx`, `Input.tsx`, `Modal.tsx`).
- **Acesso a Dados:** Clientes Supabase inicializados via `src/lib/supabase/client.ts` (browser) e `src/lib/supabase/server.ts` (servidor). Middleware presente em `src/lib/supabase/middleware.ts`.
