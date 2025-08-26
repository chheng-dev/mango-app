import { NextRequest, NextResponse } from 'next/server';
import { userQueries } from '@/lib/db/queries';

export async function GET() {
  try {
    const users = await userQueries.getAll();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields for new schema
    if (!data.email || !data.name || !data.code || !data.passwordHash || !data.passwordConfirmation) {
      return NextResponse.json(
        { error: 'Email, name, code, passwordHash, and passwordConfirmation are required' },
        { status: 400 }
      );
    }

    // Check if email or code already exists
    const existingUserByEmail = await userQueries.getByEmail(data.email);
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    const existingUserByCode = await userQueries.getByCode(data.code);
    if (existingUserByCode) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }

    const user = await userQueries.create(data);
    
    // Don't return password fields in response
    const { passwordHash, passwordConfirmation, ...userResponse } = user;
    
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
