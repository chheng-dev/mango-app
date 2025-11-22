import { BaseApiService } from "./baseApiService";

class CustomerApiService extends BaseApiService {
  constructor() {
    super('/api/customers');
  }

  getAll(filters?: Record<string, string | number | boolean>): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return this.get<any[]>('/', params);
  }

  getByCode(ccode: string): Promise<any> {
    return this.get<any>(`/${ccode}`);
  }

  createCustomer(data: any): Promise<any> {
    return this.post<any>('/', data);
  }

  updateCustomer(ccode: string, data: any): Promise<any> {
    return this.put<any>(`/${ccode}`, data);
  }

  deleteCustomer(ccode: string): Promise<any> {
    return this.delete<any>(`/${ccode}`);
  } 
}
  
export const customerApiService = new CustomerApiService(); 
export default customerApiService;