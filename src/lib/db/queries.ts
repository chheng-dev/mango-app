import { db } from './index';
import { 
  users, 
  type User, 
  type NewUser,
} from './schema';
import { eq, desc, and } from 'drizzle-orm';

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

  async getAll(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  },

  async update(id: number, data: Partial<NewUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  },
};
