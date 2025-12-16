import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { Sparkles } from "lucide-react";
import { AnalysisData } from "../utils/parser";

interface Message {
    id: string;
    content: string;
    role: "user" | "assistant";
    imageUrl?: string;
    imageAlt?: string;
}

interface BotResponse {
    text: string;
    imageUrl?: string;
    imageAlt?: string;
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

import { chatbotBrain } from "../utils/chatbotBrain";

// Removed old getBotResponse function in favor of ML-based chatbotBrain


const ChatContainer = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [analysisData] = useState<AnalysisData>(defaultAnalysisData);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
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
            const response = chatbotBrain.getResponse(content, analysisData);
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                content: response.text,
                role: "assistant",
                imageUrl: response.imageUrl,
                imageAlt: response.imageAlt
            };
            setIsTyping(false);
            setMessages((prev) => [...prev, aiResponse]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 glow-effect">
                            <Sparkles className="w-8 h-8 text-primary animate-pulse-glow" />
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground mb-2">
                            How can I help you today?
                        </h2>

                    </div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                content={message.content}
                                role={message.role}
                                imageUrl={message.imageUrl}
                                imageAlt={message.imageAlt}
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
                </div>
            </div>
        </div>
    );
};

export default ChatContainer;
