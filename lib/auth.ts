import crypto from "crypto";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_default_portfolio_secret_key_123456";

/**
 * Generates a signed token for a username, valid for 24 hours.
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
 * Verifies the incoming request's OAuth/JWT access token from the Authorization header.
 */
export async function verifyOAuth(req: Request | NextRequest): Promise<boolean> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.substring(7);
  if (!token) return false;

  return verifyToken(token);
}
