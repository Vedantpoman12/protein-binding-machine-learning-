"""
Protein Binding Prediction Tool
Predict if a ligand (compound) binds to a protein target
"""

import pandas as pd
import numpy as np
import pickle
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
import warnings
warnings.filterwarnings('ignore')

class ProteinBindingPredictor:
    """Predict protein-ligand binding interactions"""
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.label_encoders = {}
        
    def train_model(self, data_file='dti_synthetic_dataset.csv'):
        """Train the prediction model"""
        print("="*70)
        print("TRAINING PROTEIN BINDING PREDICTION MODEL")
        print("="*70)
        
        # Load data
        df = pd.read_csv(data_file)
        print(f"\nLoaded {len(df)} samples")
        
        # Encode categorical variables
        print("\nEncoding categorical features...")
        le_family = LabelEncoder()
        le_assay = LabelEncoder()
        le_source = LabelEncoder()
        
        df['target_family_encoded'] = le_family.fit_transform(df['target_family'])
        df['assay_type_encoded'] = le_assay.fit_transform(df['assay_type'])
        df['data_source_encoded'] = le_source.fit_transform(df['data_source'])
        
        # Store encoders
        self.label_encoders['target_family'] = le_family
        self.label_encoders['assay_type'] = le_assay
        self.label_encoders['data_source'] = le_source
        
        # Select features
        molecular_features = ['molecular_weight', 'alogP', 'HBD', 'HBA', 
                             'rotatable_bonds', 'TPSA']
        assay_features = ['assay_pH', 'assay_temp_C', 'assay_confidence', 'pKd']
        fingerprint_features = [f'fp_pc{i}' for i in range(1, 17)]
        protein_features = [f'prot_emb{i}' for i in range(1, 9)]
        encoded_features = ['target_family_encoded', 'assay_type_encoded', 
                           'data_source_encoded']
        
        self.feature_names = (molecular_features + assay_features + 
                             fingerprint_features + protein_features + encoded_features)
        
        X = df[self.feature_names]
        y = df['interaction']
        
        # Split and scale
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train Random Forest (best performing model)
        print("\nTraining Random Forest model...")
        self.model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train_scaled, y_train)
        test_score = self.model.score(X_test_scaled, y_test)
        
        print(f"✓ Model trained successfully!")
        print(f"  Training accuracy: {train_score:.4f}")
        print(f"  Test accuracy: {test_score:.4f}")
        
        # Save model
        self.save_model()
        
        return self
    
    def save_model(self, filename='binding_predictor_model.pkl'):
        """Save the trained model"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'label_encoders': self.label_encoders
        }
        
        with open(filename, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"\n✓ Model saved to: {filename}")
    
    def load_model(self, filename='binding_predictor_model.pkl'):
        """Load a trained model"""
        try:
            with open(filename, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.label_encoders = model_data['label_encoders']
            
            print(f"✓ Model loaded from: {filename}")
            return True
        except FileNotFoundError:
            print(f"✗ Model file not found: {filename}")
            return False
    
    def predict_single(self, features):
        """
        Predict binding for a single compound-target pair
        
        Parameters:
        -----------
        features : dict
            Dictionary containing all required features
        
        Returns:
        --------
        dict with prediction results
        """
        if self.model is None:
            raise ValueError("Model not trained or loaded!")
        
        # Create feature vector
        feature_vector = []
        for feat in self.feature_names:
            if feat in features:
                feature_vector.append(features[feat])
            else:
                # Use median value for missing features
                feature_vector.append(0)
        
        # Scale features
        X = np.array(feature_vector).reshape(1, -1)
        X_scaled = self.scaler.transform(X)
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probability = self.model.predict_proba(X_scaled)[0]
        
        return {
            'binding': bool(prediction),
            'prediction': 'BINDING' if prediction == 1 else 'NO BINDING',
            'confidence': float(probability[1]),
            'probability_no_binding': float(probability[0]),
            'probability_binding': float(probability[1])
        }
    
    def predict_batch(self, input_file, output_file='predictions.csv'):
        """
        Predict binding for multiple compound-target pairs from a file
        
        Parameters:
        -----------
        input_file : str
            CSV file with compound-target features
        output_file : str
            Output file for predictions
        """
        if self.model is None:
            raise ValueError("Model not trained or loaded!")
        
        # Load data
        df = pd.read_csv(input_file)
        print(f"\nPredicting binding for {len(df)} compound-target pairs...")
        
        # Encode categorical features if present
        if 'target_family' in df.columns:
            df['target_family_encoded'] = self.label_encoders['target_family'].transform(df['target_family'])
        if 'assay_type' in df.columns:
            df['assay_type_encoded'] = self.label_encoders['assay_type'].transform(df['assay_type'])
        if 'data_source' in df.columns:
            df['data_source_encoded'] = self.label_encoders['data_source'].transform(df['data_source'])
        
        # Get features
        X = df[self.feature_names]
        X_scaled = self.scaler.transform(X)
        
        # Predict
        predictions = self.model.predict(X_scaled)
        probabilities = self.model.predict_proba(X_scaled)
        
        # Add results to dataframe
        df['predicted_interaction'] = predictions
        df['binding_probability'] = probabilities[:, 1]
        df['prediction_label'] = ['BINDING' if p == 1 else 'NO BINDING' for p in predictions]
        
        # Save
        df.to_csv(output_file, index=False)
        
        print(f"✓ Predictions saved to: {output_file}")
        print(f"\nSummary:")
        print(f"  Predicted BINDING: {sum(predictions)} ({sum(predictions)/len(predictions)*100:.1f}%)")
        print(f"  Predicted NO BINDING: {len(predictions)-sum(predictions)} ({(len(predictions)-sum(predictions))/len(predictions)*100:.1f}%)")
        
        return df

def create_sample_input():
    """Create a sample input file for predictions"""
    # Get some samples from the original dataset
    df = pd.read_csv('dti_synthetic_dataset.csv')
    
    # Take 10 random samples
    sample_df = df.sample(n=10, random_state=42).copy()
    
    # Remove the interaction column (what we want to predict)
    if 'interaction' in sample_df.columns:
        actual_interactions = sample_df['interaction'].values
        sample_df = sample_df.drop('interaction', axis=1)
    
    # Save
    sample_df.to_csv('sample_compounds_for_prediction.csv', index=False)
    
    print("✓ Created sample input file: sample_compounds_for_prediction.csv")
    print(f"  Contains {len(sample_df)} compound-target pairs")
    
    return actual_interactions

def interactive_prediction():
    """Interactive prediction interface"""
    print("\n" + "="*70)
    print("INTERACTIVE PROTEIN BINDING PREDICTION")
    print("="*70)
    
    # Initialize predictor
    predictor = ProteinBindingPredictor()
    
    # Try to load model, or train if not available
    if not predictor.load_model():
        print("\nNo pre-trained model found. Training now...")
        predictor.train_model()
    
    print("\n" + "="*70)
    print("PREDICTION OPTIONS")
    print("="*70)
    print("\n1. Predict from sample file (demo)")
    print("2. Enter custom compound-target features")
    print("3. Train new model")
    
    choice = input("\nSelect option (1-3): ").strip()
    
    if choice == '1':
        # Create and predict on sample
        print("\nCreating sample input file...")
        actual = create_sample_input()
        
        print("\nMaking predictions...")
        results = predictor.predict_batch('sample_compounds_for_prediction.csv')
        
        # Show comparison
        print("\n" + "="*70)
        print("SAMPLE PREDICTIONS VS ACTUAL")
        print("="*70)
        for i in range(min(10, len(results))):
            pred = results.iloc[i]['predicted_interaction']
            prob = results.iloc[i]['binding_probability']
            actual_val = actual[i]
            match = "✓" if pred == actual_val else "✗"
            
            print(f"{i+1:2d}. Predicted: {'BINDING' if pred==1 else 'NO BINDING':12s} "
                  f"(p={prob:.3f}) | Actual: {'BINDING' if actual_val==1 else 'NO BINDING':12s} {match}")
    
    elif choice == '2':
        print("\n" + "="*70)
        print("ENTER COMPOUND-TARGET FEATURES")
        print("="*70)
        print("\nExample values provided in [brackets] - press Enter to use them")
        
        features = {}
        
        # Molecular features
        features['molecular_weight'] = float(input("Molecular weight [400]: ") or 400)
        features['alogP'] = float(input("alogP [2.5]: ") or 2.5)
        features['HBD'] = int(input("H-bond donors [2]: ") or 2)
        features['HBA'] = int(input("H-bond acceptors [5]: ") or 5)
        features['rotatable_bonds'] = int(input("Rotatable bonds [4]: ") or 4)
        features['TPSA'] = float(input("TPSA [100]: ") or 100)
        
        # Assay features
        features['assay_pH'] = float(input("Assay pH [7.4]: ") or 7.4)
        features['assay_temp_C'] = float(input("Assay temp (°C) [25]: ") or 25)
        features['assay_confidence'] = float(input("Assay confidence (0-1) [0.8]: ") or 0.8)
        features['pKd'] = float(input("pKd value [7.5]: ") or 7.5)
        
        # Categorical features with robust matching
        def get_valid_input(prompt, encoder, default):
            valid_options = list(encoder.classes_)
            valid_lower = {opt.lower(): opt for opt in valid_options}
            
            while True:
                user_input = input(f"{prompt} {valid_options} [{default}]: ").strip()
                if not user_input:
                    return encoder.transform([default])[0]
                
                # Try exact match
                if user_input in valid_options:
                    return encoder.transform([user_input])[0]
                
                # Try case-insensitive match
                if user_input.lower() in valid_lower:
                    corrected = valid_lower[user_input.lower()]
                    print(f"  -> Interpreted as '{corrected}'")
                    return encoder.transform([corrected])[0]
                
                print(f"  ❌ Invalid option. Please choose from: {', '.join(valid_options)}")

        features['target_family_encoded'] = get_valid_input(
            "Target family", predictor.label_encoders['target_family'], 'Kinase'
        )
        
        features['assay_type_encoded'] = get_valid_input(
            "Assay type", predictor.label_encoders['assay_type'], 'Binding Assay'
        )
        
        features['data_source_encoded'] = get_valid_input(
            "Data source", predictor.label_encoders['data_source'], 'ChEMBL'
        )
        
        # Fingerprint and protein embeddings (use zeros for simplicity)
        for i in range(1, 17):
            features[f'fp_pc{i}'] = 0.0
        for i in range(1, 9):
            features[f'prot_emb{i}'] = 0.0
        
        # Make prediction
        result = predictor.predict_single(features)
        
        print("\n" + "="*70)
        print("PREDICTION RESULT")
        print("="*70)
        print(f"\n{'='*35}")
        print(f"  {result['prediction']}")
        print(f"{'='*35}")
        print(f"\nConfidence: {result['confidence']:.1%}")
        print(f"\nProbabilities:")
        print(f"  No Binding: {result['probability_no_binding']:.3f} ({result['probability_no_binding']*100:.1f}%)")
        print(f"  Binding:    {result['probability_binding']:.3f} ({result['probability_binding']*100:.1f}%)")
        
        if result['binding']:
            print(f"\n🎯 This compound is predicted to BIND to the target protein!")
            if result['confidence'] > 0.9:
                print("   Very high confidence prediction!")
            elif result['confidence'] > 0.7:
                print("   Good confidence prediction.")
            else:
                print("   Moderate confidence - additional validation recommended.")
        else:
            print(f"\n❌ This compound is predicted NOT to bind to the target protein.")
    
    elif choice == '3':
        print("\nTraining new model...")
        predictor.train_model()
    
    print("\n" + "="*70)

if __name__ == "__main__":
    interactive_prediction()
