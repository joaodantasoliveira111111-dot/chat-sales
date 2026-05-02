# Convenções de Código

**Data:** 2026-05-02

## Design System & Estilização
- **Neumorfismo/Glassmorphism:** Toda a interface (UI) do dashboard foi reconstruída utilizando uma linguagem de design neumórfica.
- **Variáveis:** As cores principais e as constantes de layout são armazenadas em `src/app/globals.css` via variáveis CSS (`--primary`, `--bg-base`, etc.).
- **Implementação:** Componentes de UI dentro de `src/components/ui/` utilizam tags `style={{}}` inline com essas variáveis CSS para garantir consistência, evitando a natureza frágil de longas strings de classes do Tailwind sempre que possível, especialmente em componentes altamente customizados como `Cards` ou `Inputs`.

## Padrões React & Next.js
- **Server vs Client Components:** Regras padrões do Next.js App Router são aplicadas. Páginas que buscam dados pesados do Supabase são marcadas como `async` (Server Components) e passam os dados para os `*Content.tsx` (Client Components) interativos.
- **Diretivas de Cliente:** Arquivos que usam hooks do React (`useState`, `useEffect`, `useRouter`, etc.) devem iniciar com `'use client'`.

## Banco de Dados & Autenticação (Supabase)
- **Políticas de RLS:** A Segurança em Nível de Linha (Row Level Security) do Supabase é amplamente utilizada. Consultas do lado do cliente DEVEM ser autenticadas.
- **Middleware:** O padrão `createAdminClient` é usado quando o servidor precisa contornar o RLS de forma segura (ex: dentro de webhooks). Caso contrário, os clientes com escopo de usuário (`createClient`) lidam com a autenticação padrão.

## Nomenclatura de Arquivos
- Componentes e Páginas usam `PascalCase.tsx`.
- Utilitários, bibliotecas e rotas de API usam `camelCase.ts` ou `kebab-case`.
