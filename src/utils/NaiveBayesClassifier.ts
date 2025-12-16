
// Simple Naive Bayes Classifier for Text Classification
// This brings Machine Learning capabilities to the chatbot without external dependencies

interface CategoryData {
    docCount: number;
    wordCounts: Map<string, number>;
    totalWords: number;
}

export class NaiveBayesClassifier {
    private categories: Map<string, CategoryData>;
    private vocabulary: Set<string>;
    private totalDocuments: number;

    constructor() {
        this.categories = new Map();
        this.vocabulary = new Set();
        this.totalDocuments = 0;
    }

    // Tokenize text into words, removing punctuation and converting to lowercase
    private tokenize(text: string): string[] {
        const stopWords = new Set([
            'what', 'is', 'a', 'an', 'the', 'of', 'in', 'for', 'to', 'and', 'are', 'tell', 'me', 'about', 'explain', 'define', 'meaning', 'how', 'do', 'does'
        ]);

        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.has(word));
    }

    // Train the model with a document and its category
    public train(text: string, category: string): void {
        const tokens = this.tokenize(text);

        // Initialize category if not exists
        if (!this.categories.has(category)) {
            this.categories.set(category, {
                docCount: 0,
                wordCounts: new Map(),
                totalWords: 0
            });
        }

        const categoryData = this.categories.get(category)!;
        categoryData.docCount++;
        this.totalDocuments++;

        // Update word counts
        tokens.forEach(token => {
            this.vocabulary.add(token);
            categoryData.totalWords++;
            const currentCount = categoryData.wordCounts.get(token) || 0;
            categoryData.wordCounts.set(token, currentCount + 1);
        });
    }

    // Predict the category for a given text
    public predict(text: string): { category: string; probability: number } {
        const tokens = this.tokenize(text);
        let maxProbability = -Infinity;
        let bestCategory = 'unknown';

        // Calculate probability for each category
        // P(Category|Document) ∝ P(Category) * P(Document|Category)
        // Using log probabilities to avoid underflow

        this.categories.forEach((data, category) => {
            // P(Category)
            const categoryProbability = Math.log(data.docCount / this.totalDocuments);

            // P(Document|Category)
            let docProbability = 0;
            tokens.forEach(token => {
                // Laplace smoothing: (count + 1) / (total_words + vocabulary_size)
                const wordCount = data.wordCounts.get(token) || 0;
                const wordProbability = Math.log(
                    (wordCount + 1) / (data.totalWords + this.vocabulary.size)
                );
                docProbability += wordProbability;
            });

            const totalProbability = categoryProbability + docProbability;

            if (totalProbability > maxProbability) {
                maxProbability = totalProbability;
                bestCategory = category;
            }
        });

        return { category: bestCategory, probability: maxProbability };
    }
}
