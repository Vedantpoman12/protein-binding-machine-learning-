"""
Protein-Compound Binding Relationship Analysis
Shows which compounds bind to which protein targets
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Set style
sns.set_style('whitegrid')
plt.rcParams['figure.figsize'] = (14, 10)

def analyze_binding_relationships():
    """Analyze and visualize protein-compound binding relationships"""
    print("="*70)
    print("PROTEIN-COMPOUND BINDING RELATIONSHIP ANALYSIS")
    print("="*70)
    
    # Load data
    df = pd.read_csv('dti_synthetic_dataset.csv')
    
    # Filter for positive binding interactions only
    binding_df = df[df['interaction'] == 1].copy()
    
    print(f"\nTotal interactions in dataset: {len(df)}")
    print(f"Positive binding interactions: {len(binding_df)} ({len(binding_df)/len(df)*100:.1f}%)")
    print(f"Non-binding interactions: {len(df) - len(binding_df)} ({(len(df)-len(binding_df))/len(df)*100:.1f}%)")
    
    # Summary by target family
    print("\n" + "="*70)
    print("BINDING BY PROTEIN FAMILY")
    print("="*70)
    
    family_binding = binding_df.groupby('target_family').agg({
        'compound_id': 'count',
        'pKd': ['mean', 'min', 'max'],
        'assay_confidence': 'mean'
    }).round(3)
    
    family_binding.columns = ['Binding Count', 'Avg pKd', 'Min pKd', 'Max pKd', 'Avg Confidence']
    print(family_binding)
    
    # Top binding targets
    print("\n" + "="*70)
    print("TOP 20 TARGETS WITH MOST BINDING COMPOUNDS")
    print("="*70)
    
    top_targets = binding_df['target_id'].value_counts().head(20)
    for i, (target, count) in enumerate(top_targets.items(), 1):
        family = binding_df[binding_df['target_id'] == target]['target_family'].iloc[0]
        avg_pkd = binding_df[binding_df['target_id'] == target]['pKd'].mean()
        print(f"{i:2d}. {target:12s} ({family:12s}): {count:3d} compounds, Avg pKd: {avg_pkd:.2f}")
    
    # Create detailed binding table
    print("\n" + "="*70)
    print("CREATING DETAILED BINDING RELATIONSHIPS TABLE")
    print("="*70)
    
    binding_table = binding_df[['compound_id', 'target_id', 'target_family', 
                                 'pKd', 'molecular_weight', 'assay_confidence',
                                 'assay_type', 'data_source']].copy()
    
    binding_table = binding_table.sort_values(['target_family', 'target_id', 'pKd'], 
                                               ascending=[True, True, False])
    
    # Save detailed relationships
    binding_table.to_csv('binding_relationships_detailed.csv', index=False)
    print(f"✓ Saved: binding_relationships_detailed.csv ({len(binding_table)} binding pairs)")
    
    # Sample of binding relationships
    print("\n" + "="*70)
    print("SAMPLE BINDING RELATIONSHIPS (First 30)")
    print("="*70)
    print(binding_table.head(30).to_string(index=False))
    
    # Visualization 1: Binding by protein family
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # 1.1 Binding counts by family
    family_counts = binding_df['target_family'].value_counts()
    axes[0, 0].bar(family_counts.index, family_counts.values, 
                   color='steelblue', edgecolor='navy', alpha=0.7)
    axes[0, 0].set_xlabel('Protein Family', fontsize=12, fontweight='bold')
    axes[0, 0].set_ylabel('Number of Binding Interactions', fontsize=12, fontweight='bold')
    axes[0, 0].set_title('Binding Interactions by Protein Family', fontsize=14, fontweight='bold')
    axes[0, 0].tick_params(axis='x', rotation=45)
    axes[0, 0].grid(axis='y', alpha=0.3)
    
    # Add value labels
    for i, v in enumerate(family_counts.values):
        axes[0, 0].text(i, v + 5, str(v), ha='center', fontweight='bold')
    
    # 1.2 pKd distribution by family
    binding_df.boxplot(column='pKd', by='target_family', ax=axes[0, 1])
    axes[0, 1].set_xlabel('Protein Family', fontsize=12, fontweight='bold')
    axes[0, 1].set_ylabel('pKd Value', fontsize=12, fontweight='bold')
    axes[0, 1].set_title('Binding Affinity (pKd) by Protein Family', fontsize=14, fontweight='bold')
    axes[0, 1].get_figure().suptitle('')  # Remove automatic title
    
    # 1.3 Heatmap of binding matrix (top targets)
    # Create binding matrix
    top_20_targets = binding_df['target_id'].value_counts().head(20).index
    top_20_compounds = binding_df[binding_df['target_id'].isin(top_20_targets)].groupby('compound_id')['target_id'].count().nlargest(20).index
    
    # Create pivot table
    matrix_data = binding_df[
        (binding_df['target_id'].isin(top_20_targets)) & 
        (binding_df['compound_id'].isin(top_20_compounds))
    ].copy()
    
    if len(matrix_data) > 0:
        # Use pKd values for the heatmap
        pivot = matrix_data.pivot_table(
            values='pKd', 
            index='compound_id', 
            columns='target_id',
            fill_value=0
        )
        
        sns.heatmap(pivot, cmap='YlOrRd', cbar_kws={'label': 'pKd'}, 
                   ax=axes[1, 0], linewidths=0.5)
        axes[1, 0].set_xlabel('Target ID', fontsize=10, fontweight='bold')
        axes[1, 0].set_ylabel('Compound ID', fontsize=10, fontweight='bold')
        axes[1, 0].set_title('Binding Heatmap\n(Top 20 Targets × Top 20 Compounds)', 
                            fontsize=12, fontweight='bold')
        axes[1, 0].tick_params(axis='both', labelsize=8)
    
    # 1.4 Assay type distribution
    assay_counts = binding_df['assay_type'].value_counts()
    axes[1, 1].pie(assay_counts.values, labels=assay_counts.index, autopct='%1.1f%%',
                   startangle=90, colors=sns.color_palette('Set3'))
    axes[1, 1].set_title('Assay Types for Binding Interactions', 
                        fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('binding_relationships_overview.png', dpi=300, bbox_inches='tight')
    print("\n✓ Saved: binding_relationships_overview.png")
    plt.close()
    
    # Visualization 2: Network-style view
    fig, ax = plt.subplots(figsize=(14, 10))
    
    # Scatter plot showing compounds vs targets colored by family
    target_encoder = {target: i for i, target in enumerate(binding_df['target_id'].unique())}
    compound_encoder = {comp: i for i, comp in enumerate(binding_df['compound_id'].unique())}
    
    binding_df['target_numeric'] = binding_df['target_id'].map(target_encoder)
    binding_df['compound_numeric'] = binding_df['compound_id'].map(compound_encoder)
    
    families = binding_df['target_family'].unique()
    colors = sns.color_palette('husl', len(families))
    family_colors = {family: colors[i] for i, family in enumerate(families)}
    
    for family in families:
        family_data = binding_df[binding_df['target_family'] == family]
        ax.scatter(family_data['target_numeric'], family_data['compound_numeric'],
                  c=[family_colors[family]], label=family, alpha=0.6, s=50, 
                  edgecolors='black', linewidth=0.5)
    
    ax.set_xlabel('Target Index', fontsize=12, fontweight='bold')
    ax.set_ylabel('Compound Index', fontsize=12, fontweight='bold')
    ax.set_title('Compound-Target Binding Map\n(Each point represents a binding interaction)', 
                fontsize=14, fontweight='bold')
    ax.legend(title='Protein Family', loc='best', fontsize=10)
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('binding_network_map.png', dpi=300, bbox_inches='tight')
    print("✓ Saved: binding_network_map.png")
    plt.close()
    
    # Create summary report
    print("\n" + "="*70)
    print("CREATING SUMMARY REPORT")
    print("="*70)
    
    with open('binding_relationships_summary.txt', 'w') as f:
        f.write("="*70 + "\n")
        f.write("PROTEIN-COMPOUND BINDING RELATIONSHIPS SUMMARY\n")
        f.write("="*70 + "\n\n")
        
        f.write("OVERVIEW\n")
        f.write("-"*70 + "\n")
        f.write(f"Total binding interactions: {len(binding_df)}\n")
        f.write(f"Unique compounds that bind: {binding_df['compound_id'].nunique()}\n")
        f.write(f"Unique protein targets: {binding_df['target_id'].nunique()}\n")
        f.write(f"Unique protein families: {binding_df['target_family'].nunique()}\n\n")
        
        f.write("BINDING BY PROTEIN FAMILY\n")
        f.write("-"*70 + "\n")
        f.write(family_binding.to_string())
        f.write("\n\n")
        
        f.write("TOP 20 MOST TARGETED PROTEINS\n")
        f.write("-"*70 + "\n")
        for i, (target, count) in enumerate(top_targets.items(), 1):
            family = binding_df[binding_df['target_id'] == target]['target_family'].iloc[0]
            avg_pkd = binding_df[binding_df['target_id'] == target]['pKd'].mean()
            f.write(f"{i:2d}. {target:12s} ({family:12s}): {count:3d} compounds, Avg pKd: {avg_pkd:.2f}\n")
        
        f.write("\n")
        f.write("="*70 + "\n")
        f.write("INTERPRETATION\n")
        f.write("="*70 + "\n")
        f.write("- Higher pKd values indicate stronger binding affinity\n")
        f.write("- Each row in the detailed CSV shows one compound-target binding pair\n")
        f.write("- Assay confidence ranges from 0 to 1 (higher is more reliable)\n")
        f.write("- Different assay types may have different reliability profiles\n")
    
    print("✓ Saved: binding_relationships_summary.txt")
    
    print("\n" + "="*70)
    print("ANALYSIS COMPLETE!")
    print("="*70)
    print("\nGenerated files:")
    print("  1. binding_relationships_detailed.csv - Complete binding pairs table")
    print("  2. binding_relationships_overview.png - Visual overview of binding patterns")
    print("  3. binding_network_map.png - Compound-target binding network")
    print("  4. binding_relationships_summary.txt - Summary statistics")
    print("\nKey Statistics:")
    print(f"  • {len(binding_df)} total binding interactions")
    print(f"  • {binding_df['compound_id'].nunique()} unique compounds bind to targets")
    print(f"  • {binding_df['target_id'].nunique()} unique protein targets")
    print(f"  • {binding_df['target_family'].nunique()} protein families involved")
    print("="*70 + "\n")

if __name__ == "__main__":
    analyze_binding_relationships()
