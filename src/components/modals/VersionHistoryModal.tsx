"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Fa } from "@/components/icons";
import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { notify } from "@/lib/notifications";
import { useIsModalOpen } from "@/lib/modals";
import { parseReleaseBody, type Inline } from "@/lib/release-notes";

const API = "https://api.github.com/repos/monkeytypegame/monkeytype/releases?per_page=5&page=";

type Release = { name: string; publishedAt: string; body: string };
type GithubRelease = { name: string | null; draft: boolean; prerelease: boolean; body: string | null; published_at: string };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

async function fetchReleases(page: number): Promise<{ releases: Release[]; empty: boolean }> {
  const res = await fetch(`${API}${page}`);
  if (!res.ok) throw new Error(`GitHub responded with ${res.status}`);
  const data = (await res.json()) as GithubRelease[];
  return {
    empty: data.length === 0,
    releases: data
      .filter((r) => !r.draft && !r.prerelease)
      .map((r) => ({ name: r.name ?? "", publishedAt: formatDate(r.published_at), body: r.body ?? "" })),
  };
}

function Inlines({ items }: { items: Inline[] }) {
  return items.map((it, i) =>
    it.kind === "bold" ? (
      <b key={i}>{it.text}</b>
    ) : it.kind === "link" ? (
      <a key={i} href={it.href} target="_blank" rel="noopener noreferrer">
        {it.text}
      </a>
    ) : (
      <Fragment key={i}>{it.text}</Fragment>
    ),
  );
}

function ReleaseItem({ release }: { release: Release }) {
  return (
    <div className="grid gap-4">
      <div className="flex place-items-center justify-between">
        <div className="text-4xl text-main">{release.name}</div>
        <div className="text-sub">{release.publishedAt}</div>
      </div>
      <div>
        {parseReleaseBody(release.body).map((b, i) =>
          b.kind === "heading" ? (
            <h3 key={i} className="mb-2 text-xl text-sub">
              {b.text}
            </h3>
          ) : (
            <Fragment key={i}>
              <Inlines items={b.inline} />
              <br />
            </Fragment>
          ),
        )}
      </div>
      <div className="mt-4 mb-16 h-1 w-full rounded bg-sub-alt" />
    </div>
  );
}

export function VersionHistoryModal() {
  const isOpen = useIsModalOpen("VersionHistory");
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const page = useRef(1);
  const busy = useRef(false);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    try {
      const { releases: next, empty } = await fetchReleases(page.current);
      page.current += 1;
      setReleases((prev) => [...prev, ...next]);
      if (empty) setDone(true);
      setError(null);
    } catch (e) {
      console.error("Failed to load version history", e);
      notify("Failed to load version history", { level: "error" });
      setError("Failed to load version history");
      setDone(true);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  // load while open; the observer re-fires whenever the bottom is (still) in view after a page lands
  useEffect(() => {
    const el = sentinel;
    if (!isOpen || done || !el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) void loadMore();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [isOpen, done, loadMore, sentinel, releases.length]);

  return (
    <AnimatedModal id="VersionHistory" modalClass="max-w-6xl!">
      {error && releases.length === 0 ? (
        <div>{error}</div>
      ) : (
        <div className="releases">
          {releases.map((r) => (
            <ReleaseItem key={r.name + r.publishedAt} release={r} />
          ))}
        </div>
      )}
      <div ref={setSentinel} className="mb-8 min-h-px text-center text-2xl text-sub">
        {loading && <Fa icon="circle-notch" className="animate-spin" />}
      </div>
    </AnimatedModal>
  );
}
