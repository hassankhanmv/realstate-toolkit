# Changelog

All notable changes to the Real Estate Toolkit web application will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [2026-02-17]

### Added

- **Tile Component** (`/components/dashboard/Tile.tsx`)
  - Flexible stats card with optional icon, title, value, and trend indicators
  - Auto-adjusting layout when props are missing
  - Compact spacing following shadcn design principles
  - Full RTL/LTR support with automatic layout mirroring
  - Green/red trend arrows with directional indicators

- **Logout Confirmation Dialog** (`/components/common/LogoutConfirmDialog.tsx`)
  - Reusable confirmation dialog for logout action
  - Shared between sidebar and header user menu
  - Internationalized with translation keys
  - Destructive styling for confirm button

- **Alert Dialog Component** (`/components/ui/alert-dialog.tsx`)
  - shadcn/ui alert dialog based on Radix UI primitives
  - Used for confirmations and destructive actions
  - Accessible with keyboard navigation

- **Sidebar Features**
  - Collapse/expand functionality (280px ↔ 64px)
  - State persistence in localStorage
  - Collapse toggle button with chevron icons
  - Logout button below help section
  - Tooltips in collapsed state
  - Left border indicator for active menu items

- **Translation Keys**
  - `sidebar.title`, `sidebar.collapse`, `sidebar.expand`, `sidebar.logout`
  - `logout_dialog.title`, `logout_dialog.description`, `logout_dialog.cancel`, `logout_dialog.confirm`
  - Added Arabic translations for all new keys

### Changed

- **Sidebar Component** (`/components/dashboard/Sidebar.tsx`)
  - Removed logo icon from branding section
  - Changed title to "Property Hub" (translation key: "sidebar.title")
  - Active menu items now use accent color (`bg-accent/10`) instead of slate gray
  - Active items have gold left border indicator
  - Compact header with collapse button
  - Help section only displayed when expanded
  - Logout confirmation dialog integration

- **Dashboard Layout** (`/components/layouts/DashboardLayout.tsx`)
  - Dynamic sidebar width based on collapsed state
  - Uses `marginInlineStart` with inline styles for smooth transitions
  - Sidebar state management with useState and localStorage
  - RTL-aware using `start-0` positioning

- **Dashboard Route** (`/routes/dashboard.tsx`)
  - Completely redesigned stats section using Tile components
  - Removed hardcoded stat colors and gradients
  - Reduced spacing from `space-y-8` to `space-y-6`
  - Stats grid now uses `gap-4` (previously `gap-6`)
  - Redesigned Quick Actions cards with accent color icons
  - Icon backgrounds changed to `bg-accent/10` with `text-accent`
  - More compact Recent Activity section with smaller padding
  - Activity indicator dots now use accent color
  - Simplified card layouts with better visual hierarchy

- **Header Component** (`/components/dashboard/Header.tsx`)
  - Minor spacing adjustments for border alignment
  - Prepared for logout confirmation dialog integration (currently uses direct logout)

- **Theme Colors** (`/app.css`)
  - Refined accent color usage throughout components
  - Consistent gold/sand accent across active states

### Fixed

- **RTL Layout Issues**
  - Replaced all `pl-*`, `pr-*`, `ml-*`, `mr-*` with directional equivalents
  - Sidebar now uses `start-0` instead of `left-0` for RTL support
  - Collapse button chevrons properly oriented in RTL (`ChevronLeft`/`ChevronRight`)
  - Active menu item border indicator uses `start-0` for RTL compatibility
  - Margin adjustments in DashboardLayout use `marginInlineStart`
  - Icon positioning in collapsed sidebar centered correctly in RTL

- **Layout Alignment**
  - Header border and sidebar divider now align perfectly
  - Consistent spacing grid between header, sidebar, and content
  - Sidebar width transitions smoothly without layout shift

- **Component Spacing**
  - Removed excessive padding from dashboard cards
  - Stats cards now more compact and space-efficient
  - Quick Actions grid tighter with better use of screen real estate
  - Recent Activity items condensed with appropriate spacing

### Removed

- Logo icon from sidebar branding
- Generic "Real Estate Portal" subtitle
- Bright multicolor gradients from stats cards
- Excessive padding in dashboard sections
- Hardcoded menu logout action (replaced with confirmation dialog)

### Dependencies

- Added `@radix-ui/react-alert-dialog` (v1.x) for AlertDialog component

---

## Previous Versions

### [2026-02-16] - Initial Dashboard Refactoring

- Created constants and configuration system
- Updated theme to professional deep slate and gold palette
- Added comprehensive i18n support for English and Arabic
- Refactored Sidebar and Header to use menu configuration
- Created Banner component
- Removed all hardcoded text in favor of translation keys
