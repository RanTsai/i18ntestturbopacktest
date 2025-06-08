export function extractUrl(input: any): string {
    if (typeof input === "object" && input.text) {
        input = input.text;
    }
    if (typeof input !== "string") return "";
    const match = input.match(/https?:\/\/[^\s]+/);
    return match ? match[0] : "";
}