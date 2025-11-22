import { AuthController } from "@/lib/controllers/auth-controller";
import { setRegularUserCookies } from "@/lib/auth/cookie-helpers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    console.log('Login attempt for:', email);

    const loginResult = await AuthController.login(email, password);
    
    if (!loginResult) {
      console.log('Login failed for:', email);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }


    const response = NextResponse.json({
      success: true,
      message: loginResult.message,
      user: loginResult.user,
      token: loginResult.accessToken // For backward compatibility
    });

    setRegularUserCookies(
      response,
      loginResult.accessToken,
      loginResult.refreshToken,
    );

    console.log('Login API: Response cookies to be set:', response.cookies.getAll());
    
    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 },
    );
  }
}