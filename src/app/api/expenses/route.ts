import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma'; // Use the singleton prisma instance

// GET all expenses for the current user
export async function GET() {
  try {
    console.log("🔍 API: Fetching expenses...");
    const session = await getServerSession(authOptions);
    console.log("👤 API: Session user:", session?.user?.email);

    if (!session || !session.user) {
      console.log("❌ API: No authenticated session");
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use the user ID directly from the session if possible
    const userId = session.user.id;
    console.log("👤 API: User ID from session:", userId);
    
    if (!userId) {
      // Fallback to email lookup if id isn't available
      console.log("🔍 API: No user ID in session, looking up by email:", session.user.email);
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email as string,
        },
        select: {
          id: true
        }
      });

      if (!user) {
        console.log("❌ API: User not found in database");
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      
      console.log("✅ API: Found user by email, ID:", user.id);
      const expenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`📤 API: Returning ${expenses.length} expenses`);
      return NextResponse.json(expenses);
    } else {
      // If we have the userId directly from session, use it
      console.log(`🔍 API: Looking up expenses for user ID: ${userId}`);
      const expenses = await prisma.expense.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      console.log(`📤 API: Returning ${expenses.length} expenses`);
      return NextResponse.json(expenses);
    }
  } catch (error) {
    console.error('❌ API Error fetching expenses:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// POST a new expense
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use the user ID directly from the session if possible
    const userId = session.user.id;
    let finalUserId = userId;
    
    if (!userId) {
      // Fallback to email lookup if id isn't available
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email as string,
        },
        select: {
          id: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }
      
      finalUserId = user.id;
    }

    const { category, amount, frequency, description } = await request.json();

    if (!category || !amount) {
      return NextResponse.json(
        { message: 'Category and amount are required' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        userId: finalUserId as string,
        category,
        amount: parseFloat(amount.toString()),
        frequency: frequency || 'monthly',
        description: description || null,
        date: new Date(),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 