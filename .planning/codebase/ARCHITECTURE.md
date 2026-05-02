# Arquitetura & Padrões

**Data:** 2026-05-02

## Arquitetura de Alto Nível
O projeto é um SaaS B2B multi-inquilino (multi-tenant) construído com Next.js App Router (React Server Components + Client Components) e Supabase como backend-as-a-service. Ele permite que os usuários construam funis de vendas conversacionais (fluxos), vinculem-nos a produtos digitais e publiquem interfaces de chat voltadas ao público que se integram diretamente a gateways de pagamento para entrega autônoma.

## Principais Subsistemas

### 1. Painel Admin (`src/app/admin`)
- **Padrão:** Interface de dashboard com UI Neumórfica / Glassmorphism.
- **Roteamento:** Roteamento aninhado sob `/admin/` (Produtos, Fluxos, Páginas, Pedidos, Configurações, etc.).
- **Busca de Dados:** Híbrida. Buscas pesadas são feitas no Lado do Servidor (`page.tsx`), e repassadas como propriedades iniciais para os Client Components (`Content.tsx`), que gerenciam o estado local (criação, exclusão, filtragem) e mutam o banco de dados via clientes `@supabase/ssr` do browser ou rotas de API.

### 2. Construtor de Fluxos (`src/app/admin/flows/[id]`)
- **Padrão:** Editor visual baseado em nós usando React Flow.
- **Gerenciamento de Estado:** Lógica customizada usando Zustand ou State React pesado dependendo da complexidade do estado do gráfico (nós, arestas).

### 3. Páginas Públicas & Motor de Chat (`src/app/p/[slug]`)
- **Padrão:** Rotas dinâmicas voltadas ao público servindo a interface conversacional.
- **Renderizador:** O `PublicChatPage.tsx` atua como um interpretador/executor para o gráfico de Fluxo, executando nós sequencialmente (ex: atrasos de digitação, balões de chat, botões, checkouts) e mantendo o estado.
- **Temas:** A UI do chat suporta temas CSS totalmente personalizados via `theme_id` (ex: WhatsApp Classic, Instagram DM, Neumorphic Dark), gerenciados na tabela `themes`.

### 4. Pagamentos & Entrega (`src/app/api/payments/`, `src/app/api/orders/`)
- **Padrão:** Injeção de Gateway Abstraída.
- Webhooks recebem eventos, leem o parâmetro `?u=userId`, carregam as configurações `admin_settings` desse usuário específico do Supabase para recuperar as credenciais encriptadas do gateway, instanciam o `PaymentProvider` correto, processam o pagamento e disparam automaticamente a entrega digital (arquivos, credenciais, licenças).
