import type { PullRequestFragment } from "@/graphql/generated";
import dayjs from "dayjs";
import { Fragment } from "react";

type Props = {
  prList?: (PullRequestFragment | null)[];
};

export const PRList = ({ prList = [] }: Props) => {
  return (
    <>
      <Row>
        <Th>PR</Th>
        <Th width={120}>State</Th>
        <Th width={100}>Comments</Th>
        <Th width={160}>Assigner</Th>
        <Th width={160}>Requested</Th>
        <Th width={160}>Approved</Th>
        <Th width={100}>Created At</Th>
        <Th width={100}>Merged At</Th>
      </Row>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {prList?.map((pr) => {
          if (pr === null) return null;
          return (
            <Row key={pr.id}>
              <Td align="left">
                <a
                  href={pr.url as string}
                  target="_blank"
                  className="underline"
                >
                  {pr.title}
                </a>
              </Td>
              <Td width={120}>{pr.state}</Td>
              <Td width={100}>{pr.totalCommentsCount}</Td>
              <Td width={160}>{pr.author?.login}</Td>
              <Td width={160}>
                {pr.timelineItems?.nodes
                  ?.map((node) =>
                    node?.__typename === "ReviewRequestedEvent" &&
                    node.requestedReviewer?.__typename === "User"
                      ? node.requestedReviewer?.login
                      : null,
                  )
                  .filter(Boolean)
                  .join(", ")}
              </Td>
              <Td width={160}>
                {pr.reviews?.nodes
                  ?.map((node) => node?.author?.login)
                  .filter(Boolean)
                  .join(", ")}
              </Td>
              <Td width={100}>
                {dayjs(pr.createdAt as string).format("YY-MM-DD")}
              </Td>
              <Td width={100}>
                {pr.mergedAt
                  ? dayjs(pr.mergedAt as string).format("YY-MM-DD")
                  : ""}
              </Td>
            </Row>
          );
        })}
      </div>
    </>
  );
};

const Row = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex w-full gap-2 border-b border-b-gray-800 py-2 even:bg-[#12161c] ">
      {children}
    </div>
  );
};

const Th = ({
  width,
  children,
}: React.PropsWithChildren<{ width?: number }>) => {
  return (
    <div
      className="text-center text-lg text-gray-500"
      style={{ width, flex: width === undefined ? 1 : undefined }}
    >
      {children}
    </div>
  );
};

const Td = ({
  width,
  align = "center",
  children,
}: React.PropsWithChildren<{
  width?: number;
  align?: "left" | "center" | "right";
}>) => {
  return (
    <div
      className="text-left text-lg text-gray-300"
      style={{
        width,
        flex: width === undefined ? 1 : undefined,
        textAlign: align,
      }}
    >
      {children}
    </div>
  );
};
