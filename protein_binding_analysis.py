"""
Protein Binding Prediction Analysis
Predicts drug-target interactions using machine learning
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    classification_report, confusion_matrix, 
    roc_auc_score, roc_curve, accuracy_score,
    precision_recall_curve, f1_score
)
import warnings
warnings.filterwarnings('ignore')

# Set style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (12, 8)

def load_and_prepare_data(filepath):
    """Load and prepare the dataset"""
    print("="*70)
    print("LOADING DATASET")
    print("="*70)
    
    df = pd.read_csv(filepath)
    print(f"Dataset shape: {df.shape}")
    print(f"\nFirst few rows:")
    print(df.head())
    
    print(f"\nDataset Info:")
    print(df.info())
    
    print(f"\nMissing Values:")
    print(df.isnull().sum().sum(), "total missing values")
    
    print(f"\nTarget Distribution:")
    print(df['interaction'].value_counts())
    print(f"Positive rate: {df['interaction'].mean():.2%}")
    
    return df

def feature_engineering(df):
    """Prepare features for modeling"""
    print("\n" + "="*70)
    print("FEATURE ENGINEERING")
    print("="*70)
    
    # Encode categorical variables
    le = LabelEncoder()
    df['target_family_encoded'] = le.fit_transform(df['target_family'])
    df['assay_type_encoded'] = le.fit_transform(df['assay_type'])
    df['data_source_encoded'] = le.fit_transform(df['data_source'])
    
    # Select features for modeling
    molecular_features = ['molecular_weight', 'alogP', 'HBD', 'HBA', 
                         'rotatable_bonds', 'TPSA']
    
    assay_features = ['assay_pH', 'assay_temp_C', 'assay_confidence', 'pKd']
    
    fingerprint_features = [f'fp_pc{i}' for i in range(1, 17)]
    
    protein_features = [f'prot_emb{i}' for i in range(1, 9)]
    
    encoded_features = ['target_family_encoded', 'assay_type_encoded', 
                       'data_source_encoded']
    
    all_features = (molecular_features + assay_features + 
                   fingerprint_features + protein_features + encoded_features)
    
    X = df[all_features]
    y = df['interaction']
    
    print(f"Number of features: {len(all_features)}")
    print(f"Features: {', '.join(all_features[:10])}...")
    print(f"\nFeature groups:")
    print(f"  - Molecular features: {len(molecular_features)}")
    print(f"  - Assay features: {len(assay_features)}")
    print(f"  - Fingerprint features: {len(fingerprint_features)}")
    print(f"  - Protein embeddings: {len(protein_features)}")
    print(f"  - Encoded features: {len(encoded_features)}")
    
    return X, y, all_features

def train_models(X_train, X_test, y_train, y_test):
    """Train multiple models and compare performance"""
    print("\n" + "="*70)
    print("MODEL TRAINING")
    print("="*70)
    
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'SVM': SVC(probability=True, random_state=42),
        'Neural Network': MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=500, random_state=42)
    }
    
    results = {}
    predictions = {}
    probabilities = {}
    
    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)
        
        results[name] = {
            'accuracy': accuracy,
            'f1_score': f1,
            'roc_auc': roc_auc
        }
        
        predictions[name] = y_pred
        probabilities[name] = y_prob
        
        print(f"  Accuracy: {accuracy:.4f}")
        print(f"  F1 Score: {f1:.4f}")
        print(f"  ROC-AUC: {roc_auc:.4f}")
    
    return models, results, predictions, probabilities

def visualize_results(results, predictions, probabilities, y_test, models, X_train, feature_names):
    """Create comprehensive visualizations"""
    print("\n" + "="*70)
    print("GENERATING VISUALIZATIONS")
    print("="*70)
    
    # 1. Model Comparison
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    model_names = list(results.keys())
    metrics = ['accuracy', 'f1_score', 'roc_auc']
    metric_labels = ['Accuracy', 'F1 Score', 'ROC-AUC']
    
    for idx, (metric, label) in enumerate(zip(metrics, metric_labels)):
        values = [results[name][metric] for name in model_names]
        axes[idx].bar(model_names, values, color='skyblue', edgecolor='navy', alpha=0.7)
        axes[idx].set_ylabel(label, fontsize=12)
        axes[idx].set_title(f'{label} Comparison', fontsize=14, fontweight='bold')
        axes[idx].set_ylim([0, 1])
        axes[idx].tick_params(axis='x', rotation=45)
        axes[idx].grid(axis='y', alpha=0.3)
        
        # Add value labels
        for i, v in enumerate(values):
            axes[idx].text(i, v + 0.02, f'{v:.3f}', ha='center', fontsize=10)
    
    plt.tight_layout()
    plt.savefig('model_comparison.png', dpi=300, bbox_inches='tight')
    print("Saved: model_comparison.png")
    plt.close()
    
    # 2. ROC Curves
    plt.figure(figsize=(10, 8))
    
    for name in model_names:
        fpr, tpr, _ = roc_curve(y_test, probabilities[name])
        auc = results[name]['roc_auc']
        plt.plot(fpr, tpr, label=f'{name} (AUC = {auc:.3f})', linewidth=2)
    
    plt.plot([0, 1], [0, 1], 'k--', label='Random Classifier', linewidth=2)
    plt.xlabel('False Positive Rate', fontsize=12)
    plt.ylabel('True Positive Rate', fontsize=12)
    plt.title('ROC Curves - Protein Binding Prediction', fontsize=14, fontweight='bold')
    plt.legend(loc='lower right', fontsize=10)
    plt.grid(alpha=0.3)
    plt.savefig('roc_curves.png', dpi=300, bbox_inches='tight')
    print("Saved: roc_curves.png")
    plt.close()
    
    # 3. Confusion Matrices
    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    axes = axes.flatten()
    
    for idx, name in enumerate(model_names):
        cm = confusion_matrix(y_test, predictions[name])
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   ax=axes[idx], cbar=True,
                   xticklabels=['No Binding', 'Binding'],
                   yticklabels=['No Binding', 'Binding'])
        axes[idx].set_title(f'{name}', fontsize=12, fontweight='bold')
        axes[idx].set_ylabel('True Label', fontsize=10)
        axes[idx].set_xlabel('Predicted Label', fontsize=10)
    
    # Hide extra subplot
    axes[5].axis('off')
    
    plt.tight_layout()
    plt.savefig('confusion_matrices.png', dpi=300, bbox_inches='tight')
    print("Saved: confusion_matrices.png")
    plt.close()
    
    # 4. Feature Importance (Random Forest)
    rf_model = models['Random Forest']
    feature_importance = pd.DataFrame({
        'feature': feature_names,
        'importance': rf_model.feature_importances_
    }).sort_values('importance', ascending=False).head(20)
    
    plt.figure(figsize=(12, 8))
    plt.barh(range(len(feature_importance)), feature_importance['importance'],
             color='coral', edgecolor='darkred', alpha=0.7)
    plt.yticks(range(len(feature_importance)), feature_importance['feature'])
    plt.xlabel('Importance', fontsize=12)
    plt.title('Top 20 Feature Importance - Random Forest', fontsize=14, fontweight='bold')
    plt.gca().invert_yaxis()
    plt.grid(axis='x', alpha=0.3)
    plt.tight_layout()
    plt.savefig('feature_importance.png', dpi=300, bbox_inches='tight')
    print("Saved: feature_importance.png")
    plt.close()
    
    # 5. Precision-Recall Curves
    plt.figure(figsize=(10, 8))
    
    for name in model_names:
        precision, recall, _ = precision_recall_curve(y_test, probabilities[name])
        plt.plot(recall, precision, label=name, linewidth=2)
    
    plt.xlabel('Recall', fontsize=12)
    plt.ylabel('Precision', fontsize=12)
    plt.title('Precision-Recall Curves', fontsize=14, fontweight='bold')
    plt.legend(loc='lower left', fontsize=10)
    plt.grid(alpha=0.3)
    plt.savefig('precision_recall_curves.png', dpi=300, bbox_inches='tight')
    print("Saved: precision_recall_curves.png")
    plt.close()

def generate_report(results, y_test, predictions, df):
    """Generate a detailed text report"""
    print("\n" + "="*70)
    print("GENERATING REPORT")
    print("="*70)
    
    with open('protein_binding_report.txt', 'w') as f:
        f.write("="*70 + "\n")
        f.write("PROTEIN BINDING PREDICTION ANALYSIS REPORT\n")
        f.write("="*70 + "\n\n")
        
        f.write("DATASET SUMMARY\n")
        f.write("-"*70 + "\n")
        f.write(f"Total samples: {len(df)}\n")
        f.write(f"Features: {df.shape[1] - 1}\n")
        f.write(f"Positive samples (binding): {df['interaction'].sum()}\n")
        f.write(f"Negative samples (no binding): {len(df) - df['interaction'].sum()}\n")
        f.write(f"Positive rate: {df['interaction'].mean():.2%}\n\n")
        
        f.write("TARGET FAMILIES\n")
        f.write("-"*70 + "\n")
        for family, count in df['target_family'].value_counts().items():
            f.write(f"{family}: {count} ({count/len(df)*100:.1f}%)\n")
        f.write("\n")
        
        f.write("MODEL PERFORMANCE COMPARISON\n")
        f.write("-"*70 + "\n")
        f.write(f"{'Model':<25} {'Accuracy':<12} {'F1 Score':<12} {'ROC-AUC':<12}\n")
        f.write("-"*70 + "\n")
        
        for name, metrics in results.items():
            f.write(f"{name:<25} {metrics['accuracy']:<12.4f} "
                   f"{metrics['f1_score']:<12.4f} {metrics['roc_auc']:<12.4f}\n")
        
        f.write("\n" + "="*70 + "\n")
        f.write("DETAILED CLASSIFICATION REPORTS\n")
        f.write("="*70 + "\n\n")
        
        for name, y_pred in predictions.items():
            f.write(f"\n{name}\n")
            f.write("-"*70 + "\n")
            f.write(classification_report(y_test, y_pred, 
                                         target_names=['No Binding', 'Binding']))
            f.write("\n")
        
        # Best model
        best_model = max(results.items(), key=lambda x: x[1]['roc_auc'])
        f.write("\n" + "="*70 + "\n")
        f.write(f"BEST MODEL: {best_model[0]}\n")
        f.write("="*70 + "\n")
        f.write(f"Accuracy: {best_model[1]['accuracy']:.4f}\n")
        f.write(f"F1 Score: {best_model[1]['f1_score']:.4f}\n")
        f.write(f"ROC-AUC: {best_model[1]['roc_auc']:.4f}\n")
    
    print("Saved: protein_binding_report.txt")

def main():
    """Main execution function"""
    print("\n" + "="*70)
    print("PROTEIN BINDING PREDICTION ANALYSIS")
    print("Drug-Target Interaction (DTI) Modeling")
    print("="*70 + "\n")
    
    # Load data
    df = load_and_prepare_data('dti_synthetic_dataset.csv')
    
    # Feature engineering
    X, y, feature_names = feature_engineering(df)
    
    # Split data
    print("\n" + "="*70)
    print("DATA SPLITTING")
    print("="*70)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Training set: {len(X_train)} samples")
    print(f"Test set: {len(X_test)} samples")
    
    # Scale features
    print("\nScaling features...")
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    # Train models
    models, results, predictions, probabilities = train_models(
        X_train, X_test, y_train, y_test
    )
    
    # Visualize results
    visualize_results(results, predictions, probabilities, y_test, 
                     models, X_train, feature_names)
    
    # Generate report
    generate_report(results, y_test, predictions, df)
    
    # Summary
    print("\n" + "="*70)
    print("ANALYSIS COMPLETE!")
    print("="*70)
    print("\nGenerated files:")
    print("  1. model_comparison.png - Model performance comparison")
    print("  2. roc_curves.png - ROC curves for all models")
    print("  3. confusion_matrices.png - Confusion matrices")
    print("  4. feature_importance.png - Top 20 important features")
    print("  5. precision_recall_curves.png - Precision-recall curves")
    print("  6. protein_binding_report.txt - Detailed analysis report")
    
    # Best model
    best_model_name = max(results.items(), key=lambda x: x[1]['roc_auc'])[0]
    best_auc = results[best_model_name]['roc_auc']
    print(f"\nBest Model: {best_model_name} (ROC-AUC: {best_auc:.4f})")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
