'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { SubmitEvent, useRef, useState } from 'react';
import { MCP_SERVERS_UI, MCPServerName, SERVER_ICONS } from '../lib/mcp/mcp-config';
import { ToolCreator } from '../components/ToolCreator';
import { ChatForm } from '../components/chat/ChatForm';
import { useChatForm } from '../hooks/useChat';
import useSWR from 'swr';
import { SelectModel } from '../components/chat/SelectModel';
import { useAtom } from 'jotai';
import { selectedModelAtom } from '../store/models';

function ToolCall({
  part
}: {
  part: {
    type: string;
    state?: string;
    args?: Record<string, string>;
    output?: Record<string, string | number> }
}) {
  const icons: Record<string, string> = {
    'tool-calculate': "🧮",
    'tool-get_weather': "🌤️",
    'tool-get_pokemon_info': "⚡",
  };

  // const formatOutput = () => {
  //   if (!part.output) return null;
  //   const o = part.output;
  //   if (o.result !== undefined) return `${o.expression} = ${o.result}`;
  //   return JSON.stringify(o);
  // };


  return (
    <div className="flex items-center gap-2 text-xs py-1 border-l-2 border-neutral-800 pl-3 my-1">
      <span>{icons[part.type] ?? "🔧"}</span>
      <span className="text-neutral-500 font-mono">{part.type.split('-')[1]}</span>
      {part.state === "output-available"
        ? (
          <span
            className="text-green-600 dark:text-green-400">
            ✓
          </span>
        )
        : (
          <span
            className="text-neutral-500 animate-pulse">
            running…
          </span>
        )
      }
    </div>
  );
}

export default function ChatPage() {
  const [selectedModel] = useAtom(selectedModelAtom);
  const transport = new DefaultChatTransport({
    api: "/api/chat",
    prepareSendMessagesRequest({ messages }) {
      return {
        body: {
          messages,
          model: selectedModel,
          // activeServers: activeServersRef.current,
        },
      };
    },
  });
  const [input, setInput] = useState('');
  const [activeServers, setActiveServers] = useState<MCPServerName[]>(["filesystem"]);
  const activeServersRef = useRef(activeServers);

  const toggleServer = (server: MCPServerName) => {
    const next = activeServers.includes(server)
      ? activeServers.filter((s) => s !== server)
      : [...activeServers, server];

    setActiveServers(next);
    activeServersRef.current = next;
  };

  console.log('activeServers', activeServers);

  console.log('transport', transport);

  const { messages, status, sendMessage } = useChatForm({ transport });

  console.log('messages from chat page', messages);

  const isLoading = status === 'streaming' || status === 'submitted';

  const suggestions = [
    "Calculate 1337 * 42",
    "🙅🏿‍♂️𓃮🙅🏻‍♂️🖤 What is the weather like in Wakanda?",
    "What is sin(90)?",
    "What is the type of pokemon Pikachu?",
  ];

  const { data } = useSWR('/api/ai-models', async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  });

  return (
    <div
      className='max-w-2xl mx-auto p-4'>
      <h1
        className='text-2xl font-bold mb-4'>
        MCP Chat Explorer
      </h1>
      <div
        className='space-y-4 mb-4'>
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-neutral-700">
            <p className="text-xs tracking-widest uppercase">try asking</p>
            <div className="flex flex-col gap-2 items-center">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { sendMessage({ text: s }); }}
                  className="text-xs border border-neutral-800 px-4 py-2 rounded hover:border-amber-700 hover:text-amber-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map(message => (
          <div
            key={message.id}
            className={
              message.role === 'user'
                ? 'text-right'
                : 'text-left'
            }>
            <span
              className='inline-block p-2 rounded bg-gray-100'>
              {message.parts.map((part, partIndex) => {
                if (part.type === 'text') {
                  return <div key={partIndex}>{part.text}</div>;
                }
                if (part.type.startsWith("tool-")) {
                  return <ToolCall key={partIndex} part={part as never} />;
                }
                return null;
              })}
            </span>
          </div>
        ))}
        {
          isLoading && (
            messages[messages.length - 1]?.role !== "assistant"
              ? (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] tracking-widest uppercase text-neutral-600">ai</span>
                  <span className="text-neutral-600 animate-pulse text-sm">▋</span>
                </div>
              )
              : (
                <div className="flex items-center gap-1">
                  <span className="text-neutral-600 animate-pulse text-sm">▋</span>
                </div>
              )
          )
        }
      </div>

      {/* MCP Server Selector */}
      {/* <div className="flex gap-2 mb-3">
        {
          MCP_SERVERS_UI.map((server) => {
            const isActive = activeServers.includes(server);

            return (
              <button
                key={server}
                type="button"
                onClick={() => toggleServer(server)}
                className={`flex items-center gap-1 text-xs px-3 py-1 rounded border transition-colors ${
                  isActive
                    ? "border-amber-700 text-amber-600 bg-amber-950/20"
                    : "border-neutral-800 text-neutral-500 hover:border-neutral-600"
                }`}
              >
                <span>{SERVER_ICONS[server]}</span>
                <span>{server}</span>
              </button>
            )
          })
        }
      </div> */}

      {/* <ToolCreator onToolRegistered={() => console.log("nueva tool disponible")} /> */}

      <ChatForm sendMessage={sendMessage} status={status} />
    </div>
  );
}