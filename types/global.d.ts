export interface ApiResponse<T> {
  status: string;
  data: T;
}

export type ID = string | number;

declare global {
}
