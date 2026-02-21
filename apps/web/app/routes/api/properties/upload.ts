import type { Route } from "./+types/upload";
import { data } from "react-router";
import { getSupabaseServer } from "@/lib/supabase.server";
import { uploadPropertyImages, deletePropertyImage } from "@repo/supabase";

export const action = async ({ request }: Route.ActionArgs) => {
  const { supabase, headers } = getSupabaseServer(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return data({ error: "Unauthorized" }, { status: 401, headers });
  }

  // ── POST: Upload images ──
  if (request.method === "POST") {
    try {
      const formData = await request.formData();
      const propertyId = formData.get("propertyId") as string | null;
      const files = formData.getAll("files") as File[];

      if (!files.length) {
        return data({ error: "No files provided" }, { status: 400, headers });
      }

      const targetId = propertyId || `temp-${Date.now()}`;

      const uploadedUrls = await uploadPropertyImages(
        supabase as any,
        user.id,
        targetId,
        files,
      );

      return data({ urls: uploadedUrls }, { headers });
    } catch (error) {
      console.error("Upload error:", error);
      return data(
        {
          error:
            error instanceof Error ? error.message : "Failed to upload images",
        },
        { status: 500, headers },
      );
    }
  }

  // ── DELETE: Remove image from storage ──
  if (request.method === "DELETE") {
    try {
      const body = (await request.json()) as { imageUrl?: string };
      const { imageUrl } = body;

      if (!imageUrl) {
        return data(
          { error: "imageUrl is required" },
          { status: 400, headers },
        );
      }

      await deletePropertyImage(supabase as any, imageUrl);
      return data({ success: true }, { headers });
    } catch (error) {
      console.error("Delete image error:", error);
      return data(
        {
          error:
            error instanceof Error ? error.message : "Failed to delete image",
        },
        { status: 500, headers },
      );
    }
  }

  return data({ error: "Method not allowed" }, { status: 405, headers });
};
