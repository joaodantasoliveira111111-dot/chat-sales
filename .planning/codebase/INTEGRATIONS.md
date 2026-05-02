# Integrações & Serviços Externos

**Data:** 2026-05-02

## Banco de Dados & Autenticação
- **Provedor:** Supabase
- **Implementação:** 
  - Utiliza `@supabase/ssr` para autenticação no lado do servidor e busca de dados.
  - Expõe `createClient()` (browser) e `createAdminClient()` (servidor/middleware).
  - Estruturas de dados principais (Produtos, Fluxos, Nós/Arestas de Fluxo, Temas, Pedidos, Entregas, Configurações de Admin) são gerenciadas aqui.

## Gateways de Pagamento
- **Arquitetura:** Abstraída via `src/lib/payment/paymentProvider.ts`
- **Provedores:**
  - **PushinPay:** Gerenciado em `pushinPayProvider.ts`
  - **AmploPay:** Gerenciado em `amploPayProvider.ts`
- **Isolamento de Tenant (Multi-inquilino):** As credenciais não são armazenadas em `.env.local`. Elas são armazenadas na tabela do Supabase `admin_settings` para cada usuário (`userId`), e instanciadas dinamicamente nas rotas de API com base no inquilino (dono do produto).

## Análise & Rastreamento (Analytics)
- **Provedor:** Meta Pixel (Facebook Pixel)
- **Implementação:** Lógica abstraída (`src/lib/analytics/`) que permite a inserção dinâmica de eventos de rastreamento do Meta Pixel após ações de pagamento bem-sucedidas (ex: disparar `Purchase` no webhook/entrega).

## Implantação (Deployment)
- **Plataforma:** Vercel (presumido com base no uso do Next.js e logs anteriores)
