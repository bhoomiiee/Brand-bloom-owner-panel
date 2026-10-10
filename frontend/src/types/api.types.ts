export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
}
