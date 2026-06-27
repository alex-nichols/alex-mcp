import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const client = new Client(
  { name: 'test-client', version: '1.0.0' },
  {
    capabilities: {}
  }
);

async function test() {
  const transport = new StreamableHTTPClientTransport(new URL('http://localhost:3030/mcp'));
  
  await client.connect(transport);
  
  console.log('Connected!');
  
  // List tools
  const tools = await client.listTools();
  console.log('Available tools:', JSON.stringify(tools, null, 2));
  
  // Call calculator
  const result = await client.callTool({
    name: 'calculator',
    arguments: { a: 5, b: 3 }
  });
  console.log('Calculator result:', JSON.stringify(result, null, 2));
  
  await client.close();
  process.exit(0);
}

test().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
