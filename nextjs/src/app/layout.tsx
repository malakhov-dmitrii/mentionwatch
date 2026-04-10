import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MentionWatch — Social Media Monitoring API for Developers",
  description:
    "Monitor keyword mentions across social media via API and webhooks. Developer-first. Set up in 90 seconds. $19/mo.",
  openGraph: {
    title: "MentionWatch — Social Media Monitoring API",
    description:
      "Get webhooks when your product is mentioned on HN, Reddit, and more. Set up in 90 seconds.",
    type: "website",
    url: "https://mentionwatch.mlh.one",
  },
  twitter: { card: "summary_large_image" },
  keywords:
    "social media monitoring API, mention monitoring webhooks, brand monitoring API, keyword monitoring, HN monitoring, Reddit monitoring",
  alternates: {
    types: { "text/plain": "/llms.txt" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "MentionWatch",
              description:
                "Social media keyword monitoring API with webhook delivery. Developer-first. AI-agent friendly.",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web API",
              offers: [
                {
                  "@type": "Offer",
                  name: "Starter",
                  price: "19",
                  priceCurrency: "USD",
                },
                {
                  "@type": "Offer",
                  name: "Pro",
                  price: "49",
                  priceCurrency: "USD",
                },
              ],
              url: "https://mentionwatch.mlh.one",
            }),
          }}
        />
        <script
          defer
          data-domain="mentionwatch.mlh.one"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="bg-[#09090b] text-zinc-400 font-sans text-base leading-relaxed antialiased">
        {children}
      </body>
    </html>
  );
}
