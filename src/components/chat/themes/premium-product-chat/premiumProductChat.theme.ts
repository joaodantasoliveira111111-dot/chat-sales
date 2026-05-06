export const premiumProductChatTheme = {
  colors: {
    headerBg: 'transparent',
    headerText: '#FFFFFF',
    headerBorder: 'transparent',

    background: '#050B14',
    backgroundPattern: 'radial-gradient(circle at top left, rgba(11,124,255,0.28), transparent 32%), radial-gradient(circle at top right, rgba(109,93,246,0.22), transparent 34%), linear-gradient(180deg, #07111F 0%, #050B14 100%)',

    assistantBubble: 'rgba(255,255,255,0.06)',
    assistantBubbleBorder: 'rgba(255,255,255,0.08)',
    assistantText: '#F8FAFC',
    userBubble: 'linear-gradient(135deg, #0B7CFF 0%, #00C2FF 100%)',
    userText: '#FFFFFF',

    button: 'rgba(255,255,255,0.06)',
    buttonText: '#FFFFFF',
    buttonBorder: 'rgba(255,255,255,0.10)',
    buttonHover: 'rgba(0,194,255,0.12)',

    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.10)',
    inputText: '#FFFFFF',
    inputPlaceholder: 'rgba(255,255,255,0.45)',
    inputBarBg: '#070D1A',

    sendButtonBg: 'linear-gradient(135deg, #0B7CFF, #00C2FF)',
    sendButtonText: '#FFFFFF',

    scrollbar: 'rgba(255,255,255,0.15)',
    typingDot: '#00C2FF',
    timestamp: 'rgba(255,255,255,0.65)',
    checkmark: '#22D3EE',
  },

  radius: {
    bubble: '20px',
    button: '18px',
    input: '999px',
    avatar: '999px',
  },

  spacing: {
    messageGap: '6px',
    bubblePadding: '14px 16px',
    buttonPadding: '12px 16px',
    headerHeight: '0px',
    inputBarHeight: '80px',
  },

  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: {
      message: '15px',
      timestamp: '11px',
      button: '14px',
      input: '16px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '600',
    },
  },

  shadows: {
    bubble: '0 2px 12px rgba(0,0,0,0.2)',
    button: 'none',
    header: 'none',
  },

  layout: {
    maxWidth: {
      desktop: '78%',
      mobile: '78%',
    },
  },
}

export type PremiumProductChatTheme = typeof premiumProductChatTheme
