import type { PullRequestFragment } from "@/graphql/generated";

type Props = {
  prList?: (PullRequestFragment | null)[];
};

export const PRReport = ({ prList = [] }: Props) => {
  const reportData = getReportData(prList);
  console.log(reportData);
  return <div></div>;
};

const getReportData = (prList: (PullRequestFragment | null)[]) => {
  return prList.reduce((acc, pr) => {
    if (pr === null) return acc;

    const toDo = [
      getPRCount,
      getRequestedCount,
      getApprovedCountOfRequested,
      getApprovedCount,
    ];

    toDo.forEach((fn) => {
      const results = fn(pr);
      if (!results) return;
      results.forEach((result) => {
        const [key, subKey, value] = result;
        if (!key) return;
        if (!acc.has(key)) {
          acc.set(key, { [subKey]: value });
        } else {
          acc.set(key, {
            ...acc.get(key),
            [subKey]: (acc.get(key)?.[subKey] ?? 0) + value,
          });
        }
      });
    });

    return acc;
  }, new Map<string, Record<string, number>>());
};

const getPRCount = (pr: PullRequestFragment) => {
  if (!pr.author) return null;
  return [[pr.author.login, "prCount", 1] as const];
};

const getRequestedCount = (pr: PullRequestFragment) => {
  if (!pr.timelineItems) return null;

  return pr.timelineItems?.nodes
    ?.map((node) =>
      node?.__typename === "ReviewRequestedEvent" &&
      node.requestedReviewer?.__typename === "User"
        ? node.requestedReviewer?.login
        : null,
    )
    .filter(Boolean)
    .map((login) => [login, "requestedCount", 1] as const);
};

const getApprovedCountOfRequested = (pr: PullRequestFragment) => {
  if (!pr.timelineItems) return null;

  const requested =
    pr.timelineItems?.nodes
      ?.map((node) =>
        node?.__typename === "ReviewRequestedEvent" &&
        node.requestedReviewer?.__typename === "User"
          ? node.requestedReviewer?.login
          : null,
      )
      .filter(Boolean) ?? [];

  const approved =
    pr.reviews?.nodes?.map((node) => node?.author?.login).filter(Boolean) ?? [];

  return requested
    .filter((login) => login && approved.includes(login))
    .map((login) => [login, "approvedCountOfRequested", 1] as const);
};

const getApprovedCount = (pr: PullRequestFragment) => {
  if (!pr.reviews) return null;

  return pr.reviews?.nodes
    ?.map((node) => node?.author?.login)
    .filter(Boolean)
    .map((login) => [login, "approvedCount", 1] as const);
};
