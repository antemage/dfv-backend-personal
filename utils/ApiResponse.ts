export interface ApiResponse {
  message: string;
  data: any;
}

export function createApiResponse(message: string, data: any): ApiResponse {
  return {
    message,
    data,
  };
}
