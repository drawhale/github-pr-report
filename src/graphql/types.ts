import { GetPullRequestsQuery } from "./generated";

export type PullReqeust = NonNullable<
  NonNullable<GetPullRequestsQuery["repository"]>["pullRequests"]["nodes"]
>[0];

export type TimelineItem = NonNullable<
  NonNullable<PullReqeust>["timelineItems"]["nodes"]
>[0];
