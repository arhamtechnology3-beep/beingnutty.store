/**
 * Minimal, safe renderer for admin-authored text:
 * blank line = new paragraph, "## " = heading, "- " = bullet list.
 */
export function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="space-y-5 text-lg leading-relaxed text-roast">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-4 font-display text-2xl font-bold text-ink">
              {block.slice(3)}
            </h2>
          );
        }
        if (lines.every((l) => l.startsWith("- "))) {
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
