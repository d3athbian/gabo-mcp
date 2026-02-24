import { AppError } from './Error.js';

export function parseError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN', 500, error.stack);
  }

  return new AppError(String(error), 'UNKNOWN');
}
