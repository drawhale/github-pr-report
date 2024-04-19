import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_APP_API_URL,
  documents: "./src/graphql/**/*.graphql",
  generates: {
    "./src/graphql/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
    },
  },
  config: {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "User-Agent": "Github PR Report",
    },
  },
};
export default config;
