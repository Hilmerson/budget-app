'use client';

import { useState } from 'react';
import { 
  CalendarIcon, 
  BanknotesIcon, 
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
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

export default function BillCard({ bill, onStatusChange, onDelete }: BillCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
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
      }
    } catch (error) {
      console.error('Error toggling payment status:', error);
      alert('Failed to update payment status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const daysUntilDue = getDaysUntilDue(bill.dueDate);
  
  // Determine card styling based on status
  let cardClass = 'bg-white';
  let statusColor = 'text-blue-500';
  let borderClass = 'border';
  
  if (bill.status === 'paid') {
    cardClass = 'bg-green-50';
    statusColor = 'text-green-500';
    borderClass = 'border border-green-100';
  } else if (bill.status === 'overdue') {
    cardClass = 'bg-red-50';
    statusColor = 'text-red-500';
    borderClass = 'border border-red-100';
  } else {
    // If upcoming but due soon (within reminder days)
    if (daysUntilDue <= bill.reminderDays) {
      cardClass = 'bg-yellow-50';
      statusColor = 'text-yellow-600';
      borderClass = 'border border-yellow-100';
    }
  }
  
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`${cardClass} ${borderClass} rounded-lg shadow-sm overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium text-gray-800">{bill.name}</h3>
            <p className="text-gray-500 text-sm">{bill.category}</p>
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
        )}
        
        {bill.status === 'overdue' && (
          <div className="text-sm text-red-500 font-medium flex items-center mb-2">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            Overdue by {Math.abs(daysUntilDue)} days
          </div>
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
            className="flex-1 flex items-center justify-center cursor-pointer"
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
            variant="danger"
            className="flex items-center cursor-pointer"
            onClick={() => onDelete(bill.id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {showDetails && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="text-sm">
            {bill.description && (
              <p className="text-gray-600 mb-2">{bill.description}</p>
            )}
            
            <div className="text-xs text-gray-500">
              {bill.autoPay && (
                <div className="flex items-center mb-1">
                  <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
                  Set to autopay
                </div>
              )}
              
              <div className="flex items-center mb-1">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Reminder: {bill.reminderDays} days before due date
              </div>
              
              {bill.paymentURL && (
                <div className="flex items-center mb-1">
                  <ArrowTopRightOnSquareIcon className="h-3 w-3 mr-1 text-blue-500" />
                  <a href={bill.paymentURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline cursor-pointer">
                    Payment link
                  </a>
                </div>
              )}
              
              {bill.paymentHistory && bill.paymentHistory.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-gray-700 mb-1">Recent Payments</div>
                  {bill.paymentHistory.map(payment => (
                    <div key={payment.id} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                      <span>{formatDate(payment.paymentDate)}</span>
                      <span>{formatCurrency(payment.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 