import { FastMCP } from "fastmcp";
import { z } from "zod";

const server = new FastMCP({
  name: "Glama MCP Server Search",
  version: "1.0.0",
});

// Base URL for Glama MCP API
const GLAMA_API_BASE = "https://glama.ai/api/mcp";

// Helper function to make API requests
async function makeGlamaRequest(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${GLAMA_API_BASE}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.append(key, value);
      }
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

server.addTool({
  annotations: {
    openWorldHint: true, // This tool interacts with external API
    readOnlyHint: true, // This tool only reads data
    title: "Search MCP Servers",
  },
  description: "Search for MCP servers in the Glama directory using free text queries",
  execute: async (args) => {
    try {
      const params: Record<string, string> = {};

      if (args.query) {
        params.query = args.query;
      }
      if (args.first) {
        params.first = args.first.toString();
      }
      if (args.after) {
        params.after = args.after;
      }

      const result = await makeGlamaRequest("/v1/servers", params);

      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error searching MCP servers: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  name: "search_mcp_servers",
  parameters: z.object({
    query: z.string().optional().describe("Free text search query (e.g., 'hacker news', 'database', 'weather')"),
    first: z.number().min(1).max(100).default(10).optional().describe("Number of results to return (1-100, default: 10)"),
    after: z.string().optional().describe("Cursor for pagination to get results after this point"),
  }),
});

server.addTool({
  annotations: {
    openWorldHint: true,
    readOnlyHint: true,
    title: "Get MCP Server Details",
  },
  description: "Get detailed information about a specific MCP server by namespace and slug",
  execute: async (args) => {
    try {
      const result = await makeGlamaRequest(`/v1/servers/${args.namespace}/${args.slug}`);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error getting MCP server details: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  name: "get_mcp_server_details",
  parameters: z.object({
    namespace: z.string().describe("The namespace/organization of the MCP server (e.g., 'microsoft', 'openai')"),
    slug: z.string().describe("The slug/name of the MCP server (e.g., 'playwright-mcp', 'gpt-mcp')"),
  }),
});

server.addTool({
  annotations: {
    openWorldHint: true,
    readOnlyHint: true,
    title: "Get MCP Server Attributes",
  },
  description: "Get available attributes that can be used to filter MCP servers",
  execute: async () => {
    try {
      const result = await makeGlamaRequest("/v1/attributes");
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error getting MCP server attributes: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  name: "get_mcp_server_attributes",
  parameters: z.object({}),
});

server.addResource({
  async load() {
    return {
      text: `# Glama MCP Server Search

This MCP server provides tools to search and explore MCP servers from the Glama directory.

## Available Tools:

1. **search_mcp_servers** - Search for MCP servers using free text queries
2. **get_mcp_server_details** - Get detailed information about a specific server
3. **get_mcp_server_attributes** - Get available filtering attributes

## API Base URL: ${GLAMA_API_BASE}

## Usage Examples:

- Search for database servers: query="database"
- Search for weather services: query="weather"
- Get server details: namespace="microsoft", slug="playwright-mcp"
`,
    };
  },
  mimeType: "text/markdown",
  name: "Glama MCP Server Search Documentation",
  uri: "glama://docs/readme.md",
});

server.start({
  transportType: "stdio",
});
