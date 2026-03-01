import { getSupabaseServer } from "@/lib/supabase.server";
import { getPublishedProperties } from "@repo/supabase";
import type { PortalPropertyFilters } from "@repo/supabase";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const { supabase, headers } = getSupabaseServer(request);

  const filters: PortalPropertyFilters = {};

  const q = url.searchParams.get("q");
  if (q) filters.query = q;

  const priceMin = url.searchParams.get("priceMin");
  if (priceMin) filters.priceMin = Number(priceMin);

  const priceMax = url.searchParams.get("priceMax");
  if (priceMax) filters.priceMax = Number(priceMax);

  const bedrooms = url.searchParams.get("bedrooms");
  if (bedrooms) filters.bedrooms = Number(bedrooms);

  const status = url.searchParams.getAll("status");
  if (status.length) filters.status = status;

  const type = url.searchParams.getAll("type");
  if (type.length) filters.type = type;

  const location = url.searchParams.get("location");
  if (location) filters.location = location;

  const page = url.searchParams.get("page");
  if (page) filters.page = Number(page);

  const limit = url.searchParams.get("limit");
  if (limit) filters.limit = Number(limit);

  const sortBy = url.searchParams.get(
    "sortBy",
  ) as PortalPropertyFilters["sortBy"];
  if (sortBy) filters.sortBy = sortBy;

  try {
    const result = await getPublishedProperties(supabase, filters);
    return Response.json(result, { headers });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to fetch properties" },
      { status: 500, headers },
    );
  }
}
