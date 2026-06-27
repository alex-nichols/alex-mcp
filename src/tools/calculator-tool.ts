import { BaseTool } from '../core/base-tool';
import { z } from 'zod';

export default class CalculatorTool extends BaseTool<{ a: number; b: number }> {
  readonly name = "calculator";
  readonly description = "Performs addition using two numbers.";
  readonly inputSchema = z.object({
    a: z.number(),
    b: z.number(),
  });

  async execute({ a, b }: { a: number; b: number }) {
    return { result: a + b };
  }
}
