// Shared TypeScript types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';