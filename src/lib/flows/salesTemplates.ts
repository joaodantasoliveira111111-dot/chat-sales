import { FlowEdge, FlowNode, NodeType, DeliveryType } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export type SalesTemplateId =
  | 'account_credentials'
  | 'digital_product'
  | 'community'
  | 'course'
  | 'mentorship'
  | 'local_service'
  | 'scheduling'
  | 'quick_pix'

export interface SalesTemplateDefinition {
  id: SalesTemplateId
  name: string
  description: string
  suggestedDeliveryType: DeliveryType
}

export interface BuildSalesTemplateParams {
  templateId: SalesTemplateId
  userId: string
  flowId: string
  productId?: string | null
  deliveryType?: DeliveryType
  supportWhatsapp?: string
  gateway?: string
  visualTemplate?: string
}

interface TemplateStep {
  key: string
  type: NodeType
  title: string
  config: Record<string, unknown>
  x?: number
  y?: number
}

export const salesTemplates: SalesTemplateDefinition[] = [
  {
    id: 'account_credentials',
    name: 'Conta com login e senha',
    description: 'Acesso licenciado com estoque, Pix e entrega automatica de credenciais.',
    suggestedDeliveryType: 'account_credentials',
  },
  {
    id: 'digital_product',
    name: 'Produto digital',
    description: 'E-book, pack, arquivo, prompts, planilha ou material pronto para baixar.',
    suggestedDeliveryType: 'digital_file',
  },
  {
    id: 'community',
    name: 'Comunidade',
    description: 'Grupo VIP, canal, clube de membros ou comunidade fechada.',
    suggestedDeliveryType: 'community_link',
  },
  {
    id: 'course',
    name: 'Curso',
    description: 'Curso gravado, aula unica, mini curso ou area de membros.',
    suggestedDeliveryType: 'course',
  },
  {
    id: 'mentorship',
    name: 'Mentoria',
    description: 'Mentoria, consultoria, diagnostico ou acompanhamento manual.',
    suggestedDeliveryType: 'manual_access',
  },
  {
    id: 'local_service',
    name: 'Servico local',
    description: 'Estetica, clinica, assistencia, loja fisica, delivery ou orcamento.',
    suggestedDeliveryType: 'manual_access',
  },
  {
    id: 'scheduling',
    name: 'Agendamento',
    description: 'Consulta, avaliacao, reuniao, visita ou diagnostico comercial.',
    suggestedDeliveryType: 'manual_access',
  },
  {
    id: 'quick_pix',
    name: 'Oferta direta com Pix rapido',
    description: 'Venda simples, barata e de impulso com pagamento e entrega no chat.',
    suggestedDeliveryType: 'custom_message',
  },
]

export function getSalesTemplate(id: SalesTemplateId) {
  return salesTemplates.find(template => template.id === id) || salesTemplates[0]
}

export function buildSalesTemplateFlow(params: BuildSalesTemplateParams): {
  nodes: Omit<FlowNode, 'created_at' | 'updated_at'>[]
  edges: Omit<FlowEdge, 'created_at'>[]
} {
  const template = getSalesTemplate(params.templateId)
  const deliveryType = params.deliveryType || template.suggestedDeliveryType
  const supportWhatsapp = params.supportWhatsapp || '{{system.support_whatsapp}}'
  const productId = params.productId || null
  const steps = getTemplateSteps(params.templateId, deliveryType, productId, supportWhatsapp)
  const ids = Object.fromEntries(steps.map(step => [step.key, uuidv4()]))

  const nodes = steps.map((step, index) => ({
    id: ids[step.key],
    user_id: params.userId,
    flow_id: params.flowId,
    type: step.type,
    title: step.title,
    position_x: step.x ?? (index % 2 === 0 ? 120 : 520),
    position_y: step.y ?? 80 + index * 150,
    config: {
      ...step.config,
      sales_template_id: params.templateId,
      visual_template: params.visualTemplate || 'whatsapp',
      payment_gateway: params.gateway || 'default',
      system_support_whatsapp: supportWhatsapp,
    },
  }))

  const edges = steps.slice(0, -1).map((step, index) => {
    const next = steps[index + 1]
    return {
      id: uuidv4(),
      user_id: params.userId,
      flow_id: params.flowId,
      source_node_id: ids[step.key],
      source_handle: defaultSourceHandle(step),
      target_node_id: ids[next.key],
      target_handle: 'top-target',
      condition: null,
    }
  })

  return { nodes, edges }
}

function defaultSourceHandle(step: TemplateStep) {
  if (step.type === 'product_plan' || step.type === 'quick_reply' || step.type === 'delivery') return 'right-source'
  return 'bottom-source'
}

function getTemplateSteps(
  templateId: SalesTemplateId,
  deliveryType: DeliveryType,
  productId: string | null,
  supportWhatsapp: string
): TemplateStep[] {
  const commonCapture = [
    capture('capture_name', 'Captura nome', 'Perfeito. Me diz seu nome completo.', 'lead.name', 'text'),
    capture('capture_email', 'Captura e-mail', 'Agora me envie seu melhor e-mail.', 'lead.email', 'email'),
    capture('capture_phone', 'Captura WhatsApp', 'E por último, seu WhatsApp com DDD.', 'lead.phone', 'phone'),
  ]

  const payment = [
    message('pre_pix', 'Pre-Pix', 'Fechado, {{lead.name}}.\n\nVou gerar seu Pix agora.'),
    node('payment', 'payment', 'Pagamento Pix', {
      product_id: productId,
      expiration_minutes: 30,
      pending_text: 'Pix gerado. Copie o codigo abaixo e pague no seu banco.',
      copy_button_text: 'Copiar codigo Pix',
    }),
    node('wait_payment', 'wait_payment', 'Aguardar pagamento', {
      polling_interval_seconds: 5,
      timeout_minutes: 30,
    }),
  ]

  const ending = (deliveryTemplate: string, extraSupport?: string) => [
    node('delivery', 'delivery', 'Entrega automatica', {
      product_id: productId,
      inventory_product_id: productId,
      delivery_type: deliveryType,
      delivery_template: deliveryTemplate,
      out_of_stock_message: 'Pagamento aprovado.\n\nNo momento estamos liberando seu acesso manualmente. Nossa equipe vai te chamar em alguns minutos.',
      inventory_status_after_delivery: 'delivered',
      button_text: '{{delivery.button_text}}',
    }),
    message('support', 'Suporte', extraSupport || `Se tiver qualquer dificuldade, chama o suporte por aqui:\n\n${supportWhatsapp}`),
    node('end', 'end', 'Fim', {
      final_message: 'Pronto.\n\nObrigado pela compra!',
      restart_button: false,
    }),
  ]

  if (templateId === 'digital_product') {
    return [
      node('start', 'start', 'Inicio', {}),
      message('welcome', 'Boas-vindas', 'Oi.\n\nVou te mostrar rapidinho como funciona o {{product.name}} e como voce recebe o acesso.'),
      message('pain', 'Dor', 'Se voce esta tentando resolver isso sozinho, provavelmente ja percebeu que perde tempo procurando modelo, copiando coisa solta e adaptando tudo na mao.'),
      message('solution', 'Solucao', 'O {{product.name}} ja vem pronto para voce usar, adaptar e aplicar sem comecar do zero.'),
      message('what_gets', 'O que recebe', 'Voce recebe:\n\n- Material pronto\n- Acesso imediato\n- Instrucoes de uso\n- Suporte caso precise'),
      message('offer', 'Oferta', 'O acesso ao {{product.name}} esta disponivel por:\n\nR$ {{product.price}}'),
      message('receive', 'Como recebe', 'Depois do Pix aprovado, o acesso e liberado automaticamente aqui no chat.'),
      ...commonCapture.slice(0, 2),
      ...payment,
      ...ending('Pagamento aprovado.\n\nAqui esta seu material:\n\n{{delivery.link}}\n\nClique e salve o acesso.', `Se tiver qualquer duvida para acessar ou baixar, me chama por aqui:\n\n${supportWhatsapp}`),
    ]
  }

  if (templateId === 'community') {
    return [
      node('start', 'start', 'Inicio', {}),
      message('welcome', 'Boas-vindas', 'Oi.\n\nVoce esta a poucos passos de entrar na {{community.name}}.'),
      message('pain', 'Dor', 'Muita gente tenta aprender ou conseguir resultado sozinha, mas acaba perdida, sem direcao e sem acesso ao que realmente importa.'),
      message('solution', 'Pertencimento', 'Na comunidade, voce entra em um ambiente fechado com conteudo, atualizacoes e suporte para seguir o caminho certo.'),
      message('inside', 'O que tem dentro', 'Dentro da comunidade voce encontra:\n\n- Conteudos exclusivos\n- Atualizacoes\n- Materiais de apoio\n- Avisos importantes\n- Suporte e orientacao'),
      planNode('plans', 'Escolha de acesso', 'Escolha seu acesso:', ['7 dias', '30 dias', 'Acesso completo'], productId),
      message('receive', 'Como recebe', 'Depois do pagamento, o link de entrada e liberado automaticamente aqui no chat.'),
      commonCapture[0],
      commonCapture[2],
      ...payment,
      ...ending('Pagamento aprovado.\n\nSeu acesso a comunidade foi liberado.\n\nClique abaixo para entrar:\n\n{{delivery.link}}', `Ao entrar, leia a mensagem fixada e salve o link de acesso.\n\nSuporte:\n${supportWhatsapp}`),
    ]
  }

  if (templateId === 'course') {
    return [
      node('start', 'start', 'Inicio', {}),
      message('welcome', 'Boas-vindas', 'Oi.\n\nVou te explicar como funciona o acesso ao curso {{product.name}}.'),
      message('pain', 'Dor', 'O maior problema de quem tenta aprender sozinho e perder tempo com conteudo solto, sem ordem e sem saber o que fazer primeiro.'),
      message('solution', 'Solucao', 'O curso foi organizado para voce seguir uma sequencia simples, direta e pratica.'),
      message('learns', 'O que aprende', 'Voce vai receber:\n\n- Aulas organizadas\n- Acesso ao conteudo\n- Instrucoes de uso\n- Suporte caso tenha dificuldade no acesso'),
      message('offer', 'Oferta', 'O acesso ao {{product.name}} esta disponivel por:\n\nR$ {{product.price}}'),
      message('access', 'Como acessar', 'Depois do Pix aprovado, o sistema libera o link de acesso aqui mesmo no chat.'),
      ...commonCapture.slice(0, 2),
      ...payment,
      ...ending('Pagamento aprovado.\n\nSeu acesso ao curso foi liberado:\n\nLink: {{delivery.link}}\nLogin: {{delivery.login}}\nSenha: {{delivery.password}}\n\nSalve essas informacoes.', `Se tiver dificuldade para acessar, chama o suporte:\n\n${supportWhatsapp}`),
    ]
  }

  if (templateId === 'mentorship') {
    return [
      node('start', 'start', 'Inicio', {}),
      message('welcome', 'Boas-vindas', 'Oi.\n\nVou te explicar como funciona a mentoria e ver a melhor opcao para voce.'),
      message('pain', 'Dor', 'Muitas vezes o problema nao e falta de esforco, e falta de direcao certa.'),
      message('solution', 'Solucao', 'Na mentoria, voce recebe uma orientacao direta, olhando para sua situacao e para o que precisa ser feito primeiro.'),
      message('how', 'Como funciona', 'Funciona assim:\n\n1. Voce escolhe o formato.\n2. Faz o pagamento.\n3. Recebe a confirmacao.\n4. Nossa equipe alinha o proximo passo.'),
      planNode('plans', 'Formato', 'Escolha o formato:', ['Mentoria individual', 'Diagnostico rapido', 'Acompanhamento completo'], productId),
      commonCapture[0],
      commonCapture[2],
      ...payment,
      ...ending(`Pagamento aprovado.\n\nSua mentoria foi confirmada.\n\nNossa equipe vai te chamar pelo WhatsApp para alinhar o proximo passo:\n\n${supportWhatsapp}`),
    ]
  }

  if (templateId === 'local_service') {
    return [
      node('start', 'start', 'Inicio', {}),
      message('welcome', 'Boas-vindas', 'Oi.\n\nVi que voce tem interesse em {{product.name}}.\n\nVou te explicar rapidinho e ja vejo a melhor opcao para voce.'),
      message('pain', 'Dor local', 'Muita gente deixa para resolver isso depois e acaba gastando mais tempo, mais dinheiro ou perdendo a oportunidade.'),
      message('solution', 'Solucao', 'Aqui voce resolve de forma simples: escolhe a opcao, confirma os dados e deixa tudo encaminhado.'),
      message('offer', 'Oferta', 'Hoje temos essa condicao:\n\n{{product.name}}\nPor R$ {{product.price}}\n\nAtendimento rapido e suporte pelo WhatsApp.'),
      quickReply('interest', 'Interesse', 'O que voce prefere agora?', ['Quero agendar', 'Quero saber valores', 'Quero falar com atendente']),
      commonCapture[0],
      commonCapture[2],
      quickReply('period', 'Periodo', 'Qual periodo fica melhor para voce?', ['Manha', 'Tarde', 'Noite']),
      ...ending('Perfeito, {{lead.name}}.\n\nSeu interesse foi registrado e nossa equipe vai confirmar o atendimento pelo WhatsApp.', `Se quiser falar com alguem agora, chama aqui:\n\n${supportWhatsapp}`),
    ]
  }

  if (templateId === 'scheduling') {
    return [
      node('start', 'start', 'Inicio', {}),
      message('welcome', 'Boas-vindas', 'Oi.\n\nVou te ajudar a agendar seu atendimento de forma rapida.'),
      message('pain', 'Dor', 'Quanto mais voce adia, mais dificil fica resolver isso com calma e no melhor horario.'),
      message('invite', 'Convite', 'Posso verificar a melhor opcao de horario para voce agora.'),
      commonCapture[0],
      commonCapture[2],
      quickReply('period', 'Periodo', 'Qual periodo voce prefere?', ['Manha', 'Tarde', 'Noite']),
      ...ending('Perfeito, {{lead.name}}.\n\nSeu pedido de agendamento foi registrado.\n\nNossa equipe vai confirmar o melhor horario com voce pelo WhatsApp.', `Se precisar falar com alguem agora, chama aqui:\n\n${supportWhatsapp}`),
    ]
  }

  if (templateId === 'quick_pix') {
    return [
      node('start', 'start', 'Inicio', {}),
      message('welcome', 'Boas-vindas', 'Oi.\n\nVoce chegou na oferta do {{product.name}}.'),
      message('offer', 'Oferta direta', 'O acesso esta disponivel agora por R$ {{product.price}}.\n\nApos o Pix aprovado, voce recebe tudo automaticamente aqui no chat.'),
      message('receive', 'Como recebe', 'E simples:\n\n1. Voce paga no Pix.\n2. O sistema confirma.\n3. Seu acesso e liberado aqui mesmo.'),
      quickReply('buy', 'Botao de compra', 'Quer seguir?', ['Quero meu acesso', 'Ver planos', 'Tirar duvida']),
      capture('capture_name', 'Captura nome', 'Me diga seu nome para liberar corretamente.', 'lead.name', 'text'),
      ...payment,
      ...ending('Pagamento aprovado.\n\nAqui esta seu acesso:\n\n{{delivery.content}}'),
    ]
  }

  return [
    node('start', 'start', 'Inicio', {}),
    message('welcome', 'Boas-vindas', 'Oi, tudo certo?\n\nVi que voce quer acessar o {{product.name}} pagando menos.\n\nVou te explicar rapidinho como funciona.'),
    message('pain', 'Dor', 'Hoje muita gente quer usar ferramentas premium, mas o valor oficial acaba ficando pesado.'),
    message('solution', 'Solucao', 'A ideia aqui e te dar uma forma mais acessivel de usar o {{product.name}}, com liberacao rapida e suporte caso precise.'),
    message('how', 'Como funciona', 'Funciona assim:\n\n1. Voce escolhe o plano.\n2. Faz o pagamento via Pix.\n3. Assim que confirmar, seu acesso e liberado automaticamente aqui no chat.'),
    planNode('plans', 'Escolha de plano', 'Tenho essas opcoes disponiveis para o {{product.name}}:\n\nEscolha a que faz mais sentido:', ['24 horas - R$ {{plan_1.price}}', '7 dias - R$ {{plan_2.price}}', '30 dias - R$ {{plan_3.price}}'], productId),
    ...commonCapture,
    ...payment,
    ...ending('Pagamento aprovado.\n\nSeu acesso foi liberado:\n\nLogin: {{account.login}}\nSenha: {{account.password}}\n\nGuarde esses dados com seguranca.'),
  ]
}

function node(key: string, type: NodeType, title: string, config: Record<string, unknown>): TemplateStep {
  return { key, type, title, config }
}

function message(key: string, title: string, text: string): TemplateStep {
  return node(key, 'text_message', title, {
    message_text: text,
    show_typing: true,
    typing_duration_ms: 850,
    delay_ms: 250,
  })
}

function capture(key: string, title: string, label: string, variableName: string, inputType: string): TemplateStep {
  return node(key, 'capture_input', title, {
    label,
    input_type: inputType,
    variable_name: variableName,
    required: true,
  })
}

function quickReply(key: string, title: string, text: string, labels: string[]): TemplateStep {
  return node(key, 'quick_reply', title, {
    message_text: text,
    buttons: labels.map(label => ({
      id: uuidv4(),
      label,
      action_type: 'go_to_node',
    })),
  })
}

function planNode(key: string, title: string, text: string, labels: string[], productId: string | null): TemplateStep {
  const plans = labels.map((label, index) => ({
    id: index === 0 ? 'plan-primary' : uuidv4(),
    label,
    plan_name: label,
    button_text: label,
    product_id: productId,
  }))

  return node(key, 'product_plan', title, {
    message_text: text,
    product_id: productId,
    plans,
    buttons: plans.map(plan => ({
      id: plan.id,
      label: plan.button_text,
      action_type: 'go_to_node',
    })),
  })
}
