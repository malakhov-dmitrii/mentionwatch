import { describe, it, expect, vi, beforeEach } from "vitest";
import { deliverWebhook } from "@/lib/webhook";

const FAST_DELAYS = [0, 0, 0, 0]; // no waits in tests

describe("deliverWebhook", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("delivers successfully on first attempt", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200 })
    );

    const result = await deliverWebhook(
      "https://example.com/webhook",
      "test-secret",
      {
        id: "mw_evt_test",
        keyword: "test",
        source: "hackernews",
        type: "story",
        title: "Test",
        text: "Test text",
        author: "user",
        url: "https://example.com",
        source_url: null,
        timestamp: new Date().toISOString(),
        delivered_at: new Date().toISOString(),
      }
    );

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
  });

  it("includes HMAC signature header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    await deliverWebhook("https://example.com/webhook", "test-secret", {
      id: "mw_evt_test",
      keyword: "test",
      source: "hackernews",
      type: "story",
      title: "Test",
      text: "",
      author: "",
      url: "",
      source_url: null,
      timestamp: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    });

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers["X-MentionWatch-Signature"]).toMatch(/^sha256=[a-f0-9]{64}$/);
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("uses redirect: manual to prevent SSRF", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    await deliverWebhook("https://example.com/webhook", "secret", {
      id: "mw_evt_test",
      keyword: "test",
      source: "hackernews",
      type: "story",
      title: "Test",
      text: "",
      author: "",
      url: "",
      source_url: null,
      timestamp: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    });

    expect(fetchMock.mock.calls[0][1].redirect).toBe("manual");
  });

  it("retries on failure and eventually gives up", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverWebhook("https://example.com/webhook", "secret", {
      id: "mw_evt_test",
      keyword: "test",
      source: "hackernews",
      type: "story",
      title: "Test",
      text: "",
      author: "",
      url: "",
      source_url: null,
      timestamp: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    }, FAST_DELAYS);

    expect(result.success).toBe(false);
    expect(result.attempts).toBe(4); // initial + 3 retries
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("retries on network error", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const result = await deliverWebhook("https://example.com/webhook", "secret", {
      id: "mw_evt_test",
      keyword: "test",
      source: "hackernews",
      type: "story",
      title: "Test",
      text: "",
      author: "",
      url: "",
      source_url: null,
      timestamp: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
    }, FAST_DELAYS);

    expect(result.success).toBe(true);
    expect(result.attempts).toBe(3);
  });
});
