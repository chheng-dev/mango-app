import { NextResponse } from "next/server";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export class ApiResponseBuilder {
  static success<T>(data?: T, message?: string, status= 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }, { status });
  }

  static error(error: string, message?: string, status= 400): NextResponse<ApiResponse> {
    return NextResponse.json({
      success: false,
      error,
      message,
      timestamp: new Date().toISOString()
    }, { status });
  }

  static unauthorized(error = 'Unauthorized'): NextResponse<ApiResponse> {
    return this.error(error, undefined, 401);
  }

  static forbidden(error = 'Forbidden'): NextResponse<ApiResponse> {
    return this.error(error, undefined, 403);
  }

  static notFound(error = 'Not Found'): NextResponse<ApiResponse> {
    return this.error(error, undefined, 404);
  }

  static serverError(error = 'Internal Server Error'): NextResponse<ApiResponse> {
    return this.error(error, undefined, 500);
  }

  static validationError(error: string): NextResponse<ApiResponse> {
    return this.error(`Validation failed: ${error}`, undefined, 422);
  }
}