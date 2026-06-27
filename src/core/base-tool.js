const { ZodSchema } = require('zod');

class BaseTool {
  constructor() {
    if (this.constructor === BaseTool) {
      throw new Error('Cannot instantiate abstract class');
    }
  }

  get name() {
    throw new Error('Abstract method not implemented');
  }

  get description() {
    throw new Error('Abstract method not implemented');
  }

  get inputSchema() {
    throw new Error('Abstract method not implemented');
  }

  async execute(args) {
    throw new Error('Abstract method not implemented');
  }
}

module.exports = BaseTool;
