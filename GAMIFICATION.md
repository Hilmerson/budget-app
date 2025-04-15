# Gamification System Documentation

## Overview

Finny incorporates a gamification system to make financial management more engaging and rewarding. The system includes experience points (XP), levels, badges, and challenges that incentivize users to maintain good financial habits.

## Experience Points (XP) System

### Core Mechanics

- **Level Structure**: Each level requires a specific amount of XP to advance to the next level
- **XP Accumulation**: XP is earned through various financial activities
- **Level Up**: When sufficient XP is earned, the user levels up and excess XP carries over

### XP Requirements Per Level

| Level | XP Required to Level Up |
|-------|-------------------------|
| 1     | 100                     |
| 2     | 150                     |
| 3     | 200                     |
| 4     | 250                     |
| 5     | 300                     |
| 6     | 350                     |
| 7     | 400                     |
| 8     | 450                     |
| 9     | 500                     |
| 10+   | 500 (fixed)             |

The maximum level is capped at 30, with 500 XP required for each level beyond 10.

### XP Implementation Details

- XP is reset to 0 after leveling up, with overflow XP applied to the new level
- The system uses a non-cumulative approach (each level tracks XP independently)
- Client state is synchronized with the server through the `/api/user/experience` endpoint

### XP Sources

Users can earn XP through various actions:
- Adding income entries
- Adding expense entries
- Staying under budget
- Achieving savings goals
- Completing challenges

## User Interface Components

### LevelProgress Component

Displays:
- Current level number
- Progress bar showing XP towards next level
- Numerical representation of current XP / required XP

### XP Gain Animation

- Shows floating animation when XP is earned
- Special animation for level up events
- The animations are non-blocking and fade out automatically

### Achievements Panel

Displays badges and achievements earned through financial milestones:
- Tracks completed achievements
- Shows locked/upcoming achievements
- Sorts achievements by completion status

## Database Integration

The experience data is stored in the User model with:
- `experience`: Current XP amount
- `level`: Current user level

The API offers:
- `GET /api/user/experience`: Retrieves current experience and level
- `PUT /api/user/experience`: Updates experience and level values

## Technical Implementation

### State Management

The gamification system is managed through the Zustand store (`useBudgetStore.ts`) with the following key methods:

- `addExperience(amount)`: Adds XP and handles level-up logic
- `setExperience(data, skipDatabaseSync)`: Directly sets XP and level values
- `checkLevelUp()`: Verifies if conditions are met for a level up
- `resetExperience()`: Resets user to level 1 with 0 XP (for testing)
- `showXPGainAnimation(amount, isLevelUp)`: Triggers XP gain animations

### Level Calculation

The system calculates level thresholds and XP requirements using:
- `getXpRequiredForLevel(level)`: Returns XP needed for a specific level
- `getXpNeededForNextLevel(level, currentXp)`: Calculates remaining XP needed to level up

## Testing Tools

For development and testing, the dashboard includes:
- "+50 XP" button to add experience points
- "Reset to Lvl 1" button to reset progress

These tools appear in a small panel in the top-right corner of the dashboard (in development environment).

## Future Enhancements

Planned improvements include:
- More varied XP sources
- Weekly challenges with XP rewards
- Achievement-based rewards
- Social sharing of achievements
- Improved visual feedback for level progression 