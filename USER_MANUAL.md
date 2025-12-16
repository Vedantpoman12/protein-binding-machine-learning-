# User Manual: Protein Binding Analysis & Chatbot

## 1. Introduction
Welcome to the Protein Binding Analysis application. This tool allows researchers and students to explore Drug-Target Interaction (DTI) data using advanced machine learning models and an interactive AI chatbot. The application provides insights into how chemical compounds bind to specific protein targets, which is crucial for drug discovery.

## 2. Using the Chatbot Interface

The core feature of this application is the intelligent chatbot that acts as your guide through the analysis.

### How to Access
1. Launch the application (`npm run dev`).
2. The chatbot interface will appear on the main screen.

### Capabilities
The chatbot is trained to answer questions in the following categories:

*   **Project Overview**: Ask "What is this project?" or "What is the goal?"
*   **Model Performance**: Ask "Which model is the best?", "Show me the accuracy", or "What are the F1 scores?"
*   **Biological Concepts**: Ask for definitions like "What is a Kinase?", "What is a GPCR?", or "What is protein binding?"
*   **Visualizations**: Ask "Show me the confusion matrix", "Display ROC curves", or "Show feature importance."
*   **Dataset Stats**: Ask "How many samples are there?" or "What are the protein families?"

### Example Queries
Try these exact phrases to see the chatbot in action:
*   "Show me binding relationships"
*   "What is the accuracy of the Random Forest model?"
*   "Explain what an Ion Channel is."
*   "Show me the feature importance chart."

### Interactive Features
*   **Charts & Images**: When you ask for visualizations, the chatbot will render them directly in the chat. You can click on these images to view them in full size (if implemented) or simply view them inline.
*   **Typing Indicators**: The bot shows a typing animation to indicate it is processing your request.

## 3. Running Machine Learning Analysis

If you wish to regenerate the analysis or retrain the models, you can use the provided Python scripts.

### Prerequisites
Ensure you have Python installed with the necessary libraries:
```bash
pip install pandas scikit-learn numpy matplotlib seaborn
```

### Steps to Run Analysis
1.  Navigate to the project root directory in your terminal.
2.  Run the main analysis script:
    ```bash
    python src/protein_binding_analysis.py
    ```
    *(Note: Adjust the path if the script is in the root or `src` folder based on your file structure)*

3.  **Outputs**:
    The script will generate several files in your directory:
    *   `protein_binding_report.txt`: A detailed text summary.
    *   `ANALYSIS_SUMMARY.md`: A markdown summary.
    *   `model_comparison.png`, `roc_curves.png`, etc.: Visualization images.
    *   `binding_predictor_model.pkl`: The saved trained model.

## 4. Making New Predictions

You can use the trained model to predict binding for new compounds.

1.  Prepare a CSV file with your compound features (must match the training features).
2.  Run the prediction script (example usage):
    ```bash
    python predict_binding.py
    ```
3.  The script will output predictions (Bind/No Bind) and save them to `predictions.csv`.

## 5. Troubleshooting

*   **"npm command not found"**: Ensure Node.js is installed and added to your system PATH.
*   **Chatbot not responding**: Check the browser console (F12) for potential errors. The chatbot logic is client-side, so no backend server is required for the chat itself aside from the Vite dev server.
*   **Images not loading**: Ensure the visualization images exist in the `public/images` folder. If you re-ran the python script, move the generated images to `public/images`.
