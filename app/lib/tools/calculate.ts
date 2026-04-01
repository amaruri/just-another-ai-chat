import { tool } from 'ai';
import { z } from 'zod';

export const calculate = tool({
  description: 'A calculator tool that evaluates mathematical expressions.',
  inputSchema: z.object({
    expression: z.string().describe('The mathematical expression to evaluate.'),
  }),
  execute: async ({ expression }) => {
    try {
      const result = Function(`"use strict"; return (${expression})`)() as number;
      return { expression, result };
    } catch (error) {
      return { error: 'Invalid expression', expression };
    }
  },
})