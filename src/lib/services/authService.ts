import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import bcrypt from "bcryptjs";
import { userController } from "../controllers/UserController";

export async function authenticateUser(email: string, password: string) {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.email, email));

  if (!user) return null;
  if (!user.isActive) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isVerified: user.isVerified,
  }
}

export async function buildUserClaims(userId: number) {
  const permissions = await userController.getUserPermissions(userId);
  return { permissions };
}