import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma'; // Use singleton Prisma instance

// PUT /api/user/experience - Update user experience points
export async function PUT(request: Request) {
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

    // Parse the request body
    const body = await request.json();
    const { experience, level } = body;

    // Validate the input
    if (experience === undefined || level === undefined) {
      return NextResponse.json(
        { message: 'Experience and level are required' },
        { status: 400 }
      );
    }

    // Update the user's experience and level
    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        experience: experience,
        level: level,
      },
    });

    return NextResponse.json({
      message: 'Experience updated successfully',
      experience: updatedUser.experience,
      level: updatedUser.level
    });
  } catch (error) {
    console.error('Error updating user experience:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
}

// GET /api/user/experience - Get user's current experience and level
export async function GET() {
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
      select: {
        experience: true,
        level: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      experience: user.experience,
      level: user.level
    });
  } catch (error) {
    console.error('Error fetching user experience:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 