import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/bills/[id] - Get a specific bill
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const billId = params.id;
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        paymentHistory: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });
    
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    
    // Ensure the bill belongs to the user
    if (bill.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json(bill);
  } catch (error) {
    console.error('Error fetching bill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bill' },
      { status: 500 }
    );
  }
}

// PUT /api/bills/[id] - Update a bill
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const billId = params.id;
    const body = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if bill exists and belongs to the user
    const existingBill = await prisma.bill.findUnique({
      where: { id: billId },
    });
    
    if (!existingBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    
    if (existingBill.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // For recurring bills, recalculate the next due date if necessary
    let nextDueDate = existingBill.nextDueDate;
    
    if (body.isRecurring && (body.dueDate || body.frequency)) {
      const dueDateObj = new Date(body.dueDate || existingBill.dueDate);
      nextDueDate = new Date(dueDateObj);
      const frequency = body.frequency || existingBill.frequency;
      
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
    
    // Update the bill
    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: {
        name: body.name ?? undefined,
        amount: body.amount ? parseFloat(body.amount.toString()) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        category: body.category ?? undefined,
        frequency: body.isRecurring === false ? 'one-time' : (body.frequency ?? undefined),
        description: body.description ?? undefined,
        reminderDays: body.reminderDays ?? undefined,
        autoPay: body.autoPay ?? undefined,
        paymentURL: body.paymentURL ?? undefined,
        isRecurring: body.isRecurring ?? undefined,
        isPaid: body.isPaid ?? undefined,
        isPinned: body.isPinned !== undefined ? body.isPinned : undefined,
        nextDueDate: body.isRecurring === false ? null : nextDueDate,
        status: body.status ?? undefined,
        lastPaid: body.isPaid ? new Date() : existingBill.lastPaid,
      },
    });
    
    return NextResponse.json(updatedBill);
  } catch (error) {
    console.error('Error updating bill:', error);
    return NextResponse.json(
      { error: 'Failed to update bill' },
      { status: 500 }
    );
  }
}

// DELETE /api/bills/[id] - Delete a bill
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userEmail = session.user.email;
    const billId = params.id;
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if bill exists and belongs to the user
    const existingBill = await prisma.bill.findUnique({
      where: { id: billId },
    });
    
    if (!existingBill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    
    if (existingBill.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Delete all payment history records for this bill
    await prisma.billPayment.deleteMany({
      where: { billId },
    });
    
    // Delete the bill
    await prisma.bill.delete({
      where: { id: billId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json(
      { error: 'Failed to delete bill' },
      { status: 500 }
    );
  }
} 