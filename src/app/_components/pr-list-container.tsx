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
            <th>Assigner</th>
            <th>Comments</th>
            {/* <th>Created At</th> */}
            {/* <th>User</th> */}
            {/* <th>Requested Reviewers</th> */}
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
                <td>{pr.author?.login}</td>
                <td>{pr.totalCommentsCount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
