type LogLevel = "info" | "warn" | "error" | "debug";

function emit(level: LogLevel, event: string, data?: Record<string, unknown>) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  };
  const output = JSON.stringify(entry);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

export const logger = {
  info: (event: string, data?: Record<string, unknown>) => emit("info", event, data),
  warn: (event: string, data?: Record<string, unknown>) => emit("warn", event, data),
  error: (event: string, data?: Record<string, unknown>) => emit("error", event, data),
  debug: (event: string, data?: Record<string, unknown>) => emit("debug", event, data),
};

export function maskKey(token: string | null | undefined): string {
  if (!token) return "(none)";
  return token.length > 6 ? `${token.slice(0, 6)}…` : "(short)";
}
