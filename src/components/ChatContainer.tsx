import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Sparkles } from "lucide-react";
import { AnalysisData } from "../utils/parser";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

const defaultAnalysisData: AnalysisData = {
  bestModels: {
    names: ["Random Forest", "Gradient Boosting"],
    accuracy: "100.0%",
    f1: "100.0%",
    roc_auc: "100.0%"
  },
  otherModels: [
    { name: "Logistic Regression", accuracy: "96.50%", f1: "96.37%", roc_auc: "99.61%" },
    { name: "SVM", accuracy: "92.50%", f1: "92.15%", roc_auc: "97.56%" },
    { name: "Neural Network", accuracy: "88.50%", f1: "87.57%", roc_auc: "96.06%" }
  ],
  dataset: {
    total: 1000,
    positive: 484,
    negative: 516,
    features: 42
  },
  bindingStats: {
    families: [
      { name: "Kinase", count: 162, avgPkd: "7.73" },
      { name: "GPCR", count: 105, avgPkd: "7.63" },
      { name: "Enzyme", count: 98, avgPkd: "7.68" },
      { name: "IonChannel", count: 69, avgPkd: "7.35" },
      { name: "Transporter", count: 50, avgPkd: "7.58" }
    ],
    topTargets: [
      { name: "TRG_2068", family: "Kinase", count: 9 },
      { name: "TRG_2072", family: "Kinase", count: 9 },
      { name: "TRG_2052", family: "Enzyme", count: 9 }
    ]
  }
};

function getBotResponse(input: string, data: AnalysisData) {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('f1') || lowerInput.includes('score')) {
    return `The F1 scores are:\n` +
      `Best (${data.bestModels.names.join('/')}): ${data.bestModels.f1}\n` +
      data.otherModels.map(m => `• ${m.name}: ${m.f1}`).join('\n');
  }

  if (lowerInput.includes('accuracy') || lowerInput.includes('precision')) {
    return `Here are the Accuracy metrics:\n` +
      `Best (${data.bestModels.names.join('/')}): ${data.bestModels.accuracy}\n` +
      data.otherModels.map(m => `• ${m.name}: ${m.accuracy}`).join('\n');
  }

  if (lowerInput.includes('recall')) {
    return `While specific recall values weren't in the summary, the F1 scores (which combine precision and recall) are:\n` +
      `Best: ${data.bestModels.f1}\n` +
      data.otherModels.map(m => `• ${m.name}: ${m.f1}`).join('\n');
  }

  if (lowerInput.includes('best') || lowerInput.includes('model')) {
    return `The best performing models are ${data.bestModels.names.join(' and ')} with ${data.bestModels.accuracy} accuracy and F1 score.`;
  }

  if (lowerInput.includes('data') || lowerInput.includes('sample')) {
    return `The dataset consists of ${data.dataset.total} compound-target pairs (${data.dataset.positive} positive, ${data.dataset.negative} negative) with ${data.dataset.features} features.`;
  }

  if (lowerInput.includes('family') || lowerInput.includes('families') || lowerInput.includes('kinase') || lowerInput.includes('gpcr')) {
    return `**Binding by Protein Family**:\n` +
      data.bindingStats?.families.map(f => `• ${f.name}: ${f.count} interactions (Avg pKd: ${f.avgPkd})`).join('\n') || "No family data available.";
  }

  if (lowerInput.includes('target') || lowerInput.includes('protein')) {
    return `**Top Targeted Proteins**:\n` +
      data.bindingStats?.topTargets.map((t, i) => `${i + 1}. ${t.name} (${t.family}): ${t.count} compounds`).join('\n') || "No target data available.";
  }

  if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
    return "Hello! Ask me about F1 scores, accuracy, protein families, or top targets.";
  }

  if (lowerInput.includes('project') || lowerInput.includes('about') || lowerInput.includes('goal') || lowerInput.includes('what is this')) {
    return `Project Overview: This is a Machine Learning project for Drug-Target Interaction (DTI) prediction.\n\n` +
      `Goal: To predict whether a chemical compound will bind to a specific protein target.\n` +
      `Methodology: We trained multiple models (Random Forest, Gradient Boosting, etc.) on a dataset of 1000 compound-target pairs using features like molecular descriptors and protein embeddings.`;
  }

  return "I can tell you about the Project Overview, F1 scores, Accuracy, Protein Families, Top Targets, or Dataset details. What would you like to know?";
}

const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [analysisData] = useState<AnalysisData>(defaultAnalysisData);
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
      const responseText = getBotResponse(content, analysisData);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText,
        role: "assistant",
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
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
            <p className="text-muted-foreground text-sm max-w-md mb-6">
              I'm your AI assistant, ready to answer questions about your protein binding analysis.
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
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-muted-foreground text-center flex-1">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
