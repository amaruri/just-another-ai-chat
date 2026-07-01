# MCP Chat Explorer

> AI-powered chat interface with **MCP**, **RAG**, and **dynamic tool generation** — a sandbox for exploring the frontier of agentic AI applications.

Built with Next.js 16, React 19, and the Vercel AI SDK, this project demonstrates end-to-end skills in **AI UI engineering**: integrating local LLMs (Ollama), the Model Context Protocol for extensible tool ecosystems, Retrieval-Augmented Generation for persistent memory, and runtime AI-driven tool creation.

---

## Features

### AI Chat with Local LLMs
- Chat interface powered by [Ollama](https://ollama.ai) models (default: `qwen3:8b`)
- Real-time streaming responses via the Vercel AI SDK
- Dynamic model selection from all available local models

### Tool Use (Function Calling)
The AI agent can invoke a growing toolkit to answer questions and perform actions:

| Tool | Description |
|---|---|
| `calculate` | Evaluates math expressions |
| `trigonometry` | Trigonometric calculations |
| `getWeather` | Simulated weather lookup |
| `getPokemonInfo` | Real-time Pokémon data via PokeAPI |
| `searchDocuments` | Semantic search over indexed knowledge |

### Model Context Protocol (MCP)
MCP servers extend the agent's capabilities at runtime:

- **Filesystem server** — read/write access to project files
- **Fetch server** — URL fetching and content summarization
- **Dynamic tools server** — register and invoke AI-generated tools on the fly (Express + Streamable HTTP transport)

### 🧠 RAG (Retrieval-Augmented Generation)
Semantic memory via **ChromaDB** with local Ollama embeddings (`mxbai-embed-large`):

- **Document memory** — index files, query semantically at chat time
- **Conversation memory** — automatically persist meaningful exchanges
- **Smart filtering** — LLM classifier (`isWorthSaving`) decides what to remember
- **Text chunking** — configurable word-based chunker (200 words, 50 overlap)

### ⚡ Dynamic Tool Creation
Generate and register new tools at runtime using natural language:

1. Describe what you want (e.g. "a tool that converts Celsius to Fahrenheit")
2. An LLM generates the schema + implementation code
3. The tool is registered via MCP and persisted to disk
4. It's available immediately and across restarts

This turns the chat into a **self-extending agent** — it can grow its own capabilities.

### Agent Architecture
- **System prompts** guide behavior: plain-text responses, memory-aware, search-before-guessing
- **5-step tool call limit** per response (`stepCountIs(5)`)
- **Streaming UI** with inline tool-call visualization (loading, success, error states)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Lucide React icons |
| **AI SDK** | Vercel AI SDK 6 (`ai`, `@ai-sdk/react`, `@ai-sdk/mcp`) |
| **LLM Provider** | Ollama (`ollama-ai-provider-v2`) |
| **MCP** | `@modelcontextprotocol/sdk`, custom stdio & HTTP servers |
| **Vector Store** | ChromaDB (`chromadb` 3.4) |
| **State** | Jotai atoms, SWR for data fetching |
| **Validation** | Zod 4 |
| **Scripting** | `tsx` for CLI tools |
| **Icons** | Lucide React |

---

## Getting Started

### Prerequisites
- Node.js 20+
- [Ollama](https://ollama.ai) running locally with models pulled:
  ```bash
  ollama pull qwen3:8b
  ollama pull mxbai-embed-large
  ```

### Install & Run

```bash
npm install
npm run dev           # Next.js dev server → http://localhost:3000
```

In a separate terminal (for dynamic tool creation):

```bash
npm run dev:mcp       # Dynamic MCP server → port 3001
```

### Index Documents (optional)
Place files in `tmp/`, then:

```bash
npx tsx scripts/index-documents.ts
```

---

## Project Structure

```
app/
├── api/
│   ├── chat/route.ts          # Streaming chat API + RAG + tools
│   ├── ai-models/route.ts     # Ollama model listing
│   ├── generate-tool/route.ts # AI-powered tool code generation
│   └── register-tool/route.ts # Tool registration via MCP
├── chat/page.tsx              # Chat interface
├── components/
│   ├── chat/                  # Chat input, model selector
│   └── ToolCreator.tsx        # Dynamic tool creation UI
├── lib/
│   ├── mcp/                   # MCP client & config
│   ├── servers/               # Custom MCP servers (fetch, dynamic)
│   ├── tools/                 # Built-in + dynamic tools
│   ├── ddbb/chroma.ts         # ChromaDB vector store
│   ├── chunker.ts             # Text chunking
│   ├── prompts.ts             # System prompt builder
│   └── worth-saving.ts        # Conversation memory classifier
├── hooks/useChat.ts           # Custom chat hook
└── store/models.ts            # Jotai atoms
scripts/                       # CLI utilities (indexing, eval, DB mgmt)
tmp/                           # Document files for RAG indexing
```

---

## Why This Project

This is a portfolio piece demonstrating the transition from **frontend engineer** to **frontend AI engineer** (or **product AI engineer**). It showcases:

- **Modern AI SDKs** — integrating LLMs with streaming, tool calling, and structured outputs
- **MCP protocol** — building and consuming Model Context Protocol servers (stdio & HTTP)
- **RAG systems** — vector databases, embeddings, semantic search, and memory management
- **Agentic patterns** — tool use, dynamic capability extension, smart memory filtering
- **Full-stack execution** — from polished React UI to Express MCP servers to database scripting

---

## Roadmap / WIP

- [ ] Landing page redesign (currently default Next.js)
- [ ] Sidebar for conversation history
- [ ] Animated grid background component
- [ ] Tool creator UI integration in chat
- [ ] MCP server selector in chat
- [ ] Anthropic Claude integration (SDK installed)
- [ ] Tests

---

## License

Private — personal portfolio project.
