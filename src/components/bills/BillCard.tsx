'use client';

import { useState } from 'react';
import { 
  CalendarIcon, 
  BanknotesIcon, 
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PaperClipIcon as PinOutlineIcon
} from '@heroicons/react/24/outline';
import { PaperClipIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  frequency: string;
  description?: string;
  reminderDays: number;
  autoPay: boolean;
  paymentURL?: string;
  isPaid: boolean;
  isRecurring: boolean;
  nextDueDate?: string;
  status: 'paid' | 'upcoming' | 'overdue';
  lastPaid?: string;
  paymentHistory: PaymentHistory[];
  isPinned?: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  method?: string;
}

interface BillCardProps {
  bill: Bill;
  onStatusChange: (id: string, isPaid: boolean) => void;
  onDelete: (id: string) => void;
  onPin?: (id: string, isPinned: boolean) => void;
}

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper function to format dates
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Helper to get days until due
const getDaysUntilDue = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

// Helper function to get progress color
const getProgressColor = (daysUntilDue: number, reminderDays: number) => {
  if (daysUntilDue <= 0) return 'bg-red-500'; // Overdue
  if (daysUntilDue <= Math.floor(reminderDays / 3)) return 'bg-red-400'; // Very urgent
  if (daysUntilDue <= Math.floor(reminderDays / 2)) return 'bg-orange-400'; // Urgent
  if (daysUntilDue <= reminderDays) return 'bg-yellow-400'; // Approaching
  return 'bg-green-400'; // Safe
};

// Helper function to calculate progress percentage
const getProgressPercentage = (daysUntilDue: number, reminderDays: number) => {
  // Ensure we don't go over 100% or under 0%
  if (daysUntilDue <= 0) return 100;
  
  // We'll use reminderDays + 10 as our "full period" to make the progress more visible
  const fullPeriod = reminderDays + 10;
  const progress = ((fullPeriod - daysUntilDue) / fullPeriod) * 100;
  
  return Math.min(Math.max(progress, 0), 100);
};

export default function BillCard({ bill, onStatusChange, onDelete, onPin }: BillCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  
  const handlePaymentToggle = async () => {
    try {
      setIsLoading(true);
      
      if (bill.isPaid) {
        // If already paid, just toggle the status
        await onStatusChange(bill.id, false);
      } else {
        // If not paid, create a payment record
        const payment = {
          billId: bill.id,
          amount: bill.amount,
          paymentDate: new Date().toISOString(),
          method: 'manual',
          notes: 'Marked as paid manually',
        };
        
        const response = await fetch('/api/bills/payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payment),
        });
        
        if (!response.ok) {
          throw new Error('Failed to record payment');
        }
        
        await onStatusChange(bill.id, true);
        // Show success animation
        setShowPaymentSuccess(true);
        setTimeout(() => setShowPaymentSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error toggling payment status:', error);
      alert('Failed to update payment status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePinToggle = () => {
    if (onPin) {
      onPin(bill.id, !bill.isPinned);
    }
  };
  
  const daysUntilDue = getDaysUntilDue(bill.dueDate);
  
  // Determine card styling based on status
  let cardClass = 'bg-white';
  let statusColor = 'text-blue-500';
  let borderClass = 'border border-gray-200';
  let leftBorderClass = '';
  
  if (bill.status === 'paid') {
    statusColor = 'text-green-500';
    leftBorderClass = 'border-l-4 border-l-green-500';
    cardClass = 'bg-white';
  } else if (bill.status === 'overdue') {
    statusColor = 'text-red-500';
    leftBorderClass = 'border-l-4 border-l-red-500';
    cardClass = 'bg-red-50';
  } else {
    // If upcoming but due soon (within reminder days)
    if (daysUntilDue <= bill.reminderDays) {
      statusColor = 'text-yellow-600';
      leftBorderClass = 'border-l-4 border-l-yellow-500';
      // Only add background color if very close to due date (3 days or less)
      cardClass = daysUntilDue <= 3 ? 'bg-yellow-50' : 'bg-white';
    } else {
      // Regular upcoming bills (not due soon)
      leftBorderClass = 'border-l-4 border-l-gray-300';
    }
  }
  
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`${cardClass} ${borderClass} ${leftBorderClass} rounded-lg shadow-sm overflow-hidden relative`}
    >
      {/* Payment success overlay */}
      <AnimatePresence>
        {showPaymentSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500 bg-opacity-80 flex items-center justify-center z-10"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <CheckCircleIcon className="h-16 w-16 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center">
            {onPin && (
              <button
                onClick={handlePinToggle}
                className="mr-2 focus:outline-none"
                title={bill.isPinned ? "Unpin this bill" : "Pin this bill as important"}
              >
                {bill.isPinned ? (
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.5 17V9M9.5 9C10.1667 8.33333 10.9 7 10.5 6C10.1 5 9.16667 4.33333 8.5 4H10.5C12.1667 4.33333 15.9 5.4 16.5 6C17.1 6.6 15.6667 7.33333 14.5 7.5L9.5 9Z" 
                      stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="9.5" cy="3" r="2" fill="#EF4444" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400 hover:text-red-500" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.5 17V9M9.5 9C10.1667 8.33333 10.9 7 10.5 6C10.1 5 9.16667 4.33333 8.5 4H10.5C12.1667 4.33333 15.9 5.4 16.5 6C17.1 6.6 15.6667 7.33333 14.5 7.5L9.5 9Z" 
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="9.5" cy="3" r="2" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            )}
            <div>
              <h3 className="font-medium text-gray-800">{bill.name}</h3>
              <p className="text-gray-500 text-sm">{bill.category}</p>
            </div>
          </div>
          <div className="text-xl font-semibold">
            {formatCurrency(bill.amount)}
          </div>
        </div>
        
        <div className="flex items-center text-sm mb-2">
          <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
          <span>
            {bill.status === 'paid' 
              ? `Paid on ${bill.lastPaid ? formatDate(bill.lastPaid) : 'N/A'}`
              : `Due ${formatDate(bill.dueDate)}`}
          </span>
        </div>
        
        {bill.status === 'upcoming' && (
          <>
            <div className={`text-sm ${statusColor} font-medium flex items-center mb-2`}>
              {daysUntilDue === 0 ? (
                <>
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  Due today
                </>
              ) : daysUntilDue < 0 ? (
                <>
                  <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                  Overdue by {Math.abs(daysUntilDue)} days
                </>
              ) : (
                <>
                  {daysUntilDue <= bill.reminderDays && <ExclamationCircleIcon className="h-4 w-4 mr-1" />}
                  {daysUntilDue} days until due
                </>
              )}
            </div>
            
            {/* Due date progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div 
                className={`h-1.5 rounded-full ${getProgressColor(daysUntilDue, bill.reminderDays)}`}
                style={{ width: `${getProgressPercentage(daysUntilDue, bill.reminderDays)}%` }}
              ></div>
            </div>
          </>
        )}
        
        {bill.status === 'overdue' && (
          <>
            <div className="text-sm text-red-500 font-medium flex items-center mb-2">
              <ExclamationCircleIcon className="h-4 w-4 mr-1" />
              Overdue by {Math.abs(daysUntilDue)} days
            </div>
            
            {/* Overdue progress bar - 100% red */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
              <div className="h-1.5 rounded-full bg-red-500 w-full"></div>
            </div>
          </>
        )}
        
        {bill.isRecurring && (
          <div className="text-xs text-gray-500 mb-2">
            {bill.frequency === 'one-time' ? 'One-time payment' : `Recurs ${bill.frequency}`}
            {bill.nextDueDate && bill.status === 'paid' && (
              <> · Next due: {formatDate(bill.nextDueDate)}</>
            )}
          </div>
        )}
        
        <div className="flex space-x-2 mt-3">
          <Button
            size="sm"
            variant={bill.status === 'paid' ? 'secondary' : 'primary'}
            onClick={handlePaymentToggle}
            disabled={isLoading}
            className={`flex-1 flex items-center justify-center cursor-pointer ${
              daysUntilDue <= 2 && bill.status === 'upcoming' ? 'animate-pulse' : ''
            }`}
          >
            {bill.status === 'paid' ? (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Paid
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Mark Paid
              </>
            )}
          </Button>
          
          {bill.paymentURL && (
            <Button
              size="sm"
              variant="secondary"
              className="flex items-center cursor-pointer"
              onClick={() => window.open(bill.paymentURL, '_blank')}
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            size="sm"
            variant="secondary"
            className="flex items-center cursor-pointer"
            onClick={() => setShowDetails(!showDetails)}
            title="View details"
          >
            <InformationCircleIcon className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            className="flex items-center cursor-pointer text-red-500 hover:text-red-700"
            onClick={() => onDelete(bill.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showDetails && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="px-4 pb-4 pt-2 border-t border-gray-100"
        >
          <div className="text-sm">
            {bill.description && (
              <p className="text-gray-600 mb-3">{bill.description}</p>
            )}
            
            <div className="space-y-2">
              {bill.autoPay && (
                <div className="flex items-center text-xs text-gray-600 bg-green-50 p-1.5 rounded">
                  <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                  Set to autopay
                </div>
              )}
              
              <div className="flex items-center text-xs text-gray-600 bg-blue-50 p-1.5 rounded">
                <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                Reminder: {bill.reminderDays} days before due date
              </div>
              
              {bill.paymentURL && (
                <div className="flex items-center text-xs text-gray-600 bg-purple-50 p-1.5 rounded">
                  <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                  <a href={bill.paymentURL} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline cursor-pointer">
                    Payment link
                  </a>
                </div>
              )}
              
              {bill.paymentHistory && bill.paymentHistory.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <div className="font-medium text-gray-700 mb-2">Payment History</div>
                  
                  {/* Visual payment timeline */}
                  <div className="mb-3 bg-gray-100 p-2 rounded">
                    <div className="h-16 relative">
                      {/* Timeline line */}
                      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-300"></div>
                      
                      {/* Payment dots */}
                      {bill.paymentHistory.slice(0, 8).map((payment, index) => {
                        // Calculate position based on date
                        const date = new Date(payment.paymentDate);
                        // Use last 8 payments and distribute them along the timeline
                        const position = index / (Math.min(bill.paymentHistory.length, 8) - 1) * 100;
                        
                        return (
                          <div 
                            key={payment.id}
                            className="absolute top-1/2 transform -translate-y-1/2"
                            style={{ left: `${position}%` }}
                          >
                            <div className="relative">
                              <div className="h-3 w-3 rounded-full bg-green-500"></div>
                              <div className="absolute bottom-full mb-1 transform -translate-x-1/2 left-1/2">
                                <div className="text-xs font-medium whitespace-nowrap">
                                  {formatDate(payment.paymentDate).split(' ')[0]} {/* Just show month/day */}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  {formatCurrency(payment.amount)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="max-h-32 overflow-y-auto">
                    {bill.paymentHistory.map(payment => (
                      <div 
                        key={payment.id} 
                        className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-600 text-xs">{formatDate(payment.paymentDate)}</span>
                          {payment.notes && (
                            <span className="text-gray-500 text-xs italic">{payment.notes}</span>
                          )}
                        </div>
                        <span className="font-medium">{formatCurrency(payment.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 