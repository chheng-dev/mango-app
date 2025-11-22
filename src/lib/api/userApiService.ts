import { User, CreateUserData, UpdateUserData, UserFilters, ApiResponse } from '../types/user';
import { BaseApiService } from './baseApiService';
export class UserApiService extends BaseApiService {
  constructor() {
    super('/api/users');
  }

  async getUsers(filters?: UserFilters): Promise<ApiResponse<User[]>> {
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value.toString());
          }
        });
      }

      return await this.get<User[]>('/', params);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error; // Let the caller handle the error
    }
  }

  createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    return this.post<User>('/', data);
  }

  updateUser(id: number, updates: UpdateUserData): Promise<ApiResponse<User>> {
    return this.put<User>(`/${id}`, updates);
  }

  deleteUser(id: number): Promise<ApiResponse<boolean>> {
    return this.delete<boolean>(`/${id}`);
  }

  updateUserStatus(id: number, isActive: boolean): Promise<ApiResponse<User>> {
    return this.updateUser(id, { isActive });
  }

  getUserById(id: number): Promise<ApiResponse<User>> {
    return this.get<User>(`/${id}`);
  }
}

export const userApiService = new UserApiService();
export default userApiService;