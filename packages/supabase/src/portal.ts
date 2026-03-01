import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, LeadInsert } from "./types";

// ── Portal Filters ──────────────────────────────────────────────────────────

export interface PortalPropertyFilters {
  query?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  status?: string[];
  type?: string[];
  location?: string;
  page?: number;
  limit?: number;
  sortBy?: "price_asc" | "price_desc" | "date_desc" | "date_asc" | "beds_desc";
}

// ── Published Properties ────────────────────────────────────────────────────

export const getPublishedProperties = async (
  supabase: SupabaseClient<Database>,
  filters: PortalPropertyFilters = {},
) => {
  try {
    const { page = 1, limit = 12, sortBy = "date_desc" } = filters;
    const offset = (page - 1) * limit;

    let query = (supabase.from("properties") as any)
      .select("*", { count: "exact" })
      .eq("is_published", true);

    // Text search on title, description, location
    if (filters.query) {
      query = query.or(
        `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,location.ilike.%${filters.query}%`,
      );
    }

    if (filters.priceMin !== undefined) {
      query = query.gte("price", filters.priceMin);
    }
    if (filters.priceMax !== undefined) {
      query = query.lte("price", filters.priceMax);
    }
    if (filters.bedrooms !== undefined) {
      query = query.gte("bedrooms", filters.bedrooms);
    }
    if (filters.status?.length) {
      query = query.in("status", filters.status);
    }
    if (filters.type?.length) {
      query = query.in("type", filters.type);
    }
    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }

    // Sorting
    switch (sortBy) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "date_asc":
        query = query.order("created_at", { ascending: true });
        break;
      case "beds_desc":
        query = query.order("bedrooms", { ascending: false });
        break;
      case "date_desc":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch published properties: ${error.message}`);
    }

    return {
      properties: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  } catch (err) {
    console.error("Error in getPublishedProperties:", err);
    throw err;
  }
};

export const getPublishedPropertyById = async (
  supabase: SupabaseClient<Database>,
  id: string,
) => {
  try {
    const { data, error } = await (supabase.from("properties") as any)
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .single();

    if (error) {
      throw new Error(`Failed to fetch property: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error in getPublishedPropertyById:", err);
    throw err;
  }
};

// ── Favorites ───────────────────────────────────────────────────────────────

export const getUserFavorites = async (
  supabase: SupabaseClient<Database>,
  buyerId: string,
) => {
  try {
    // Get favorite records with joined property data
    const { data: favorites, error: favError } = await (
      supabase.from("favorites") as any
    )
      .select("id, property_id, created_at")
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false });

    if (favError) {
      throw new Error(`Failed to fetch favorites: ${favError.message}`);
    }

    if (!favorites || favorites.length === 0) {
      return [];
    }

    // Fetch the actual property data for each favorite
    const propertyIds = favorites.map((f: any) => f.property_id);
    const { data: properties, error: propError } = await (
      supabase.from("properties") as any
    )
      .select("*")
      .in("id", propertyIds)
      .eq("is_published", true);

    if (propError) {
      throw new Error(
        `Failed to fetch favorite properties: ${propError.message}`,
      );
    }

    return (properties ?? []).map((prop: any) => ({
      ...prop,
      favorited_at:
        favorites.find((f: any) => f.property_id === prop.id)?.created_at ??
        null,
    }));
  } catch (err) {
    console.error("Error in getUserFavorites:", err);
    throw err;
  }
};

export const addFavorite = async (
  supabase: SupabaseClient<Database>,
  buyerId: string,
  propertyId: string,
) => {
  try {
    const { data, error } = await (supabase.from("favorites") as any)
      .insert({ buyer_id: buyerId, property_id: propertyId })
      .select()
      .single();

    if (error) {
      // Handle duplicate gracefully
      if (error.code === "23505") {
        return { alreadyExists: true };
      }
      throw new Error(`Failed to add favorite: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error in addFavorite:", err);
    throw err;
  }
};

export const removeFavorite = async (
  supabase: SupabaseClient<Database>,
  buyerId: string,
  propertyId: string,
) => {
  try {
    const { error } = await (supabase.from("favorites") as any)
      .delete()
      .eq("buyer_id", buyerId)
      .eq("property_id", propertyId);

    if (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }

    return true;
  } catch (err) {
    console.error("Error in removeFavorite:", err);
    throw err;
  }
};

export const getUserFavoriteIds = async (
  supabase: SupabaseClient<Database>,
  buyerId: string,
): Promise<string[]> => {
  try {
    const { data, error } = await (supabase.from("favorites") as any)
      .select("property_id")
      .eq("buyer_id", buyerId);

    if (error) {
      throw new Error(`Failed to fetch favorite IDs: ${error.message}`);
    }

    return (data ?? []).map((f: any) => f.property_id);
  } catch (err) {
    console.error("Error in getUserFavoriteIds:", err);
    throw err;
  }
};

// ── User Action Logs ────────────────────────────────────────────────────────

export const logUserAction = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  actionType: "search" | "filter" | "save" | "inquire" | "view",
  details?: Record<string, unknown>,
  propertyId?: string,
) => {
  try {
    const { error } = await (supabase.from("user_action_logs") as any).insert({
      user_id: userId,
      action_type: actionType,
      details: details ?? {},
      property_id: propertyId ?? null,
    });

    if (error) {
      // Non-critical: don't throw, just log
      console.error("Failed to log user action:", error.message);
    }
  } catch (err) {
    console.error("Error in logUserAction:", err);
  }
};

// ── Inquiry → Lead Creation ─────────────────────────────────────────────────

export const createInquiryLead = async (
  supabase: SupabaseClient<Database>,
  data: {
    name: string;
    email?: string;
    phone?: string;
    message?: string;
    propertyId?: string;
    companyId: string;
  },
) => {
  try {
    const leadData: LeadInsert = {
      company_id: data.companyId,
      property_id: data.propertyId ?? null,
      name: data.name,
      email: data.email ?? null,
      phone: data.phone ?? null,
      message: data.message ?? null,
      status: "New",
      source: "portal",
    };

    const { data: lead, error } = await (supabase.from("leads") as any)
      .insert(leadData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create inquiry lead: ${error.message}`);
    }

    return lead;
  } catch (err) {
    console.error("Error in createInquiryLead:", err);
    throw err;
  }
};

// ── User Inquiry History ────────────────────────────────────────────────────

export const getUserInquiries = async (
  supabase: SupabaseClient<Database>,
  email: string,
): Promise<any[]> => {
  try {
    const { data, error } = await (supabase.from("leads") as any)
      .select(
        "id, name, email, message, status, source, property_id, created_at",
      )
      .eq("email", email)
      .eq("source", "portal")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw new Error(`Failed to fetch user inquiries: ${error.message}`);
    }

    // Fetch property titles for context
    const propertyIds = (data ?? [])
      .map((d: any) => d.property_id)
      .filter(Boolean);

    let propertyMap: Record<string, string> = {};
    if (propertyIds.length > 0) {
      const { data: properties } = await (supabase.from("properties") as any)
        .select("id, title")
        .in("id", propertyIds);

      propertyMap = (properties ?? []).reduce(
        (acc: Record<string, string>, p: any) => {
          acc[p.id] = p.title;
          return acc;
        },
        {},
      );
    }

    return (data ?? []).map((inquiry: any) => ({
      ...inquiry,
      property_title: propertyMap[inquiry.property_id] ?? null,
    }));
  } catch (err) {
    console.error("Error in getUserInquiries:", err);
    return [];
  }
};
