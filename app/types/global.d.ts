export interface ApiResponse<T> {
  status: string;
  data: T;
}

export type ID = string | number;

declare global {
  // You can add global type augmentations here if needed
}
