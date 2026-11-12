/**
 * Minimal, safe renderer for admin-authored text:
 * blank line = new paragraph, "## " = heading, "- " = bullet list.
 */
export function RichText({ text }: { text: string }) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n\s*\n/);
  return (
    <div className="space-y-5 text-lg leading-relaxed text-roast">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trimEnd());
        const heading = lines[0]?.match(/^##\s+(.+)$/);
        if (heading && lines.length === 1) {
          return (
            <h3 key={i} className="pt-4 font-display text-2xl font-bold text-ink">
              {heading[1]}
            </h3>
          );
        }
        if (heading && lines.length > 1) {
          return (
            <div key={i} className="space-y-3">
              <h3 className="pt-4 font-display text-2xl font-bold text-ink">{heading[1]}</h3>
              {lines.slice(1).filter(Boolean).map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          );
        }
        if (lines.length && lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-6">
              {lines.map((l) => (
                <li key={l}>{l.slice(2)}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{block}</p>;
      })}
    </div>
  );
}
