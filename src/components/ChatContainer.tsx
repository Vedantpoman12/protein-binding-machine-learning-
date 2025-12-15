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

function getBotResponse(input: string, data: AnalysisData): BotResponse {
    const lowerInput = input.toLowerCase();

    // Protein Binding Specific Queries
    if (lowerInput.includes('protein binding') || lowerInput.includes('binding') || lowerInput.includes('network') || lowerInput.includes('relationship')) {
        return {
            text: `**What is Protein Binding?**\n\nProtein binding occurs when a molecule (usually a drug or chemical) attaches to a specific protein target. This interaction can activate or inhibit the protein's function.\n\n**Visual Analysis:**\nThe chart below visualizes the binding network in our dataset, showing how different compound families interact with their targets.`,
            imageUrl: "/images/binding_relationships_overview.png",
            imageAlt: "Protein Binding Relationships Overview"
        };
    }

    // Educational Content - Basic Definitions
    // Improved matching for typos (e.g., "hwta -> what")
    const isQuestion = lowerInput.includes('what') || lowerInput.includes('hwta') || lowerInput.includes('define') || lowerInput.includes('explain');

    if (lowerInput.includes('protein') && (isQuestion || lowerInput.includes('mean'))) {
        return {
            text: `**What is a Protein?**\n\nProteins are large, complex molecules made up of chains of amino acids. They are essential for virtually all biological processes in living organisms.\n\n**Key Points:**\n• Building blocks of life\n• Made of 20 different amino acids\n• Perform specific functions (enzymes, antibodies, structural support)\n• Can bind to other molecules (like drugs or ligands)`
        };
    }

    if (lowerInput.includes('binding') && (isQuestion || lowerInput.includes('mean')) && !lowerInput.includes('protein binding')) {
        return {
            text: `**What is Binding?**\n\nBinding refers to the interaction between two molecules, such as a drug (ligand) and a protein (target).\n\n**Key Concepts:**\n• **Affinity**: How strongly two molecules stick together\n• **Specificity**: How selective a molecule is for its target\n• **pKd**: A measure of binding strength (higher = stronger)\n\nIn drug discovery, we want compounds that bind strongly and specifically to disease-related proteins.`
        };
    }

    if (lowerInput.includes('kinase') && (isQuestion || lowerInput.includes('mean'))) {
        return {
            text: `**What is a Kinase?**\n\nKinases are a family of enzymes that add phosphate groups to proteins, a process called phosphorylation.\n\n**Why They Matter:**\n• Control cell signaling pathways\n• Regulate cell growth, division, and death\n• Often mutated or overactive in cancer\n• Popular drug targets (e.g., cancer treatments)\n\nIn our dataset, Kinases have 162 binding interactions with an average pKd of 7.73.`
        };
    }

    if (lowerInput.includes('gpcr') && (isQuestion || lowerInput.includes('mean'))) {
        return {
            text: `**What is a GPCR?**\n\nGPCR stands for G Protein-Coupled Receptor, a large family of cell surface proteins.\n\n**Key Features:**\n• Located on cell membranes\n• Receive signals from outside the cell\n• Activate internal signaling pathways\n• Target for ~30% of all drugs\n\n**Examples:** Receptors for hormones, neurotransmitters, and sensory signals.\n\nOur dataset includes 105 GPCR interactions with an average pKd of 7.63.`
        };
    }

    if (lowerInput.includes('enzyme') && (isQuestion || lowerInput.includes('mean'))) {
        return {
            text: `**What is an Enzyme?**\n\nEnzymes are proteins that speed up chemical reactions in living organisms.\n\n**Characteristics:**\n• Act as biological catalysts\n• Highly specific to their substrates\n• Can be inhibited by drugs\n• Essential for metabolism, DNA replication, and more\n\nEnzyme inhibitors are common drug strategies. Our dataset has 98 enzyme interactions.`
        };
    }

    if ((lowerInput.includes('ion channel') || lowerInput.includes('ionchannel')) && (isQuestion || lowerInput.includes('mean'))) {
        return {
            text: `**What is an Ion Channel?**\n\nIon channels are pore-forming proteins that allow specific ions (like sodium, potassium, calcium) to pass through cell membranes.\n\n**Functions:**\n• Regulate electrical signals (nerves, heart)\n• Control muscle contraction\n• Maintain cell volume\n\nThey are major targets for drugs treating pain, hypertension, and epilepsy. Our dataset contains 69 ion channel interactions.`
        };
    }

    if (lowerInput.includes('transporter') && (isQuestion || lowerInput.includes('mean'))) {
        return {
            text: `**What is a Transporter?**\n\nTransporters are membrane proteins that move substances (nutrients, ions, drugs) across cell membranes against their gradient.\n\n**Importance:**\n• Essential for nutrient uptake\n• Remove toxins from cells\n• Affect drug absorption and distribution\n\nModulating transporters can improve drug delivery. We have 50 transporter interactions in our data.`
        };
    }

    if (lowerInput.includes('machine learning') || ((lowerInput.includes('ml') || lowerInput.includes('ai')) && isQuestion)) {
        return {
            text: `**What is Machine Learning?**\n\nMachine Learning (ML) is a type of artificial intelligence where computers learn patterns from data without being explicitly programmed.\n\n**In This Project:**\n• We trained models to predict protein-drug binding\n• Used features like molecular descriptors and protein properties\n• Evaluated models: Random Forest, SVM, Neural Networks\n• Best accuracy: 100% (Random Forest & Gradient Boosting)\n\nML helps discover new drugs faster by predicting which compounds will work.`
        };
    }

    if (lowerInput.includes('f1') || lowerInput.includes('score')) {
        return {
            text: `The F1 scores are:\n` +
                `Best (${data.bestModels.names.join('/')}): ${data.bestModels.f1}\n` +
                data.otherModels.map(m => `• ${m.name}: ${m.f1}`).join('\n'),
            imageUrl: "/images/model_comparison.png",
            imageAlt: "Model Comparison Chart"
        };
    }

    if (lowerInput.includes('accuracy') || lowerInput.includes('precision')) {
        return {
            text: `Here are the Accuracy metrics:\n` +
                `Best (${data.bestModels.names.join('/')}): ${data.bestModels.accuracy}\n` +
                data.otherModels.map(m => `• ${m.name}: ${m.accuracy}`).join('\n'),
            imageUrl: "/images/model_comparison.png",
            imageAlt: "Model Comparison Chart"
        };
    }

    if (lowerInput.includes('recall')) {
        return {
            text: `While specific recall values weren't in the summary, the F1 scores (which combine precision and recall) are:\n` +
                `Best: ${data.bestModels.f1}\n` +
                data.otherModels.map(m => `• ${m.name}: ${m.f1}`).join('\n'),
            imageUrl: "/images/precision_recall_curves.png",
            imageAlt: "Precision Recall Curves"
        };
    }

    if (lowerInput.includes('best') || lowerInput.includes('model')) {
        return {
            text: `The best performing models are ${data.bestModels.names.join(' and ')} with ${data.bestModels.accuracy} accuracy and F1 score.`,
            imageUrl: "/images/roc_curves.png",
            imageAlt: "ROC Curves"
        };
    }

    if (lowerInput.includes('matrix') || lowerInput.includes('confusion')) {
        return {
            text: "Here are the confusion matrices for the trained models, showing true positives, false positives, true negatives, and false negatives.",
            imageUrl: "/images/confusion_matrices.png",
            imageAlt: "Confusion Matrices"
        };
    }

    if (lowerInput.includes('feature') || lowerInput.includes('importance')) {
        return {
            text: "These are the most important features used by the Random Forest model to predict binding.",
            imageUrl: "/images/feature_importance.png",
            imageAlt: "Feature Importance"
        };
    }

    if (lowerInput.includes('data') || lowerInput.includes('sample')) {
        return {
            text: `The dataset consists of ${data.dataset.total} compound-target pairs (${data.dataset.positive} positive, ${data.dataset.negative} negative) with ${data.dataset.features} features.`
        };
    }

    if (lowerInput.includes('target') || lowerInput.includes('protein') || lowerInput.includes('family') || lowerInput.includes('families')) {
        const familiesText = data.bindingStats?.families.map(f => `• ${f.name}: ${f.count} interactions`).join('\n');

        return {
            text: `**Proteins in this Project**:\n\nOur dataset focuses on binding interactions across several key protein families:\n\n${familiesText}\n\nYou can ask "What is a Kinase?" or "What is a GPCR?" to learn more about specific types.`
        };
    }

    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
        return {
            text: "Hello! I can help you understand protein binding, explain ML concepts, or answer questions about the analysis. Try asking 'What is a protein?' or 'Show me binding relationships'."
        };
    }

    if (lowerInput.includes('project') || lowerInput.includes('about') || lowerInput.includes('goal') || lowerInput.includes('what is this')) {
        return {
            text: `Project Overview: This is a Machine Learning project for Drug-Target Interaction (DTI) prediction.\n\n` +
                `Goal: To predict whether a chemical compound will bind to a specific protein target.\n` +
                `Methodology: We trained multiple models (Random Forest, Gradient Boosting, etc.) on a dataset of 1000 compound-target pairs.`
        };
    }

    // Generic Image Handler for "other stuff"
    if (lowerInput.includes('show me') || lowerInput.includes('image of') || lowerInput.includes('picture of')) {
        const subject = lowerInput.replace('show me', '').replace('image of', '').replace('picture of', '').replace(/a /g, '').replace(/an /g, '').trim();
        if (subject.length > 0) {
            return {
                text: `Here is an image of ${subject} for you.`,
                imageUrl: `https://placehold.co/600x400?text=${encodeURIComponent(subject)}`,
                imageAlt: subject
            };
        }
    }

    return {
        text: "I can tell you about the Project Overview, F1 scores, Accuracy, Protein Families, Top Targets, or show you charts like ROC curves and Confusion Matrices. What would you like to know?"
    };
}

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
            const response = getBotResponse(content, analysisData);
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
