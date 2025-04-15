# Budget App

A personal finance management application built with Next.js that helps users track expenses, manage budgets, and improve their financial health.

## Features

- **Route-based Navigation**: Intuitive navigation structure for easy access to all features
- **Expense Tracking**: Log and categorize expenses with detailed insights
- **Budget Planning**: Set financial goals and track progress
- **Financial Health**: Get insights into your overall financial well-being
- **Gamification**: Enhanced XP and leveling system to reward consistent financial habits
  - Automatic level-ups when thresholds are reached
  - Persistent progress tracking between sessions
  - Race-condition handling for rapid interactions
- **User Authentication**: Secure login and user profiles

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

### Navigation Structure

The app uses a consistent navigation pattern across authenticated routes:

- Dashboard and Profile pages share a common `ClientSideLayout` component for the sidebar
- The sidebar remains visible across all authenticated routes for better UX
- Mobile-responsive design with a collapsible sidebar for smaller viewports

See the [ROUTE_NAVIGATION.md](./ROUTE_NAVIGATION.md) file for more details about the application's navigation structure.

## Learn More

This project uses:

- [Next.js](https://nextjs.org) for the framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [NextAuth.js](https://next-auth.js.org) for authentication
- [Prisma](https://prisma.io) for database ORM

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
