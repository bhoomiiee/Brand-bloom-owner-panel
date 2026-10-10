export class ApiResponse {
  static success<T>(data: T, meta?: Record<string, any>) {
    return {
      success: true,
      data,
      meta
    };
  }

  static created<T>(data: T) {
    return {
      success: true,
      data
    };
  }
}
