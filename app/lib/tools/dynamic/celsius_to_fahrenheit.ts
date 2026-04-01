import { tool } from 'ai';
import { z } from 'zod';

// Auto-generated dynamic tool
export const celsius_to_fahrenheit = tool({
  description: 'Converts Celsius to Fahrenheit',
  inputSchema: z.object({ "value": "number" }),
  execute: async (args) => {
    return String((Number(args.value) * 9 / 5) + 32)
  },
});
