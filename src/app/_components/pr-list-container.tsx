"use client";

import { PullRequestState } from "@/graphql/generated";
import { api } from "@/trpc/react";
import { PRReport } from "./pr-report";
import { PRList } from "./pr-list";
import clsx from "clsx";
import { useRef, useState } from "react";

export const PRListContainer = () => {
  const [ownerName, setOwnerName] = useState("");
  const [repoName, setRepoName] = useState("");

  const ownerNameInputRef = useRef<HTMLInputElement>(null);
  const repoNameInputRef = useRef<HTMLInputElement>(null);

  const { data, fetchNextPage, isFetching } =
    api.github.getPRList.useInfiniteQuery(
      {
        owner: ownerName,
        repo: repoName,
        states: [PullRequestState.Open, PullRequestState.Merged],
        perPage: 100,
      },
      {
        enabled: ownerName !== "" && repoName !== "",
        retry: 1,
        getNextPageParam: (lastPage) =>
          lastPage?.pullRequests?.pageInfo?.endCursor,
      },
    );

  const handleKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setOwnerName(ownerNameInputRef.current?.value ?? "");
      setRepoName(repoNameInputRef.current?.value ?? "");
    }
  };

  const prList = data?.pages.flatMap((page) => page?.pullRequests?.nodes ?? []);

  return (
    <div className="flex h-full flex-col gap-3 bg-gray-950 p-6">
      <div className="flex justify-between">
        <div className="flex gap-2">
          <input
            ref={ownerNameInputRef}
            placeholder="owner name"
            className="rounded-lg bg-gray-800 px-2 text-white placeholder:italic placeholder:text-gray-500"
            onKeyDown={handleKeydown}
          />
          <span className="text-xl text-gray-400">/</span>
          <input
            ref={repoNameInputRef}
            placeholder="repo name"
            className="rounded-lg bg-gray-800 px-2 text-white placeholder:italic placeholder:text-gray-500"
            onKeyDown={handleKeydown}
          />
        </div>
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
        {!isFetching && !data && (
          <div className="flex w-full items-center justify-center p-8 text-white">
            Not found repository or empty data.
          </div>
        )}
        <PRList prList={prList} />
        <PRReport prList={prList} />
      </div>
    </div>
  );
};
