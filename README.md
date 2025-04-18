# Budget App

A personal finance management application built with Next.js that helps users track expenses, manage budgets, and improve their financial health.

## Features

- **Route-based Navigation**: Intuitive navigation structure for easy access to all features
- **Expense Tracking**: Log and categorize expenses with detailed insights
- **Budget Planning**: Set financial goals and track progress
- **Bill Reminders**: Track and manage recurring payments with smart reminders
  - Pin important bills to keep them at the top of each section
  - Visually consistent cards with clear status indicators
  - User-friendly form with clear input fields 
  - Subtle yet accessible actions for common tasks
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

### Bill Reminders

The Bill Reminders feature helps users keep track of recurring and one-time payments with:
- Visual indicators for upcoming, overdue, and paid bills
- Star icon to pin important bills to the top of each section
- Consistent card height regardless of bill type (recurring or one-time)
- Streamlined, intuitive form with properly spaced icon-labeled fields
- Automated calculations for next payment dates
- XP rewards for on-time payments
- Payment history tracking

See the [BILL_REMINDERS.md](./BILL_REMINDERS.md) file for complete documentation.

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
