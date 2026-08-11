import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;
    onSend(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-[#E8ECE9] bg-white p-4">
      <div className="flex items-end gap-2 border border-[#E8ECE9] rounded-lg p-2 bg-[#FAF9F6] focus-within:border-[#4F6D60] transition-colors">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your documents..."
          rows={1}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent outline-none py-1.5 px-2 text-sm text-[#1C222E] max-h-32 min-h-[36px] font-sans"
        />
        <button
          type="submit"
          disabled={!content.trim() || disabled}
          className={`flex items-center justify-center p-2 rounded-md transition-colors ${
            !content.trim() || disabled
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-[#4F6D60] hover:bg-[#E8ECE9] hover:text-[#1C222E]'
          }`}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </form>
  );
};
export default ChatInput;
