import type { NextRequest } from "next/server";
import { REMOTE_LANGUAGES } from "@/data/remote-languages";

// Preserve old language URLs while serving the bundled dictionaries.
export async function GET(req: NextRequest, ctx: RouteContext<"/api/languages/[name]">) {
  const { name } = await ctx.params;
  if (!REMOTE_LANGUAGES.includes(name)) {
    return Response.json({ error: "unknown language" }, { status: 404 });
  }
  return Response.redirect(new URL(`/languages/${encodeURIComponent(name)}.json`, req.url), 307);
}
