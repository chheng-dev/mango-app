import { db } from './index';
import { 
  users, 
  type User, 
  type NewUser,
} from './schema';
import { eq, desc, and, or, like } from 'drizzle-orm';

export const userQueries = {
  // Create a new user
  async create(data: NewUser): Promise<User> {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  },

  // Get user by ID
  async getById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  // Get user by email
  async getByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  // Get user by code
  async getByCode(code: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.code, code));
    return user;
  },

  // Get user by email or code
  async getByEmailOrCode(identifier: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.code, identifier)));
    return user;
  },

  // Get all active users
  async getAll(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(desc(users.createdAt));
  },

  // Get all users (including inactive)
  async getAllIncludingInactive(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
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

  // Verify user email
  async verifyEmail(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        isVerified: true, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  // Update password
  async updatePassword(id: number, passwordHash: string, passwordConfirmation: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        passwordHash, 
        passwordConfirmation,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  },

  // Soft delete user
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

  // Search users by name or email
  async search(query: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.isActive, true),
          or(
            like(users.name, `%${query}%`),
            like(users.email, `%${query}%`),
            like(users.code, `%${query}%`)
          )
        )
      )
      .orderBy(desc(users.createdAt));
  },
};
