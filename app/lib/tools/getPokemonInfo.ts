import { tool } from "ai";
import { z } from "zod";

export const getPokemonInfo = tool({
  description: "Get pokemon info",
  inputSchema: z.object({ name: z.string() }),
  execute: async ({ name }) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);

    console.log("response", response);

    if (!response.ok) {
      return { error: `Pokemon "${name}" not found. Try a different name.` };
    }

    const data = await response.json();
    return {
      name: data.name,
      height: data.height,
      weight: data.weight,
      base_experience: data.base_experience,
      types: data.types.map((t: { type: { name: string } }) => t.type.name),
      abilities: data.abilities.map((a: { ability: { name: string } }) => a.ability.name),
      stats: data.stats.map((s: { stat: { name: string }; base_stat: number }) => ({
        name: s.stat.name,
        value: s.base_stat,
      }))
    };
  },
});