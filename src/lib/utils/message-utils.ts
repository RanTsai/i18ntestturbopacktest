export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (typeof err === "object" && err && "message" in err) {
    return String((err as { message?: unknown }).message);
  }
  return "Unknown error";
}
