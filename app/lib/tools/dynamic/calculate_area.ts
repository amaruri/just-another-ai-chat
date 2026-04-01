
  import { tool } from 'ai';
  import { z } from 'zod';

  // Auto-generated dynamic tool
  export const calculate_area = tool({
    description: 'Calculate geometric shape area',
    inputSchema: z.object({"shape":"string","dimensions":"object"}),
    execute: async (args) => {
      if (args.shape === 'rectangle') return String(args.dimensions.width * args.dimensions.height);
if (args.shape === 'circle') return String(Math.PI * args.dimensions.radius * args.dimensions.radius);
if (args.shape === 'triangle') return String(0.5 * args.dimensions.base * args.dimensions.height);
return 'Invalid shape'
    },
  });
        