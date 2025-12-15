export interface AnalysisData {
    bestModels: {
        names: string[];
        accuracy: string;
        f1: string;
        roc_auc: string;
    };
    otherModels: {
        name: string;
        accuracy: string;
        f1: string;
        roc_auc: string;
    }[];
    dataset: {
        total: number;
        positive: number;
        negative: number;
        features: number;
    };
    bindingStats?: {
        families: { name: string; count: number; avgPkd: string }[];
        topTargets: { name: string; family: string; count: number }[];
    };
}

export const parseAnalysisSummary = (text: string): AnalysisData => {
    const data: AnalysisData = {
        bestModels: { names: [], accuracy: "", f1: "", roc_auc: "" },
        otherModels: [],
        dataset: { total: 0, positive: 0, negative: 0, features: 0 },
        bindingStats: { families: [], topTargets: [] }
    };

    // Extract Dataset Info
    const totalMatch = text.match(/Total Samples\*\*: ([\d,]+)/);
    if (totalMatch) data.dataset.total = parseInt(totalMatch[1].replace(/,/g, ""));

    const positiveMatch = text.match(/Positive Samples\*\*: (\d+)/);
    if (positiveMatch) data.dataset.positive = parseInt(positiveMatch[1]);

    const negativeMatch = text.match(/Negative Samples\*\*: (\d+)/);
    if (negativeMatch) data.dataset.negative = parseInt(negativeMatch[1]);

    const featuresMatch = text.match(/Features\*\*: (\d+)/);
    if (featuresMatch) data.dataset.features = parseInt(featuresMatch[1]);

    // Extract Best Models
    const bestModelSection = text.match(/Best Models: (.*)/);
    if (bestModelSection) {
        // "Random Forest & Gradient Boosting" -> ["Random Forest", "Gradient Boosting"]
        data.bestModels.names = bestModelSection[1].split("&").map(s => s.trim());
    }

    // Extract Best Model Metrics
    // Looking for the section immediately following "Best Models"
    const bestMetricsSection = text.split("### Best Models")[1]?.split("### Other Models")[0];
    if (bestMetricsSection) {
        const acc = bestMetricsSection.match(/Accuracy\*\*: ([\d.]+%)/);
        if (acc) data.bestModels.accuracy = acc[1];

        const f1 = bestMetricsSection.match(/F1 Score\*\*: ([\d.]+%)/);
        if (f1) data.bestModels.f1 = f1[1];

        const roc = bestMetricsSection.match(/ROC-AUC\*\*: ([\d.]+%)/);
        if (roc) data.bestModels.roc_auc = roc[1];
    }

    // Extract Other Models
    // This is a bit more complex, iterating through the "Other Models Performance" section
    const otherModelsSection = text.split("### Other Models Performance")[1]?.split("## Generated Outputs")[0];
    if (otherModelsSection) {
        const models = otherModelsSection.split(/\d+\. \*\*/).slice(1); // Split by numbered list "1. **"

        models.forEach(modelBlock => {
            const nameMatch = modelBlock.match(/(.*?)\*\*/);
            const name = nameMatch ? nameMatch[1] : "Unknown";

            const acc = modelBlock.match(/Accuracy: ([\d.]+%)/);
            const f1 = modelBlock.match(/F1 Score: ([\d.]+%)/);
            const roc = modelBlock.match(/ROC-AUC: ([\d.]+%)/);

            if (name && acc && f1 && roc) {
                data.otherModels.push({
                    name: name,
                    accuracy: acc[1],
                    f1: f1[1],
                    roc_auc: roc[1]
                });
            }
        });
    }

    return data;
};
