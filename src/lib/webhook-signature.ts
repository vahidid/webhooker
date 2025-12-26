import crypto from "crypto";

/**
 * Verify webhook signature based on algorithm
 */
export function verifySignature(
  payload: string,
  signature: string | null,
  secret: string,
  algorithm: "HMAC_SHA1" | "HMAC_SHA256" | "HMAC_SHA512" | "NONE" | null
): boolean {
  // No signature verification required
  if (!algorithm || algorithm === "NONE") {
    return true;
  }

  // Signature is required but not provided
  if (!signature) {
    return false;
  }

  // Map algorithm to crypto algorithm
  const algoMap: Record<string, string> = {
    HMAC_SHA1: "sha1",
    HMAC_SHA256: "sha256",
    HMAC_SHA512: "sha512",
  };

  const cryptoAlgo = algoMap[algorithm];
  if (!cryptoAlgo) {
    return false;
  }

  // Compute expected signature
  const hmac = crypto.createHmac(cryptoAlgo, secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");

  // Different providers format signatures differently
  // GitHub: sha256=<signature>
  // GitLab: <signature> (raw hex)
  const cleanSignature = signature.replace(/^(sha1|sha256|sha512)=/, "");

  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(cleanSignature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Extract event type from headers and body based on provider
 */
export function extractEventType(
  headers: Record<string, string>,
  body: Record<string, unknown>,
  providerName: string
): string {
  switch (providerName.toLowerCase()) {
    case "github":
      return headers["x-github-event"] || "unknown";
    case "gitlab":
      return body.event_type as string || body.object_kind as string || "unknown";
    case "jira":
      return headers["x-event-key"] || "unknown";
    case "bitbucket":
      return headers["x-event-key"] || "unknown";
    default:
      // Try to infer from body
      return (body.event_type as string) || (body.type as string) || "unknown";
  }
}
