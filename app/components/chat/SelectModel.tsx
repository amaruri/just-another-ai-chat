import { useAtom } from "jotai";
import { selectedModelAtom } from "../../store/models";
import useSWR from "swr";
import { useEffect } from 'react';

type AIModel = {
  name: string,
  model: string,
  modified_at: string,
  size: number,
  digest: string,
  details: {
    format: string,
    family: string,
    families: string[],
    parameter_size: string,
    quantization_level: string
  }
}

export const SelectModel = () => {
  const { data, isLoading, error } = useSWR('/api/ai-models', async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  });

  const [selectedModel, setSelectedModel] = useAtom(selectedModelAtom);

  if (isLoading) return <div>Loading...</div>

  if (error) return <div>Error: {error.message}</div>

  return (
    <select
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className="p-2 border rounded-full border-blue-400 shadow-lg mb-2 bg-blue-400 text-white cursor-pointer"
    >
      {data.models.map((model: AIModel) => (
        <option key={model.name} value={model.name}>
          {model.name}
        </option>
      ))}
    </select>
  )
}