import { defineConfig } from "@trigger.dev/sdk";
import { syncEnvVars } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: "proj_ozkmhmkswbitdwpqfmii",
  dirs: ["src/trigger"],
  maxDuration: 300,
  build: {
    extensions: [
      syncEnvVars(({ env }) => {
        const keys = ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL"];
        return keys
          .filter((k) => env[k])
          .map((k) => ({ name: k, value: env[k]! }));
      }),
    ],
  },
});
