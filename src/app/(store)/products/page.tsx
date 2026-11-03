import { permanentRedirect } from "next/navigation";

export default function ProductsIndexPage() {
  permanentRedirect("/collections/dry-fruits");
}
