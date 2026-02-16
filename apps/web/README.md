# Real Estate Toolkit - Web Application

A modern, production-ready real estate management platform built with React Router, Redux, and Supabase authentication. Designed specifically for the UAE market with full Arabic (RTL) support.

## 🏗 ️ Project Architecture

### Technology Stack

- **Frontend Framework**: React 19.2 with React Router
- **State Management**: Redux Toolkit
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Internationalization**: react-i18next
- **Build Tool**: Vite
- **Language**: TypeScript

### Directory Structure

```
web/
├── app/
│   ├── components/
│   │   ├── common/          # Shared components (Banner, LogoutConfirmDialog)
│   │   ├── dashboard/       # Dashboard-specific components (Tile, Sidebar, Header)
│   │   ├── layouts/         # Layout components (DashboardLayout)
│   │   └── ui/              # shadcn/ui components (Button, Card, etc.)
│   ├── config/
│   │   └── menuConfig.ts    # Sidebar and header menu configuration
│   ├── constants/
│   │   ├── common.ts        # App constants (routes, config, storage keys)
│   │   └── index.ts         # Barrel exports
│   ├── lib/                # Utility functions (Supabase client, utils)
│   ├── routes/              # Page components (dashboard, login, signup)
│   ├── store/              # Redux store, slices
│   ├── types/              # TypeScript type definitions
│   ├── app.css             # Global styles and theme
│   └── root.tsx            # App entry point
├── public/
│   └── locales/            # Translation files (en, ar)
│       ├── en/common.json
│       └── ar/common.json
└── package.json
```

## 🎨 Dashboard Architecture

### Component Hierarchy

```
DashboardLayout
├── Sidebar (collapsible)
│   ├── Branding
│   ├── Navigation Menu (from menuConfig)
│   ├── Help Section
│   └── Logout Button (with confirmation dialog)
├── Header
│   ├── Mobile Menu Toggle (Sheet)
│   ├── Language Switcher
│   └── User Menu (from menuConfig)
└── Main Content
    └── Dashboard Route
        ├── Stats Grid (Tile components)
        ├── Quick Actions Cards
        └── Recent Activity
```

### Key Dashboard Components

#### Tile Component

**Path**: `/components/dashboard/Tile.tsx`

Flexible stats card with auto-adjusting layout.

**Usage:**

```tsx
<Tile
  title="Total Properties"
  value="12"
  icon={Building2}
  trend={{ value: "+2 this month", direction: "up" }}
/>
```

#### Sidebar Component

**Path**: `/components/dashboard/Sidebar.tsx`

**Features:**

- Collapsible (280px → 64px)
- State persisted in localStorage
- Menu items from `config/menuConfig.ts`
- Active state with accent color
- Logout button with confirmation dialog

## 🌍 Internationalization (i18n)

- **Library**: react-i18next
- **Supported Languages**: English (en), Arabic (ar)
- **Translation Files**: `/public/locales/{lang}/common.json`

### RTL Support

Uses Tailwind directional utilities:

- `ps-*` (padding-start) instead of `pl-*`
- `pe-*` (padding-end) instead of `pr-*`
- `ms-*` (margin-start) instead of `ml-*`
- `me-*` (margin-end) instead of `mr-*`
- `start-0` / `end-0` for positioning

## 🔐 State Management

### Global App Object

Accessible via `window.App`:

```typescript
window.App = {
  store, // Redux store
  validation, // Validation schemas
  translateStatic, // Static translation function
  actions: {
    // Common Redux actions
    setLoading,
    addToast,
    removeToast,
  },
  menuItems: {
    // Menu configuration
    sidebar,
    userMenu,
  },
  constants: {
    // App constants
    APP_CONFIG,
    UI_CONFIG,
    ROUTES,
    STORAGE_KEYS,
  },
};
```

## 🎨 Theme System

**Primary Theme**: Deep Slate & Gold (UAE-appropriate)

```css
--primary: hsl(222 47% 11%) /* Deep Slate */ --accent: hsl(38 52% 58%)
  /* Gold/Sand */;
```

## 🚀 Development

### Running Locally

```bash
# From root
pnpm install
pnpm dev
```

### Build for Production

```bash
pnpm run build
```

## 🌐 Environment Variables

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Best Practices

1. **Always use translation keys** - Never hardcode text
2. **Use directional utilities** for RTL support
3. **Keep components small and focused**
4. **Use TypeScript** - Type everything
5. **Follow shadcn patterns**
6. **Test in both languages**

---

Built with ❤️ for UAE Real Estate Market
