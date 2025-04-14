import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

// GET /api/income - Get all income records for the current user
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 API: Fetching income...");
    const session = await getServerSession(authOptions);
    console.log("👤 API: Session user:", session?.user?.email);
    
    if (!session || !session.user) {
      console.log("❌ API: No authenticated session");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      console.log("✅ API: Found user by email, ID:", user.id);
      const income = await prisma.income.findMany({
        where: {
          userId: user.id,
        },
        orderBy: {
          date: 'desc',
        },
      });

      console.log(`📤 API: Returning ${income.length} income records`);
      return NextResponse.json(income);
    } else {
      // If we have the userId directly from session, use it
      console.log(`🔍 API: Looking up income for user ID: ${userId}`);
      const income = await prisma.income.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          date: 'desc',
        },
      });
      
      console.log(`📤 API: Returning ${income.length} income records`);
      return NextResponse.json(income);
    }
  } catch (error) {
    console.error('❌ API Error fetching income:', error);
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
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      finalUserId = user.id;
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
        userId: finalUserId as string,
        source,
        amount: parseFloat(amount.toString()),
        frequency: frequency || 'monthly',
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