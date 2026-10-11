import { CommandLineFab } from "@/components/CommandLineFab";
import { CookieModal } from "@/components/CookieModal";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MerchBanner } from "@/components/MerchBanner";
import { TestPage } from "@/components/TestPage";
import { TestProvider } from "@/components/TestProvider";

export default function Home() {
  return (
    <TestProvider>
      <MerchBanner />
      <CookieModal />
      <CommandLineFab />
      <div
        id="app"
        className="content-grid min-h-screen grid-rows-[auto_1fr_auto] gap-y-8 pt-[calc(var(--banner-height,0px)+2rem)] pb-8"
      >
        <Header />
        <TestPage />
        <Footer />
      </div>
    </TestProvider>
  );
}
