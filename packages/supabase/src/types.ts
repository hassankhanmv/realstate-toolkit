export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          company_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
      };
      properties: {
        Row: {
          id: string;
          broker_id: string;
          title: string;
          price: number;
          description: string | null;
          location: string;
          bedrooms: number;
          bathrooms: number;
          area: number;
          furnished: boolean;
          rooms: number | null;
          type:
            | "Apartment"
            | "Villa"
            | "Townhouse"
            | "Office"
            | "Plot"
            | "Commercial";
          amenities: string[] | null;
          images: string[] | null;
          floor: number | null;
          year_built: number | null;
          status: "For Sale" | "For Rent" | "Off-Plan" | "Ready";
          notes: string | null;
          is_published: boolean;
          handover_date: string | null;
          payment_plan: string | null;
          rera_id: string | null;
          roi_estimate: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          broker_id: string;
          title: string;
          price: number;
          description?: string | null;
          location: string;
          bedrooms: number;
          bathrooms: number;
          area: number;
          furnished?: boolean;
          rooms?: number | null;
          type:
            | "Apartment"
            | "Villa"
            | "Townhouse"
            | "Office"
            | "Plot"
            | "Commercial";
          amenities?: string[] | null;
          images?: string[] | null;
          floor?: number | null;
          year_built?: number | null;
          status: "For Sale" | "For Rent" | "Off-Plan" | "Ready";
          notes?: string | null;
          is_published?: boolean;
          handover_date?: string | null;
          payment_plan?: string | null;
          rera_id?: string | null;
          roi_estimate?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          broker_id?: string;
          title?: string;
          price?: number;
          description?: string | null;
          location?: string;
          bedrooms?: number;
          bathrooms?: number;
          area?: number;
          furnished?: boolean;
          rooms?: number | null;
          type?:
            | "Apartment"
            | "Villa"
            | "Townhouse"
            | "Office"
            | "Plot"
            | "Commercial";
          amenities?: string[] | null;
          images?: string[] | null;
          floor?: number | null;
          year_built?: number | null;
          status?: "For Sale" | "For Rent" | "Off-Plan" | "Ready";
          notes?: string | null;
          is_published?: boolean;
          handover_date?: string | null;
          payment_plan?: string | null;
          rera_id?: string | null;
          roi_estimate?: number | null;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          broker_id: string;
          property_id: string | null;
          name: string;
          phone: string | null;
          email: string | null;
          message: string | null;
          status: string;
          notes: string | null;
          source: string | null;
          follow_up_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          broker_id: string;
          property_id?: string | null;
          name: string;
          phone?: string | null;
          email?: string | null;
          message?: string | null;
          status?: string;
          notes?: string | null;
          source?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          broker_id?: string;
          property_id?: string | null;
          name?: string;
          phone?: string | null;
          email?: string | null;
          message?: string | null;
          status?: string;
          notes?: string | null;
          source?: string | null;
          follow_up_date?: string | null;
          created_at?: string;
        };
      };
    };
  };
};

export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyInsert =
  Database["public"]["Tables"]["properties"]["Insert"];
export type PropertyUpdate =
  Database["public"]["Tables"]["properties"]["Update"];

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];
