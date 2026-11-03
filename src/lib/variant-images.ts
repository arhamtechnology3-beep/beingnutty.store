/** The selected size's own photos first, then photos shared by every size. */
export function imagesForVariant<T extends { variantId: string | null }>(images: T[], variantId: string) {
  const own = images.filter((i) => i.variantId === variantId);
  const shared = images.filter((i) => !i.variantId);
  const list = [...own, ...shared];
  return list.length ? list : images;
}
