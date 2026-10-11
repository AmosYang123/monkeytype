import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const title = "Monkeytype | A minimalistic, customizable typing test";
const description =
  "The most customizable typing test website with a minimal design and a ton of features. Test yourself in various modes, track your progress and improve your speed.";

export const metadata: Metadata = {
  title: { default: title, template: "%s | Monkeytype" },
  description,
  keywords: ["typing test", "monkeytype", "speed test", "typing", "test", "speed"],
  authors: [{ name: "Miodec" }],
  icons: {
    apple: [{ url: "/seo/apple-touch-icon.png", sizes: "180x180" }],
    other: [{ rel: "mask-icon", url: "/seo/safari-pinned-tab.svg" }],
  },
  openGraph: { title, description, type: "website", images: ["/seo/mtsocial.png"] },
  twitter: { card: "summary_large_image", title, images: ["/seo/mtsocial.png"] },
};

export const viewport: Viewport = {
  themeColor: "#323437",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
