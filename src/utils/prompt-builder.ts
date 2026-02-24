/**
 * Prompt Building Utility
 * Handles template loading, variable injection, and caching.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { APP_PATHS } from '../config/constants.js';
import { AppError } from './errors/Error.js';
import { logger } from './logger/index.js';

// Cache loaded templates to avoid disk I/O on every request
const templateCache = new Map<string, string>();

// Try to resolve templates relative to src (dev) or dist (prod)
const TEMPLATE_DIR_SRC = APP_PATHS.TEMPLATES_SRC;
const TEMPLATE_DIR_DIST = APP_PATHS.TEMPLATES_DIST;

export class PromptBuilder {
  private templateName: string;
  private variables: Record<string, string> = {};
  private sections: string[] = [];

  constructor(templateName: string) {
    this.templateName = templateName;
  }

  /**
   * Set a variable to be replaced in the template.
   * Use {{VAR_NAME}} in the markdown file.
   */
  setVariable(key: string, value: string | undefined | null): this {
    this.variables[key] = value || '';
    return this;
  }

  /**
   * Set multiple variables at once.
   */
  setVariables(vars: Record<string, string | undefined | null>): this {
    for (const [key, value] of Object.entries(vars)) {
      this.setVariable(key, value);
    }
    return this;
  }

  /**
   * Append a raw section of text to the prompt.
   * Useful for dynamic content not in the template.
   */
  addSection(content: string): this {
    if (content) {
      this.sections.push(content);
    }
    return this;
  }

  /**
   * Build the final prompt string.
   */
  async build(): Promise<string> {
    let templateContent = await this.loadTemplate(this.templateName);

    // 1. Replace variables
    for (const [key, value] of Object.entries(this.variables)) {
      const placeholder = `{{${key}}}`;
      // Global replace for all occurrences
      templateContent = templateContent.split(placeholder).join(value);
    }

    // 2. Append extra sections
    if (this.sections.length > 0) {
      templateContent += `\n\n${this.sections.join('\n\n')}`;
    }

    return templateContent.trim();
  }

  /**
   * Load template from disk or cache.
   */
  private async loadTemplate(filename: string): Promise<string> {
    if (templateCache.has(filename)) {
      return templateCache.get(filename)!;
    }

    // Try multiple locations to handle dev vs prod vs tests
    const pathsToTry = [
      path.join(TEMPLATE_DIR_SRC, filename),
      path.join(TEMPLATE_DIR_DIST, filename),
      path.join(process.cwd(), 'src/prompts/templates', filename),
      path.join(process.cwd(), 'dist/prompts/templates', filename),
    ];

    for (const templatePath of pathsToTry) {
      try {
        if (fs.existsSync(templatePath)) {
          const content = await fs.promises.readFile(templatePath, 'utf-8');
          templateCache.set(filename, content);
          return content;
        }
      } catch (_e) {
        // Ignore error and try next path
      }
    }

    const errorMsg = `Failed to load prompt template: ${filename}. Checked paths: ${pathsToTry.join(', ')}`;
    logger.error(errorMsg);
    throw new AppError(errorMsg, 'TEMPLATE_NOT_FOUND', 500, {
      filename,
      pathsChecked: pathsToTry,
    });
  }
}
