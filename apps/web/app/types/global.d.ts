import type { MenuItem, UserMenuItem } from "@/config/menuConfig";
import type { APP_CONFIG, UI_CONFIG, ROUTES, STORAGE_KEYS } from "@/constants";

declare global {
  interface Window {
    ENV: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
    };
    App: {
      menuItems: {
        sidebar: MenuItem[];
        userMenu: UserMenuItem[];
      };
      constants: {
        APP_CONFIG: typeof APP_CONFIG;
        UI_CONFIG: typeof UI_CONFIG;
        ROUTES: typeof ROUTES;
        STORAGE_KEYS: typeof STORAGE_KEYS;
      };
    };
  }
}

export {};
