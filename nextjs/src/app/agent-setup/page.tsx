import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Agent Setup — MentionWatch",
  description: "Set up MentionWatch monitoring with your AI agent. Copy-paste instructions for ChatGPT, Claude, and other AI assistants.",
};

export default function AgentSetupPage() {
  return (
    <div className="pt-14">
      <div className="max-w-[760px] mx-auto px-6 py-20">
        <p className="font-mono text-[11px] text-amber-500 uppercase tracking-[0.14em] mb-4">Agent Setup</p>
        <h1 className="text-[36px] font-semibold text-white tracking-tight mb-4">Set up with your AI agent</h1>
        <p className="text-zinc-400 mb-12 max-w-[500px]">
          Give your AI assistant these instructions to set up MentionWatch monitoring automatically.
        </p>

        <section className="mb-12">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">Quick setup prompt</h2>
          <p className="text-[14px] text-zinc-500 mb-4">Copy this into ChatGPT, Claude, or any AI assistant:</p>
          <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-5 font-mono text-[12px] leading-[1.75] text-zinc-400 overflow-x-auto whitespace-pre-wrap">
{`I want to set up social media monitoring for my product using MentionWatch.

Here's what MentionWatch does:
- Monitors Hacker News and Reddit for keyword mentions
- Sends me webhooks when keywords appear
- Pricing: Starter $19/mo (5 keywords), Pro $49/mo (25 keywords)
- 7-day free trial, no credit card required

Help me:
1. Sign up at https://mentionwatch.mlh.one/#pricing
2. After checkout, I'll get an API key at /welcome
3. Add my keywords via API
4. Set up my webhook endpoint
5. Test that it works

API base URL: https://mentionwatch.mlh.one
Auth: Authorization: Bearer <my-api-key>
Docs: https://mentionwatch.mlh.one/docs
Machine-readable docs: https://mentionwatch.mlh.one/llms.txt`}
          </pre>
        </section>

        <section className="mb-12">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">Step-by-step</h2>
          <div className="space-y-6">
            <div>
              <p className="font-mono text-[11px] text-zinc-600 mb-2">Step 1: Sign up</p>
              <p className="text-[14px] text-zinc-400">
                Go to <Link href="/#pricing" className="text-amber-500 hover:text-amber-400 no-underline">mentionwatch.mlh.one/#pricing</Link> and pick a plan. After Creem checkout, you&apos;ll be redirected to <code className="font-mono text-[12px] text-zinc-300">/welcome</code> with your API key and webhook secret.
              </p>
            </div>
            <div>
              <p className="font-mono text-[11px] text-zinc-600 mb-2">Step 2: Add keywords</p>
              <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto">
{`curl -X POST https://mentionwatch.mlh.one/api/keywords \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"keyword": "your-product-name"}'`}
              </pre>
            </div>
            <div>
              <p className="font-mono text-[11px] text-zinc-600 mb-2">Step 3: Set webhook URL</p>
              <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto">
{`curl -X POST https://mentionwatch.mlh.one/api/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://your-app.com/mentionwatch-webhook"}'`}
              </pre>
            </div>
            <div>
              <p className="font-mono text-[11px] text-zinc-600 mb-2">Step 4: Test</p>
              <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto">
{`curl -X POST https://mentionwatch.mlh.one/api/webhooks/test \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
              </pre>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-[20px] font-semibold text-white tracking-tight mb-4">Machine-readable docs</h2>
          <p className="text-[14px] text-zinc-400">
            For AI agents that support <code className="font-mono text-[12px] text-zinc-300">llms.txt</code>:{" "}
            <Link href="/llms.txt" className="text-amber-500 hover:text-amber-400 no-underline">mentionwatch.mlh.one/llms.txt</Link>
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <Link href="/docs" className="text-amber-500 hover:text-amber-400 no-underline font-mono text-[13px]">Full API docs &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
