const BaseTool = require('../core/base-tool.js');
const z = require('zod');

class CalculatorTool extends BaseTool {
  constructor() {
    super();
    Object.defineProperty(this, 'name', { value: "calculator", writable: false });
    Object.defineProperty(this, 'description', { value: "Performs addition using two numbers.", writable: false });
    Object.defineProperty(this, 'inputSchema', { value: z.object({
      a: z.number(),
      b: z.number(),
    }), writable: false });
  }

  async execute({ a, b }) {
    return { result: a + b };
  }
}

module.exports = CalculatorTool;
