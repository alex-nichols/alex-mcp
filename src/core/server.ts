import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ToolRegistry } from "./registry.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { Implementation } from "@modelcontextprotocol/sdk/types.js";

export class MCPServerWrapper {
  private server: McpServer;
  private registry: ToolRegistry;
  private app = createMcpExpressApp({ host: "0.0.0.0" });

  constructor(registry: ToolRegistry) {
    this.server = new McpServer(
      {
        name: "alex-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.registry = registry;

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    });

    this.setupTools();

    this.server.connect(transport);

    this.app.post("/mcp", async (req, res) => {
      await transport.handleRequest(req, res, req.body);
    });
  }

  private setupTools() {
    const tools = this.registry.getTools();
    
    for (const tool of tools) {
      this.server.registerTool(
        tool.name,
        {
          description: tool.description,
          inputSchema: tool.inputSchema as any,
        },
        async (args: unknown) => {
          try {
            const result = await this.registry.executeTool(tool.name, args);
            return {
              content: [{ type: "text" as const, text: JSON.stringify(result) }],
            };
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
              content: [{ type: "text" as const, text: errorMessage }],
              isError: true,
            };
          }
        }
      );
    }
  }

  public async run(port: number = 3030) {
    this.app.listen(port, () => {
      console.error(`MCP Server running on http://localhost:${port}/mcp`);
    });
  }
}

