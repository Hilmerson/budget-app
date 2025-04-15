# Finny Project Summary

## Project Overview
Finny (formerly BudgetWise) is a gamified budget application that helps users manage their finances while making the experience engaging through gamification elements. The application combines modern design with practical financial tools, incorporating elements like experience points, levels, streaks, and achievements to motivate users.

## Key Features

### Core Functionality
- **Employment Mode Selection**: Users can select between full-time, contract/freelance, or other employment modes
- **Income Tracking**: Users can add income with various frequency options (one-time, weekly, bi-weekly, monthly, quarterly, yearly)
- **Expense Management**: Users can add, categorize, and track expenses with frequency options
- **Financial Metrics**: Calculation of tax estimates, after-tax income, and remaining income
- **Goals**: Users can set savings goals with target amounts

### Gamification Elements
- **Experience Points**: Users earn XP for financial activities
- **Level Progression**: Users level up based on accumulated XP with specific thresholds for each level
- **XP Animation**: Visual feedback when users earn XP or level up
- **Streaks**: Track consecutive days of financial activity
- **Achievements/Badges**: Unlock achievements for financial milestones
- **Challenges**: Daily/weekly challenges to encourage engagement

### UI Components
- **Dashboard**: Central hub with overview of financial health and gamification stats
- **Income Component**: Interface for managing income
- **Expenses Component**: Interface for tracking and categorizing expenses
- **Gamification Elements**: LevelProgress, StreakTracker, Achievements, Challenge components
- **Illustration Components**: WelcomeIllustration, FinancialHealthCard, SavingsGoalCard, BudgetComparisonCard

## Technical Stack
- **Frontend**: Next.js with React
- **State Management**: Zustand for global state
- **Styling**: Tailwind CSS
- **Database**: SQL Server with Prisma ORM
- **Authentication**: NextAuth.js

## Database Models
- **User**: Basic user information, authentication, experience and level data
- **Income**: Income entries with amount, frequency, and relationship to user
- **Expense**: Expense entries with amount, category, frequency, and relationship to user
- **Achievement**: User achievements and badges
- **Experience**: User experience points and level tracking
- **Goal**: User savings goals

## API Routes
- **/api/auth/signup**: User registration
- **/api/auth/[...nextauth]**: Authentication handling
- **/api/income**: Income management endpoints
- **/api/expenses**: Expense management endpoints
- **/api/user/experience**: Experience points and level tracking

## State Management
The application uses Zustand for state management with the following key stores:
- **useBudgetStore**: Manages income, expenses, and experience/level progression

## Navigation
The application now uses Next.js route-based navigation:
- `/dashboard` - Main dashboard
- `/dashboard/income` - Income management
- `/dashboard/expenses` - Expense management
- `/dashboard/achievements` - User achievements
- `/profile` - User profile

## Recent Development History
1. Initial application structure with NextAuth authentication
2. Implementation of Zustand store for state management
3. Development of basic income/expense tracking
4. Addition of gamification elements
5. Database integration with Prisma and SQL Server
6. Comprehensive UI redesign with modern dashboard layout
7. Fix for SQL Server enum compatibility by using strings
8. Enhanced UI components with improved visibility and cursor styling 
9. Rebranding from BudgetWise to Finny with fish-themed logo and slogan
10. Migration from hash-based to route-based navigation
11. Fixed XP/level system to correctly handle level progression
12. Improved client-side state management with better server synchronization
13. Added debug/test tools for XP and level management

## Known Issues & Future Improvements
- Further refinement of the financial health score calculation
- More comprehensive gamification rewards system
- Addition of spending analysis and trends charts
- Integration with financial institutions (future)

## Design Principles
- Modern, clean UI with consistent spacing and typography
- Gamification elements that are engaging but not distracting
- Clear financial information presentation
- Mobile-first responsive design
- Accessible UI elements with proper contrast

## Repository Information
- GitHub repository: https://github.com/Hilmerson/budget-app.git

## Documentation
- **ROUTE_NAVIGATION.md**: Details on the route-based navigation implementation
- **GAMIFICATION.md**: Documentation of the XP/level system and gamification features

This summary should provide enough context to quickly understand the project structure, features, and development history if the conversation context is lost. 