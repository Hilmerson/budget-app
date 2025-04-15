# Gamification System Documentation

## Overview
The Finny app includes a comprehensive gamification system designed to encourage users to maintain good financial habits. The system includes experience points (XP), levels, badges, and challenges that reward users for consistent use of the app and smart financial decisions.

## XP System

### Level Structure
Users progress through levels as they earn experience points (XP). The current implementation includes:

- New users start at Level 1 with 0 XP
- Each level requires progressively more XP to advance to the next level
- Experience thresholds follow this formula:
  - Base XP: 100 XP for Level 1
  - Growth factor: +50 XP per level
  - Level 1: 0-99 XP
  - Level 2: 100-199 XP
  - Level 3: 200-349 XP
  - Level 4: 350-549 XP
  - Each subsequent level requires an additional 50 XP compared to the previous level
  - Maximum level is capped at Level 10 (3000+ XP)

### XP Accumulation
Users earn XP through various actions:
- Adding income entries: +10 XP
- Adding expense entries: +5 XP
- Completing daily logins: +15 XP
- Setting budget goals: +20 XP
- Achieving savings targets: +25 XP

The XP system is designed to:
- Immediately reflect changes in the UI
- Persist data to the database
- Handle overflow XP when leveling up (excess XP rolls over to the next level)
- Prevent race conditions during rapid XP accumulation
- Automatically level up users when they reach the XP threshold
- Maintain consistent state between client and server to prevent level resets

## User Interface Components

### LevelProgress Component
Located in `src/components/LevelProgress.tsx`, this component:
- Displays current level and XP
- Shows a visual progress bar toward the next level
- Animates when XP is earned
- Updates automatically when level thresholds are reached

### Achievements Panel
Located in `src/app/dashboard/achievements/page.tsx`, this panel:
- Displays all badges/achievements the user has earned
- Shows locked achievements that can be unlocked
- Provides information on how to earn each achievement

## Database Integration
User experience and level data is stored in the database and managed through:
- Experience table in the database (via Prisma ORM)
- API endpoints for reading and updating user experience

## Technical Implementation

### State Management
The gamification system is managed through several methods in the `useBudgetStore.ts` Zustand store:

- `addExperience(amount)`: Adds XP to the user's total, handles level-ups, and syncs with the server
  - Performs all operations in a single state update to avoid race conditions
  - Calculates level-ups and overflow XP
  - Saves to database and re-fetches from server to ensure consistency
- `setExperience(amount)`: Sets the user's experience to a specific amount
- `checkLevelUp()`: Checks if a user can level up based on current XP and applies the level-up if possible
  - Called automatically on app initialization to ensure correct level
- `updateGamification(data)`: Updates the gamification state from external sources
- `setStreak(days)`: Updates the user's streak count

### Level Calculation Functions
Key functions related to XP and level calculations:

- `getLevelInfo(xp)`: Determines a user's level and next threshold based on XP amount
  - Uses a formula where each level requires a base XP (100) plus a growth factor (50 XP per level)
  - Returns current level, next level threshold, and progress percentage
- `showXpGainAnimation(amount)`: Displays a visual notification when XP is earned

### Data Synchronization
To prevent issues with client-server state:
- Experience data is fetched via the `useUserExperience` hook when the app initializes
- After XP updates, the client re-fetches the latest data from the server
- The app verifies level status on initialization with `checkLevelUp()`

### API Endpoints
Located in `src/app/api/user/experience/route.ts`, the API provides:
- GET: Retrieves the user's current experience and level
- PUT: Updates the user's experience and level, handling level-up logic

## Testing Tools
For development and testing purposes, the dashboard includes:
- A +25 XP button for triggering experience gains
- Debug information displaying current XP and level data
- State synchronization tools for ensuring client-server consistency

## Future Enhancements
Planned improvements to the gamification system:
- More diverse achievement types
- Daily/weekly financial challenges with XP rewards
- Tiered rewards based on user level
- Social features allowing comparison with friends
- Customizable profile badges and avatars

This documentation will be updated as new gamification features are implemented. 