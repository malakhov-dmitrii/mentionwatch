import type { Metadata } from "next";
import { WelcomeClient } from "./client";

export const metadata: Metadata = {
  title: "Welcome to MentionWatch",
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default function WelcomePage() {
  return <WelcomeClient />;
}
