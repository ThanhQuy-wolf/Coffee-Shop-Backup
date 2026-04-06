import { FeedLayout } from "@/components/templates/feed-layout";

export default function RootFeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FeedLayout>{children}</FeedLayout>;
}
