import { tool } from 'ai';
        import { z } from 'zod';

        // Auto-generated dynamic tool
        export const calculate_volume = tool({
          description: 'Calcula el volumen de figuras tridimensionales',
          inputSchema: z.object({"shape": "string", "dimensions": "object"}),
          execute: async (args) => {
            let volume;
switch (args.shape.toLowerCase()) {
  case 'cubo':
    volume = Math.pow(args.dimensions.lado, 3);
    break;
  case 'cilindro':
    volume = Math.PI * Math.pow(args.dimensions.radio, 2) * args.dimensions.altura;
    break;
  case 'esfera':
    volume = (4/3) * Math.PI * Math.pow(args.dimensions.radio, 3);
    break;
  case 'cono':
    volume = (1/3) * Math.PI * Math.pow(args.dimensions.radio, 2) * args.dimensions.altura;
    break;
  case 'prisma':
    volume = args.dimensions.base_area * args.dimensions.altura;
    break;
  case 'piramide':
    volume = (1/3) * args.dimensions.base_area * args.dimensions.altura;
    break;
  default:
    volume = 'Forma no reconocida';
}
return String(volume);
          },
        });
      