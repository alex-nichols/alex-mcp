import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';

export interface ToolConfig {
  tools: {
    [name: string]: string;
  };
}

export class ToolRegistry {
  private tools: Map<string, any> = new Map();
  private configPath: string;
  private config: ToolConfig;

  constructor(configPath: string) {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.initializeWatcher();
  }

  private loadConfig(): ToolConfig {
    if (!fs.existsSync(this.configPath)) {
      return { tools: {} };
    }
    const content = fs.readFileSync(this.configPath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse config file:', e);
      return { tools: {} };
    }
  }

  private async loadTool(name: string, filePath: string) {
    try {
      const resolvedPath = path.resolve(filePath);
      
      // Remove ?t query for require() 
      const cleanPath = resolvedPath.replace(/\?.*$/, '');
      
      const module: any = require(cleanPath);
      const ToolClass = module.default || module;
      
      if (typeof ToolClass !== 'function') {
        throw new Error(`Loaded module does not export a class: ${filePath}`);
      }

      const toolInstance = new ToolClass();
      
      this.tools.set(name, toolInstance);
      console.error(`Successfully loaded tool: ${name} from ${resolvedPath}`);
    } catch (error) {
      console.error(`Failed to load tool ${name} from ${filePath}:`, error);
    }
  }

  private async reloadAllTools() {
    console.error('Reloading all tools...');
    this.tools.clear();
    for (const [name, filePath] of Object.entries(this.config.tools)) {
      await this.loadTool(name, filePath);
    }
  }

  private initializeWatcher() {
    chokidar.watch(this.configPath).on('change', async () => {
      console.error('Config file changed. Reloading configuration...');
      this.config = this.loadConfig();
      await this.reloadAllTools();
    });
  }

  public async init() {
    await this.reloadAllTools();
  }

  public getTools(): any[] {
    return Array.from(this.tools.values());
  }

  public executeTool(name: string, args: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool ${name} not found.`);
    }
    return tool.execute(args);
  }

  public async addToolManually(name: string, filePath: string) {
     await this.loadTool(name, path.resolve(filePath));
  }

  public removeToolManually(name: string) {
    this.tools.delete(name);
    console.error(`Removed tool: ${name}`);
  }
}
