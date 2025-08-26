import { db } from '../index';
import { users, type User, type NewUser } from '../schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export const userQueries = {
  // Create a new user
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  // Get user by ID with profile
  async getById(id: number) {
    const result = await db
      .select({
        user: users,
      })
      .from(users)
      .where(eq(users.id, id));
    
    return result[0] || null;
  },

  // Get user by email
  async getByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  // Get all users with profiles
  async getAll() {
    return await db
      .select({
        user: users,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  },

  // Update user
  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  // Delete user (soft delete by setting isActive to false)
  async delete(id: number): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  },

  // Hard delete user
  async hardDelete(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  },

  async updateLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        lastLoginAt: new Date(),
        updatedAt: new Date(),
        version: sql`${users.version} + 1`
      })
      .where(eq(users.id, id));
  },
};
