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
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          property_id: string | null;
          name: string;
          phone: string | null;
          email: string | null;
          message: string | null;
          status: string;
          notes: string | null;
          created_at: string;
        };
      };
    };
  };
};
