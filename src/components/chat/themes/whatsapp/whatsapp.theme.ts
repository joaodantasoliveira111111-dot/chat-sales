// ============================================================
// WHATSAPP THEME CONFIGURATION
// ============================================================

export const whatsappTheme = {
  // Colors
  colors: {
    // Header
    headerBg: '#008069',
    headerText: '#FFFFFF',
    headerBorder: 'rgba(17, 27, 33, 0.08)',

    // Background
    background: '#EFEAE2',
    backgroundPattern: 'none',

    // Message bubbles
    assistantBubble: '#FFFFFF',
    assistantBubbleBorder: 'transparent',
    assistantText: '#111B21',
    userBubble: '#D9FDD3',
    userText: '#111B21',

    // Buttons
    button: '#FFFFFF',
    buttonText: '#008069',
    buttonBorder: '#D1D7DB',
    buttonHover: '#F5F5F5',

    // Input
    inputBg: '#FFFFFF',
    inputBorder: 'transparent',
    inputText: '#111B21',
    inputPlaceholder: '#8E8E8E',
    inputBarBg: '#F0F2F5',

    // Send button
    sendButtonBg: '#008069',
    sendButtonText: '#FFFFFF',

    // Other
    scrollbar: '#C4C4C4',
    typingDot: '#008069',
    timestamp: '#667781',
    checkmark: '#4FC3F7',
  },

  // Border radius
  radius: {
    bubble: '8px',
    button: '18px',
    input: '999px',
    avatar: '999px',
  },

  // Spacing
  spacing: {
    messageGap: '2px',
    bubblePadding: '8px 10px',
    buttonPadding: '9px 14px',
    headerHeight: '56px',
    inputBarHeight: '60px',
  },

  // Typography
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      message: '14.2px',
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

  // Shadows
  shadows: {
    bubble: 'none',
    button: 'none',
    header: 'none',
  },

  // Layout
  layout: {
    maxWidth: {
      desktop: '70%',
      mobile: '82%',
    },
  },
}

export type WhatsAppTheme = typeof whatsappTheme
