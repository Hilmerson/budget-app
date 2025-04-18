'use client';

import { useState, useMemo } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  status: 'paid' | 'upcoming' | 'overdue';
  reminderDays: number;
}

interface BillCalendarProps {
  bills: Bill[];
  onBillClick: (billId: string) => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BillCalendar({ bills, onBillClick }: BillCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedBills, setSelectedBills] = useState<Bill[]>([]);
  
  // Get the days in the current month view
  const calendarDays = useMemo(() => {
    // First day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Get the first day to show in the calendar (may be from previous month)
    const startOffset = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    // Get days from previous month to show
    const prevMonthDays = Array.from({ length: startOffset }, (_, i) => ({
      date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - startOffset + i + 1),
      isCurrentMonth: false,
      isPrevMonth: true,
      isNextMonth: false
    }));
    
    // Get days from current month
    const currentMonthDays = Array.from({ length: lastDay.getDate() }, (_, i) => ({
      date: new Date(currentYear, currentMonth, i + 1),
      isCurrentMonth: true,
      isPrevMonth: false,
      isNextMonth: false
    }));
    
    // Get days from next month to fill the calendar grid
    const totalDaysShown = 42; // 6 rows of 7 days
    const nextMonthDays = Array.from(
      { length: totalDaysShown - prevMonthDays.length - currentMonthDays.length },
      (_, i) => ({
        date: new Date(currentYear, currentMonth + 1, i + 1),
        isCurrentMonth: false,
        isPrevMonth: false,
        isNextMonth: true
      })
    );
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [currentMonth, currentYear]);
  
  // Get the bills for each date
  const billsByDate = useMemo(() => {
    const mapping: Record<string, Bill[]> = {};
    
    bills.forEach(bill => {
      const dueDate = new Date(bill.dueDate);
      const dateKey = dueDate.toISOString().split('T')[0];
      
      if (!mapping[dateKey]) {
        mapping[dateKey] = [];
      }
      
      mapping[dateKey].push(bill);
    });
    
    return mapping;
  }, [bills]);
  
  // Handle month navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
    setSelectedDate(null);
    setSelectedBills([]);
  };
  
  // Handle date selection
  const handleDateClick = (day: { date: Date }) => {
    setSelectedDate(day.date);
    
    const dateKey = day.date.toISOString().split('T')[0];
    setSelectedBills(billsByDate[dateKey] || []);
  };
  
  // Get bills indicator styling
  const getBillsIndicator = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    const dateBills = billsByDate[dateKey] || [];
    
    if (dateBills.length === 0) return null;
    
    // Check if there are any overdue bills
    const hasOverdue = dateBills.some(bill => bill.status === 'overdue');
    // Check if there are any upcoming bills
    const hasUpcoming = dateBills.some(bill => bill.status === 'upcoming');
    // Check if all bills are paid
    const allPaid = dateBills.every(bill => bill.status === 'paid');
    
    let bgColor = 'bg-gray-300';
    
    if (hasOverdue) {
      bgColor = 'bg-red-500';
    } else if (hasUpcoming) {
      bgColor = 'bg-yellow-500';
    } else if (allPaid) {
      bgColor = 'bg-green-500';
    }
    
    return (
      <div className="absolute bottom-1 left-0 right-0 flex justify-center space-x-1">
        {dateBills.slice(0, 3).map((_, index) => (
          <div 
            key={index} 
            className={`h-1.5 w-1.5 rounded-full ${bgColor}`}
          />
        ))}
        {dateBills.length > 3 && (
          <div className="text-xs text-gray-500">+{dateBills.length - 3}</div>
        )}
      </div>
    );
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Format amount as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  // Get status icon
  const getStatusIcon = (status: 'paid' | 'upcoming' | 'overdue') => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <ExclamationCircleIcon className="h-4 w-4 text-red-500" />;
      case 'upcoming':
        return <CalendarDaysIcon className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Calendar header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date().getMonth())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
          <button 
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {DAYS.map(day => (
          <div key={day} className="text-center font-medium py-2 text-gray-600">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, i) => {
          const dateKey = day.date.toISOString().split('T')[0];
          const dayBills = billsByDate[dateKey] || [];
          const isSelected = selectedDate && 
            selectedDate.getDate() === day.date.getDate() &&
            selectedDate.getMonth() === day.date.getMonth() &&
            selectedDate.getFullYear() === day.date.getFullYear();
          
          // Style for the day cell
          let dayClasses = "relative h-24 p-1 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer transition-colors";
          
          // Add styling for current month vs prev/next month
          if (!day.isCurrentMonth) {
            dayClasses += " bg-gray-50";
          }
          
          // Add styling for today
          if (isToday(day.date)) {
            dayClasses += " bg-blue-50 border-blue-200";
          }
          
          // Add styling for selected date
          if (isSelected) {
            dayClasses += " ring-2 ring-blue-500 bg-blue-50";
          }
          
          return (
            <div 
              key={i} 
              className={dayClasses}
              onClick={() => handleDateClick(day)}
            >
              <div className={`text-sm ${!day.isCurrentMonth ? 'text-gray-400' : 'font-medium'}`}>
                {day.date.getDate()}
              </div>
              
              {dayBills.length > 0 && (
                <div className="mt-1 space-y-1 max-h-[80%] overflow-hidden">
                  {dayBills.slice(0, 2).map(bill => (
                    <div 
                      key={bill.id}
                      className={`text-xs p-1 rounded truncate flex items-center 
                        ${bill.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          bill.status === 'overdue' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBillClick(bill.id);
                      }}
                    >
                      <BanknotesIcon className="h-3 w-3 mr-1 inline" />
                      {bill.name}
                    </div>
                  ))}
                  {dayBills.length > 2 && (
                    <div className="text-xs text-gray-500 pl-1">
                      +{dayBills.length - 2} more
                    </div>
                  )}
                </div>
              )}
              
              {getBillsIndicator(day.date)}
            </div>
          );
        })}
      </div>
      
      {/* Selected date bills */}
      <AnimatePresence>
        {selectedDate && selectedBills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-gray-200 pt-4"
          >
            <h3 className="font-medium mb-2">
              Bills for {selectedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            <div className="space-y-2">
              {selectedBills.map(bill => (
                <div 
                  key={bill.id}
                  className="flex items-center justify-between p-2 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => onBillClick(bill.id)}
                >
                  <div className="flex items-center">
                    {getStatusIcon(bill.status)}
                    <span className="ml-2 font-medium">{bill.name}</span>
                    <span className="ml-2 text-sm text-gray-500">{bill.category}</span>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(bill.amount)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 