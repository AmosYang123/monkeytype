import Link from "next/link";
import { Fa } from "@/components/icons";

export function NotFoundPage() {
  return (
    <main className="full-width content-grid">
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col gap-16 md:flex-row">
          <div className="place-self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/monkeymeme.jpg" alt="" className="rounded-xl" />
          </div>
          <div className="flex max-w-md flex-col items-center gap-4">
            <h2 className="flex place-items-center gap-[0.5em] pb-0 text-7xl text-main">404</h2>
            <p className="text-center">
              Ooops! Looks like this page
              <br />
              or resource doesn&apos;t exist.
            </p>
            <Link
              href="/"
              className="inline-flex h-min cursor-pointer items-center justify-center gap-[0.5em] rounded bg-sub-alt px-8 py-4 text-center leading-[1.25] text-text transition-[color,background] duration-125 ease-in-out select-none hover:bg-text hover:text-bg focus-visible:shadow-[0_0_0_0.1rem_var(--bg-color),_0_0_0_0.2rem_var(--text-color)] focus-visible:outline-none active:bg-sub"
            >
              <Fa icon="home" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
