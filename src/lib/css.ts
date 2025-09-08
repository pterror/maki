export function escapeCssIdentifier(ident: string) {
  return ident.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}
