import { createHash } from "crypto";

/** Fixed namespace for FIO app-authored modules. */
const NS = "1b671a64-40d5-491e-99b0-da01ff1f3341";

/** Deterministic UUID v5 (name-based, SHA-1) — stable id per module key. */
export function moduleId(key: string): string {
  const nsBytes = Buffer.from(NS.replace(/-/g, ""), "hex");
  const hash = createHash("sha1")
    .update(nsBytes)
    .update(Buffer.from(`module:${key}`, "utf8"))
    .digest();
  const bytes = hash.subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
