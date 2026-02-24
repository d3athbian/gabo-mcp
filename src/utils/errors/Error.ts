export class AppError {
  constructor(
    public message: string,
    public code: string,
    public status: number = 500,
    public details?: unknown
  ) {}
}
