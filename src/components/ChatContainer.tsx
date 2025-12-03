import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Sparkles } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

const mockResponses = [
  "Hello! I'm here to help you with anything you need. What can I assist you with today?",
  "That's a great question! Let me think about that for a moment...",
  "I'd be happy to help you with that. Here's what I suggest:",
  "Interesting! Could you tell me more about what you're looking for?",
  "I understand. Let me provide you with some helpful information.",
  "Thanks for sharing that with me. Here's my perspective:",
];

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        role: "assistant",
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 glow-effect">
              <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              How can I help you today?
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              I'm your AI assistant, ready to answer questions, help with tasks, 
              or just have a conversation.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                role={message.role}
              />
            ))}
            {isTyping && (
              <ChatMessage content="" role="assistant" isTyping />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border/50">
        <ChatInput onSend={handleSend} disabled={isTyping} />
        <p className="text-xs text-muted-foreground text-center mt-3">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatContainer;
