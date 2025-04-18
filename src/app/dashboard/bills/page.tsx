'use client';

import { useState, useEffect } from 'react';
import { CalendarDaysIcon, BanknotesIcon, PlusCircleIcon, ChevronRightIcon, ExclamationCircleIcon, CheckCircleIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper } from 'lucide-react';
import BillForm from '@/components/bills/BillForm';
import BillCard from '@/components/bills/BillCard';
import BillCalendar from '@/components/bills/BillCalendar';
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
  isPinned?: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  method?: string;
}

// Categories for bills - must match those in BillForm
const BILL_CATEGORIES = [
  'Housing',
  'Utilities',
  'Internet',
  'Phone',
  'Insurance',
  'Subscriptions',
  'Loan',
  'Credit Card',
  'Transportation',
  'Healthcare',
  'Education',
  'Other'
];

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
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showAllPaidCelebration, setShowAllPaidCelebration] = useState(false);
  
  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bills');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bills');
      }
      
      const data = await response.json();
      setBills(data);
      
      // Check if we should show the celebration (all bills paid, and at least one bill exists)
      const hasUnpaidBills = data.some(bill => bill.status === 'upcoming' || bill.status === 'overdue');
      const hasBills = data.length > 0;
      
      if (hasBills && !hasUnpaidBills && !showAllPaidCelebration) {
        setShowAllPaidCelebration(true);
        // Hide celebration after 5 seconds
        setTimeout(() => setShowAllPaidCelebration(false), 5000);
      }
      
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
      
      await fetchBills(); // Will check for all-paid celebration after update
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
  
  const handlePinChange = async (billId: string, isPinned: boolean) => {
    try {
      // Update local state immediately for responsive UI
      setBills(prev => 
        prev.map(bill => 
          bill.id === billId ? { ...bill, isPinned } : bill
        )
      );
      
      // Update on server
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPinned }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update bill');
      }
    } catch (err) {
      console.error('Error updating bill pin status:', err);
      setError('Failed to update bill. Please try again.');
      // Revert local change on error
      fetchBills();
    }
  };
  
  // Group bills by their status
  const upcomingBills = bills.filter(bill => bill.status === 'upcoming');
  const overdueBills = bills.filter(bill => bill.status === 'overdue');
  const paidBills = bills.filter(bill => bill.status === 'paid');
  
  // Filter bills by category if selected
  const filterBillsByCategory = (bills: Bill[]) => {
    if (!selectedCategory) return bills;
    return bills.filter(bill => bill.category === selectedCategory);
  };
  
  // Apply category filter to all bill lists
  const filteredUpcomingBills = filterBillsByCategory(upcomingBills);
  const filteredOverdueBills = filterBillsByCategory(overdueBills);
  const filteredPaidBills = filterBillsByCategory(paidBills);
  
  // Sort bills by pin status first, then by due date
  const sortBills = (bills: Bill[]) => {
    return [...bills].sort((a, b) => {
      // Pinned bills first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // Then sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };
  
  // Sort bills by pin status and due date
  const sortedUpcomingBills = sortBills(filteredUpcomingBills);
  const sortedOverdueBills = sortBills(filteredOverdueBills);
  const sortedPaidBills = sortBills(filteredPaidBills);
  
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
  
  const handleBillClick = (billId: string) => {
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      setSelectedBill(bill);
      setShowBillDetails(true);
    }
  };
  
  // Set a category filter
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setShowCategoryFilter(false);
  };
  
  // Clear category filter
  const clearCategoryFilter = () => {
    setSelectedCategory(null);
  };
  
  return (
    <div className="h-full w-full py-6">
      {/* All Bills Paid Celebration */}
      <AnimatePresence>
        {showAllPaidCelebration && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-x-0 top-4 mx-auto w-auto max-w-md z-50 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-center justify-center"
          >
            <div className="flex flex-col items-center p-2">
              <motion.div
                initial={{ rotate: 0, scale: 0.5 }}
                animate={{ 
                  rotate: [0, 15, -15, 10, -10, 5, -5, 0],
                  scale: [0.5, 1.2, 1]
                }}
                transition={{ duration: 1 }}
              >
                <PartyPopper className="h-12 w-12 text-yellow-500 mb-2" />
              </motion.div>
              <h3 className="text-lg font-bold text-green-700">Congratulations!</h3>
              <p className="text-green-600 text-center">
                All your bills are paid for this month. Great job staying on top of your finances!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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
          <div className="relative">
            <Button
              variant={selectedCategory ? 'success' : 'secondary'}
              onClick={() => setShowCategoryFilter(!showCategoryFilter)}
              className="flex items-center"
            >
              <FunnelIcon className="h-5 w-5 mr-1" />
              {selectedCategory || 'Filter'}
              {selectedCategory && (
                <XMarkIcon 
                  className="h-4 w-4 ml-1" 
                  onClick={(e) => {
                    e.stopPropagation();
                    clearCategoryFilter();
                  }}
                />
              )}
            </Button>
            
            {showCategoryFilter && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <div className="py-1">
                  {BILL_CATEGORIES.map(category => (
                    <button
                      key={category}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        selectedCategory === category 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
      
      {/* Active filters display */}
      {selectedCategory && (
        <div className="mb-4 flex items-center">
          <span className="text-sm text-gray-500 mr-2">Filtered by:</span>
          <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full flex items-center">
            {selectedCategory}
            <button 
              onClick={clearCategoryFilter} 
              className="ml-1 text-indigo-600 hover:text-indigo-800"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}
      
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
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-800 font-medium">Today: {todayFormatted}</p>
              </div>
              
              {/* Overdue bills section */}
              {sortedOverdueBills.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h2 
                    className="text-lg font-semibold text-red-800 mb-2 flex items-center cursor-pointer" 
                    onClick={() => toggleSection('overdue')}
                  >
                    <ExclamationCircleIcon className="h-5 w-5 mr-2" />
                    Overdue ({sortedOverdueBills.length})
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
                      {sortedOverdueBills.map(bill => (
                        <motion.div key={bill.id} variants={itemVariants}>
                          <BillCard
                            bill={bill}
                            onStatusChange={handlePaidStatusChange}
                            onDelete={handleDeleteBill}
                            onPin={handlePinChange}
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
                            onPin={handlePinChange}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
              
              {/* Recently paid bills section */}
              {sortedPaidBills.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h2 
                    className="text-lg font-semibold text-green-800 mb-2 flex items-center cursor-pointer"
                    onClick={() => toggleSection('paid')}
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Paid ({sortedPaidBills.length})
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
                      {sortedPaidBills.slice(0, 3).map(bill => (
                        <motion.div key={bill.id} variants={itemVariants}>
                          <BillCard
                            bill={bill}
                            onStatusChange={handlePaidStatusChange}
                            onDelete={handleDeleteBill}
                            onPin={handlePinChange}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  {!collapsedSections.paid && sortedPaidBills.length > 3 && (
                    <button
                      className="text-green-700 mt-2 text-sm font-medium hover:text-green-800 flex items-center cursor-pointer"
                      onClick={() => {/* Show more paid bills */}}
                    >
                      View all {sortedPaidBills.length} paid bills
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </button>
                  )}
                </div>
              )}
              
              {bills.length === 0 && !loading && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <BanknotesIcon className="h-16 w-16 text-indigo-400" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">No bills found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Track your recurring bills, get reminders before they're due, and never miss a payment again.
                  </p>
                  <div className="space-y-4">
                    <Button 
                      variant="primary" 
                      onClick={handleAddBill}
                      size="lg"
                      className="px-8"
                    >
                      <PlusCircleIcon className="h-5 w-5 mr-2" />
                      Add Your First Bill
                    </Button>
                    
                    <div className="text-sm text-gray-500 max-w-md mx-auto pt-4 border-t border-gray-100">
                      <p className="mb-2">Here are some examples of bills you might want to track:</p>
                      <div className="grid grid-cols-2 gap-2 text-left mx-auto max-w-xs">
                        <ul className="space-y-1">
                          <li>• Rent/Mortgage</li>
                          <li>• Electricity</li>
                          <li>• Water</li>
                          <li>• Internet</li>
                        </ul>
                        <ul className="space-y-1">
                          <li>• Phone</li>
                          <li>• Insurance</li>
                          <li>• Subscriptions</li>
                          <li>• Credit Cards</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-blue-800 font-medium">Today: {todayFormatted}</p>
              </div>
              
              <BillCalendar 
                bills={selectedCategory ? filterBillsByCategory(bills) : bills} 
                onBillClick={handleBillClick} 
              />
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
      
      {showBillDetails && selectedBill && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bill Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBillDetails(false)}
              >
                Close
              </Button>
            </div>
            <BillCard
              bill={selectedBill}
              onStatusChange={handlePaidStatusChange}
              onDelete={(id) => {
                handleDeleteBill(id);
                setShowBillDetails(false);
              }}
              onPin={handlePinChange}
            />
          </div>
        </div>
      )}
    </div>
  );
} 