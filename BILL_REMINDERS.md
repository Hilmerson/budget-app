# Bill Reminders Feature

## Overview
The Bill Reminders feature in Finny helps users keep track of their recurring and one-time bills. It provides a clean, modern interface with visual indicators, notifications for upcoming payments, and a system that rewards on-time payments with XP and streak increases.

## Key Features

### Bill Management
- Create, edit, and delete bills
- Track payment history
- Set reminder notifications
- Mark bills as paid manually
- Record payment details
- Pin important bills to the top of each section

### Visual UI Elements
- Color-coded bills based on status (paid, upcoming, overdue)
- Clean card-based interface with consistent heights for all bills
- Star icons to mark important bills
- Subtle action buttons with clear purpose (primary for payment, secondary for details)
- Non-destructive UI with subtle but recognizable delete functionality
- Animated transitions for a modern feel
- Clear status indicators for due dates

### Smart Functionality
- Automatic calculation of next payment dates for recurring bills
- Countdown of days until payment is due
- Configurable reminder notifications
- Support for various payment frequencies (weekly, monthly, etc.)
- Consistent display of payment frequency information

### Gamification Integration
- Earn XP for paying bills on time
- Increment streak counter for consistent on-time payments
- Achievement badges for bill payment milestones (planned)

## Technical Implementation

### Data Model
The bill system is built on two main database models:
- `Bill` - Contains bill information, status, recurrence settings, and pinned status
- `BillPayment` - Tracks individual payments made against a bill

### API Endpoints
- `GET /api/bills` - Retrieve all bills for a user
- `POST /api/bills` - Create a new bill
- `GET /api/bills/:id` - Get details for a specific bill
- `PUT /api/bills/:id` - Update a bill
- `DELETE /api/bills/:id` - Delete a bill
- `POST /api/bills/payment` - Record a payment for a bill

### UI Components
- `BillCard` - Displays a single bill with its details, actions and pin status
- `BillForm` - User-friendly form with icon-labeled inputs for creating and editing bills
- `BillsPage` - Main page displaying all bills grouped by status with pinned bills at the top of each group

## User Flow

1. **Adding a Bill**
   - User navigates to Bills page
   - Clicks "Add Bill" button
   - Completes form with bill details (name, amount, due date, etc.)
   - Specifies if bill is recurring and sets frequency
   - Bill appears in the appropriate section (upcoming/overdue)

2. **Paying a Bill**
   - User clicks "Mark Paid" on an upcoming bill
   - System records payment with current date
   - Calculates next due date for recurring bills
   - Awards XP and updates streak for on-time payments
   - Bill moves to "Paid" section

3. **Getting Reminders**
   - User receives notification when bill is due soon
   - Visual indicators show urgency based on days until due
   - Overdue bills are highlighted for immediate attention
   
4. **Managing Important Bills**
   - User can click the star icon to pin important bills
   - Pinned bills appear at the top of their respective sections
   - Star changes color to indicate pinned status

## Future Enhancements

- Calendar view for visualizing bills due throughout the month
- Bill payment scheduling
- Integration with financial institutions for automatic payment tracking
- Smart reminders based on user payment patterns
- Bill category analysis for budget recommendations
- Custom bill categories and tags
- Shared bills between household members
- Historical payment trends and reporting