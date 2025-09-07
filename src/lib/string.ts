export function camelCaseToPascalCase(input: string): string {
  return input.replace(/^(.)/, (_, char) => char.toUpperCase());
}

export function camelCaseToTitleCase(input: string): string {
  // TODO: Replace with a single regex replace
  return input
    .replace(/[A-Z](?=[A-Z])|[a-z](?=[A-Z0-9])|[0-9](?=[A-Za-z])/g, "$& ")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function kebabCaseToPascalCase(input: string): string {
  return input
    .replace(/^./, (char) => char.toUpperCase())
    .replace(/-(.)/g, (_, char) => char.toUpperCase());
}

export function ellipsis(value: string, characters = 100): string {
  const stringValue: string =
    typeof value?.toString === "function" ? String(value) : "";
  if (stringValue.length > characters) {
    return stringValue.slice(0, characters) + "...";
  }
  return stringValue;
}
