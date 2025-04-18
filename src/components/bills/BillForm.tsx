'use client';

import { useState } from 'react';
import { CalendarIcon, BanknotesIcon, ClockIcon } from '@heroicons/react/24/outline';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useForm, Controller } from 'react-hook-form';

type BillFormProps = {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
};

// Categories for bills
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

// Frequency options
const FREQUENCY_OPTIONS = [
  { value: 'one-time', label: 'One Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

// Reminder days options
const REMINDER_OPTIONS = [
  { value: '1', label: '1 day before' },
  { value: '2', label: '2 days before' },
  { value: '3', label: '3 days before' },
  { value: '5', label: '5 days before' },
  { value: '7', label: '1 week before' },
  { value: '10', label: '10 days before' },
  { value: '14', label: '2 weeks before' },
  { value: '21', label: '3 weeks before' },
  { value: '30', label: '1 month before' }
];

export default function BillForm({ onSubmit, onCancel, initialData }: BillFormProps) {
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? true);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: initialData || {
      name: '',
      amount: '',
      dueDate: new Date().toISOString().substring(0, 10),
      category: '',
      frequency: 'monthly',
      description: '',
      reminderDays: 3,
      autoPay: false,
      paymentURL: '',
      isRecurring: true
    }
  });
  
  const onFormSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      
      // Format the URL if provided
      if (data.paymentURL && !data.paymentURL.match(/^https?:\/\//i)) {
        data.paymentURL = 'https://' + data.paymentURL;
      }
      
      // Format the date
      const formattedData = {
        ...data,
        amount: parseFloat(data.amount),
        dueDate: new Date(data.dueDate).toISOString(),
        reminderDays: parseInt(data.reminderDays),
      };
      
      // If we're adding a new bill
      if (!initialData) {
        const response = await fetch('/api/bills', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create bill');
        }
      } 
      // If we're editing an existing bill
      else {
        const response = await fetch(`/api/bills/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update bill');
        }
      }
      
      onSubmit(formattedData);
    } catch (error) {
      console.error('Error submitting bill:', error);
      alert('Failed to save bill. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Bill Name*
          </label>
          <Input
            id="name"
            placeholder="e.g. Rent, Internet, Netflix"
            {...register('name', { required: 'Bill name is required' })}
            error={errors.name?.message?.toString()}
          />
        </div>
        
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount*
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <BanknotesIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="pl-10"
              {...register('amount', { 
                required: 'Amount is required',
                min: { value: 0, message: 'Amount must be positive' }
              })}
              error={errors.amount?.message?.toString()}
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date*
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="dueDate"
              type="date"
              className="pl-10"
              {...register('dueDate', { required: 'Due date is required' })}
              error={errors.dueDate?.message?.toString()}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category*
          </label>
          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <Select
                id="category"
                options={BILL_CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                value={field.value}
                onChange={field.onChange}
                emptyOptionLabel="Select a category"
                error={errors.category?.message?.toString()}
              />
            )}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            id="isRecurring"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            checked={isRecurring}
            {...register('isRecurring')}
            onChange={e => setIsRecurring(e.target.checked)}
          />
          <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
            This is a recurring bill
          </label>
        </div>
        
        {isRecurring && (
          <div className="pl-6 border-l-2 border-gray-100">
            <div className="mb-4">
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="frequency"
                      options={FREQUENCY_OPTIONS}
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.frequency?.message?.toString()}
                      className="pl-10"
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-700 mb-1">
          Remind Me
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <Controller
            name="reminderDays"
            control={control}
            render={({ field }) => (
              <Select
                id="reminderDays"
                options={REMINDER_OPTIONS}
                value={field.value.toString()}
                onChange={(value) => {
                  // For controlled components, extract the value from the event
                  const stringValue = typeof value === 'object' && value !== null 
                    ? (value.target as HTMLSelectElement).value 
                    : value;
                  field.onChange(parseInt(stringValue));
                }}
                className="pl-10"
                helperText="When should we remind you about this bill?"
              />
            )}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          id="description"
          rows={2}
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Add notes about this bill"
          {...register('description')}
        />
      </div>
      
      <div className="pt-2">
        <label htmlFor="paymentURL" className="block text-sm font-medium text-gray-700 mb-1">
          Payment URL (Optional)
        </label>
        <Input
          id="paymentURL"
          type="text"
          placeholder="example.com/pay"
          {...register('paymentURL', {
            validate: {
              validUrl: (value) => {
                if (!value) return true;
                // Add https:// prefix if missing
                if (value && !value.match(/^https?:\/\//i)) {
                  value = 'https://' + value;
                }
                return true;
              }
            }
          })}
          error={errors.paymentURL?.message?.toString()}
        />
        <p className="mt-1 text-sm text-gray-500">
          Link to the payment page for this bill (https:// will be added if missing)
        </p>
      </div>
      
      <div className="flex items-center mt-2">
        <input
          id="autoPay"
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          {...register('autoPay')}
        />
        <label htmlFor="autoPay" className="ml-2 block text-sm text-gray-700">
          This bill is on autopay
        </label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Bill' : 'Add Bill'}
        </Button>
      </div>
    </form>
  );
} 