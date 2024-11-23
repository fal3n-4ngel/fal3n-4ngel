declare global {
    interface ApiResponse<T> {
      status: string;
      data: T;
    }
  
    type ID = string | number;
  }
  export {};
  