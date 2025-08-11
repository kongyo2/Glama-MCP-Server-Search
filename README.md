# Glama MCP Server Search
[![smithery badge](https://smithery.ai/badge/@kongyo2/glama-mcp-server-search)](https://smithery.ai/server/@kongyo2/glama-mcp-server-search)

<a href="https://glama.ai/mcp/servers/@kongyo2/Glama-MCP-Server-Search">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@kongyo2/Glama-MCP-Server-Search/badge" />
</a>

An MCP server for searching and exploring MCP servers from the [Glama MCP directory](https://glama.ai/mcp/servers).

This server provides tools to search for MCP servers, get detailed information about specific servers, and explore available server attributes using the Glama MCP API.

## Features

- **Search MCP Servers**: Search the Glama directory using free text queries
- **Get Server Details**: Retrieve detailed information about specific MCP servers
- **Browse Attributes**: Explore available filtering attributes for MCP servers
- **Pagination Support**: Handle large result sets with cursor-based pagination

## Available Tools

### 1. search_mcp_servers

Search for MCP servers in the Glama directory using free text queries.

**Parameters:**

- `query` (optional): Free text search query (e.g., "database", "weather", "hacker news")
- `first` (optional): Number of results to return (1-100, default: 10)
- `after` (optional): Cursor for pagination

**Example:**

```json
{
  "query": "database",
  "first": 5
}
```

### 2. get_mcp_server_details

Get detailed information about a specific MCP server.

**Parameters:**

- `namespace`: The namespace/organization (e.g., "microsoft", "openai")
- `slug`: The server slug/name (e.g., "playwright-mcp")

**Example:**

```json
{
  "namespace": "microsoft",
  "slug": "playwright-mcp"
}
```

### 3. get_mcp_server_attributes

Get available attributes that can be used to filter MCP servers.

**Parameters:** None

## Usage Examples

### Start the server

```bash
npm run start
```

### Development mode with CLI interaction

```bash
npm run dev
```

### Testing

```bash
npm run test
```

### Linting

Having a good linting setup reduces the friction for other developers to contribute to your project.

```bash
npm run lint
```

This boilerplate uses [Prettier](https://prettier.io/), [ESLint](https://eslint.org/) and [TypeScript ESLint](https://typescript-eslint.io/) to lint the code.

### Formatting

Use `npm run format` to format the code.

```bash
npm run format
```

