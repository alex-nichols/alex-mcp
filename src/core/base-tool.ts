import { ZodSchema } from 'zod';

export abstract class BaseTool<T extends object> {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly inputSchema: ZodSchema<T>;
  abstract execute(args: T): Promise<any>;
}
