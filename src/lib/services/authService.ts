import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";
import { userController } from "../controllers/UserController";

export async function authenticateUser(email: string, password: string) {
  try {
    console.log('🔍 AuthService - Starting authentication for:', email);
    
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email));

    console.log('🔍 AuthService - User found:', user ? { id: user.id, email: user.email, isActive: user.isActive } : 'null');

    if (!user) {
      console.log('❌ AuthService - User not found');
      return null;
    }
    
    if (!user.isActive) {
      console.log('❌ AuthService - User is not active');
      return null;
    }

    console.log('🔍 AuthService - Checking password...');
    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log('🔍 AuthService - Password valid:', valid);
    
    if (!valid) {
      console.log('❌ AuthService - Invalid password');
      return null;
    }

    const result = {
      id: user.id,
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    };
    
    console.log('✅ AuthService - Authentication successful:', result);
    return result;
  } catch (error) {
    console.error('💥 AuthService - Authentication error:', error);
    return null;
  }
}

export async function buildUserClaims(userId: number) {
  const permissions = await userController.getUserPermissions(userId);
  return { permissions };
}