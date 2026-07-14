import crypto from "crypto";
import { NextRequest } from "next/server";
import { logger, maskKey } from "@/lib/logger";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_default_portfolio_secret_key_123456";
const API_KEY = process.env.API_KEY || process.env.EXPENSES_API_KEY;

/**
 * Generates a signed token for a username, valid for 24 hours.
 * @deprecated Auth is now unified via a static API key. Kept for reference.
 */
export function generateToken(username: string): string {
  const payload = {
    username,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours validity
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(payloadB64)
    .digest("base64url");
    
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a token's signature and expiration.
 * @deprecated Auth is now unified via a static API key.
 */
export function verifyToken(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    
    const [payloadB64, signature] = parts;
    if (!payloadB64 || !signature) return false;
    
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(payloadB64)
      .digest("base64url");
      
    if (signature !== expectedSignature) return false;
    
    const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadStr);
    
    if (payload.exp < Date.now()) return false;
    
    return true;
  } catch (err) {
    console.error("Token verification failed:", err);
    return false;
  }
}

/**
 * Validates the incoming request's Authorization: Bearer <token> header
 * against the static API_KEY environment variable.
 * All portfolio endpoints (GitHub, Blogs, Projects, Spotify, Stats) use this.
 */
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
