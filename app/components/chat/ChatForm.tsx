import { useRef, useState } from 'react';
import { SubmitEvent } from 'react';
import { ChatStatus } from 'ai';
import { Send } from 'lucide-react';
import { SelectModel } from './SelectModel';

export const ChatForm = ({
  sendMessage,
  status
}: {
  sendMessage: ({ text }: { text: string }) => Promise<void>,
  status: ChatStatus,
}) => {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isLoading = status === 'streaming' || status === 'submitted';

  const disableSubmit = isLoading || input.trim() === "";

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disableSubmit) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleFocus = () => {
    setIsFocused(true);
  }

  const handleBlur = () => {
    setIsFocused(false);
  }

  return (
    <>
      <div className='fixed bottom-0 left-0 right-0 mx-auto max-w-2xl p-4 pb-8'>
        <div className='w-full flex justify-end'>
          <SelectModel />
        </div>

        <div
          onClick={() => inputRef.current?.focus()}
          className={`bg-white rounded-4xl border shadow-lg cursor-text transition-all duration-200 ease-in-out ${isFocused ? 'border-blue-500 shadow-blue-500/20' : 'border-gray-100'
            }`}>
          <form
            onSubmit={handleSubmit}
            className='flex gap-2 items-center p-4'>
            <textarea
              id='chat-input'
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage({ text: input });
                  setInput('');
                }
              }}
              placeholder='Use shift+enter for a new line...'
              className='flex-1 p-2 border-none rounded-lg max-h-[30vh] overflow-y-auto field-sizing-content min-h-11 resize-none focus:outline-none' />
            <button
              disabled={disableSubmit}
              type='submit'
              className={
                `bg-blue-500
                text-white
                rounded-full
                disabled:bg-gray-200
                disabled:cursor-not-allowed
                flex
                items-center
                justify-center
                transition-all
                duration-200
                ease-in-out
                ${!disableSubmit ? 'h-11 w-11' : 'h-0 w-0'}
                `
              }>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </>
  )
}