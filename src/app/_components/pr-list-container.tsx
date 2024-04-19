"use client";

import { PullRequestState } from "@/graphql/generated";
import { api } from "@/trpc/react";

const ownerName = "";
const repoName = "";

export const PRListContainer = () => {
  const { data, fetchNextPage } = api.github.getPRList.useInfiniteQuery(
    {
      owner: ownerName,
      repo: repoName,
      states: [PullRequestState.Open, PullRequestState.Merged],
      perPage: 10,
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage?.pullRequests?.pageInfo?.endCursor,
    },
  );

  const prList = data?.pages.flatMap((page) => page?.pullRequests?.nodes ?? []);
  console.log(prList);

  return (
    <div>
      <button onClick={() => fetchNextPage()}>Load More</button>
      <table>
        <thead>
          <tr>
            <th>PR</th>
            <th>State</th>
            <th>Comments</th>
            <th>Assigner</th>
            <th>Requested</th>
            <th>Approved</th>
            <th>Created At</th>
            <th>Merged At</th>
          </tr>
        </thead>
        <tbody>
          {prList?.map((pr) => {
            if (pr === null) return null;
            return (
              <tr key={pr.id}>
                <td>
                  <a
                    href={pr.url as string}
                    target="_blank"
                    className="underline"
                  >
                    {pr.title}
                  </a>
                </td>
                <th>{pr.state}</th>
                <td>{pr.totalCommentsCount}</td>
                <td>{pr.author?.login}</td>
                <td>
                  {pr.timelineItems?.nodes
                    ?.map((node) =>
                      node?.__typename === "ReviewRequestedEvent" &&
                      node.requestedReviewer?.__typename === "User"
                        ? node.requestedReviewer?.login
                        : null,
                    )
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td>
                  {pr.reviews?.nodes
                    ?.map((node) => node?.author?.login)
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td>{pr.createdAt}</td>
                <td>{pr.mergedAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
