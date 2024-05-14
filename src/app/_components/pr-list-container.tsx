"use client";

import { PullRequestState } from "@/graphql/generated";
import { api } from "@/trpc/react";
import { PRReport } from "./pr-report";
import { PRList } from "./pr-list";
import clsx from "clsx";

const ownerName = "";
const repoName = "";

export const PRListContainer = () => {
  const { data, fetchNextPage, isFetching } =
    api.github.getPRList.useInfiniteQuery(
      {
        owner: ownerName,
        repo: repoName,
        states: [PullRequestState.Open, PullRequestState.Merged],
        perPage: 100,
      },
      {
        getNextPageParam: (lastPage) =>
          lastPage?.pullRequests?.pageInfo?.endCursor,
      },
    );

  const prList = data?.pages.flatMap((page) => page?.pullRequests?.nodes ?? []);

  return (
    <div className="flex h-full flex-col gap-3 bg-gray-950 p-6">
      <div className="flex justify-between">
        <div></div>
        <button
          className="rounded-lg bg-green-700 px-4 py-1 text-white"
          onClick={() => fetchNextPage()}
        >
          Load More
        </button>
      </div>

      <div
        className={clsx("flex flex-1 flex-col overflow-hidden", {
          "opacity-50": isFetching,
        })}
      >
        <PRList prList={prList} />
        <PRReport prList={prList} />
      </div>
    </div>
  );
};
