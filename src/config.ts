/**
 * Business WhatsApp number in international format, digits only
 * (e.g. "27821234567" for a South African number).
 * Leave empty to open WhatsApp's contact picker with the message prefilled.
 */
export const WHATSAPP_NUMBER = '';

export function whatsappLink(message: string): string {
  const text = encodeURIComponent(message);
  return WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
    : `https://wa.me/?text=${text}`;
}
