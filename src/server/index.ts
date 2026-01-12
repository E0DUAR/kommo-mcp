
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerKommoTools } from './tools.js';

/**
 * Create and configure the Kommo MCP server.
 */
export function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'kommo-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register all Kommo tools
  registerKommoTools(server);

  return server;
}

/**
 * Start the MCP server (entry point for bin/mcp-server.ts).
 */
export async function startMCPServer(): Promise<void> {
  const server = createMCPServer();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log to stderr (stdout is used for MCP protocol)
  console.error('Kommo MCP server running on stdio');
}