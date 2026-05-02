import type {
  ChatStep,
  Faq,
  Flow,
  FlowEdge,
  FlowNode,
  InventoryItem,
  PageAppearanceSettings,
  Product,
} from "@/lib/types";

export const defaultProduct: Product = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "CapCut Pro - Acesso Digital",
  slug: "capcut-pro",
  description:
    "Acesso digital autorizado para uso pessoal, com entrega automatizada apos confirmacao do pagamento.",
  price: 27.9,
  is_active: true,
  status: "active",
  delivery_type: "digital_credential",
  image_url: null,
  public_title: "CapCut Pro por menos",
  public_subtitle:
    "Acesso digital para quem edita vídeos no celular e quer usar mais recursos sem pagar caro.",
  support_text: "Suporte disponivel em caso de duvida ou problema de acesso.",
  default_instructions:
    "1. Abra o CapCut.\n2. Faça login com os dados acima.\n3. Não altere e-mail, senha ou dados de segurança.\n4. Use conforme as orientações recebidas.\n5. Se tiver dificuldade, clique no botão de suporte.",
};

export const defaultAppearance: PageAppearanceSettings = {
  publicOfferName: "CapCut Pro por menos",
  publicSubtitle:
    "Acesso digital para quem edita vídeos no celular e quer usar mais recursos sem pagar caro.",
  template: "dark_premium",
  avatarUrl: null,
  showHeader: true,
  showTopSupport: false,
  showMicroCredibility: true,
  microCredibilityText:
    "Entrega digital após pagamento • Suporte de acesso • Uso pessoal",
  primaryColor: "#00D1FF",
  secondaryColor: "#7B61FF",
  background: "#0B0F14",
  bubbleStyle: "rounded",
  buttonStyle: "gradient",
  font: "geist",
};

export const defaultFlow: Flow = {
  id: "00000000-0000-4000-8000-000000001001",
  name: "Funil CapCut Pro",
  slug: "capcut-pro",
  product_id: defaultProduct.id,
  theme_id: "dark_premium",
  status: "published",
  start_node_id: "00000000-0000-4000-8000-000000001101",
  published_at: "2026-05-01T00:00:00.000Z",
};

export const defaultFlowNodes: FlowNode[] = [
  {
    id: "00000000-0000-4000-8000-000000001101",
    flow_id: defaultFlow.id,
    type: "start",
    title: "Inicio",
    position_x: 80,
    position_y: 160,
    config: { name: "Inicio", next_node_id: "00000000-0000-4000-8000-000000001102" },
  },
  {
    id: "00000000-0000-4000-8000-000000001102",
    flow_id: defaultFlow.id,
    type: "button_message",
    title: "Dor direta",
    position_x: 390,
    position_y: 80,
    config: {
      message_text:
        "Você usa CapCut e vive encontrando efeito, template ou recurso bom… mas ele está bloqueado no Pro?",
      delay_ms: 500,
      show_typing: true,
      buttons: [
        {
          label: "Sim, acontece comigo",
          action_type: "go_to_node",
          target_node_id: "00000000-0000-4000-8000-000000001103",
        },
      ],
    },
  },
  {
    id: "00000000-0000-4000-8000-000000001103",
    flow_id: defaultFlow.id,
    type: "button_message",
    title: "Identificacao",
    position_x: 700,
    position_y: 80,
    config: {
      message_text:
        "É bem chato.\n\nVocê grava o vídeo, começa a editar, tenta deixar mais bonito para postar no Instagram, TikTok ou Reels… e justamente o recurso que faria diferença aparece como Pro.",
      delay_ms: 650,
      show_typing: true,
      buttons: [
        {
          label: "Quero resolver isso",
          action_type: "go_to_node",
          target_node_id: "00000000-0000-4000-8000-000000001104",
        },
      ],
    },
  },
  {
    id: "00000000-0000-4000-8000-000000001104",
    flow_id: defaultFlow.id,
    type: "button_message",
    title: "Solucao",
    position_x: 1010,
    position_y: 80,
    config: {
      message_text:
        "Com o acesso CapCut Pro, você edita com mais liberdade e consegue usar mais recursos para deixar seus vídeos com aparência melhor, sem ficar preso só no básico.",
      delay_ms: 650,
      show_typing: true,
      buttons: [
        {
          label: "Como funciona?",
          action_type: "go_to_node",
          target_node_id: "00000000-0000-4000-8000-000000001105",
        },
      ],
    },
  },
  {
    id: "00000000-0000-4000-8000-000000001105",
    flow_id: defaultFlow.id,
    type: "button_message",
    title: "Como funciona",
    position_x: 1320,
    position_y: 80,
    config: {
      message_text:
        "Funciona de forma simples:\n\nVocê compra, faz o pagamento e, assim que for confirmado, recebe os dados e instruções de acesso aqui mesmo na tela.\n\nSem complicação.",
      delay_ms: 700,
      show_typing: true,
      buttons: [
        {
          label: "Entendi",
          action_type: "go_to_node",
          target_node_id: "00000000-0000-4000-8000-000000001106",
        },
      ],
    },
  },
  {
    id: "00000000-0000-4000-8000-000000001106",
    flow_id: defaultFlow.id,
    type: "button_message",
    title: "Para quem e",
    position_x: 1630,
    position_y: 80,
    config: {
      message_text:
        "Serve para quem cria vídeos para Instagram, TikTok, Reels, anúncios, status, loja, trabalho ou conteúdo próprio.\n\nSe você já usa CapCut e quer editar melhor pagando menos, faz sentido para você.",
      delay_ms: 650,
      show_typing: true,
      buttons: [
        {
          label: "Serve para mim",
          action_type: "go_to_node",
          target_node_id: "00000000-0000-4000-8000-000000001107",
        },
      ],
    },
  },
  {
    id: "00000000-0000-4000-8000-000000001107",
    flow_id: defaultFlow.id,
    type: "button_message",
    title: "Oferta",
    position_x: 1940,
    position_y: 80,
    config: {
      message_text:
        "Hoje você pode adquirir o acesso CapCut Pro por:\n\nR$ 27,90\n\nEntrega digital após confirmação do pagamento.\nVocê recebe os dados de acesso aqui mesmo, dentro desta conversa.\nSuporte em caso de dúvida ou problema de acesso.",
      delay_ms: 750,
      show_typing: true,
      buttons: [
        {
          label: "Comprar agora",
          action_type: "open_checkout",
          target_node_id: "00000000-0000-4000-8000-000000001109",
        },
        {
          label: "Tenho dúvidas",
          action_type: "open_faq",
          target_node_id: "00000000-0000-4000-8000-000000001108",
        },
      ],
    },
  },
  {
    id: "00000000-0000-4000-8000-000000001108",
    flow_id: defaultFlow.id,
    type: "faq",
    title: "FAQ",
    position_x: 2250,
    position_y: 300,
    config: {
      faqs: [
        {
          question: "O que eu recebo?",
          answer: "Você recebe os dados de acesso e as instruções para usar.",
        },
        {
          question: "A entrega é rápida?",
          answer:
            "Sim. Após a confirmação do pagamento, a entrega é feita de forma digital dentro desta própria conversa.",
        },
        {
          question: "Tem suporte?",
          answer: "Sim. Se tiver algum problema de acesso, você pode chamar o suporte.",
        },
        {
          question: "É para uso pessoal?",
          answer: "Sim. Essa oferta é para quem quer usar o CapCut Pro nos próprios vídeos.",
        },
      ],
      final_button_text: "Comprar CapCut Pro por R$ 27,90",
      final_button_target_node_id: "00000000-0000-4000-8000-000000001109",
    },
  },
  {
    id: "00000000-0000-4000-8000-000000001109",
    flow_id: defaultFlow.id,
    type: "checkout",
    title: "Checkout",
    position_x: 2250,
    position_y: 80,
    config: {
      product_id: defaultProduct.id,
      required_fields: ["name", "email", "whatsapp"],
      summary_title: "Resumo da compra",
      summary_text:
        "Após a confirmação do pagamento, seus dados de acesso serão liberados aqui mesmo na tela.",
      button_text: "Gerar Pix",
      next_node_id: "00000000-0000-4000-8000-000000001110",
    },
  },
  {
    id: "00000000-0000-4000-8000-000000001110",
    flow_id: defaultFlow.id,
    type: "pix_payment",
    title: "Pix",
    position_x: 2560,
    position_y: 80,
    config: {
      payment_provider: "mock",
      expiration_minutes: 30,
      success_target_node_id: "00000000-0000-4000-8000-000000001111",
      pending_text:
        "Pix gerado.\n\nCopie o código Pix abaixo ou escaneie o QR Code. Assim que o pagamento for confirmado, seu acesso será liberado automaticamente aqui nesta conversa.",
      button_paid_text: "Já paguei",
    },
  },
  {
    id: "00000000-0000-4000-8000-000000001111",
    flow_id: defaultFlow.id,
    type: "delivery",
    title: "Entrega",
    position_x: 2870,
    position_y: 80,
    config: {
      product_id: defaultProduct.id,
      support_button_text: "Preciso de suporte",
      buy_again_button_text: "Comprar outro acesso",
    },
  },
];

export const defaultFlowEdges: FlowEdge[] = [
  ["00000000-0000-4000-8000-000000001101", "next", "00000000-0000-4000-8000-000000001102"],
  ["00000000-0000-4000-8000-000000001102", "button:0", "00000000-0000-4000-8000-000000001103"],
  ["00000000-0000-4000-8000-000000001103", "button:0", "00000000-0000-4000-8000-000000001104"],
  ["00000000-0000-4000-8000-000000001104", "button:0", "00000000-0000-4000-8000-000000001105"],
  ["00000000-0000-4000-8000-000000001105", "button:0", "00000000-0000-4000-8000-000000001106"],
  ["00000000-0000-4000-8000-000000001106", "button:0", "00000000-0000-4000-8000-000000001107"],
  ["00000000-0000-4000-8000-000000001107", "button:0", "00000000-0000-4000-8000-000000001109"],
  ["00000000-0000-4000-8000-000000001107", "button:1", "00000000-0000-4000-8000-000000001108"],
  ["00000000-0000-4000-8000-000000001108", "final", "00000000-0000-4000-8000-000000001109"],
  ["00000000-0000-4000-8000-000000001109", "next", "00000000-0000-4000-8000-000000001110"],
  ["00000000-0000-4000-8000-000000001110", "success", "00000000-0000-4000-8000-000000001111"],
].map(([source_node_id, source_handle, target_node_id], index) => ({
  id: `00000000-0000-4000-8000-0000000012${String(index).padStart(2, "0")}`,
  flow_id: defaultFlow.id,
  source_node_id,
  source_handle,
  target_node_id,
  condition: null,
}));

export const defaultChatSteps: ChatStep[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    product_id: defaultProduct.id,
    step_order: 1,
    message_text:
      "Você usa CapCut e vive encontrando efeito, template ou recurso bom… mas ele está bloqueado no Pro?",
    media_type: "none",
    media_url: null,
    media_alt: null,
    node_id: "dor-direta",
    position_x: 80,
    position_y: 80,
    next_step_id: "00000000-0000-4000-8000-000000000102",
    secondary_step_id: null,
    primary_button_text: "Sim, acontece comigo",
    primary_button_action: "next_step",
    secondary_button_text: null,
    secondary_button_action: null,
    delay_ms: 550,
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    product_id: defaultProduct.id,
    step_order: 2,
    message_text:
      "É bem chato.\n\nVocê grava o vídeo, começa a editar, tenta deixar mais bonito para postar no Instagram, TikTok ou Reels… e justamente o recurso que faria diferença aparece como Pro.",
    media_type: "none",
    media_url: null,
    media_alt: null,
    node_id: "identificacao",
    position_x: 380,
    position_y: 80,
    next_step_id: "00000000-0000-4000-8000-000000000103",
    secondary_step_id: null,
    primary_button_text: "Quero resolver isso",
    primary_button_action: "next_step",
    secondary_button_text: null,
    secondary_button_action: null,
    delay_ms: 650,
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    product_id: defaultProduct.id,
    step_order: 3,
    message_text:
      "Com o acesso CapCut Pro, você edita com mais liberdade e consegue usar mais recursos para deixar seus vídeos com aparência melhor, sem ficar preso só no básico.",
    media_type: "none",
    media_url: null,
    media_alt: null,
    node_id: "solucao",
    position_x: 680,
    position_y: 80,
    next_step_id: "00000000-0000-4000-8000-000000000104",
    secondary_step_id: null,
    primary_button_text: "Como funciona?",
    primary_button_action: "next_step",
    secondary_button_text: null,
    secondary_button_action: null,
    delay_ms: 650,
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    product_id: defaultProduct.id,
    step_order: 4,
    message_text:
      "Funciona de forma simples:\n\nVocê compra, faz o pagamento e, assim que for confirmado, recebe os dados e instruções de acesso aqui mesmo na tela.\n\nSem complicação.",
    media_type: "none",
    media_url: null,
    media_alt: null,
    node_id: "explicacao",
    position_x: 980,
    position_y: 80,
    next_step_id: "00000000-0000-4000-8000-000000000105",
    secondary_step_id: null,
    primary_button_text: "Entendi",
    primary_button_action: "next_step",
    secondary_button_text: null,
    secondary_button_action: null,
    delay_ms: 700,
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000105",
    product_id: defaultProduct.id,
    step_order: 5,
    message_text:
      "Serve para quem cria vídeos para Instagram, TikTok, Reels, anúncios, status, loja, trabalho ou conteúdo próprio.\n\nSe você já usa CapCut e quer editar melhor pagando menos, faz sentido para você.",
    media_type: "none",
    media_url: null,
    media_alt: null,
    node_id: "para-quem-e",
    position_x: 1280,
    position_y: 80,
    next_step_id: "00000000-0000-4000-8000-000000000106",
    secondary_step_id: null,
    primary_button_text: "Serve para mim",
    primary_button_action: "next_step",
    secondary_button_text: null,
    secondary_button_action: null,
    delay_ms: 650,
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000106",
    product_id: defaultProduct.id,
    step_order: 6,
    message_text:
      "Hoje você pode adquirir o acesso CapCut Pro por:\n\nR$ 27,90\n\nEntrega digital após confirmação do pagamento.\nVocê recebe os dados de acesso aqui mesmo, dentro desta conversa.\nSuporte em caso de dúvida ou problema de acesso.",
    media_type: "none",
    media_url: null,
    media_alt: null,
    node_id: "oferta",
    position_x: 1580,
    position_y: 80,
    next_step_id: null,
    secondary_step_id: null,
    primary_button_text: "Comprar agora",
    primary_button_action: "open_checkout",
    secondary_button_text: "Tenho dúvidas",
    secondary_button_action: "open_faq",
    delay_ms: 750,
    is_active: true,
  },
];

export const defaultFaqs: Faq[] = [
  {
    id: "00000000-0000-4000-8000-000000000201",
    product_id: defaultProduct.id,
    question: "O que eu recebo?",
    answer: "Você recebe os dados de acesso e as instruções para usar.",
    order: 1,
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000202",
    product_id: defaultProduct.id,
    question: "A entrega é rápida?",
    answer:
      "Sim. Após a confirmação do pagamento, a entrega é feita de forma digital dentro desta própria conversa.",
    order: 2,
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000203",
    product_id: defaultProduct.id,
    question: "Tem suporte?",
    answer: "Sim. Se tiver algum problema de acesso, você pode chamar o suporte.",
    order: 3,
    is_active: true,
  },
  {
    id: "00000000-0000-4000-8000-000000000204",
    product_id: defaultProduct.id,
    question: "É para uso pessoal?",
    answer: "Sim. Essa oferta é para quem quer usar o CapCut Pro nos próprios vídeos.",
    order: 4,
    is_active: true,
  },
];

export const defaultInventoryItem: InventoryItem = {
  id: "00000000-0000-4000-8000-000000000301",
  product_id: defaultProduct.id,
  title: "CapCut Pro - Demo",
  access_email: "demo.capcut@example.com",
  access_password: "SenhaDemo123",
  access_url: "https://www.capcut.com",
  extra_instructions:
    "Entregavel demonstrativo para testar o fluxo. Substitua por um acesso autorizado real no painel.",
  status: "available",
  assigned_order_id: null,
  delivered_at: null,
};
