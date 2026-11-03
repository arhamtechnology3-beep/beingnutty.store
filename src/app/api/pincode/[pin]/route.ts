type PostOffice = { Name: string; District: string; State: string; Block?: string };
type Lookup = { Status: string; PostOffice: PostOffice[] | null }[];

export async function GET(_request: Request, ctx: RouteContext<"/api/pincode/[pin]">) {
  const { pin } = await ctx.params;
  if (!/^[1-9]\d{5}$/.test(pin)) return Response.json({ ok: false }, { status: 400 });

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      next: { revalidate: 60 * 60 * 24 * 30 },
      signal: AbortSignal.timeout(4000),
    });
    const [data] = (await res.json()) as Lookup;
    const office = data?.Status === "Success" ? data.PostOffice?.[0] : undefined;
    if (!office) return Response.json({ ok: false }, { status: 404 });
    return Response.json(
      { ok: true, city: office.District, state: office.State, area: office.Name },
      { headers: { "Cache-Control": "public, max-age=86400, s-maxage=2592000" } },
    );
  } catch {
    return Response.json({ ok: false }, { status: 502 });
  }
}
