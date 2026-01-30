/**
 * Main MCP Server entry point
 * Placeholder for Phase 3 implementation
 */

import { config } from './config.ts';
import { testConnection } from './db/client.ts';

const version = '0.1.0';

async function main(): Promise<void> {
  console.log(`Starting Knowledge MCP Server v${version}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Log Level: ${config.logLevel}`);
  
  try {
    // Test database connection
    console.log('Testing database connection...');
    const connected = await testConnection();
    
    if (!connected && config.nodeEnv === 'production') {
      throw new Error('Failed to connect to database');
    }
    
    if (connected) {
      console.log('✓ Database connection successful');
    } else {
      console.warn('⚠ Database connection failed - running in offline mode');
    }
    
    // Initialize MCP server
    console.log(`Starting MCP server on port ${config.mcp.port}...`);
    console.log(`Embeddings provider: ${config.embeddings.provider} (${config.embeddings.model})`);
    
    // TODO: Initialize MCP server with handlers in Phase 3
    // For now, just show that the server would start here
    
    console.log('✓ Knowledge MCP Server is ready');
    console.log('→ Waiting for MCP protocol connections...');
    
    // Keep server running
    await new Promise(() => {
      // Server will run until process is terminated
    });
  } catch (error) {
    console.error('Fatal error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
