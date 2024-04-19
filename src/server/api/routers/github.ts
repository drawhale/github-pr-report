import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import request from "graphql-request";
import { PullRequestState, GetPullRequestsDocument } from "@/graphql/generated";

const getRequestHeaders = () => ({
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
});

export const githubRouter = createTRPCRouter({
  getPRList: publicProcedure
    .input(
      z.object({
        owner: z.string(),
        repo: z.string(),
        perPage: z.number().min(1).max(100).default(30).optional(),
        states: z
          .array(
            z.enum([
              PullRequestState.Open,
              PullRequestState.Closed,
              PullRequestState.Merged,
            ]),
          )
          .default([PullRequestState.Merged])
          .optional(),
        cursor: z.string().nullish(),
        direction: z.enum(["forward", "backward"]),
      }),
    )
    .query(async ({ input }) => {
      const { owner, repo, perPage, states, cursor } = input;
      const result = await request(
        process.env.NEXT_PUBLIC_APP_API_URL ?? "",
        GetPullRequestsDocument,
        {
          owner,
          name: repo,
          states,
          perPage,
          cursor,
        },
        getRequestHeaders(),
      );

      return result.repository;
    }),
});
