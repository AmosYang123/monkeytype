// Renders GitHub release bodies the way monkeytype's version history does (### headings, **bold**,
// [links](url), line breaks) but as data, so nothing from GitHub is ever injected as HTML.
export type Inline = { kind: "text" | "bold"; text: string } | { kind: "link"; text: string; href: string };
export type Block = { kind: "heading"; text: string } | { kind: "line"; inline: Inline[] };

const INLINE = /\*\*(.*?)\*\*|\[(.*?)\]\((.*?)\)/g;

export function parseInline(line: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of line.matchAll(INLINE)) {
    if (m.index > last) out.push({ kind: "text", text: line.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: "bold", text: m[1] });
    else if (/^https?:\/\//i.test(m[3])) out.push({ kind: "link", text: m[2], href: m[3] });
    else out.push({ kind: "text", text: m[0] });
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push({ kind: "text", text: line.slice(last) });
  return out;
}

export function parseReleaseBody(body: string): Block[] {
  const lines = body.split(/\r?\n/);
  const out: Block[] = [];
  for (let i = 0; i < lines.length; i++) {
    const h = /^### (.*)$/.exec(lines[i]);
    if (!h) {
      out.push({ kind: "line", inline: parseInline(lines[i]) });
      continue;
    }
    out.push({ kind: "heading", text: h[1] });
    // the source swallows the line break right after a heading, so a blank line after it vanishes
    if (lines[i + 1] === "") i++;
  }
  return out;
}
