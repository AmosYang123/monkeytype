import type { NextRequest } from "next/server";
import { REMOTE_LANGUAGES } from "@/data/remote-languages";

// Only the allow-listed large word lists are proxied (fixed upstream host, no user-controlled URL).
const UPSTREAM = "https://monkeytype.com/languages/";
const ONE_DAY = 60 * 60 * 24;

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/languages/[name]">) {
  const { name } = await ctx.params;
  if (!REMOTE_LANGUAGES.includes(name)) {
    return Response.json({ error: "unknown language" }, { status: 404 });
  }
  const res = await fetch(`${UPSTREAM}${name}.json`, { next: { revalidate: ONE_DAY } });
  if (!res.ok) return Response.json({ error: "language unavailable" }, { status: 502 });
  return new Response(res.body, {
    headers: {
      "content-type": "application/json",
      "cache-control": `public, max-age=${ONE_DAY}`,
    },
  });
}
