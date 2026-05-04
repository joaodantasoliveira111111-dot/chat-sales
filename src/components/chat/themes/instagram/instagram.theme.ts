// ============================================================
// INSTAGRAM THEME CONFIGURATION
// ============================================================

export const instagramTheme = {
  // Colors
  colors: {
    // Header
    headerBg: '#FFFFFF',
    headerText: '#262626',
    headerBorder: '#DBDBDB',

    // Background
    background: '#FFFFFF',
    backgroundPattern: 'none',

    // Message bubbles
    assistantBubble: '#EFEFEF',
    assistantBubbleBorder: 'transparent',
    assistantText: '#262626',
    userBubble: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 55%, #FCAF45 100%)',
    userText: '#FFFFFF',

    // Buttons
    button: '#FFFFFF',
    buttonText: '#0095F6',
    buttonBorder: '#DBDBDB',
    buttonHover: '#F5F5F5',

    // Input
    inputBg: '#FFFFFF',
    inputBorder: '#DBDBDB',
    inputText: '#262626',
    inputPlaceholder: '#8E8E8E',
    inputBarBg: '#FFFFFF',

    // Send button
    sendButtonBg: '#0095F6',
    sendButtonText: '#FFFFFF',

    // Other
    scrollbar: '#C4C4C4',
    typingDot: '#0095F6',
    timestamp: '#737373',
    checkmark: '#0095F6',
  },

  // Border radius
  radius: {
    bubble: '18px',
    button: '999px',
    input: '999px',
    avatar: '999px',
  },

  // Spacing
  spacing: {
    messageGap: '4px',
    bubblePadding: '10px 14px',
    buttonPadding: '9px 14px',
    headerHeight: '56px',
    inputBarHeight: '60px',
  },

  // Typography
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      message: '14px',
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
      mobile: '78%',
    },
  },
}

export type InstagramTheme = typeof instagramTheme
