import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
const AUTH_TOKEN_KEY = 'authToken';
const USER_DATA_KEY = 'userData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Call backend API
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || 'Login failed' },
        { status: response.status || 401 }
      );
    }

    // Extract token and user data
    const { tokens, user } = data.data;
    const token = tokens.accessToken;

    // Set cookies using Next.js cookies API
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    cookieStore.set(AUTH_TOKEN_KEY, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    cookieStore.set(USER_DATA_KEY, JSON.stringify(user), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Get redirect URL from query params or default to dashboard
    const searchParams = request.nextUrl.searchParams;
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    // Use NextResponse.redirect() for server-side redirect
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error: any) {
    console.error('Login route error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'An error occurred during login' },
      { status: 500 }
    );
  }
}
