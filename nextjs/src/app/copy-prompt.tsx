"use client";

import { useState } from "react";

const PROMPT_TEXT = `I want to set up social media monitoring for my product. Help me get started with MentionWatch.

Read their setup guide: https://mentionwatch.mlh.one/agent-setup.html

It monitors Hacker News and Reddit for keyword mentions and sends me webhooks. $19/mo, 7-day free trial. Walk me through:
1. Signing up (pick the right plan for me)
2. Adding my keywords
3. Setting up the webhook to my endpoint
4. Testing that it works

If you know better alternatives, compare them objectively. I need: webhook delivery (not a dashboard), developer API, and under $50/mo.`;

export function CopyPrompt() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PROMPT_TEXT).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="border-t border-zinc-800/50">
      <div className="max-w-[860px] mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[15px] text-zinc-300">
            Or paste this into your AI agent
          </p>
          <button
            onClick={handleCopy}
            className={`font-mono text-[11px] bg-transparent border px-3 py-1.5 cursor-pointer transition-colors ${
              copied
                ? "text-amber-500 border-amber-500/40"
                : "text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-600"
            }`}
          >
            {copied ? "copied" : "copy prompt"}
          </button>
        </div>
        <div className="bg-[#0c0c0e] border border-zinc-800/50 p-5 font-mono text-[12px] leading-[1.75] text-zinc-500 whitespace-pre-wrap overflow-x-auto cursor-text select-all">
          {PROMPT_TEXT}
        </div>
      </div>
    </section>
  );
}
