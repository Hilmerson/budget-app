import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma'; // Use singleton Prisma instance

interface Context {
  params: {
    id: string;
  };
}

// GET /api/income/[id] - Get a specific income record
export async function GET(request: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    const id = params.id;
    
    const income = await prisma.income.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });
    
    if (!income) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }
    
    return NextResponse.json(income);
  } catch (error) {
    console.error('Error fetching income record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income record' },
      { status: 500 }
    );
  }
}

// PUT /api/income/[id] - Update an income record
export async function PUT(request: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const { source, amount, frequency, description, date } = body;
    
    // Check if the income exists and belongs to the user
    const existingIncome = await prisma.income.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });
    
    if (!existingIncome) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }
    
    // Update the income record
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: {
        source: source || existingIncome.source,
        amount: amount ? parseFloat(amount) : existingIncome.amount,
        frequency: frequency || existingIncome.frequency,
        description: description !== undefined ? description : existingIncome.description,
        date: date ? new Date(date) : existingIncome.date,
      },
    });
    
    return NextResponse.json(updatedIncome);
  } catch (error) {
    console.error('Error updating income record:', error);
    return NextResponse.json(
      { error: 'Failed to update income record' },
      { status: 500 }
    );
  }
}

// DELETE /api/income/[id] - Delete an income record
export async function DELETE(request: NextRequest, context: Context) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const params = await context.params;
    const id = params.id;
    
    // Check if the income exists and belongs to the user
    const existingIncome = await prisma.income.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });
    
    if (!existingIncome) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }
    
    // Delete the income record
    await prisma.income.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting income record:', error);
    return NextResponse.json(
      { error: 'Failed to delete income record' },
      { status: 500 }
    );
  }
} 