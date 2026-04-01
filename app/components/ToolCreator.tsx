"use client";
import { useState } from "react";

type GeneratedTool = {
  toolName: string;
  description: string;
  argsSchema: Record<string, string>;
  code: string;
};

export function ToolCreator({ onToolRegistered }: { onToolRegistered: () => void }) {
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<GeneratedTool | null>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "confirming" | "registering">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!toolName || !description) return;
    setStatus("generating");
    setError(null);

    const res = await fetch("/api/generate-tool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolName, description }),
    });

    const data = await res.json();

    if (data.success) {
      setPreview(data.tool);
      setStatus("confirming");
    } else {
      setError(data.error);
      setStatus("idle");
    }
  };

  const handleRegister = async () => {
    if (!preview) return;
    setStatus("registering");

    const res = await fetch("/api/register-tool", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preview),
    });

    const data = await res.json();

    if (data.success) {
      setStatus("idle");
      setToolName("");
      setDescription("");
      setPreview(null);
      onToolRegistered();
    } else {
      setError(data.error);
      setStatus("confirming");
    }
  };

  return (
    <div className="border border-neutral-800 rounded p-4 space-y-3">
      <p className="text-xs tracking-widest uppercase text-neutral-500">create tool</p>

      {status !== "confirming" && (
        <>
          <input
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            placeholder="tool_name (snake_case)"
            className="w-full text-sm p-2 border border-neutral-800 rounded bg-transparent"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should this tool do?"
            className="w-full text-sm p-2 border border-neutral-800 rounded bg-transparent"
          />
          <button
            onClick={handleGenerate}
            disabled={status === "generating" || !toolName || !description}
            className="text-xs px-3 py-1 border border-neutral-800 rounded hover:border-amber-700 hover:text-amber-600 transition-colors disabled:opacity-40"
          >
            {status === "generating" ? "generating…" : "generate ⚡"}
          </button>
        </>
      )}

      {/* Preview del código generado */}
      {preview && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">Review before registering:</p>
          <pre className="text-xs bg-neutral-900 text-white p-3 rounded overflow-auto">
            {JSON.stringify(preview, null, 2)}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={handleRegister}
              disabled={status === "registering"}
              className="text-xs px-3 py-1 border border-green-800 text-green-600 rounded hover:bg-green-950/20 transition-colors disabled:opacity-40"
            >
              {status === "registering" ? "registering…" : "confirm ✓"}
            </button>
            <button
              onClick={() => { setStatus("idle"); setPreview(null); }}
              className="text-xs px-3 py-1 border border-neutral-800 rounded hover:border-red-800 hover:text-red-500 transition-colors"
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}