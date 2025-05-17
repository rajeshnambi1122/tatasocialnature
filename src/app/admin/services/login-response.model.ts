export interface LoginResponse {
  token?: string;
  success?: boolean;
  message?: string;
  role?: string;
  status?: string;
  jwttoken?: string;
  // Add any other properties that the API returns
} 