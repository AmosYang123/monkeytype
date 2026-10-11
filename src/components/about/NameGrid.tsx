"use client";

import { useEffect, useState } from "react";

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

export function NameGrid({ src, errorMessage }: { src: string; errorMessage: string }) {
  const [names, setNames] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(src)
      .then((r) => r.json() as Promise<unknown>)
      .then((d) => (isStringArray(d) ? setNames(d) : setFailed(true)))
      .catch(() => setFailed(true));
  }, [src]);

  if (failed) return <div className="text-error">{errorMessage}</div>;
  return (
    <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(13em, 1fr))" }}>
      {names.map((n, i) => (
        <div key={`${n}-${i}`}>{n}</div>
      ))}
    </div>
  );
}
