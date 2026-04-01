import { tool } from "ai";
import { z } from "zod";

export const trigonometry = tool({
  description: "A trigonometry tool that evaluates trigonometric expressions.",
  inputSchema: z.object({
    expression: z.string().describe('The trigonometric expression to evaluate.'),
  }),
  execute: async ({ expression }) => {
    try {
      const result = Function(`"use strict"; return (Math.${expression})`)() as number;
      return { expression, result };
    } catch (error) {
      return { error: 'Invalid expression', expression };
    }
  },
});