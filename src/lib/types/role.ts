import { Permission } from "../types/permission";

export interface Role {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  permissions?: Permission[];
  userCount?: number;
}
export interface CreateRoleData {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateRoleData {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}