import crypto from "crypto";
import { NextRequest } from "next/server";
import { logger, maskKey } from "@/lib/logger";

const API_KEY = process.env.API_KEY;

export async function verifyOAuth(req: Request | NextRequest): Promise<boolean> {
  const pathname = new URL(req.url).pathname;

  if (!API_KEY) {
    logger.warn("auth_fail", { reason: "api_key_env_not_set", path: pathname });
    return false;
  }
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logger.warn("auth_fail", {
      reason: "missing_or_malformed_header",
      got: authHeader ? "non-bearer" : "(none)",
      path: pathname,
    });
    return false;
  }
  const token = authHeader.substring(7);
  if (!token) {
    logger.warn("auth_fail", { reason: "empty_token", path: pathname });
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  const keyBuf = Buffer.from(API_KEY);
  const tokenBuf = Buffer.from(token);
  if (keyBuf.length !== tokenBuf.length) {
    logger.warn("auth_fail", {
      reason: "invalid_key",
      key_prefix: maskKey(token),
      path: pathname,
    });
    return false;
  }
  const valid = crypto.timingSafeEqual(keyBuf, tokenBuf);
  if (!valid) {
    logger.warn("auth_fail", {
      reason: "invalid_key",
      key_prefix: maskKey(token),
      path: pathname,
    });
  }
  return valid;
}
