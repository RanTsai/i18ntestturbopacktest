export function extractUrl(input: unknown): string {
  if (
    typeof input === "object" &&
    input !== null &&
    "text" in input &&
    typeof (input as { text?: unknown }).text === "string"
  ) {
    input = (input as { text: string }).text;
  }

  if (typeof input !== "string") return "";

  const match = input.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : "";
}
