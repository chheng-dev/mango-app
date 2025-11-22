import { NextRequest, NextResponse } from "next/server";
import { userController } from "@/lib/controllers/UserController";

export const GET = async (request: NextRequest) => {
  try {
    // Check for custom auth token (not NextAuth)
    const authCookie = request.cookies.get('auth-token');
    const token = authCookie ? authCookie.value : null;

    if (!token) {
      console.error("Profile API: No auth-token cookie found");
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify custom JWT token
    const { jwtService } = await import('@/lib/auth/jwt');
    const decoded = jwtService.verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      console.error("Profile API: Invalid token");
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    // Get user data
    const userResult = await userController.getCurrentUser(userId);
    if (!userResult.success || !userResult.data) {
      console.error("Profile API: User not found");
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const user = userResult.data;

    // Get user roles, permissions, and super admin status
    const [roles, permissions, isSuperAdmin] = await Promise.all([
      userController.getUserRoles(userId),
      userController.getUserPermissionsGrouped(userId),
      userController.isSuperAdmin(userId)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        roles,
        permissions,
        isSuperAdmin
      }
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
