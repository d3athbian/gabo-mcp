import { errorResponse } from '../tool-handler/index.js';
import type { ToolResponse } from '../tool-handler/tool-handler.type.js';
import { parseError } from './parseError.js';

export function formatErrorResponse(error: unknown): ToolResponse {
  const appError = parseError(error);
  return errorResponse(appError.message, appError.code);
}
