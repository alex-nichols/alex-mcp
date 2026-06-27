import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { ToolRegistry } from "./registry.js";
import express from "express";
import cors from "cors";

export class MCPServerWrapper {
  private server: Server;
  private registry: ToolRegistry;
  private app: express.Application = express();
  private transport: SSEServerTransport | null = null;

  constructor(registry: ToolRegistry) {
    this.server = new Server(
      {
        name: "dynamic-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    this.registry = registry;
    this.app.use(cors());
    this.setupHandlers();
    this.setupRoutes();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.registry.getTools().map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: (tool.inputSchema as any).shape as any,
      }));

      return {
        tools: tools,
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.registry.executeTool(name, args);
        return {
          content: [{ type: "text", text: JSON.stringify(result) }],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [{ type: "text", text: error.message }],
        };
      }
    });
  }

  private setupRoutes() {
    this.app.get("/mcp", async (req, res) => {
      this.transport = new SSEServerTransport("/messages", res);
      await this.server.connect(this.transport);
      console.error("SSE connection established");
    });

    this.app.post("/messages", async (req, res) => {
      if (!this.transport) {
        res.status(400).send("No active SSE connection");
        return;
      }
      await this.transport.handlePostMessage(req, res);
    });
  }

  public async run(port: number = 3030) {
    this.app.listen(port, '0.0.0.0', () => {
      console.error(`MCP Server running on http://localhost:${port}/mcp`);
    });
  }
}

