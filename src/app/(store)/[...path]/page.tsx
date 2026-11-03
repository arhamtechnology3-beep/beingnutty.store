import { redirectOrNotFound } from "@/lib/redirects";

export const revalidate = 300;

/** Only reached when no other route matches: serves admin-managed redirects, otherwise a 404. */
export default async function RedirectOrNotFound({ params }: PageProps<"/[...path]">) {
  const { path } = await params;
  return redirectOrNotFound(`/${path.map((segment) => decodeURIComponent(segment)).join("/")}`);
}
