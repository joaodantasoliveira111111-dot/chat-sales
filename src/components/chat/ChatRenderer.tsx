'use client'

import { PublicPage, FlowButton, FlowNode } from '@/types'
import { ConversationalFormFlow } from './ConversationalFormFlow'
import { DeliveryCard } from './DeliveryCard'
import { PixPaymentCard } from './PixPaymentCard'
import { convertThemeToConfig } from './chatHelpers'
import {
  WhatsAppHeader,
  WhatsAppMessageBubble,
  WhatsAppQuickReplies,
  WhatsAppInputBar,
  WhatsAppMediaMessage,
  WhatsAppLayout,
  WhatsAppTypingIndicator,
  whatsappTheme,
} from './themes/whatsapp'

import {
  InstagramHeader,
  InstagramMessageBubble,
  InstagramQuickReplies,
  InstagramInputBar,
  InstagramMediaMessage,
  InstagramLayout,
  InstagramTypingIndicator,
  instagramTheme,
} from './themes/instagram'

import {
  PremiumProductChatHeader,
  PremiumProductChatMessageBubble,
  PremiumProductChatQuickReplies,
  PremiumProductChatInputBar,
  PremiumProductChatMediaMessage,
  PremiumProductChatLayout,
  PremiumProductChatTypingIndicator,
  premiumProductChatTheme,
} from './themes/premium-product-chat'

import { FlowEngineResult } from './useFlowEngine'

interface ChatRendererProps {
  page: PublicPage
  nodes: FlowNode[]
  engine: FlowEngineResult
}

export function ChatRenderer({ page, nodes, engine }: ChatRendererProps) {
  const {
    state,
    isTyping,
    inputValue,
    setInputValue,
    waitingInput,
    orderId,
    deliveryPayload,
    messagesEndRef,
    handleUserInput,
    handleQuickReply,
    handleFormComplete,
    handlePixComplete,
    handleDeliveryFetch,
    renderText,
    renderButtons,
    variables,
  } = engine

  const template = (page.theme_id || 'whatsapp').replace(/[^a-z0-9_-]/gi, '_')
  const isWhatsApp = template === 'whatsapp'
  const isPremiumProductChat = template === 'premium_product_chat' || template === 'premium-product-chat'

  const Header = isPremiumProductChat ? PremiumProductChatHeader : isWhatsApp ? WhatsAppHeader : InstagramHeader
  const MessageBubble = isPremiumProductChat ? PremiumProductChatMessageBubble : isWhatsApp ? WhatsAppMessageBubble : InstagramMessageBubble
  const QuickReplies = isPremiumProductChat ? PremiumProductChatQuickReplies : isWhatsApp ? WhatsAppQuickReplies : InstagramQuickReplies
  const InputBar = isPremiumProductChat ? PremiumProductChatInputBar : isWhatsApp ? WhatsAppInputBar : InstagramInputBar
  const MediaMessage = isPremiumProductChat ? PremiumProductChatMediaMessage : isWhatsApp ? WhatsAppMediaMessage : InstagramMediaMessage
  const Layout = isPremiumProductChat ? PremiumProductChatLayout : isWhatsApp ? WhatsAppLayout : InstagramLayout
  const TypingIndicator = isPremiumProductChat ? PremiumProductChatTypingIndicator : isWhatsApp ? WhatsAppTypingIndicator : InstagramTypingIndicator

  const activeTheme = isPremiumProductChat ? premiumProductChatTheme : isWhatsApp ? whatsappTheme : instagramTheme

  const header = <Header page={page} />
  const inputBar = (
    <InputBar
      value={inputValue}
      onChange={setInputValue}
      onSend={handleUserInput}
      active={!!waitingInput}
      type={waitingInput?.config.input_type || 'text'}
      placeholder={waitingInput?.config.placeholder || (isWhatsApp ? 'Digite uma mensagem' : isPremiumProductChat ? 'Digite sua mensagem...' : 'Mensagem...')}
    />
  )

  if (nodes.length === 0) {
    return (
      <Layout header={header} inputBar={inputBar} customCss={page.custom_css}>
        <MessageBubble
          message={{ id: 'empty', type: 'assistant', content: 'Esta conversa ainda não tem um fluxo publicado.', timestamp: Date.now() }}
          avatarUrl={page.avatar_url}
          isUser={false}
        />
      </Layout>
    )
  }

  if (!state) {
    return (
      <Layout header={header} inputBar={inputBar} customCss={page.custom_css}>
        <TypingIndicator avatarUrl={page.avatar_url} />
      </Layout>
    )
  }

  return (
    <Layout
      header={page.show_header ? header : null}
      inputBar={inputBar}
      customCss={page.custom_css}
    >
      {state.visible_messages.map(msg => {
        const index = state.visible_messages.indexOf(msg)
        const prev = state.visible_messages[index - 1]
        const next = state.visible_messages[index + 1]
        const isUser = msg.type === 'user'
        const prevSame = prev && prev.type === msg.type && (msg.type === 'assistant' || msg.type === 'user')
        const nextSame = next && next.type === msg.type && (msg.type === 'assistant' || msg.type === 'user')

        if (msg.type === 'assistant' || msg.type === 'user') {
          return (
            <MessageBubble
              key={msg.id}
              message={msg.content ? { ...msg, content: renderText(msg.content, variables) } : msg}
              avatarUrl={page.avatar_url}
              isUser={isUser}
              showAvatar={!prevSame}
              compact={!!prevSame || !!nextSame}
            />
          )
        }

        if (msg.type === 'media') {
          return (
            <MediaMessage
              key={msg.id}
              message={msg.content ? { ...msg, content: renderText(msg.content, variables) } : msg}
              isUser={isUser}
              avatarUrl={page.avatar_url}
              showAvatar={!prevSame}
              compact={!!prevSame || !!nextSame}
            />
          )
        }

        if (msg.type === 'buttons') {
          return (
            <QuickReplies
              key={msg.id}
              buttons={renderButtons(msg.buttons || [], variables)}
              onSelect={(button: FlowButton) => handleQuickReply(button, msg.nodeId || '')}
            />
          )
        }

        if (msg.type === 'checkout') {
          return (
            <ConversationalFormFlow
              key={msg.id}
              config={msg.payload || {}}
              theme={convertThemeToConfig(activeTheme)}
              page={page}
              variables={variables}
              onSubmit={(data) => handleFormComplete(data, msg.nodeId || '')}
            />
          )
        }

        if (msg.type === 'pix') {
          return (
            <PixPaymentCard
              key={msg.id}
              config={msg.payload || {}}
              theme={convertThemeToConfig(activeTheme)}
              page={page}
              variables={variables}
              orderId={orderId}
              sessionId={state.session_id}
              onPaymentSuccess={(newOrderId) => handlePixComplete(newOrderId, msg.nodeId || '')}
            />
          )
        }

        if (msg.type === 'delivery') {
          return (
            <DeliveryCard
              key={msg.id}
              config={msg.payload || {}}
              theme={convertThemeToConfig(activeTheme)}
              orderId={orderId}
              sessionId={state.session_id}
              onFetchDelivery={() => handleDeliveryFetch(msg.nodeId || '')}
              existingPayload={deliveryPayload}
            />
          )
        }

        return null
      })}

      {isTyping && <TypingIndicator avatarUrl={page.avatar_url} />}
      <div ref={messagesEndRef} />

      {page.show_microcopy && page.microcopy_text && (
        <div className="flex-shrink-0 py-2 text-center">
          <p className="text-xs opacity-40">
            {page.microcopy_text}
          </p>
        </div>
      )}

      {page.show_powered_by && (
        <div className="flex-shrink-0 py-2 text-center">
          <p className="text-xs opacity-30">
            Powered by Chatfy
          </p>
        </div>
      )}
    </Layout>
  )
}
