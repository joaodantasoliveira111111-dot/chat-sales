# Preocupações do Código (Concerns)

**Data:** 2026-05-02

## Segurança
- **Resolvido:** As credenciais de gateway (AmploPay, PushinPay) costumavam ser codificadas diretamente em `.env.local`, o que quebrava a arquitetura multi-inquilino e expunha segredos. Elas foram migradas com sucesso para a tabela `admin_settings` no Supabase.
- **Preocupação:** As políticas RLS em `admin_settings` devem aplicar estritamente a regra `auth.uid() = user_id` para impedir que os usuários extraiam as chaves de API de outros. Atualmente implementado, mas requer testes rigorosos em futuras migrações de banco de dados.

## Dívida Técnica & Arquitetura
- **Transição CSS:** O projeto está no meio de uma transição de classes inline do Tailwind CSS para uma interface estruturada Neumórfica utilizando variáveis CSS (`globals.css`) e tags `style={{}}` dentro dos componentes principais de UI. A maioria dos arquivos foi migrada (`AdminLayout`, `Cards`, `Button`, `Input`, `PagesContent`, `DashboardContent`, `FlowsContent`, etc.), mas algumas classes Tailwind residuais podem permanecer em componentes periféricos mais antigos.
- **Tratamento de Erros:** Falhas em Webhooks ou falhas na alocação de estoque (ex: ao vender um produto sem estoque) atualmente geram logs no console e retornam erros HTTP básicos. Uma "Dead-Letter Queue" (DLQ) robusta ou um mecanismo de repetição (retry) para webhooks está ausente.

## Áreas Frágeis
- **Editor React Flow:** A construção da árvore de lógica conversacional (`src/app/admin/flows/[id]`) usando o React Flow pode se tornar extremamente complexa ao gerenciar arestas e dados de nós customizados. Modificar esquemas de nós requer adesão estrita aos tipos `FlowNodeConfig`, caso contrário a renderização do gráfico irá quebrar.
- **Correspondência de Provedor de Webhook:** O `webhook/route.ts` depende do Gateway externo enviando o User ID de volta como um Parâmetro de Consulta (Query Parameter) (`?u=123`). Se um gateway descartar parâmetros de consulta no redirecionamento ou no disparo do webhook, o sistema falhará em identificar o inquilino e descartará o evento de pagamento.
