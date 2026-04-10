#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = process.env.MENTIONWATCH_API_URL || "https://api.mentionwatch.com";
const API_KEY = process.env.MENTIONWATCH_API_KEY || "";

async function api(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

const server = new McpServer({
  name: "mentionwatch",
  version: "0.1.0",
});

// ── Tools ──

server.tool(
  "mentionwatch_status",
  "Check your MentionWatch account status: plan, keyword usage, mention quota, and configured webhook URL.",
  {},
  async () => {
    if (!API_KEY) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No API key configured. Set MENTIONWATCH_API_KEY environment variable. Get your key at https://mentionwatch.com",
          },
        ],
      };
    }

    const me = await api("GET", "/api/me");
    if (!me.ok) {
      return {
        content: [
          { type: "text" as const, text: `Error: ${JSON.stringify(me.data)}` },
        ],
      };
    }

    const webhook = await api("GET", "/api/webhooks");
    const d = me.data as Record<string, unknown>;
    const w = webhook.data as Record<string, unknown>;
    const wd = (w?.data as Record<string, unknown>) || {};

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              plan: d.data
                ? (d.data as Record<string, unknown>).plan
                : "unknown",
              keywords: `${(d.data as Record<string, unknown>)?.keywords_used || 0}/${(d.data as Record<string, unknown>)?.keywords_limit || 0}`,
              mentions: `${(d.data as Record<string, unknown>)?.mentions_used || 0}/${(d.data as Record<string, unknown>)?.mentions_limit || 0} this month`,
              webhook_url: wd.url || "not configured",
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  "mentionwatch_add_keyword",
  "Add a keyword to monitor across social media (HN, Reddit). You'll get webhooks when this keyword appears in new posts.",
  { keyword: z.string().describe("The keyword or phrase to monitor (1-100 chars)") },
  async ({ keyword }) => {
    const res = await api("POST", "/api/keywords", { keyword });
    return {
      content: [
        {
          type: "text" as const,
          text: res.ok
            ? `Monitoring "${keyword}". ${JSON.stringify((res.data as Record<string, unknown>)?.meta)}`
            : `Failed: ${JSON.stringify(res.data)}`,
        },
      ],
    };
  }
);

server.tool(
  "mentionwatch_remove_keyword",
  "Stop monitoring a keyword. Pass the keyword ID (e.g. kw_abc123).",
  { keyword_id: z.string().describe("Keyword ID to remove (e.g. kw_abc123)") },
  async ({ keyword_id }) => {
    const res = await api("DELETE", `/api/keywords/${keyword_id}`);
    return {
      content: [
        {
          type: "text" as const,
          text: res.ok
            ? `Removed keyword ${keyword_id}.`
            : `Failed: ${JSON.stringify(res.data)}`,
        },
      ],
    };
  }
);

server.tool(
  "mentionwatch_list_keywords",
  "List all keywords you're currently monitoring.",
  {},
  async () => {
    const res = await api("GET", "/api/keywords");
    return {
      content: [
        {
          type: "text" as const,
          text: res.ok
            ? JSON.stringify(res.data, null, 2)
            : `Failed: ${JSON.stringify(res.data)}`,
        },
      ],
    };
  }
);

server.tool(
  "mentionwatch_set_webhook",
  "Set the webhook URL where mention notifications will be sent. Must be a public HTTPS endpoint.",
  { url: z.string().url().describe("Public HTTPS URL to receive webhook POSTs") },
  async ({ url }) => {
    const res = await api("POST", "/api/webhooks", { url });
    return {
      content: [
        {
          type: "text" as const,
          text: res.ok
            ? `Webhook set to ${url}. All mentions will be POSTed here with HMAC-SHA256 signatures.`
            : `Failed: ${JSON.stringify(res.data)}`,
        },
      ],
    };
  }
);

server.tool(
  "mentionwatch_test_webhook",
  "Send a test payload to your configured webhook URL. Verifies your endpoint is reachable and signature verification works.",
  {},
  async () => {
    const res = await api("POST", "/api/webhooks/test");
    return {
      content: [
        {
          type: "text" as const,
          text: res.ok
            ? `Test webhook sent! ${JSON.stringify((res.data as Record<string, unknown>)?.data)}`
            : `Failed: ${JSON.stringify(res.data)}`,
        },
      ],
    };
  }
);

server.tool(
  "mentionwatch_get_mentions",
  "Get recent mentions. Optionally filter by keyword or time range.",
  {
    keyword: z.string().optional().describe("Filter by keyword"),
    since: z.string().optional().describe("ISO 8601 date to filter from (e.g. 2026-04-11T00:00:00Z)"),
  },
  async ({ keyword, since }) => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (since) params.set("since", since);
    const qs = params.toString();

    const res = await api("GET", `/api/mentions${qs ? `?${qs}` : ""}`);
    return {
      content: [
        {
          type: "text" as const,
          text: res.ok
            ? JSON.stringify(res.data, null, 2)
            : `Failed: ${JSON.stringify(res.data)}`,
        },
      ],
    };
  }
);

server.tool(
  "mentionwatch_setup",
  "Quick setup: add keywords and set webhook URL in one step. The fastest way to start monitoring.",
  {
    keywords: z
      .array(z.string())
      .describe("List of keywords to monitor"),
    webhook_url: z
      .string()
      .url()
      .describe("Public HTTPS URL to receive webhook POSTs"),
  },
  async ({ keywords, webhook_url }) => {
    const results: string[] = [];

    // Set webhook first
    const wh = await api("POST", "/api/webhooks", { url: webhook_url });
    if (wh.ok) {
      results.push(`Webhook: ${webhook_url}`);
    } else {
      results.push(`Webhook failed: ${JSON.stringify(wh.data)}`);
      return {
        content: [{ type: "text" as const, text: results.join("\n") }],
      };
    }

    // Add keywords
    for (const kw of keywords) {
      const res = await api("POST", "/api/keywords", { keyword: kw });
      if (res.ok) {
        results.push(`Monitoring: "${kw}"`);
      } else {
        results.push(`"${kw}" failed: ${JSON.stringify(res.data)}`);
      }
    }

    // Send test
    const test = await api("POST", "/api/webhooks/test");
    if (test.ok) {
      results.push("Test webhook sent to your endpoint.");
    }

    results.push(
      "",
      "Setup complete. Mentions will arrive via webhook within 15 minutes of appearing on HN or Reddit."
    );

    return {
      content: [{ type: "text" as const, text: results.join("\n") }],
    };
  }
);

// ── Start ──

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server error:", err);
  process.exit(1);
});
