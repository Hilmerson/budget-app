import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email as string,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get the expense to check ownership
    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    });

    if (!expense) {
      return NextResponse.json(
        { message: 'Expense not found' },
        { status: 404 }
      );
    }

    // Verify the expense belongs to the current user
    if (expense.userId !== user.id) {
      return NextResponse.json(
        { message: 'Not authorized to delete this expense' },
        { status: 403 }
      );
    }

    // Delete the expense
    await prisma.expense.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: 'Expense deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 