/**
 * MCP Server Implementation with stdio transport
 * Run locally: npm run dev:local
 * Connect via MCP Inspector for web UI: npx @modelcontextprotocol/inspector tsx src/index.ts
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as fs from 'fs';
import type { Logger } from './index.type.ts';

// Detect if running under MCP Inspector
const isInspector = process.env.MCP_INSPECTOR === 'true' || process.argv.some(arg => arg.includes('inspector'));

// Minimal logging to stderr (stdout is reserved for MCP protocol)
const log: Logger = {
  info: (msg: string) => {
    const timestamp = new Date().toISOString();
    process.stderr.write(`[${timestamp}] ℹ️  ${msg}\n`);
  },
  warn: (msg: string) => {
    const timestamp = new Date().toISOString();
    process.stderr.write(`[${timestamp}] ⚠️  ${msg}\n`);
  },
  error: (msg: string, error?: unknown) => {
    const timestamp = new Date().toISOString();
    const errorMsg = error instanceof Error ? error.message : String(error);
    process.stderr.write(`[${timestamp}] ❌ ${msg} - ${errorMsg}\n`);
  },
};

// In-memory storage for demo
type StoredEntry = {
  id: string;
  type: string;
  title: string;
  content: string;
  tags: string[];
  source?: string;
  created_at: string;
};

const storage = new Map<string, StoredEntry>();

// Simple UUID generator
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Seed with sample data
function seedData() {
  const samples: StoredEntry[] = [
    {
      id: generateId(),
      type: 'REACT_PATTERN',
      title: 'useCallback with proper dependencies',
      content: 'Always include all values that change over time as dependencies. This prevents stale closures and bugs.',
      tags: ['react', 'hooks', 'performance'],
      source: 'testing',
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'ERROR_CORRECTION',
      title: 'TypeError: Cannot read property of undefined',
      content: 'Always validate data before accessing nested properties. Use optional chaining (?.) to safely access properties.',
      tags: ['javascript', 'debugging'],
      source: 'testing',
      created_at: new Date().toISOString(),
    },
    {
      id: generateId(),
      type: 'ARCH_DECISION',
      title: 'Start with monolith',
      content: 'For MVP: Start with monolith. Easier to deploy, debug, and maintain. Split to microservices only when necessary.',
      tags: ['architecture'],
      source: 'testing',
      created_at: new Date().toISOString(),
    },
  ];

  samples.forEach(entry => {
    storage.set(entry.id, entry);
  });
  
  log.info(`✅ Seeded ${samples.length} sample entries`);
}

// Initialize MCP Server
const server = new Server(
  {
    name: 'gabo-mcp-local',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const TOOLS: Tool[] = [
  {
    name: 'store_knowledge',
    description: 'Store a new knowledge entry',
    inputSchema: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [
            'UI_REASONING',
            'ARCH_DECISION',
            'PROMPT',
            'ERROR_CORRECTION',
            'CODE_SNIPPET',
            'DESIGN_DECISION',
            'TECHNICAL_INSIGHT',
            'REACT_PATTERN',
          ],
        },
        title: {
          type: 'string',
          description: 'Title of the knowledge entry',
        },
        content: {
          type: 'string',
          description: 'Full content/explanation',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
        source: {
          type: 'string',
        },
      },
      required: ['type', 'title', 'content'],
    } as Record<string, unknown> & { type: 'object' },
  },
  {
    name: 'search_knowledge',
    description: 'Search knowledge entries',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
        },
        type: {
          type: 'string',
        },
      },
      required: ['query'],
    } as Record<string, unknown> & { type: 'object' },
  },
  {
    name: 'list_knowledge',
    description: 'List all knowledge entries',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          default: 10,
        },
      },
    } as Record<string, unknown> & { type: 'object' },
  },
  {
    name: 'get_knowledge',
    description: 'Get a specific knowledge entry',
    inputSchema: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
      required: ['id'],
    } as Record<string, unknown> & { type: 'object' },
  },
];

// Handle ListTools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log.info('📋 ListTools called');
  return { tools: TOOLS };
});

// Handle CallTool
type CallToolRequest = {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
};

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
  const { params } = request;
  const { name, arguments: args = {} } = params;
  
  log.info(`🔧 Tool called: ${name}`);
  log.info(`📋 Arguments: ${JSON.stringify(args)}`);

  try {
    switch (name) {
      case 'store_knowledge': {
        const type = String(args.type);
        const title = String(args.title);
        const content = String(args.content);
        const tags = Array.isArray(args.tags) ? args.tags : [];
        const source = args.source ? String(args.source) : undefined;
        
        // Validate input
        if (!title || !content) {
          throw new Error('title and content are required');
        }

        const id = generateId();
        const entry: StoredEntry = {
          id,
          type,
          title,
          content,
          tags,
          source: source || 'mcp-local',
          created_at: new Date().toISOString(),
        };

        storage.set(id, entry);
        
        log.info(`✅ Knowledge stored with ID: ${id}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  id,
                  message: 'Knowledge stored successfully',
                  entry,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'search_knowledge': {
        const query = String(args.query);
        const type = args.type ? String(args.type) : undefined;

        if (!query) {
          throw new Error('query is required');
        }

        const results = Array.from(storage.values())
          .filter(entry => {
            const matchesQuery =
              entry.title.toLowerCase().includes(query.toLowerCase()) ||
              entry.content.toLowerCase().includes(query.toLowerCase());
            const matchesType = !type || entry.type === type;
            return matchesQuery && matchesType;
          })
          .slice(0, 10);

        log.info(`🔍 Search for "${query}": found ${results.length} results`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  query,
                  results,
                  count: results.length,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'list_knowledge': {
        const limit = typeof args.limit === 'number' ? args.limit : 10;

        const entries = Array.from(storage.values())
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit);

        log.info(`📚 Listing ${entries.length} entries`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  entries,
                  total: storage.size,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_knowledge': {
        const id = String(args.id);

        if (!id) {
          throw new Error('id is required');
        }

        const entry = storage.get(id);

        if (!entry) {
          log.warn(`Entry not found: ${id}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: false,
                    error: 'Entry not found',
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        log.info(`✅ Retrieved entry: ${id}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  entry,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log.error(`Tool error: ${name}`, error);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: errorMsg,
            },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  // Crear archivo de log para tracing de MCP (ruta absoluta fija)
  const logPath = '/tmp/gabo-mcp-traffic.log';
  const logFile = fs.createWriteStream(logPath, { flags: 'w' });
  
  log.info(`📝 MCP Traffic Logs: ${logPath}`);
  
  const trace = (direction: string, data: string) => {
    const timestamp = new Date().toISOString();
    logFile.write(`[${timestamp}] ${direction}:\n${data}\n${'─'.repeat(70)}\n`);
  };

  // Interceptar la salida (Lo que tu server envía al IDE)
  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = function(chunk: string | Uint8Array, encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void), maybeCallback?: (error?: Error | null) => void): boolean {
    try {
      trace('📤 OUT (Server -> Client)', typeof chunk === 'string' ? chunk : chunk.toString());
    } catch (e) {
      // ignorar errores en logging
    }
    
    if (typeof encodingOrCallback === 'function') {
      return originalStdoutWrite(chunk, encodingOrCallback);
    }
    
    if (typeof maybeCallback === 'function') {
      return originalStdoutWrite(chunk, encodingOrCallback as BufferEncoding | undefined, maybeCallback);
    }
    
    return originalStdoutWrite(chunk, encodingOrCallback as BufferEncoding | undefined);
  };

  // Interceptar la entrada (Lo que el IDE le pide a tu server)
  process.stdin.on('data', (chunk) => {
    try {
      trace('📥 IN (Client -> Server)', chunk.toString());
    } catch (e) {
      // ignorar errores en logging
    }
  });

  log.info('');
  log.info('═'.repeat(60));
  log.info('🚀 Knowledge MCP Server (Local)');
  log.info('═'.repeat(60));
  log.info('');
  log.info('Server Configuration:');
  log.info('  • Name: gabo-mcp-local');
  log.info('  • Version: 0.1.0');
  log.info('  • Transport: stdio (no HTTP port)');
  log.info('  • Mode: In-memory (no external dependencies)');
  log.info('');
  log.info('Available Tools:');
  TOOLS.forEach((tool, i) => {
    log.info(`  ${i + 1}. ${tool.name} - ${tool.description}`);
  });
  log.info('');
  log.info('📝 MCP Traffic Logs: mcp_traffic.log');
  log.info('');

  try {
    // Seed sample data
    seedData();
    log.info('');

    // Create transport
    const transport = new StdioServerTransport();
    log.info('🔗 Connecting via stdio...');
    
    // Conectar el servidor
    await server.connect(transport);
    
    log.info('✅ Server connected and ready!');
    log.info('');
    
    if (isInspector) {
      log.info('🌐 MCP Inspector Interface:');
      log.info('  ► Web UI Port: 5173');
      log.info('  ► URL: http://localhost:5173');
      log.info('  ► Server Transport: stdio (embedded)');
      log.info('');
    }
    
    log.info('📖 How to Use:');
    log.info('');
    log.info('  Option 1: Web UI (Recommended)');
    log.info('    $ npm run dev:inspector');
    log.info('    → Open http://localhost:5173');
    log.info('');
    log.info('  Option 2: VS Code MCP Debugger');
    log.info('    • Install extension: "MCP Debugger"');
    log.info('    • Config: ~/.mcp/servers.json');
    log.info('    • Server runs on: stdio');
    log.info('');
    log.info('  Option 3: Continue.dev');
    log.info('    • Config: ~/.continue/config.yml');
    log.info('    • Server runs on: stdio');
    log.info('');
    log.info('═'.repeat(60));
    log.info('Waiting for MCP protocol messages...');
    log.info('═'.repeat(60));
    log.info('');
  } catch (error) {
    log.error('Failed to start server', error);
    process.exit(1);
  }
}

main().catch(error => {
  log.error('Unexpected error', error);
  process.exit(1);
});
