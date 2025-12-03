import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  isTyping?: boolean;
}

const ChatMessage = ({ content, role, isTyping }: ChatMessageProps) => {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-message-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-primary/20 text-primary"
            : "bg-chat-ai-border text-chat-ai-foreground"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-tr-md"
            : "bg-chat-ai border border-chat-ai-border text-chat-ai-foreground rounded-tl-md"
        )}
      >
        {isTyping ? (
          <div className="flex gap-1 py-1">
            <span className="w-2 h-2 bg-current rounded-full typing-dot opacity-60" />
            <span className="w-2 h-2 bg-current rounded-full typing-dot opacity-60" />
            <span className="w-2 h-2 bg-current rounded-full typing-dot opacity-60" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
