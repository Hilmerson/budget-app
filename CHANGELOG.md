# Changelog

All notable changes to the Budget App will be documented in this file.

## [Unreleased]

### Added
- Route-based navigation replacing hash-based navigation
- Persistent sidebar across dashboard and profile pages
- Detailed documentation in ROUTE_NAVIGATION.md
- User experience (XP) system improvements
  - Fixed level calculation for consistent thresholds
  - Implemented progressive XP requirements for higher levels
  - Added server synchronization to prevent XP data inconsistencies
  - Fixed race conditions when rapidly gaining XP
- Bill Reminders feature
  - Added comprehensive bill management system
  - Created bills dashboard with visual status indicators
  - Implemented recurring payment support with automatic date calculation
  - Added XP rewards for on-time payments
  - Created modern, animated UI components for bill management
  - Detailed documentation in BILL_REMINDERS.md

### Fixed
- Hydration errors from client/server component mismatches
- Experience points not updating properly when clicking XP button rapidly
- Level-up system not triggering at appropriate thresholds
- Profile page layout inconsistency (now uses the same layout as dashboard)
- Experience reset issues when refetching data

### Changed
- Simplified component architecture with ClientSideLayout
- Improved state management for user experience and level data
- Enhanced UI consistency across authenticated routes

### Technical
- Added proper client-side state sync with server-side data
- Implemented experience progression formula (base 100 XP + 50 XP growth per level)
- Maximum level cap set at level 10 (3000 XP)
- Added detailed documentation and README updates 