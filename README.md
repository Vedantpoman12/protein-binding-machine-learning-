# Protein Binding Analysis & Chatbot

A comprehensive Machine Learning project for analyzing Drug-Target Interaction (DTI) predictions, featuring an interactive AI chatbot for data exploration.

## Project Overview

This project implements machine learning models to predict binding affinities between compounds and protein targets. It combines a robust Python backend for ML analysis with a modern React frontend that allows users to interact with the data through a natural language interface.

### Key Features

*   **Interactive AI Chatbot**: Ask questions about the analysis, models, and biological concepts (e.g., "What is the best model?", "Explain Kinase families").
*   **Machine Learning Models**: Predictive models for protein-ligand binding (Random Forest, Gradient Boosting, SVM, etc.).
*   **Data Visualization**: Dynamic generation of charts including ROC curves, Confusion Matrices, and Feature Importance.
*   **Educational Content**: Built-in definitions for key biological terms like GPCRs, Ion Channels, and binding affinity metrics.
*   **Web Interface**: A sleek, modern user interface built with React, Tailwind CSS, and shadcn/ui.

## Tech Stack

*   **Frontend**: React, TypeScript, Vite
*   **Styling**: Tailwind CSS, shadcn/ui, Lucide Icons
*   **ML Stack**: Python, scikit-learn, pandas, numpy
*   **Analysis**: Python scripts for training and generating insights

## Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (v3.8+)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Vedantpoman12/protein-binding-machine-learning-
    cd protein-binding-machine-learning-
    ```

2.  Install frontend dependencies:
    ```bash
    npm install
    ```

3.  (Optional) Install Python dependencies for analysis:
    ```bash
    pip install pandas scikit-learn numpy matplotlib
    ```

### Running the Application

1.  Start the development server:
    ```bash
    npm run dev
    ```

2.  Open the link shown in your terminal (usually `http://localhost:5173`) in your browser.

## Dataset Info

The analysis is based on a synthetic dataset designed to mimic real-world DTI scenarios:
*   **1000** Total Samples
*   **484** Positive Binding Interactions
*   **516** Negative Interactions
*   **42** Molecular Features
*   **Target Families**: Kinase, GPCR, Enzyme, Ion Channel, Transporter

## Models Evaluated

*   **Random Forest** (Best Performer - 100% Accuracy)
*   **Gradient Boosting** (Best Performer - 100% Accuracy)
*   Logistic Regression
*   Support Vector Machine (SVM)
*   Neural Network

## User Manual

For detailed instructions on how to use the chatbot and run the analysis scripts, please refer to the [USER_MANUAL.md](./USER_MANUAL.md) file.
