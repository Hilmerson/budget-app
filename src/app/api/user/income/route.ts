import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma'; // Use singleton Prisma instance

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { income, employmentMode } = await request.json();

    const user = await prisma.user.update({
      where: {
        email: session.user.email as string,
      },
      data: {
        income,
        employmentMode,
      },
      select: {
        id: true,
        income: true,
        employmentMode: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating income:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 