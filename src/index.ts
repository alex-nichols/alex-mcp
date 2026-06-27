import { ToolRegistry } from './core/registry';
import { MCPServerWrapper } from './core/server';
import path from 'path';

const configPath = path.resolve(process.cwd(), 'tools.config.json');
const registry = new ToolRegistry(configPath);

async function main() {
  await registry.init();
  const server = new MCPServerWrapper(registry);
  await server.run();
}

main().catch((error) => {
  console.error('Fatal error in server:', error);
  process.exit(1);
});



