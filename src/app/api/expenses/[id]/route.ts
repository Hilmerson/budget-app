import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import prisma from '@/lib/prisma'; // Use singleton Prisma instance

interface Context {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    // First validate that params.id exists
    const params = await context.params;
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: 'Missing expense ID' },
        { status: 400 }
      );
    }

    // Verify the user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the expense exists and belongs to this user
    const expense = await prisma.expense.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { message: 'Expense not found or not authorized' },
        { status: 404 }
      );
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { message: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}

// PUT handler for updating an expense
export async function PUT(request: NextRequest, context: Context) {
  try {
    // Get and validate expense ID
    const params = await context.params;
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: 'Missing expense ID' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { category, amount, frequency, description } = body;

    // Verify the expense exists and belongs to this user
    const expense = await prisma.expense.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { message: 'Expense not found or not authorized' },
        { status: 404 }
      );
    }

    // Update the expense
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        category: category || expense.category,
        amount: amount !== undefined ? parseFloat(amount.toString()) : expense.amount,
        frequency: frequency || expense.frequency,
        description: description !== undefined ? description : expense.description,
      },
    });

    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { message: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

// GET handler for fetching a single expense
export async function GET(request: NextRequest, context: Context) {
  try {
    // Get and validate expense ID
    const params = await context.params;
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: 'Missing expense ID' },
        { status: 400 }
      );
    }

    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the expense
    const expense = await prisma.expense.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!expense) {
      return NextResponse.json(
        { message: 'Expense not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { message: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
} 