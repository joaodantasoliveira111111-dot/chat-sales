export type ChatfyEventName =
  | "PageView"
  | "StartChat"
  | "ClickButton"
  | "InitiateCheckout"
  | "GeneratePix"
  | "Purchase"
  | "DeliveryCompleted";

export function trackClientEvent(
  eventName: ChatfyEventName,
  payload: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("chatfy:event", {
      detail: { eventName, payload, at: new Date().toISOString() },
    }),
  );
}
