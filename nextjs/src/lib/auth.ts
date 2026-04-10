import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  user: {
    additionalFields: {
      plan: {
        type: "string",
        defaultValue: "starter",
        input: true,
      },
      webhookUrl: {
        type: "string",
        required: false,
        input: true,
      },
      webhookSecret: {
        type: "string",
        required: false,
        input: true,
      },
      mentionsThisMonth: {
        type: "number",
        defaultValue: 0,
        input: true,
      },
      monthReset: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  plugins: [
    apiKey(),
    bearer(),
  ],
});

export type Auth = typeof auth;
