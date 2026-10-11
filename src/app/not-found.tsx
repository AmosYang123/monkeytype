import type { Metadata } from "next";
import { NotFoundPage } from "@/components/pages/NotFoundPage";

export const metadata: Metadata = { title: "404 Not Found" };

export default function NotFound() {
  return <NotFoundPage />;
}
