-- Rebuild Minimal and Dark themes so they are visually distinct from Instagram.
UPDATE public.themes
SET
  name = 'Minimal Tech',
  description = 'Tema tecnológico claro, com estética limpa, tons frios, linhas finas e foco em leitura.',
  config = '{
    "background": "#F6F8FB",
    "backgroundPattern": "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
    "chatContainer": "#F6F8FB",
    "chatContainerBorder": "rgba(15,23,42,0.08)",
    "assistantBubble": "#FFFFFF",
    "assistantBubbleBorder": "#E2E8F0",
    "assistantText": "#0F172A",
    "userBubble": "#DBEAFE",
    "userText": "#0F172A",
    "button": "#2563EB",
    "buttonText": "#FFFFFF",
    "buttonHover": "#1D4ED8",
    "headerBg": "rgba(248,250,252,0.94)",
    "headerText": "#0F172A",
    "inputBg": "#FFFFFF",
    "inputBorder": "#CBD5E1",
    "inputText": "#0F172A",
    "scrollbar": "#2563EB",
    "typingDot": "#64748B",
    "borderRadius": "0px",
    "bubbleRadius": "12px",
    "shadow": "0 10px 28px rgba(15,23,42,0.08)",
    "fontFamily": "Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    "backdropFilter": "blur(18px)",
    "timestamp": "#64748B"
  }'::jsonb
WHERE id = 'minimal_chat';

UPDATE public.themes
SET
  name = 'Dark Command',
  description = 'Tema tecnológico escuro, com contraste alto, brilho ciano discreto e sensação de painel operacional.',
  config = '{
    "background": "#070D1A",
    "backgroundPattern": "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.12), transparent 28%), linear-gradient(rgba(34,211,238,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.035) 1px, transparent 1px)",
    "chatContainer": "#0B1220",
    "chatContainerBorder": "rgba(34,211,238,0.18)",
    "assistantBubble": "#101827",
    "assistantBubbleBorder": "rgba(34,211,238,0.18)",
    "assistantText": "#E5F7FF",
    "userBubble": "#123D4A",
    "userText": "#E6FFFB",
    "button": "#22D3EE",
    "buttonText": "#041016",
    "buttonHover": "#67E8F9",
    "headerBg": "rgba(7,13,26,0.92)",
    "headerText": "#E5F7FF",
    "inputBg": "#0F172A",
    "inputBorder": "rgba(34,211,238,0.24)",
    "inputText": "#E5F7FF",
    "scrollbar": "#22D3EE",
    "typingDot": "#67E8F9",
    "borderRadius": "0px",
    "bubbleRadius": "12px",
    "shadow": "0 12px 34px rgba(0,0,0,0.34)",
    "fontFamily": "Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    "backdropFilter": "blur(18px)",
    "timestamp": "#8FB6C5"
  }'::jsonb
WHERE id = 'dark_premium';
