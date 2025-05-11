export type ServiceResponse<T> = Promise<{
  data?: T;
  status: 'success' | 'error';
  message: string;
}>;
