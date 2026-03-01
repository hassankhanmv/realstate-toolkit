import { requireAuth } from "@/lib/auth.server";
import {
  addFavorite,
  removeFavorite,
  getUserFavoriteIds,
} from "@repo/supabase";

export async function loader({ request }: { request: Request }) {
  const { user, supabase, headers } = await requireAuth(request);

  try {
    const favoriteIds = await getUserFavoriteIds(supabase, user.id);
    return Response.json({ favoriteIds }, { headers });
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to fetch favorites" },
      { status: 500, headers },
    );
  }
}

export async function action({ request }: { request: Request }) {
  const { user, supabase, headers } = await requireAuth(request);
  const body = await request.json();
  const { propertyId } = body;

  if (!propertyId) {
    return Response.json(
      { error: "propertyId is required" },
      { status: 400, headers },
    );
  }

  try {
    if (request.method === "POST") {
      const result = await addFavorite(supabase, user.id, propertyId);
      return Response.json({ success: true, data: result }, { headers });
    }

    if (request.method === "DELETE") {
      await removeFavorite(supabase, user.id, propertyId);
      return Response.json({ success: true }, { headers });
    }

    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers },
    );
  } catch (error: any) {
    return Response.json(
      { error: error.message || "Failed to update favorite" },
      { status: 500, headers },
    );
  }
}
