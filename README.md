# Protein Binding Analysis

A Machine Learning project for analyzing Drug-Target Interaction (DTI) predictions.

## Project Overview

This project implements machine learning models to predict binding affinities between compounds and protein targets. It is trained on a synthetic dataset of compound-target pairs and provides insights into binding relationships.

### Key Features

*   **Machine Learning Models**: predictive models for protein-ligand binding.
*   **Data Analysis**: Insights into binding distributions and key molecular features.
*   **Web Interface**: A simple React-based frontend to view the project entry point.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **UI Components**: shadcn/ui, Tailwind CSS
*   **ML Stack**: Python, scikit-learn, pandas

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/Vedantpoman12/protein-binding-machine-learning-
    ```

2.  Install frontend dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:8080` (or the port shown in your terminal) in your browser.

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
