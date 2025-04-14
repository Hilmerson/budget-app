import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the updated user data from the request
    const body = await request.json();
    const { name } = body;
    
    // Update the session
    if (session.user) {
      session.user.name = name;
    }
    
    // Return success
    return NextResponse.json({ 
      message: 'Session updated',
      success: true 
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { message: 'Something went wrong' },
      { status: 500 }
    );
  }
} 