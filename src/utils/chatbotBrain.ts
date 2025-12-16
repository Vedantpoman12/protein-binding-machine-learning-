import { NaiveBayesClassifier } from './NaiveBayesClassifier';
import { AnalysisData } from './parser';
import { correctSpelling } from './spellChecker';

// Define the intents
type Intent =
    | 'greeting'
    | 'project_overview'
    | 'protein_definition'
    | 'binding_definition'
    | 'protein_binding_info'
    | 'kinase_info'
    | 'gpcr_info'
    | 'enzyme_info'
    | 'ion_channel_info'
    | 'transporter_info'
    | 'ml_explanation'
    | 'model_performance'
    | 'dataset_info'
    | 'visualization_request'
    | 'project_summary'
    | 'unknown';

interface ResponseData {
    text: string;
    imageUrl?: string;
    imageAlt?: string;
}

// Training data: Map of Intent -> List of example phrases
const trainingData: Record<Intent, string[]> = {
    greeting: [
        "hello", "hi there", "hey", "greetings", "good morning", "good evening", "hi"
    ],
    project_overview: [
        "what is this project", "about this project", "project goal", "what do you do",
        "purpose of this app", "overview", "what is this"
    ],
    protein_definition: [
        "what is a protein", "define protein", "protein meaning", "explain protein",
        "simple protein definition", "protein molecule", "biological protein",
        "basics of protein", "protein explanation", "protein biology",
        "protein structure", "type of protein", "protein function"
    ],
    binding_definition: [
        "what is binding", "define binding", "interaction meaning", "how does binding work", "what is affinity"
    ],
    protein_binding_info: [
        "what is protein binding", "define protein binding", "explain protein binding",
        "protein binding meaning", "how do proteins bind", "binding relationships",
        "protein binding", "binding network", "compound binding"
    ],
    kinase_info: [
        "what is kinase", "tell me about kinase", "kinase family", "phosphorylation"
    ],
    gpcr_info: [
        "what is gpcr", "g protein coupled receptor", "tell me about gpcr", "gpcr family"
    ],
    enzyme_info: [
        "what is an enzyme", "define enzyme", "enzyme function", "catalyst"
    ],
    ion_channel_info: [
        "what is an ion channel", "ion channel meaning", "voltage gated"
    ],
    transporter_info: [
        "what is a transporter", "transporter protein", "membrane transport"
    ],
    ml_explanation: [
        "what model is used", "machine learning model", "how does the ai work",
        "random forest", "algorithm used", "is this ai"
    ],
    model_performance: [
        "how accurate is it", "accuracy", "f1 score", "performance metrics",
        "best model", "test results", "roc curve", "confusion matrix",
        "precision", "recall", "precision and recall", "precision recall",
        "model metrics", "evaluation metrics", "auc score", "model accuracy",
        "classification report", "true positive", "false positive"
    ],
    dataset_info: [
        "how much data", "dataset size", "data source", "number of samples", "training data"
    ],
    visualization_request: [
        "show me charts", "visualize results", "graphs", "plot", "show analysis"
    ],
    project_summary: [
        "everything", "all metrics", "complete summary", "full report",
        "all the data", "project summary", "give me everything",
        "all performance metrics", "complete overview", "all information"
    ],
    unknown: [] // No training data for unknown, it's the fallback
};

export class ChatbotBrain {
    private classifier: NaiveBayesClassifier;
    private isTrained: boolean = false;

    constructor() {
        this.classifier = new NaiveBayesClassifier();
    }

    public train(): void {
        if (this.isTrained) return;

        console.log("Training Chatbot Model...");
        Object.entries(trainingData).forEach(([intent, phrases]) => {
            phrases.forEach(phrase => {
                // Boost critical keywords by repeating them in the phrase training
                // This is a simple weighing technique
                this.classifier.train(phrase, intent);
            });
        });
        this.isTrained = true;
        console.log("Chatbot Model Trained Successfully.");
    }

    public getResponse(input: string, data: AnalysisData): ResponseData {
        if (!this.isTrained) {
            this.train();
        }

        // Apply spell correction before classification
        const correctedInput = correctSpelling(input);

        // Log the correction if it changed
        if (correctedInput !== input.toLowerCase()) {
            console.log(`Spell corrected: "${input}" -> "${correctedInput}"`);
        }

        const { category, probability } = this.classifier.predict(correctedInput);
        const intent = category as Intent;

        // Log for debugging
        console.log(`Input: "${correctedInput}" -> Predicted Intent: ${intent} (Log Prob: ${probability.toFixed(2)})`);

        // Confidence threshold logic could be added here if probabilities were normalized
        // For Naive Bayes log probs, it's relative.

        switch (intent) {
            case 'greeting':
                return {
                    text: "Hello! I am an AI assistant trained to explain the Protein Binding Prediction project. I use a Naive Bayes classifier to understand your questions. Ask me about proteins, the dataset, or the model performance!"
                };

            case 'project_overview':
                return {
                    text: `Project Overview: This is a Machine Learning project for Drug-Target Interaction (DTI) prediction.\n\n` +
                        `Goal: To predict whether a chemical compound will bind to a specific protein target.\n` +
                        `Methodology: We trained multiple models (Random Forest, Gradient Boosting) on a dataset of ${data.dataset.total} pairs.`
                };

            case 'protein_definition':
                return {
                    text: `What is a Protein?\n\nProteins are large molecules made of amino acids, essential for life.\n\nKey Points:\n• Building blocks of life\n• Perform specific functions (enzymes, structural)\n• The targets for most drugs.`
                };

            case 'binding_definition':
                return {
                    text: `What is Binding?\n\nBinding is the interaction between a drug (ligand) and a protein.\n\nIt's measured by:\n• Affinity (strength)\n• pKd (value used in our data, higher is stronger)\n\nIn drug discovery, we want compounds that bind strongly and specifically to disease-related proteins.`
                };

            case 'protein_binding_info':
                return {
                    text: `What is Protein Binding?\n\nProtein binding occurs when a molecule (usually a drug or chemical) attaches to a specific protein target. This interaction can activate or inhibit the protein's function.\n\nVisual Analysis:\nThe chart below visualizes the binding network in our dataset, showing how different compound families interact with their targets.`,
                    imageUrl: "/images/binding_relationships_overview.png",
                    imageAlt: "Protein Binding Relationships Overview"
                };

            case 'kinase_info':
                return {
                    text: `Kinases are enzymes that regulate cell pathways. They are a major target in this dataset (${data.bindingStats.families.find(f => f.name === 'Kinase')?.count} interactions).`
                };

            case 'gpcr_info':
                return {
                    text: `GPCRs (G Protein-Coupled Receptors) are cell surface sensors. They are the target for ~30% of all drugs. We have ${data.bindingStats.families.find(f => f.name === 'GPCR')?.count} GPCR interactions.`
                };

            case 'enzyme_info':
                return {
                    text: `Enzymes act as biological catalysts. In this dataset, we analyze ${data.bindingStats.families.find(f => f.name === 'Enzyme')?.count} specific enzyme interactions.`
                };

            case 'ion_channel_info':
                return {
                    text: `Ion channels regulate electrical signals in cells. We have ${data.bindingStats.families.find(f => f.name === 'IonChannel')?.count} samples for them.`
                };

            case 'transporter_info':
                return {
                    text: `Transporters move substances across cell membranes. They are critical for drug absorption.`
                };

            case 'ml_explanation':
                return {
                    text: `Machine Learning Model:\n\n1. Prediction Model: We use a Random Forest Classifier (best performing) to predict binding.\n2. Chatbot Model: I am currently using a custom Naive Bayes text classifier running directly in your browser to understand these intents!`,
                    imageUrl: "/images/feature_importance.png",
                    imageAlt: "Feature Importance"
                };

            case 'model_performance':
                return {
                    text: `Model Performance Metrics:\n\n` +
                        `Best Models: ${data.bestModels.names.join(', ')}\n\n` +
                        `Random Forest & Gradient Boosting:\n` +
                        `  - Accuracy: 100%\n` +
                        `  - Precision: 100%\n` +
                        `  - Recall: 100%\n` +
                        `  - F1 Score: 100%\n` +
                        `  - ROC-AUC: 100%\n\n` +
                        `Logistic Regression:\n` +
                        `  - Accuracy: 96.5%\n` +
                        `  - Precision: 96.88%\n` +
                        `  - Recall: 95.88%\n\n` +
                        `SVM:\n` +
                        `  - Accuracy: 92.5%\n` +
                        `  - Precision: 93.62%\n` +
                        `  - Recall: 90.72%\n\n` +
                        `Neural Network:\n` +
                        `  - Accuracy: 88.5%\n` +
                        `  - Precision: 92.05%\n` +
                        `  - Recall: 83.51%`,
                    imageUrl: "/images/precision_recall_curves.png",
                    imageAlt: "Precision Recall Curves"
                };

            case 'dataset_info':
                return {
                    text: `Dataset Statistics:\n\n` +
                        `Total Samples: ${data.dataset.total}\n` +
                        `Positive (Binding): ${data.dataset.positive} (48.4%)\n` +
                        `Negative (No Binding): ${data.dataset.negative}\n` +
                        `Features: ${data.dataset.features}\n\n` +
                        `Protein Families in Dataset:\n` +
                        `  - Kinase: 269 samples (162 bindings, 60.2% rate)\n` +
                        `  - GPCR: 234 samples (105 bindings, 44.9% rate)\n` +
                        `  - Enzyme: 199 samples (98 bindings, 49.3% rate)\n` +
                        `  - IonChannel: 168 samples (69 bindings, 41.1% rate)\n` +
                        `  - Transporter: 130 samples (50 bindings, 38.5% rate)`
                };

            case 'visualization_request':
                return {
                    text: "Here are the Precision-Recall curves showing model performance.",
                    imageUrl: "/images/precision_recall_curves.png",
                    imageAlt: "Precision Recall Curves"
                };

            case 'project_summary':
                return {
                    text: `COMPLETE PROJECT SUMMARY\n\n` +
                        `PROJECT: Drug-Target Interaction (DTI) Prediction\n\n` +
                        `DATASET:\n` +
                        `  - 1000 compound-target pairs\n` +
                        `  - 484 positive (binding) / 516 negative\n` +
                        `  - 37 features used\n\n` +
                        `PROTEIN FAMILIES:\n` +
                        `  - Kinase: 162 bindings (avg pKd: 7.73)\n` +
                        `  - GPCR: 105 bindings (avg pKd: 7.63)\n` +
                        `  - Enzyme: 98 bindings (avg pKd: 7.68)\n` +
                        `  - IonChannel: 69 bindings (avg pKd: 7.35)\n` +
                        `  - Transporter: 50 bindings (avg pKd: 7.58)\n\n` +
                        `MODEL PERFORMANCE:\n` +
                        `  Best: Random Forest & Gradient Boosting (100% all metrics)\n\n` +
                        `  Logistic Regression: 96.5% acc, 96.88% precision, 95.88% recall\n` +
                        `  SVM: 92.5% acc, 93.62% precision, 90.72% recall\n` +
                        `  Neural Network: 88.5% acc, 92.05% precision, 83.51% recall`,
                    imageUrl: "/images/model_comparison.png",
                    imageAlt: "Model Comparison"
                };

            default:
                return {
                    text: `I cannot answer that question.\n\n` +
                        `I am a specialized chatbot trained only on the Protein Binding Prediction project. ` +
                        `I can only help with topics related to this project.\n\n` +
                        `Topics I can discuss:\n` +
                        `  - What is a protein / binding / kinase / GPCR / enzyme\n` +
                        `  - Model performance (accuracy, precision, recall, F1 score)\n` +
                        `  - Dataset information and protein families\n` +
                        `  - Project overview and summary\n` +
                        `  - Visualization charts (ROC curves, confusion matrix)\n\n` +
                        `Please ask about one of these topics, or try rephrasing your question.`
                };
        }
    }
}

export const chatbotBrain = new ChatbotBrain();
