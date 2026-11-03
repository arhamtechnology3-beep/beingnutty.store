import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ConfirmButton } from "./confirm-button";
import { buttonClass, PageHeader } from "./ui";

export function EditorHeader({
  title,
  saved,
  viewHref,
  onDelete,
}: {
  title: string;
  saved: boolean;
  viewHref?: string;
  onDelete?: () => Promise<void>;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <PageHeader title={title} description={saved ? "Saved. Changes are live on the store." : undefined} />
      <div className="flex gap-2">
        {viewHref ? (
          <Link href={viewHref} target="_blank" className={buttonClass("secondary")}>
            <ExternalLink className="size-4" /> View
          </Link>
        ) : null}
        {onDelete ? (
          <form action={onDelete}>
            <ConfirmButton message={`Delete “${title}”? This can't be undone.`} className={buttonClass("danger")}>
              Delete
            </ConfirmButton>
          </form>
        ) : null}
      </div>
    </div>
  );
}
