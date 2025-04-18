import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/bills - Retrieve all bills for a user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const bills = await prisma.bill.findMany({
      where: { userId: user.id },
      include: {
        paymentHistory: {
          orderBy: { paymentDate: 'desc' },
          take: 3, // Include only the 3 most recent payments
        },
      },
      orderBy: { dueDate: 'asc' },
    });
    
    return NextResponse.json(bills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bills' },
      { status: 500 }
    );
  }
}

// POST /api/bills - Create a new bill
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const body = await request.json();
    
    const {
      name,
      amount,
      dueDate,
      category,
      frequency,
      description,
      reminderDays,
      autoPay,
      paymentURL,
      isRecurring,
    } = body;
    
    // Validate required fields
    if (!name || amount === undefined || !dueDate || !category || !frequency) {
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
    
    // For recurring bills, calculate the next due date
    const dueDateObj = new Date(dueDate);
    let nextDueDate = null;
    
    if (isRecurring) {
      nextDueDate = new Date(dueDateObj);
      
      switch (frequency) {
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
    
    const bill = await prisma.bill.create({
      data: {
        userId: user.id,
        name,
        amount: parseFloat(amount.toString()),
        dueDate: dueDateObj,
        category,
        frequency,
        description,
        reminderDays: reminderDays || 3,
        autoPay: autoPay || false,
        paymentURL,
        isRecurring: isRecurring || true,
        nextDueDate,
        status: 'upcoming',
      },
    });
    
    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error creating bill:', error);
    return NextResponse.json(
      { error: 'Failed to create bill' },
      { status: 500 }
    );
  }
} 