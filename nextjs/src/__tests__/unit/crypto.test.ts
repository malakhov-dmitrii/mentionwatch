import { describe, it, expect } from "vitest";
import {
  generateId,
  hmacSign,
  hmacSignRaw,
  isValidWebhookUrl,
  validateKeyword,
} from "@/lib/crypto";

describe("generateId", () => {
  it("produces prefixed ID with correct format", () => {
    const id = generateId("mw_evt");
    expect(id).toMatch(/^mw_evt_[a-z0-9]{12}$/);
  });

  it("produces unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId("test")));
    expect(ids.size).toBe(100);
  });
});

describe("hmacSign (outbound webhook signatures)", () => {
  it("produces sha256= prefixed hex", async () => {
    const sig = await hmacSign("payload", "secret");
    expect(sig).toMatch(/^sha256=[a-f0-9]{64}$/);
  });

  it("is deterministic", async () => {
    const a = await hmacSign("payload", "secret");
    const b = await hmacSign("payload", "secret");
    expect(a).toBe(b);
  });

  it("differs with different payloads", async () => {
    const a = await hmacSign("payload1", "secret");
    const b = await hmacSign("payload2", "secret");
    expect(a).not.toBe(b);
  });
});

describe("hmacSignRaw (Creem verification, bare hex)", () => {
  it("produces bare hex without sha256= prefix", async () => {
    const sig = await hmacSignRaw("payload", "secret");
    expect(sig).toMatch(/^[a-f0-9]{64}$/);
    expect(sig).not.toContain("sha256=");
  });
});

describe("isValidWebhookUrl", () => {
  it("accepts valid HTTPS URLs", () => {
    expect(isValidWebhookUrl("https://example.com/webhook").valid).toBe(true);
    expect(isValidWebhookUrl("https://api.myapp.io/hooks/mentionwatch").valid).toBe(true);
  });

  it("rejects HTTP URLs", () => {
    const result = isValidWebhookUrl("http://example.com/webhook");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("HTTPS");
  });

  it("rejects localhost", () => {
    expect(isValidWebhookUrl("https://localhost/hook").valid).toBe(false);
    expect(isValidWebhookUrl("https://localhost:3000/hook").valid).toBe(false);
  });

  it("rejects private IP ranges", () => {
    expect(isValidWebhookUrl("https://127.0.0.1/hook").valid).toBe(false);
    expect(isValidWebhookUrl("https://10.0.0.1/hook").valid).toBe(false);
    expect(isValidWebhookUrl("https://172.16.0.1/hook").valid).toBe(false);
    expect(isValidWebhookUrl("https://192.168.1.1/hook").valid).toBe(false);
    expect(isValidWebhookUrl("https://169.254.0.1/hook").valid).toBe(false);
  });

  it("rejects IPv6 private addresses", () => {
    expect(isValidWebhookUrl("https://[::1]/hook").valid).toBe(false);
    expect(isValidWebhookUrl("https://[fc00::1]/hook").valid).toBe(false);
    expect(isValidWebhookUrl("https://[fd00::1]/hook").valid).toBe(false);
  });

  it("rejects single-label hostnames", () => {
    expect(isValidWebhookUrl("https://intranet/hook").valid).toBe(false);
  });

  it("rejects malformed URLs", () => {
    expect(isValidWebhookUrl("not-a-url").valid).toBe(false);
    expect(isValidWebhookUrl("").valid).toBe(false);
  });
});

describe("validateKeyword", () => {
  it("accepts valid keywords", () => {
    expect(validateKeyword("my-product").valid).toBe(true);
    expect(validateKeyword("React.js").valid).toBe(true);
    expect(validateKeyword("my product name").valid).toBe(true);
    expect(validateKeyword("test_keyword").valid).toBe(true);
  });

  it("rejects empty keywords", () => {
    expect(validateKeyword("").valid).toBe(false);
    expect(validateKeyword("   ").valid).toBe(false);
  });

  it("rejects keywords over 100 chars", () => {
    const long = "a".repeat(101);
    expect(validateKeyword(long).valid).toBe(false);
  });

  it("accepts keywords at exactly 100 chars", () => {
    const exact = "a".repeat(100);
    expect(validateKeyword(exact).valid).toBe(true);
  });

  it("rejects special characters", () => {
    expect(validateKeyword("test@keyword").valid).toBe(false);
    expect(validateKeyword("test;DROP TABLE").valid).toBe(false);
    expect(validateKeyword("<script>alert(1)</script>").valid).toBe(false);
  });
});
