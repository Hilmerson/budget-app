# Finny - Personal Budget App

## Overview
Finny is a comprehensive personal finance management application built with Next.js, TypeScript, Tailwind CSS, and Prisma. The app helps users track income, expenses, and savings while providing visualizations and insights to improve financial health.

## Core Features

### Financial Management
- Track income and expenses across multiple categories
- Categorize transactions with custom tagging
- Set and monitor monthly budget targets
- Generate financial reports with insights
- Calculate tax implications of income and expenses

### Dashboard & Visualization
- Interactive charts showing spending patterns
- Income vs. expense comparison views
- Category-based breakdowns of financial activity
- Historical trend analysis
- Financial health scoring

### User Experience
- Modern, responsive UI that works across devices
- Route-based navigation with persistent sidebar
- Dark/light mode support
- Progressive Web App (PWA) capabilities
- Keyboard shortcuts for power users

### Data & Security
- Secure user authentication via NextAuth
- Database integration through Prisma ORM
- End-to-end data encryption for sensitive information
- Automated backups and data recovery options
- GDPR-compliant data handling

### Gamification System
- Experience points (XP) for consistent app usage
- Level progression with increasing XP thresholds
- Enhanced formula for level progression (base 100 XP + 50 XP growth factor per level)
- Maximum level cap at Level 10 (3000+ XP)
- Achievements for reaching financial milestones
- Streak counters for daily engagement
- Automatic level-up when XP thresholds are reached
- Overflow XP handling when leveling up
- Race condition prevention for rapid XP updates
- Reliable client-server state synchronization

## Technical Stack

### Frontend
- Next.js 13+ (with App Router)
- TypeScript for type safety
- Tailwind CSS for styling
- Chart.js for data visualization
- React Context API and Zustand for state management

### Backend
- Next.js API routes
- Prisma ORM for database operations
- PostgreSQL database (production)
- SQLite database (development)
- RESTful API endpoints with proper error handling

### Authentication
- NextAuth.js for authentication
- Email/password and OAuth providers
- Session management
- Role-based access control

### DevOps
- CI/CD pipeline with GitHub Actions
- Vercel deployment
- Automated testing with Jest
- Performance monitoring and error tracking

## Recent Improvements

### Route-Based Navigation
- Migrated from hash-based to route-based navigation
- Implemented persistent sidebar across routes
- Enhanced URL structure for better SEO and sharing
- Optimized client-side navigation between features

### Enhanced XP System
- Improved formula for level progression (base 100 XP + 50 XP growth factor per level)
- Fixed race conditions during rapid XP updates
- Implemented automatic level-up when thresholds are reached
- Added overflow XP handling for level-ups
- Enhanced client-server synchronization to prevent level resets
- Implemented useUserExperience hook for consistent data fetching
- Added detailed developer tools for XP testing and debugging

### Financial Health Features
- Added automated financial health scoring
- Implemented trend analysis for spending patterns
- Enhanced data visualization components

## Project Structure
The project follows a feature-based organization within the Next.js 13+ App Router structure:

```
/src
  /app - Next.js app router pages
    /dashboard - Main application dashboard
    /profile - User profile management
    /api - Backend API endpoints
  /components - Reusable UI components
  /hooks - Custom React hooks
  /lib - Utility functions and libraries
  /store - State management (Zustand)
  /types - TypeScript type definitions
  /prisma - Database schema and migrations
```

## Future Roadmap
- Investment tracking and performance monitoring
- Intelligent savings recommendations
- Bill payment reminders and scheduling
- Integration with financial institutions
- Mobile application with offline capabilities

## Contributing
Contributors are welcome to join the project. Please review the contributing guidelines in CONTRIBUTING.md before submitting pull requests. 