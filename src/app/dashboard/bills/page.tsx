'use client';

import { useState, useEffect } from 'react';
import { CalendarDaysIcon, BanknotesIcon, PlusCircleIcon, ChevronRightIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import BillForm from '@/components/bills/BillForm';
import BillCard from '@/components/bills/BillCard';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';

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
  createdAt: string;
  updatedAt: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  method?: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [error, setError] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{
    overdue: boolean;
    upcoming: boolean;
    paid: boolean;
  }>({
    overdue: false,
    upcoming: false,
    paid: false,
  });
  
  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bills');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      
      const data = await response.json();
      setBills(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bills:', err);
      setError('Failed to load bills. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBills();
  }, []);
  
  const handleAddBill = () => {
    setShowAddForm(true);
  };
  
  const handleBillAdded = () => {
    setShowAddForm(false);
    fetchBills();
  };
  
  const handlePaidStatusChange = async (billId: string, isPaid: boolean) => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPaid }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bill');
      }
      
      fetchBills();
    } catch (err) {
      console.error('Error updating bill:', err);
      setError('Failed to update bill. Please try again.');
    }
  };
  
  const handleDeleteBill = async (billId: string) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete bill');
      }
      
      fetchBills();
    } catch (err) {
      console.error('Error deleting bill:', err);
      setError('Failed to delete bill. Please try again.');
    }
  };
  
  // Group bills by their status
  const upcomingBills = bills.filter(bill => bill.status === 'upcoming');
  const overdueBills = bills.filter(bill => bill.status === 'overdue');
  const paidBills = bills.filter(bill => bill.status === 'paid');
  
  // Sort bills by due date (closest first)
  const sortedUpcomingBills = [...upcomingBills].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  
  const todayFormatted = new Date().toLocaleDateString();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  // Toggle section collapse
  const toggleSection = (section: 'overdue' | 'upcoming' | 'paid') => {
    setCollapsedSections({
      ...collapsedSections,
      [section]: !collapsedSections[section],
    });
  };
  
  return (
    <div className="h-full w-full py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bill Reminders</h1>
          <p className="text-gray-500">Track and manage your recurring payments</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('list')}
            className="flex items-center"
          >
            <BanknotesIcon className="h-5 w-5 mr-1" />
            List
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'secondary'}
            onClick={() => setViewMode('calendar')}
            className="flex items-center"
          >
            <CalendarDaysIcon className="h-5 w-5 mr-1" />
            Calendar
          </Button>
          <Button
            variant="success"
            onClick={handleAddBill}
            className="flex items-center"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1" />
            Add Bill
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <ExclamationCircleIcon className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="space-y-6">
              {/* Today's date */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-800 font-medium">Today: {todayFormatted}</p>
              </div>
              
              {/* Overdue bills section */}
              {overdueBills.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h2 
                    className="text-lg font-semibold text-red-800 mb-2 flex items-center cursor-pointer" 
                    onClick={() => toggleSection('overdue')}
                  >
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                    Overdue ({overdueBills.length})
                    <ChevronRightIcon 
                      className={`h-5 w-5 ml-2 transition-transform ${collapsedSections.overdue ? '' : 'transform rotate-90'}`} 
                    />
                  </h2>
                  
                  {!collapsedSections.overdue && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {overdueBills.map(bill => (
                        <motion.div key={bill.id} variants={itemVariants}>
                          <BillCard
                            bill={bill}
                            onStatusChange={handlePaidStatusChange}
                            onDelete={handleDeleteBill}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
              
              {/* Upcoming bills section */}
              {sortedUpcomingBills.length > 0 && (
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h2 
                    className="text-lg font-semibold mb-2 flex items-center cursor-pointer"
                    onClick={() => toggleSection('upcoming')}
                  >
                    <ChevronRightIcon 
                      className={`h-5 w-5 mr-2 transition-transform ${collapsedSections.upcoming ? '' : 'transform rotate-90'}`} 
                    />
                    Upcoming ({sortedUpcomingBills.length})
                  </h2>
                  
                  {!collapsedSections.upcoming && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {sortedUpcomingBills.map(bill => (
                        <motion.div key={bill.id} variants={itemVariants}>
                          <BillCard
                            bill={bill}
                            onStatusChange={handlePaidStatusChange}
                            onDelete={handleDeleteBill}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
              
              {/* Recently paid bills section */}
              {paidBills.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h2 
                    className="text-lg font-semibold text-green-800 mb-2 flex items-center cursor-pointer"
                    onClick={() => toggleSection('paid')}
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Paid ({paidBills.length})
                    <ChevronRightIcon 
                      className={`h-5 w-5 ml-2 transition-transform ${collapsedSections.paid ? '' : 'transform rotate-90'}`} 
                    />
                  </h2>
                  
                  {!collapsedSections.paid && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {paidBills.slice(0, 3).map(bill => (
                        <motion.div key={bill.id} variants={itemVariants}>
                          <BillCard
                            bill={bill}
                            onStatusChange={handlePaidStatusChange}
                            onDelete={handleDeleteBill}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  {!collapsedSections.paid && paidBills.length > 3 && (
                    <button
                      className="text-green-700 mt-2 text-sm font-medium hover:text-green-800 flex items-center cursor-pointer"
                      onClick={() => {/* Show more paid bills */}}
                    >
                      View all {paidBills.length} paid bills
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>
              )}
              
              {bills.length === 0 && (
                <div className="bg-gray-50 rounded-lg border p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <BanknotesIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700">No bills found</h3>
                  <p className="text-gray-500 mt-1">Get started by adding your first bill</p>
                  <div className="mt-4">
                    <Button variant="primary" onClick={handleAddBill}>
                      Add Your First Bill
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-4">
              <p className="text-gray-500 text-center py-8">Calendar view coming soon!</p>
            </div>
          )}
        </>
      )}
      
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Bill</h2>
            <BillForm onSubmit={handleBillAdded} onCancel={() => setShowAddForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
} 