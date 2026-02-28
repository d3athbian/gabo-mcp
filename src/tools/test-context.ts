/**
 * Tool Context - Global context for dependency injection in tests
 */

import { defaultToolContext } from '../tools/default-context.js';
import type { ToolContext } from '../tools/index.type.js';

let testContext: Partial<ToolContext> | null = null;

export function setTestContext(context: Partial<ToolContext> | null): void {
  testContext = context;
}

export function getToolContext(): Partial<ToolContext> {
  return testContext ?? defaultToolContext;
}
