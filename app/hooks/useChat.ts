import { useChat } from "@ai-sdk/react";
import { ChatTransport, UIMessage } from "ai";

export const useChatForm = ({ transport }: { transport: ChatTransport<UIMessage> }) => {
  const {
    messages,
    sendMessage,
    status,
  } = useChat({
    transport,
  });

  return {
    messages,
    sendMessage,
    status
  }
}