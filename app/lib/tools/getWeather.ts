import { tool } from "ai";
import { z } from "zod";

function fetchWeather(city: string) {
  const conditions = ["sunny", "cloudy", "rainy", "windy", "partly cloudy"];
  const temp = Math.floor(Math.random() * 20) + 15;
  return { city, temperature: `${temp}°C`, condition: conditions[Math.floor(Math.random() * conditions.length)] };
};

export const getWeather = tool({
  description: "Get the current weather for a city",
  inputSchema: z.object({ city: z.string() }),
  execute: async ({ city }) => fetchWeather(city),
});