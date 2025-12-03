# Protein Binding Bot

A Machine Learning-powered chatbot for analyzing Drug-Target Interaction (DTI) predictions.

## Project Overview

This project implements an intelligent chatbot that allows users to query the results of a protein binding analysis. The bot is trained on a dataset of 1000 compound-target pairs and uses machine learning models to predict binding affinities.

### Key Features

*   **Analysis Insights**: Ask about F1 scores, accuracy, and best performing models.
*   **Binding Relationships**: Query detailed information about protein families (Kinases, GPCRs, etc.) and top targets.
*   **Dynamic Knowledge**: The bot's knowledge base is built from comprehensive analysis summaries.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **UI Components**: shadcn/ui, Tailwind CSS
*   **Icons**: Lucide React

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/Vedantpoman12/protein-binding-machine-learning-
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:3000` in your browser.

## Dataset Info

The analysis is based on a synthetic dataset containing:
*   **1000** Total Samples
*   **484** Positive Binding Interactions
*   **516** Negative Interactions
*   **42** Molecular Features

## Models Evaluated

*   Random Forest (Best Performer)
*   Gradient Boosting (Best Performer)
*   Logistic Regression
*   Support Vector Machine (SVM)
*   Neural Network
