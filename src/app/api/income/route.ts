import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/income - Get all income records for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const income = await prisma.income.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return NextResponse.json(income);
  } catch (error) {
    console.error('Error fetching income:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income records' },
      { status: 500 }
    );
  }
}

// POST /api/income - Create a new income record
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { source, amount, frequency, description, date } = body;
    
    // Validate required fields
    if (!source || !amount || !date) {
      return NextResponse.json(
        { error: 'Source, amount, and date are required' },
        { status: 400 }
      );
    }
    
    const income = await prisma.income.create({
      data: {
        userId: session.user.id,
        source,
        amount: parseFloat(amount),
        frequency: frequency || 'MONTHLY',
        description,
        date: new Date(date),
      },
    });
    
    return NextResponse.json(income, { status: 201 });
  } catch (error) {
    console.error('Error creating income record:', error);
    return NextResponse.json(
      { error: 'Failed to create income record' },
      { status: 500 }
    );
  }
} 