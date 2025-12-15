import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  isTyping?: boolean;
  imageUrl?: string;
  imageAlt?: string;
}

const ChatMessage = ({ content, role, isTyping, imageUrl, imageAlt }: ChatMessageProps) => {
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
          <div className="flex flex-col gap-3">
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <img
                  src={imageUrl}
                  alt={imageAlt || "Attachment"}
                  className="rounded-md max-w-full h-auto object-cover border border-border/50 shadow-sm"
                />
              </a>
            )}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
