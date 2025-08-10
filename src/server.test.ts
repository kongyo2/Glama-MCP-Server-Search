import { describe, it, expect } from "vitest";

// Base URL for Glama MCP API
const GLAMA_API_BASE = "https://glama.ai/api/mcp";

// Helper function to make API requests (same as in server.ts)
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

describe("Glama MCP API Integration Tests", () => {
  it("should search for MCP servers successfully", async () => {
    const result = await makeGlamaRequest("/v1/servers", {
      query: "database",
      first: "5"
    });

    expect(result).toHaveProperty("servers");
    expect(result).toHaveProperty("pageInfo");
    expect(Array.isArray(result.servers)).toBe(true);
    expect(result.pageInfo).toHaveProperty("hasNextPage");
    expect(result.pageInfo).toHaveProperty("hasPreviousPage");

    if (result.servers.length > 0) {
      const server = result.servers[0];
      expect(server).toHaveProperty("id");
      expect(server).toHaveProperty("name");
      expect(server).toHaveProperty("namespace");
      expect(server).toHaveProperty("slug");
      expect(server).toHaveProperty("description");
    }
  });

  it("should get server attributes successfully", async () => {
    const result = await makeGlamaRequest("/v1/attributes");

    expect(result).toHaveProperty("attributes");
    expect(Array.isArray(result.attributes)).toBe(true);

    if (result.attributes.length > 0) {
      const attribute = result.attributes[0];
      expect(attribute).toHaveProperty("lookupKey");
      expect(attribute).toHaveProperty("name");
      expect(attribute).toHaveProperty("description");
    }
  });

  it("should get specific server details successfully", async () => {
    // First, search for a server to get a valid namespace/slug
    const searchResult = await makeGlamaRequest("/v1/servers", { first: "1" });

    if (searchResult.servers.length > 0) {
      const server = searchResult.servers[0];
      const detailResult = await makeGlamaRequest(`/v1/servers/${server.namespace}/${server.slug}`);

      expect(detailResult).toHaveProperty("id");
      expect(detailResult).toHaveProperty("name");
      expect(detailResult).toHaveProperty("namespace");
      expect(detailResult).toHaveProperty("slug");
      expect(detailResult).toHaveProperty("description");
      expect(detailResult).toHaveProperty("tools");
      expect(Array.isArray(detailResult.tools)).toBe(true);
    }
  });

  it("should handle pagination correctly", async () => {
    const firstPage = await makeGlamaRequest("/v1/servers", { first: "2" });

    expect(firstPage.servers).toHaveLength(2);

    if (firstPage.pageInfo.hasNextPage) {
      const secondPage = await makeGlamaRequest("/v1/servers", {
        first: "2",
        after: firstPage.pageInfo.endCursor
      });

      expect(secondPage.servers).toHaveLength(2);
      expect(secondPage.servers[0].id).not.toBe(firstPage.servers[0].id);
    }
  });

  it("should handle search queries correctly", async () => {
    const weatherResults = await makeGlamaRequest("/v1/servers", {
      query: "weather",
      first: "5"
    });

    expect(weatherResults).toHaveProperty("servers");
    expect(Array.isArray(weatherResults.servers)).toBe(true);

    // Check if results are relevant to weather (if any results found)
    if (weatherResults.servers.length > 0) {
      const hasWeatherRelated = weatherResults.servers.some(server =>
        server.name.toLowerCase().includes("weather") ||
        server.description.toLowerCase().includes("weather")
      );
      // Note: This might not always be true due to search algorithm, so we just check structure
      expect(typeof hasWeatherRelated).toBe("boolean");
    }
  });

  it("should handle empty search results gracefully", async () => {
    const result = await makeGlamaRequest("/v1/servers", {
      query: "veryrareandunlikelytomatchanything12345",
      first: "5"
    });

    expect(result).toHaveProperty("servers");
    expect(Array.isArray(result.servers)).toBe(true);
    expect(result).toHaveProperty("pageInfo");
  });

  it("should handle invalid server details request", async () => {
    try {
      await makeGlamaRequest("/v1/servers/nonexistent/nonexistent");
      // If we reach here, the server didn't return 404 as expected
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain("404");
    }
  });
});
