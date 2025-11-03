import { BaseApiService } from "./baseApiService";

class ContactPersonApiService extends BaseApiService {
  constructor() {
    super('/api/contact-persons');
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

  createContactPerson(data: any): Promise<any> {
    return this.post<any>('/', data);
  }

  updateContactPerson(ccode: string, data: any): Promise<any> {
    return this.put<any>(`/${ccode}`, data);
  }

  deleteContactPerson(ccode: string): Promise<any> {
    return this.delete<any>(`/${ccode}`);
  }
}

export const contactPersonApiService = new ContactPersonApiService(); 
export default contactPersonApiService;