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
          location: string | null;
          bedrooms: number | null;
          bathrooms: number | null;
          area: number | null;
          images: string[] | null;
          is_published: boolean;
          created_at: string;
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
