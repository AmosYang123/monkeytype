import type { Metadata } from "next";
import { LeaderboardsPage } from "@/components/pages/LeaderboardsPage";

export const metadata: Metadata = { title: "Leaderboards" };

export default function Page() {
  return <LeaderboardsPage />;
}
