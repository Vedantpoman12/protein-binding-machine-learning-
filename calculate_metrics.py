"""
Calculate detailed precision and recall metrics for all models
and save results to JSON for the web application
"""

import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import (
    precision_score, recall_score, f1_score, accuracy_score,
    roc_auc_score, precision_recall_curve, classification_report
)
import warnings
warnings.filterwarnings('ignore')

def load_and_prepare_data():
    df = pd.read_csv('dti_synthetic_dataset.csv')
    
    le = LabelEncoder()
    df['target_family_encoded'] = le.fit_transform(df['target_family'])
    df['assay_type_encoded'] = le.fit_transform(df['assay_type'])
    df['data_source_encoded'] = le.fit_transform(df['data_source'])
    
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
    
    return X, y, df

def train_and_evaluate():
    print("Loading data...")
    X, y, df = load_and_prepare_data()
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'SVM': SVC(probability=True, random_state=42),
        'Neural Network': MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=500, random_state=42)
    }
    
    results = {}
    
    print("\nTraining and evaluating models...")
    for name, model in models.items():
        print(f"  Training {name}...")
        model.fit(X_train_scaled, y_train)
        
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1]
        
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        accuracy = accuracy_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)
        
        results[name] = {
            'accuracy': round(accuracy * 100, 2),
            'precision': round(precision * 100, 2),
            'recall': round(recall * 100, 2),
            'f1_score': round(f1 * 100, 2),
            'roc_auc': round(roc_auc * 100, 2)
        }
        
        print(f"    Accuracy: {accuracy:.2%}, Precision: {precision:.2%}, Recall: {recall:.2%}")
    
    family_stats = []
    for family in df['target_family'].unique():
        family_data = df[df['target_family'] == family]
        binding_data = family_data[family_data['interaction'] == 1]
        family_stats.append({
            'name': family,
            'total_count': len(family_data),
            'binding_count': len(binding_data),
            'binding_rate': round(len(binding_data) / len(family_data) * 100, 2),
            'avg_pKd': round(binding_data['pKd'].mean(), 2) if len(binding_data) > 0 else 0
        })
    
    family_stats = sorted(family_stats, key=lambda x: x['binding_count'], reverse=True)
    
    dataset_stats = {
        'total_samples': len(df),
        'positive_samples': int(df['interaction'].sum()),
        'negative_samples': int(len(df) - df['interaction'].sum()),
        'num_features': X.shape[1],
        'positive_rate': round(df['interaction'].mean() * 100, 2)
    }
    
    all_metrics = {
        'model_metrics': results,
        'protein_families': family_stats,
        'dataset': dataset_stats,
        'best_model': max(results.items(), key=lambda x: x[1]['roc_auc'])[0]
    }
    
    with open('public/project_metrics.json', 'w') as f:
        json.dump(all_metrics, f, indent=2)
    
    print(f"\nMetrics saved to public/project_metrics.json")
    
    generate_precision_recall_chart(models, X_test_scaled, y_test)
    
    return all_metrics

def generate_precision_recall_chart(models, X_test, y_test):
    plt.figure(figsize=(12, 8))
    
    colors = ['#2ecc71', '#3498db', '#9b59b6', '#e74c3c', '#f39c12']
    
    for (name, model), color in zip(models.items(), colors):
        y_prob = model.predict_proba(X_test)[:, 1]
        precision, recall, _ = precision_recall_curve(y_test, y_prob)
        
        avg_precision = np.mean(precision)
        
        plt.plot(recall, precision, label=f'{name} (AP={avg_precision:.3f})', 
                linewidth=2.5, color=color)
    
    plt.xlabel('Recall', fontsize=14)
    plt.ylabel('Precision', fontsize=14)
    plt.title('Precision-Recall Curves - All Models', fontsize=16, fontweight='bold')
    plt.legend(loc='lower left', fontsize=11)
    plt.grid(alpha=0.3)
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    
    plt.annotate('Higher curves = Better performance', 
                xy=(0.5, 0.95), fontsize=10, ha='center',
                bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))
    
    plt.tight_layout()
    plt.savefig('public/images/precision_recall_curves.png', dpi=300, bbox_inches='tight')
    print("Updated: public/images/precision_recall_curves.png")
    plt.close()

def print_summary(metrics):
    print("\n" + "="*70)
    print("PROJECT METRICS SUMMARY")
    print("="*70)
    
    print("\nMODEL PERFORMANCE:")
    print("-"*70)
    print(f"{'Model':<25} {'Accuracy':<12} {'Precision':<12} {'Recall':<12} {'F1':<12}")
    print("-"*70)
    for name, m in metrics['model_metrics'].items():
        print(f"{name:<25} {m['accuracy']:<12} {m['precision']:<12} {m['recall']:<12} {m['f1_score']:<12}")
    
    print(f"\nBest Model: {metrics['best_model']}")
    
    print("\nPROTEIN FAMILIES:")
    print("-"*70)
    for fam in metrics['protein_families']:
        print(f"  {fam['name']}: {fam['binding_count']} bindings ({fam['binding_rate']}%), Avg pKd: {fam['avg_pKd']}")
    
    print("\nDATASET:")
    print("-"*70)
    ds = metrics['dataset']
    print(f"  Total Samples: {ds['total_samples']}")
    print(f"  Positive (Binding): {ds['positive_samples']} ({ds['positive_rate']}%)")
    print(f"  Negative: {ds['negative_samples']}")
    print(f"  Features: {ds['num_features']}")
    
    print("\n" + "="*70)

if __name__ == "__main__":
    metrics = train_and_evaluate()
    print_summary(metrics)
