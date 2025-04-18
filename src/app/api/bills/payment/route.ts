import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/bills/payment - Record a payment for a bill
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const body = await request.json();
    
    const { billId, amount, paymentDate, notes, method } = body;
    
    // Validate required fields
    if (!billId || amount === undefined || !paymentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if bill exists and belongs to the user
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
    });
    
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    
    if (bill.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Create the payment record
    const payment = await prisma.billPayment.create({
      data: {
        billId,
        amount: parseFloat(amount.toString()),
        paymentDate: new Date(paymentDate),
        notes,
        method,
      },
    });
    
    // Update the bill status to paid
    const paymentDate_temp = new Date(paymentDate);
    let nextDueDate = null;
    const today = new Date();
    
    // For recurring bills, calculate the next due date
    if (bill.isRecurring) {
      nextDueDate = new Date(bill.dueDate);
      
      switch (bill.frequency) {
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case 'bi-weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 14);
          break;
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 3);
          break;
        case 'yearly':
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          break;
      }
    }
    
    // Update the bill with payment information
    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: {
        isPaid: true,
        lastPaid: paymentDate_temp,
        status: 'paid',
        nextDueDate: bill.isRecurring ? nextDueDate : null,
      },
    });
    
    // If user has streak feature, increment streak for on-time payment
    if (paymentDate_temp <= bill.dueDate) {
      // Add XP for on-time payment and increment streak
      await prisma.user.update({
        where: { id: user.id },
        data: {
          streak: { increment: 1 },
          experience: { increment: 10 }, // Add XP for on-time payment
        },
      });
    }
    
    return NextResponse.json({ payment, bill: updatedBill });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      { error: 'Failed to record payment' },
      { status: 500 }
    );
  }
} 