// Spell checker using Levenshtein distance for fuzzy matching

// Common misspellings mapped to correct words
const commonMisspellings: Record<string, string> = {
    // Protein related
    'protien': 'protein',
    'proiten': 'protein',
    'proten': 'protein',
    'protain': 'protein',
    'prtein': 'protein',
    'protine': 'protein',

    // Binding related
    'bindng': 'binding',
    'bindig': 'binding',
    'biding': 'binding',
    'bindding': 'binding',
    'bnding': 'binding',

    // Precision/Recall
    'presicion': 'precision',
    'precison': 'precision',
    'precisoin': 'precision',
    'precission': 'precision',
    'presision': 'precision',
    'prcision': 'precision',

    'recal': 'recall',
    'recll': 'recall',
    'reacll': 'recall',
    'recaall': 'recall',
    'rcall': 'recall',

    // Accuracy
    'accuacy': 'accuracy',
    'accuray': 'accuracy',
    'acuracy': 'accuracy',
    'accurcy': 'accuracy',
    'accracy': 'accuracy',
    'acccuracy': 'accuracy',

    // Model
    'modle': 'model',
    'modl': 'model',
    'mdoel': 'model',
    'modeel': 'model',

    // Performance
    'performace': 'performance',
    'performnce': 'performance',
    'peformance': 'performance',
    'perfomance': 'performance',

    // Kinase
    'kinsae': 'kinase',
    'kinse': 'kinase',
    'kinas': 'kinase',
    'kinease': 'kinase',

    // GPCR
    'gcpr': 'gpcr',
    'gprc': 'gpcr',
    'gpcrs': 'gpcr',

    // Enzyme
    'enzme': 'enzyme',
    'enzyem': 'enzyme',
    'enzmye': 'enzyme',
    'enzym': 'enzyme',

    // Dataset
    'datset': 'dataset',
    'datasett': 'dataset',
    'dataste': 'dataset',
    'daaset': 'dataset',

    // Summary
    'summry': 'summary',
    'sumary': 'summary',
    'sumarry': 'summary',
    'summery': 'summary',

    // Everything
    'everthing': 'everything',
    'evreything': 'everything',
    'everythng': 'everything',
    'evrything': 'everything',

    // Machine Learning
    'machien': 'machine',
    'macine': 'machine',
    'machne': 'machine',
    'learninng': 'learning',
    'lerning': 'learning',
    'learnig': 'learning',

    // Metrics
    'metrcs': 'metrics',
    'metircs': 'metrics',
    'metics': 'metrics',
    'metriks': 'metrics',

    // Chart/Graph
    'chrt': 'chart',
    'cahrt': 'chart',
    'grpah': 'graph',
    'grah': 'graph',
    'grph': 'graph',

    // Score
    'scroe': 'score',
    'scor': 'score',
    'sccore': 'score',

    // Random Forest
    'radom': 'random',
    'randm': 'random',
    'ranodm': 'random',
    'forrest': 'forest',
    'forst': 'forest',

    // Common words
    'waht': 'what',
    'hwat': 'what',
    'whta': 'what',
    'wht': 'what',
    'teh': 'the',
    'hte': 'the',
    'adn': 'and',
    'nad': 'and',
    'hwo': 'how',
    'hwot': 'how',
    'shwo': 'show',
    'shw': 'show',
    'abut': 'about',
    'aboout': 'about',
    'abotu': 'about',
};

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    // Create a matrix
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // Fill the matrix
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // substitution
                );
            }
        }
    }

    return dp[m][n];
}

// Known vocabulary words for fuzzy matching
const vocabulary = [
    'protein', 'binding', 'precision', 'recall', 'accuracy', 'model',
    'performance', 'kinase', 'gpcr', 'enzyme', 'dataset', 'summary',
    'everything', 'machine', 'learning', 'metrics', 'chart', 'graph',
    'score', 'random', 'forest', 'what', 'how', 'show', 'about',
    'f1', 'roc', 'auc', 'curve', 'confusion', 'matrix', 'feature',
    'importance', 'ion', 'channel', 'transporter', 'hello', 'hi',
    'project', 'overview', 'families', 'data', 'samples', 'best',
    'neural', 'network', 'svm', 'logistic', 'regression', 'boosting',
    'gradient', 'visualization', 'results', 'analysis'
];

// Find the closest word from vocabulary
function findClosestWord(word: string, maxDistance: number = 2): string {
    const lowerWord = word.toLowerCase();

    // First check common misspellings
    if (commonMisspellings[lowerWord]) {
        return commonMisspellings[lowerWord];
    }

    // If word is already in vocabulary, return as is
    if (vocabulary.includes(lowerWord)) {
        return lowerWord;
    }

    // Find closest match using Levenshtein distance
    let closestWord = lowerWord;
    let minDistance = Infinity;

    for (const vocabWord of vocabulary) {
        // Skip if length difference is too large
        if (Math.abs(vocabWord.length - lowerWord.length) > maxDistance) {
            continue;
        }

        const distance = levenshteinDistance(lowerWord, vocabWord);
        if (distance < minDistance && distance <= maxDistance) {
            minDistance = distance;
            closestWord = vocabWord;
        }
    }

    return closestWord;
}

// Correct spelling in the entire input text
export function correctSpelling(input: string): string {
    const words = input.toLowerCase().split(/\s+/);

    const correctedWords = words.map(word => {
        // Remove punctuation for matching
        const cleanWord = word.replace(/[^\w]/g, '');

        if (cleanWord.length < 3) {
            return word; // Don't correct very short words
        }

        const corrected = findClosestWord(cleanWord);

        // Log corrections for debugging
        if (corrected !== cleanWord) {
            console.log(`Spell correction: "${cleanWord}" -> "${corrected}"`);
        }

        return corrected;
    });

    return correctedWords.join(' ');
}

// Export for testing
export { levenshteinDistance, findClosestWord };
