export interface User {
  id: number;
  name: string;
  email: string;
  code: string;
  passwordHash?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export type NewUserInsert = {
  name: string;
  email: string;
  code: string;
  passwordHash: string;
  isActive?: boolean;
  isVerified?: boolean;
};
