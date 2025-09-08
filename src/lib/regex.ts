export function regexEscape(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
