"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className={`font-mono text-[11px] border px-2 py-1 cursor-pointer transition-colors bg-transparent ${
        copied
          ? "text-amber-500 border-amber-500/40"
          : "text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-zinc-600"
      }`}
    >
      {copied ? "copied" : label}
    </button>
  );
}

function WelcomeContent() {
  const params = useSearchParams();
  const checkoutId = params.get("checkout_id");

  const [data, setData] = useState<{
    found: boolean;
    apiKey?: string;
    webhookSecret?: string;
    plan?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkoutId) {
      setLoading(false);
      return;
    }
    fetch(`/api/trpc/welcome.fetchCredentials?input=${encodeURIComponent(JSON.stringify({ checkoutId }))}`)
      .then((r) => r.json())
      .then((r) => {
        setData(r.result?.data || { found: false });
        setLoading(false);
      })
      .catch(() => {
        setData({ found: false });
        setLoading(false);
      });
  }, [checkoutId]);

  if (!checkoutId) {
    return (
      <div className="max-w-[660px] mx-auto px-6 py-24">
        <h1 className="text-[32px] font-semibold text-white tracking-tight mb-4">Welcome to MentionWatch</h1>
        <p className="text-zinc-400">Missing checkout_id. Please complete checkout first.</p>
        <Link href="/#pricing" className="text-amber-500 hover:text-amber-400 no-underline mt-4 inline-block font-mono text-[13px]">
          Go to pricing &rarr;
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[660px] mx-auto px-6 py-24">
        <h1 className="text-[32px] font-semibold text-white tracking-tight mb-4">Loading...</h1>
        <p className="text-zinc-500 font-mono text-[13px]">Fetching your credentials...</p>
      </div>
    );
  }

  if (!data?.found) {
    return (
      <div className="max-w-[660px] mx-auto px-6 py-24">
        <h1 className="text-[32px] font-semibold text-white tracking-tight mb-4">Checkout not found</h1>
        <p className="text-zinc-400 mb-4">This checkout link may have expired or is invalid.</p>
        <a href="mailto:hello@mentionwatch.com" className="text-amber-500 hover:text-amber-400 no-underline font-mono text-[13px]">
          Contact support &rarr;
        </a>
      </div>
    );
  }

  const planLabel = data.plan === "pro" ? "Pro ($49/mo)" : "Starter ($19/mo)";

  return (
    <div className="max-w-[660px] mx-auto px-6 py-24">
      <p className="font-mono text-[11px] text-amber-500 uppercase tracking-[0.14em] mb-4">Welcome</p>
      <h1 className="text-[32px] font-semibold text-white tracking-tight mb-2">You&apos;re in.</h1>
      <p className="text-zinc-400 mb-10">Plan: <span className="text-zinc-200">{planLabel}</span></p>

      {/* API Key */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[11px] text-zinc-600 uppercase tracking-[0.1em]">Your API key</p>
          <CopyButton text={data.apiKey || ""} label="copy" />
        </div>
        <div className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[13px] text-amber-500 break-all">
          {data.apiKey}
        </div>
      </div>

      {/* Webhook Secret */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[11px] text-zinc-600 uppercase tracking-[0.1em]">Webhook secret</p>
          <CopyButton text={data.webhookSecret || ""} label="copy" />
        </div>
        <div className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[13px] text-zinc-400 break-all">
          {data.webhookSecret}
        </div>
      </div>

      {/* Quickstart */}
      <h2 className="text-[20px] font-semibold text-white tracking-tight mb-6">Quickstart</h2>
      <div className="space-y-4">
        <div>
          <p className="font-mono text-[11px] text-zinc-600 mb-2">1. Add a keyword</p>
          <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto">
{`curl -X POST https://mentionwatch.mlh.one/api/keywords \\
  -H "Authorization: Bearer ${data.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"keyword": "your-product"}'`}
          </pre>
        </div>
        <div>
          <p className="font-mono text-[11px] text-zinc-600 mb-2">2. Set your webhook URL</p>
          <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto">
{`curl -X POST https://mentionwatch.mlh.one/api/webhooks \\
  -H "Authorization: Bearer ${data.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://your-app.com/webhook"}'`}
          </pre>
        </div>
        <div>
          <p className="font-mono text-[11px] text-zinc-600 mb-2">3. Send a test webhook</p>
          <pre className="bg-[#0c0c0e] border border-zinc-800/50 p-4 font-mono text-[12px] text-zinc-400 overflow-x-auto">
{`curl -X POST https://mentionwatch.mlh.one/api/webhooks/test \\
  -H "Authorization: Bearer ${data.apiKey}"`}
          </pre>
        </div>
      </div>

      <div className="mt-10 pt-8 border-t border-zinc-800/50">
        <Link href="/docs" className="text-amber-500 hover:text-amber-400 no-underline font-mono text-[13px]">
          Read the full docs &rarr;
        </Link>
      </div>
    </div>
  );
}

export function WelcomeClient() {
  return (
    <Suspense fallback={
      <div className="max-w-[660px] mx-auto px-6 py-24">
        <p className="text-zinc-500 font-mono text-[13px]">Loading...</p>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
