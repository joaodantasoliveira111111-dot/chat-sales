-- Refine native chat theme configs for public pages.
UPDATE public.themes
SET
  description = 'Estilo inspirado na conversa nativa do WhatsApp, com cabeçalho, estado online, fundo e bolhas próximos ao original.',
  config = config || '{
    "background": "#efeae2",
    "backgroundPattern": "url(\"https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png\")",
    "headerBg": "#008069",
    "headerText": "#ffffff",
    "assistantBubble": "#ffffff",
    "assistantText": "#111b21",
    "userBubble": "#d9fdd3",
    "userText": "#111b21",
    "button": "#008069",
    "buttonHover": "#017561",
    "buttonText": "#ffffff",
    "inputBg": "#ffffff",
    "inputText": "#111b21",
    "bubbleRadius": "7.5px",
    "shadow": "0 1px 0.5px rgba(11,20,26,.13)",
    "fontFamily": "\"Segoe UI\", \"Helvetica Neue\", Helvetica, Arial, sans-serif",
    "timestamp": "#667781"
  }'::jsonb
WHERE id = 'whatsapp';

UPDATE public.themes
SET
  description = 'Estilo inspirado na conversa nativa do Instagram Direct, com cabeçalho escuro, @ do perfil e ações de ligação/vídeo.',
  config = config || '{
    "background": "#000000",
    "backgroundPattern": "none",
    "headerBg": "#000000",
    "headerText": "#f5f5f5",
    "assistantBubble": "#262626",
    "assistantText": "#f5f5f5",
    "userBubble": "#3797f0",
    "userText": "#ffffff",
    "button": "#3797f0",
    "buttonHover": "#1877f2",
    "buttonText": "#ffffff",
    "inputBg": "#121212",
    "inputBorder": "1px solid #363636",
    "inputText": "#f5f5f5",
    "bubbleRadius": "22px",
    "shadow": "none",
    "fontFamily": "system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
    "timestamp": "#a8a8a8"
  }'::jsonb
WHERE id = 'instagram';
