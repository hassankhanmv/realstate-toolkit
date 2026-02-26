import { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PropertyInsert, PropertyUpdate } from "./types";

// Fetch all properties for a company (tenant scope)
export const getPropertiesByCompany = async (
  supabase: SupabaseClient<Database, "public">,
  companyId: string,
) => {
  try {
    const { data, error } = await (supabase.from("properties") as any)
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch properies: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error in getPropertiesByBroker:", err);
    throw err;
  }
};

// Applies filters for advanced search
export interface PropertyFilters {
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  status?: string[];
  type?: string[];
}

export const getFilteredPropertiesByCompany = async (
  supabase: SupabaseClient<Database, "public">,
  companyId: string,
  filters: PropertyFilters,
) => {
  try {
    let query = (supabase.from("properties") as any)
      .select("*")
      .eq("company_id", companyId);

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

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      throw new Error(`Failed to fetch filtered properties: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error in getFilteredProperties:", err);
    throw err;
  }
};

// Client-side validation helper
export const validatePropertyData = (data: {
  price?: number;
  is_published?: boolean;
  images?: string[] | null;
}) => {
  const errors: string[] = [];

  if (data.price !== undefined && data.price <= 0) {
    errors.push("Price must be greater than 0");
  }

  if (data.is_published && (!data.images || data.images.length === 0)) {
    errors.push("Published properties must have at least one image");
  }

  return { valid: errors.length === 0, errors };
};

// Fetch single property
export const getPropertyById = async (
  supabase: SupabaseClient<Database, "public">,
  id: string,
) => {
  try {
    const { data, error } = await (supabase.from("properties") as any)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch property: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error in getPropertyById:", err);
    throw err;
  }
};

// Create new property
export const createProperty = async (
  supabase: SupabaseClient<Database, "public">,
  data: PropertyInsert,
) => {
  try {
    const { data: newProperty, error } = await (
      supabase.from("properties") as any
    )
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }

    return newProperty;
  } catch (err) {
    console.error("Error in createProperty:", err);
    throw err;
  }
};

// Update existing property
export const updateProperty = async (
  supabase: SupabaseClient<Database, "public">,
  id: string,
  data: PropertyUpdate,
) => {
  try {
    const { data: updatedProperty, error } = await (
      supabase.from("properties") as any
    )
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }

    return updatedProperty;
  } catch (err) {
    console.error("Error in updateProperty:", err);
    throw err;
  }
};

// Delete property
export const deleteProperty = async (
  supabase: SupabaseClient<Database, "public">,
  id: string,
) => {
  try {
    const { error } = await supabase.from("properties").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }

    return true;
  } catch (err) {
    console.error("Error in deleteProperty:", err);
    throw err;
  }
};

// Upload property images
export const uploadPropertyImages = async (
  supabase: SupabaseClient<Database>,
  brokerId: string,
  propertyId: string,
  files: File[],
) => {
  // Config
  const MAX_FILES = 10;
  const MAX_SIZE_MB = 5;
  const BUCKET = "properties";

  // Validate
  if (files.length > MAX_FILES) {
    throw new Error(`Cannot upload more than ${MAX_FILES} images`);
  }

  const uploadedUrls: string[] = [];

  try {
    const uploadPromises = files.map(async (file) => {
      // Validate size
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(
          `File ${file.name} exceeds size limit of ${MAX_SIZE_MB}MB`,
        );
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${brokerId}/${propertyId}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(
          `Failed to upload ${file.name}: ${uploadError.message}`,
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    });

    await Promise.all(uploadPromises);
    return uploadedUrls;
  } catch (err) {
    console.error("Error in uploadPropertyImages:", err);
    throw err;
  }
};

// Delete property image
export const deletePropertyImage = async (
  supabase: SupabaseClient<Database>,
  imageUrl: string,
) => {
  try {
    const BUCKET = "properties";
    // Extract path from URL: .../storage/v1/object/public/properties/user/prop/file.jpg
    const path = imageUrl.split(`${BUCKET}/`).pop();

    if (!path) {
      throw new Error("Invalid image URL");
    }

    const { error } = await supabase.storage.from(BUCKET).remove([path]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }

    return true;
  } catch (err) {
    console.error("Error in deletePropertyImage:", err);
    throw err;
  }
};
