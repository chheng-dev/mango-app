import { ApiResponse } from "@/types/api";

export class BaseApiService {
  protected baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    console.log(`BaseApiService: ${options.method || 'GET'} ${url}`);

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log(`BaseApiService: Response status: ${response.status}`);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        // For non-JSON responses, return a basic success structure
        return {
          success: true,
          data: null as any,
          message: 'Request completed successfully'
        };
      }

      const result: ApiResponse<T> = await response.json();
      console.log('BaseApiService: Response data:', result);

      if (!response.ok) {
        // Handle HTTP errors with JSON response
        const errorMessage = result.error || result.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
      }

      // Handle application-level errors (success: false)
      if (result.success === false) {
        throw new Error(result.error || result.message || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error('BaseApiService: Request failed:', error);

      // Re-throw with more context if it's a network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server');
      }

      throw error;
    }
  }

  protected async get<T>(
    endpoint: string,
    params?: URLSearchParams,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = params?.toString()
      ? `${endpoint}?${params.toString()}`
      : endpoint;

    return this.request<T>(url, { ...options, method: 'GET' });
  }

  protected async post<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async put<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async patch<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<T>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}