import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchHN, hnHitToMention, type HNHit } from "@/lib/hn";

const mockHit: HNHit = {
  objectID: "12345",
  title: "Show HN: My Product is live",
  url: "https://my-product.com",
  author: "tptacek",
  story_text: "We just launched My Product, a tool that does things.",
  created_at: "2026-04-10T09:15:00.000Z",
};

describe("searchHN", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns results for matching keywords", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ hits: [mockHit] }),
      })
    );

    const results = await searchHN(["my-product"]);
    expect(results.size).toBe(1);
    expect(results.get("my-product")).toHaveLength(1);
    expect(results.get("my-product")![0].objectID).toBe("12345");
  });

  it("deduplicates case-insensitive keywords", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ hits: [mockHit] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchHN(["React", "react", "REACT"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns empty map when no hits", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ hits: [] }),
      })
    );

    const results = await searchHN(["nonexistent-keyword-xyz"]);
    expect(results.size).toBe(0);
  });

  it("handles API errors gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500 })
    );

    const results = await searchHN(["test"]);
    expect(results.size).toBe(0);
  });

  it("handles network errors gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    const results = await searchHN(["test"]);
    expect(results.size).toBe(0);
  });

  it("queries HN Algolia with correct params", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ hits: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await searchHN(["test-keyword"]);
    const url = fetchMock.mock.calls[0][0] as string;
    expect(url).toContain("hn.algolia.com/api/v1/search_by_date");
    expect(url).toContain("query=test-keyword");
    expect(url).toContain("tags=story");
    expect(url).toContain("hitsPerPage=20");
    expect(url).toMatch(/created_at_i(%3E|>)/);
  });
});

describe("hnHitToMention", () => {
  it("converts HN hit to mention format", () => {
    const mention = hnHitToMention(mockHit, "my-product");
    expect(mention.source).toBe("hackernews");
    expect(mention.type).toBe("story");
    expect(mention.title).toBe("Show HN: My Product is live");
    expect(mention.author).toBe("tptacek");
    expect(mention.url).toBe("https://news.ycombinator.com/item?id=12345");
    expect(mention.source_url).toBe("https://my-product.com");
    expect(mention.external_id).toBe("hn_12345");
    expect(mention.keyword).toBe("my-product");
  });

  it("truncates story_text to 4096 chars", () => {
    const longHit = { ...mockHit, story_text: "x".repeat(5000) };
    const mention = hnHitToMention(longHit, "test");
    expect(mention.text.length).toBe(4096);
  });

  it("handles null fields", () => {
    const nullHit = { ...mockHit, url: null, story_text: null };
    const mention = hnHitToMention(nullHit, "test");
    expect(mention.source_url).toBeNull();
    expect(mention.text).toBe("");
  });
});
