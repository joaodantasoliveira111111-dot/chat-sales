# Estratégia de Testes

**Data:** 2026-05-02

## Estado Atual
- O projeto atualmente não possui uma suíte formalizada de testes automatizados (ex: Jest, Cypress, Playwright).
- Os testes são realizados manualmente através da interação com a interface (UI).

## Simulação de Pagamento & Entrega
- Existe um "Modo Mock" embutido para testar o caminho crítico dos pagamentos.
- Dentro do Painel Admin -> Pedidos (`OrdersContent.tsx`), os administradores podem clicar em "Simular Pagamento Aprovado" em qualquer pedido pendente.
- Isso aciona o endpoint `/api/orders/[id]/manual-delivery`, contornando os Webhooks externos do Gateway, e dispara diretamente a lógica de processamento e entrega para garantir que a atribuição de estoque e a notificação ao cliente funcionem corretamente durante o desenvolvimento.

## Próximos Passos
- Implementar o Playwright para testes End-to-End (E2E) do funil conversacional público (`/p/[slug]`) para garantir que fluxos de alta conversão nunca quebrem.
- Implementar o Jest para testes unitários no `paymentProvider.ts` para garantir que as credenciais da API e as assinaturas sejam validadas com precisão.
