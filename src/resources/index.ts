import * as fs from 'node:fs';
import * as path from 'node:path';
import { type McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { APP_PATHS } from '../config/constants.js';

const DOCS_DIR = APP_PATHS.DOCS_DIR;

export function registerResources(server: McpServer) {
  // Expose docs/RULES.md as gabo://rules
  server.resource('rules', 'gabo://rules', async (uri) => {
    const rulesPath = path.join(DOCS_DIR, 'RULES.md');
    try {
      const content = await fs.promises.readFile(rulesPath, 'utf-8');
      return {
        contents: [
          {
            uri: uri.href,
            text: content,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to read rules: ${error}`);
    }
  });

  // Expose any doc file dynamically: gabo://docs/{filename}
  server.resource(
    'docs',
    new ResourceTemplate('gabo://docs/{filename}', { list: undefined }),
    async (uri, { filename }) => {
      // Sanitize filename to prevent directory traversal
      const safeFilename = path.basename(filename as string);
      const filePath = path.join(DOCS_DIR, safeFilename);

      try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        return {
          contents: [
            {
              uri: uri.href,
              text: content,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to read doc ${safeFilename}: ${error}`);
      }
    }
  );
}
