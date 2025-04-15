# Route-Based Navigation

This document outlines the navigation structure of the Budget App and explains how different routes are organized.

## Navigation Structure

The Budget App uses Next.js App Router for route management. Key features of our navigation system:

- **Persistent Sidebar**: The sidebar remains visible across the dashboard and profile pages
- **Route-Based Active States**: The sidebar highlights the currently active route
- **Client-Side Layout Component**: Uses a shared layout component for consistent UI across authenticated routes

## Route Organization

```
app/
├── dashboard/
│   ├── layout.tsx       # Uses ClientSideLayout for dashboard routes
│   ├── page.tsx         # Dashboard homepage
│   ├── budgets/
│   │   └── page.tsx     # Budget management page
│   ├── expenses/
│   │   └── page.tsx     # Expense tracking page
│   ├── reports/
│   │   └── page.tsx     # Financial reports page
│   └── settings/
│       └── page.tsx     # App settings page
├── profile/
│   ├── layout.tsx       # Also uses ClientSideLayout for consistency
│   └── page.tsx         # User profile page
└── api/
    └── ...              # API endpoints
```

## Implementation Details

### ClientSideLayout Component

The `ClientSideLayout` component ensures a consistent UI across authenticated routes. It:

- Renders the sidebar with navigation links
- Adjusts for mobile/desktop viewports
- Handles authentication checks
- Provides consistent padding/spacing

```jsx
// Components/ClientSideLayout.tsx
const ClientSideLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
};
```

### Sidebar Active States

The sidebar uses the current pathname to determine which link should be highlighted as active:

```jsx
// Using Next.js usePathname hook to determine active route
const pathname = usePathname();
const isActive = (path) => pathname === path || pathname.startsWith(path);
```

## Migrating from Previous Navigation

Previously, the application used a more complex approach with dynamic imports and conditional UI. The current approach:

- Reduces client/server component complexity
- Prevents hydration errors
- Improves performance by reducing unnecessary re-renders
- Maintains UI consistency across authenticated routes

## Overview

The app now uses Next.js's built-in routing system to navigate between different sections of the dashboard. This provides several benefits:

- Clean, semantic URLs (e.g. `/dashboard/expenses` instead of `/dashboard#expenses`)
- Better SEO as each section gets a proper URL
- Better analytics tracking
- Follows web standards and conventions

## Structure

- `/dashboard` - Main dashboard
- `/dashboard/income` - Income management
- `/dashboard/expenses` - Expense management
- `/dashboard/achievements` - User achievements
- `/profile` - User profile (now with persistent sidebar)

## Components

### DashboardLayout

Located at `src/app/dashboard/layout.tsx`, this is a server component that:
- Checks authentication
- Ensures the user is logged in before displaying the dashboard
- Uses the ClientSideLayout for rendering the UI

### ClientSideLayout

Located at `src/components/ClientSideLayout.tsx`, this client component:
- Handles dynamic imports with `ssr: false`
- Provides the structure shared by all dashboard pages and the profile page
- Loads the sidebar and client wrapper components
- Maintains consistent navigation experience across all authenticated routes

### DashboardSidebar

Located at `src/components/DashboardSidebar.tsx`, this client component:
- Shows navigation links for all sections
- Displays user info and profile picture
- Shows the level progress bar
- Provides sign-out functionality
- Highlights the active section based on the current route
- Now present across all authenticated routes, including the profile page

### ClientWrapper

Located at `src/components/ClientWrapper.tsx`, this client component:
- Loads and handles client-side animations
- Works with dynamically imported components in the server layout

### Section Pages

- `DashboardContent` - Main dashboard content (`/dashboard`)
- `IncomePage` - Income management (`/dashboard/income`)
- `ExpensesPage` - Expense management (`/dashboard/expenses`)
- `AchievementsPage` - User achievements (`/dashboard/achievements`)

## Client-Side State Management

The XP gain animation and other client-side state is managed through:
- `ClientWrapper` component containing animations
- Zustand store for state persistence

## TypeScript Compatibility

The implementation ensures strong typing throughout the codebase:
- Component props are properly typed
- Route parameters are validated
- Store access is type-safe

## Migrating From Hash-Based Navigation

For backward compatibility, the old `Dashboard` component still exists but redirects to the new routes based on the hash fragment. If a user visits a URL with a hash like `/dashboard#expenses`, they will be automatically redirected to `/dashboard/expenses`.

## Adding New Sections

To add a new dashboard section:

1. Create a new page file at `src/app/dashboard/your-section/page.tsx`
2. Add the section to the sidebar items array in `DashboardSidebar.tsx`
3. Add a condition to `getActiveSectionFromPath` in `DashboardSidebar.tsx`

## Profile Page Integration

The profile page now:
- Uses the same `ClientSideLayout` as dashboard pages
- Has the sidebar present for consistent navigation
- Shows the profile link as active when on the profile page
- Maintains the same navigation patterns as other authenticated routes

## Next.js Server Component Considerations

The implementation takes into account Next.js 15.3's restrictions on mixing server and client components:

- Server components (like `layout.tsx`) handle authentication and redirects
- Client components (like `ClientSideLayout.tsx`) handle dynamic imports and UI rendering
- Client components with `'use client'` directive are needed for hooks and interactivity

## Mobile Responsiveness

The sidebar implementation includes:
- Mobile-responsive design for smaller viewports
- Collapsible sidebar for better mobile experience
- Consistent navigation patterns across device sizes

## Future Improvements

- Add page metadata for better SEO
- Implement proper error boundaries for each route
- Create more specialized layouts for specific sections
- Add route-based data prefetching
- Enhance transitions between routes 