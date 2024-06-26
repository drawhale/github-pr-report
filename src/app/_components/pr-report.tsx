import type { PullRequestFragment } from "@/graphql/generated";
import clsx from "clsx";
import { useState } from "react";

type ReportData = {
  prCount?: number;
  requestedCount?: number;
  approvedCountOfRequested?: number;
  approvedCount?: number;
  commentCount?: number;
};

type Props = {
  prList?: (PullRequestFragment | null)[];
};

export const PRReport = ({ prList = [] }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const reportData = getReportData(prList);

  return (
    <div
      className={clsx(
        "fixed bottom-0 left-0 flex max-h-[calc(100%_-_200px)] w-full flex-col items-center",
        "transition-transform",
        !isOpen ? "translate-y-[calc(100%_-_30px)]" : "translate-y-0",
      )}
    >
      <div
        className="flex h-[30px] w-[100px] cursor-pointer items-center justify-center rounded-t-lg border border-gray-900 bg-gray-800"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <UpIcon
          size={30}
          className={clsx("fill-white", "transition-transform duration-300", {
            "rotate-180": isOpen,
          })}
        />
      </div>
      <div className="flex w-full flex-1 flex-col items-center gap-5 overflow-y-auto rounded-xl border-t border-gray-950 bg-gray-900 p-8">
        {Array.from(reportData.entries())
          .sort(
            ([, aData], [, bData]) =>
              (bData.approvedCount ?? 0) - (aData.approvedCount ?? 0),
          )
          .map(([name, data]) => (
            <div
              key={name}
              className="flex w-fit items-center justify-between gap-10 p-2 text-white"
            >
              <div className="w-40 text-lg">@{name}</div>
              <div className="flex items-center gap-[20px]">
                <ValueItem label="PR" value={data.prCount ?? 0} />
                <ValueItem label="Approved" value={data.approvedCount ?? 0} />
                <ValueItem
                  label="Requested"
                  value={`${data.approvedCountOfRequested ?? 0} / ${data.requestedCount ?? 0}`}
                />
                <ValueItem label="Comments" value={data.commentCount ?? 0} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const ValueItem = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex h-[6rem] w-[6rem] items-center justify-center rounded-full border border-gray-500 text-xl font-bold">
        {value}
      </div>
      <div className="text-sm">{label}</div>
    </div>
  );
};

export const UpIcon = ({
  size = 32,
  className = "fill-deep-gray",
}: {
  size?: number;
  className?: string;
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 30 30"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14.0271 10.8727C14.4259 10.4122 15.1402 10.4122 15.539 10.8727L21.8221 18.1278C22.383 18.7754 21.9229 19.7824 21.0662 19.7824L8.49999 19.7824C7.64323 19.7824 7.18318 18.7754 7.74406 18.1278L14.0271 10.8727Z" />
    </svg>
  );
};

const getReportData = (prList: (PullRequestFragment | null)[]) => {
  return prList.reduce((acc, pr) => {
    if (pr === null) return acc;

    const toDo = [
      getPRCount,
      getRequestedCount,
      getApprovedCountOfRequested,
      getApprovedCount,
      getCommentCount,
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
  }, new Map<string, ReportData>());
};

const getPRCount = (pr: PullRequestFragment) => {
  if (!pr.author) return null;
  return [[pr.author.login, "prCount", 1] as const];
};

const getRequestedCount = (pr: PullRequestFragment) => {
  if (!pr.timelineItems) return null;

  const approved =
    pr.reviews?.nodes?.map((node) => node?.author?.login).filter(Boolean) ?? [];

  if (approved.length === 0) return null;

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

const getCommentCount = (pr: PullRequestFragment) => {
  if (!pr.comments) return null;

  return pr.comments.nodes
    ?.filter((node) => node?.body !== undefined)
    .map((node) =>
      node?.author?.__typename === "User" ? node?.author?.login : null,
    )
    .filter(Boolean)
    .map((login) => [login, "commentCount", 1] as const);
};
