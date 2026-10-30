import re

file_path = 'e:/Research/backend/app/services/domain_architectures.py'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Mobility diagram replacement
old_mob_diag = """        diag_source = f\"\"\"flowchart TD
  classDef ing fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0f172a;
  classDef prep fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#0f172a;
  classDef core fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#0f172a;
  classDef v2x fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a;
  classDef db fill:#fdf4ff,stroke:#ec4899,stroke-width:2px,color:#0f172a;
  classDef api fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#0f172a;

  subgraph Stage1["1. Telematics & Incident Ingestion"]
    A["Real-Time GPS & CAD Stream"]:::ing --> B["Spatial Validation & Message Broker"]:::ing
  end

  subgraph Stage2["2. Spatio-Temporal Graph Engine"]
    B --> C["Dynamic Road Topology (OSM)"]:::prep
    C --> D["Live Traffic & Congestion Cost Mapper"]:::prep
  end

  subgraph Stage3["3. Route Optimization Core"]
    D --> E["{primary_algo[:32]} Engine"]:::core
    E --> F["Multi-Agent Dispatch & Re-routing Solver"]:::core
  end

  subgraph Stage4["4. Infrastructure & V2X Integration"]
    F --> G["Traffic Signal Green-Wave Preemption"]:::v2x
    G --> H["Municipal V2I Controller Gateway"]:::v2x
  end

  subgraph Stage5["5. Spatial Persistence & Cache"]
    C -.-> I[("PostGIS Dynamic Road Graph")]:::db
    E -.-> J[("TimescaleDB Trajectory Store & Redis Cache")]:::db
  end

  subgraph Stage6["6. Operations & Navigation Client"]
    H --> K["Emergency Operations Dispatch API"]:::api
    K --> L["Mobile In-Ambulance Navigation HUD"]:::api
  end

  J -.-> K\"\"\""""

new_mob_diag = """        algo1_clean = re.sub(r"\s*[\(\[\{].*", "", primary_algo).strip() or "Dynamic Spatio-Temporal Graph Neural Network"
        algo2_clean = re.sub(r"\s*[\(\[\{].*", "", secondary_algo).strip() or "Hierarchical Multi-Agent Reinforcement Learning"

        diag_source = f\"\"\"flowchart TD
  classDef ing fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
  classDef prep fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
  classDef core fill:#2e1065,stroke:#c084fc,stroke-width:2px,color:#f8fafc;
  classDef v2x fill:#312e81,stroke:#a78bfa,stroke-width:2px,color:#f8fafc;
  classDef output fill:#022c22,stroke:#34d399,stroke-width:2px,color:#f8fafc;

  subgraph Stage1["1. Telematics & Incident Ingestion Flow"]
    A["Real-Time GPS Vehicle Streams (10 Hz)"]:::ing --> B["Emergency CAD Incident Stream"]:::ing
    B --> C["Municipal Traffic Congestion Feeds"]:::ing
  end

  subgraph Stage2["2. Dynamic Road Graph & Spatial Preprocessing Flow"]
    C --> D["Topological OpenStreetMap Road Network G(V, E)"]:::prep
    D --> E["Dynamic Edge Travel Time & Congestion Weighting Engine"]:::prep
  end

  subgraph Stage3["3. Deep Neural Routing & Optimization Architecture"]
    E --> F["{algo1_clean[:38]} Engine"]:::core
    F --> G["{algo2_clean[:38]} Solver"]:::core
  end

  subgraph Stage4["4. Infrastructure & V2X Coordination Flow"]
    G --> H["Traffic Signal Preemption Coordinator (Green-Wave)"]:::v2x
    H --> I["Vehicle Load & Fleet Carbon Emission Minimizer"]:::v2x
  end

  subgraph Stage5["5. Optimal Emergency Route & Turn-by-Turn Navigation Output"]
    I --> J["Optimal Time-Critical Emergency Path Trajectory"]:::output
    J --> K["Turn-by-Turn Navigation Dispatch & Real-Time ETA"]:::output
  end\"\"\""""

if old_mob_diag in content:
    content = content.replace(old_mob_diag, new_mob_diag)
    print("Replaced Mobility diagram.")
else:
    print("Mobility diagram NOT found.")

# 2. Agriculture diagram replacement
old_agri_diag = """        diag_source = f\"\"\"flowchart TD
  classDef ing fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0f172a;
  classDef prep fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#0f172a;
  classDef core fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#0f172a;
  classDef eval fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a;
  classDef db fill:#fdf4ff,stroke:#ec4899,stroke-width:2px,color:#0f172a;
  classDef api fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#0f172a;

  subgraph Stage1["1. Multispectral & Field Sensor Ingestion"]
    A["Drone Surveys & Smartphone Leaf Images"]:::ing --> B["Radiometric Calibration & Spatial Tagger"]:::ing
  end

  subgraph Stage2["2. Canopy & Lesion Segmentation"]
    B --> C["Canopy Isolation & Soil Masking (SAM)"]:::prep
    C --> D["Lesion Chromaticity & NDVI Indexing"]:::prep
  end

  subgraph Stage3["3. Pathogen Diagnostic Core"]
    D --> E["{primary_algo[:32]} Engine"]:::core
    E --> F["Severity Grading & Multi-Pathogen Classifier"]:::core
  end

  subgraph Stage4["4. Epidemiological Forecasting"]
    F --> G["Microclimate Spore Dispersal Simulator"]:::eval
    G --> H["7-Day Outbreak Risk & Treatment Engine"]:::eval
  end

  subgraph Stage5["5. Agro-Spatial Persistence"]
    C -.-> I[("PostGIS Field Parcels & Foliar Vectors")]:::db
    E -.-> J[("TimescaleDB Weather Logs & Model Checkpoints")]:::db
  end

  subgraph Stage6["6. Advisory API & Scout Console"]
    H --> K["Agronomist Decision Support API"]:::api
    K --> L["Mobile Field Scout App & Spatial Heatmaps"]:::api
  end

  J -.-> K\"\"\""""

new_agri_diag = """        algo1_clean = re.sub(r"\s*[\(\[\{].*", "", primary_algo).strip() or "Vision Transformer & Foliar CNN"
        algo2_clean = re.sub(r"\s*[\(\[\{].*", "", secondary_algo).strip() or "Multi-Scale Lesion Severity Classifier"

        diag_source = f\"\"\"flowchart TD
  classDef ing fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
  classDef prep fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
  classDef core fill:#2e1065,stroke:#c084fc,stroke-width:2px,color:#f8fafc;
  classDef eval fill:#312e81,stroke:#a78bfa,stroke-width:2px,color:#f8fafc;
  classDef output fill:#022c22,stroke:#34d399,stroke-width:2px,color:#f8fafc;

  subgraph Stage1["1. Foliar Imagery & Weather Ingestion Flow"]
    A["Raw Drone & Handheld Plant Foliar Photos"]:::ing --> B["Radiometric Calibration & Spatial Tagger"]:::ing
    B --> C["Microclimate & Ambient Weather Telemetry Stream"]:::ing
  end

  subgraph Stage2["2. Canopy & Lesion Segmentation Flow"]
    C --> D["Canopy Isolation & Soil Masking"]:::prep
    D --> E["Lesion Chromaticity & Multi-Scale Patch Formatter"]:::prep
  end

  subgraph Stage3["3. Deep Neural Pathology Architecture"]
    E --> F["{algo1_clean[:38]} Core"]:::core
    F --> G["Spatial Self-Attention Lesion Feature Maps"]:::core
  end

  subgraph Stage4["4. Epidemiological Outbreak Forecasting Flow"]
    G --> H["{algo2_clean[:38]} Engine"]:::eval
    H --> I["Microclimate Spore Dispersal & Outbreak Risk Correlator"]:::eval
  end

  subgraph Stage5["5. Pathology Diagnosis & Agronomic Advisory Output"]
    I --> J["Identified Pathogen Strain & Severity Grade"]:::output
    J --> K["Crop Diagnostic Verdict & Actionable Treatment Advisory"]:::output
  end\"\"\""""

if old_agri_diag in content:
    content = content.replace(old_agri_diag, new_agri_diag)
    print("Replaced Agriculture diagram.")
else:
    print("Agriculture diagram NOT found.")

# 3. NLP diagram replacement
old_nlp_diag = """        diagram_source = f\"\"\"flowchart TD
  classDef ing fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0f172a;
  classDef prep fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#0f172a;
  classDef core fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#0f172a;
  classDef eval fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a;
  classDef db fill:#fdf4ff,stroke:#ec4899,stroke-width:2px,color:#0f172a;
  classDef api fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#0f172a;

  subgraph Stage1["1. Text Ingestion & Parsing"]
    A["Raw Emails, Messages & Text Payloads"]:::ing --> B["MIME Parser & Content Cleaner"]:::ing
  end

  subgraph Stage2["2. Tokenization & Feature Engineering"]
    B --> C["Subword BPE Tokenizer & Mask Formatter"]:::prep
    C --> D["Stylometric Feature & N-Gram Extractor"]:::prep
  end

  subgraph Stage3["3. Deep Learning Classification Core"]
    D --> E["{primary_algo[:30]} Backbone"]:::core
    E --> F["Multi-Head Classification Head"]:::core
  end

  subgraph Stage4["4. Adversarial Filtering & Uncertainty"]
    F --> G["{secondary_algo[:30]} Calibrator"]:::eval
    G --> H["Adversarial Evasion & Decision Rule Engine"]:::eval
  end

  subgraph Stage5["5. Corpus & Vector Persistence"]
    C -.-> I[("PostgreSQL Metadata & Audit Logs")]:::db
    E -.-> J[("pgvector Embeddings & Chroma Store")]:::db
  end

  subgraph Stage6["6. Insights API & Review Dashboard"]
    H --> K["Inference API Gateway"]:::api
    K --> L["Interactive Review & Metric Dashboard"]:::api
  end

  J -.-> K\"\"\""""

new_nlp_diag = """        algo1_clean = re.sub(r"\s*[\(\[\{].*", "", primary_algo).strip() or "Transformer Attention Classifier"
        algo2_clean = re.sub(r"\s*[\(\[\{].*", "", secondary_algo).strip() or "Adversarial Concept Drift Regularizer"
        if "multimodal" in algo2_clean.lower() or "fusion" in algo2_clean.lower():
            algo2_clean = "Adversarial Concept Drift Regularizer"

        diagram_source = f\"\"\"flowchart TD
  classDef ing fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
  classDef prep fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
  classDef core fill:#2e1065,stroke:#c084fc,stroke-width:2px,color:#f8fafc;
  classDef eval fill:#312e81,stroke:#a78bfa,stroke-width:2px,color:#f8fafc;
  classDef output fill:#022c22,stroke:#34d399,stroke-width:2px,color:#f8fafc;

  subgraph Stage1["1. Text Ingestion & Parsing Flow"]
    A["Raw Message & Email Payloads"]:::ing --> B["MIME Header & Metadata Decoder"]:::ing
    B --> C["HTML & Obfuscated Character Cleaner"]:::ing
  end

  subgraph Stage2["2. Tokenization & Feature Engineering Flow"]
    C --> D["Subword BPE Tokenizer & Mask Formatter"]:::prep
    D --> E["Stylometric & Lexical N-Gram Extractor"]:::prep
  end

  subgraph Stage3["3. Core Neural Representation Architecture"]
    E --> F["{algo1_clean[:38]} Backbone"]:::core
    F --> G["Contextual Hidden States & Latent Pooling"]:::core
  end

  subgraph Stage4["4. Adversarial Robustness & Calibration Flow"]
    G --> H["{algo2_clean[:38]}"]:::eval
    H --> I["Epistemic Uncertainty Estimator"]:::eval
  end

  subgraph Stage5["5. Final Classification & Decision Output"]
    I --> J["Multi-Head Classification Projection Layer"]:::output
    J --> K["Spam vs. Ham Verdict with Confidence Metrics"]:::output
  end\"\"\""""

if old_nlp_diag in content:
    content = content.replace(old_nlp_diag, new_nlp_diag)
    print("Replaced NLP diagram.")
else:
    print("NLP diagram NOT found.")

# 4. Universal diagram replacement
old_uni_diag = """        diagram_source = f\"\"\"flowchart TD
  classDef ing fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0f172a;
  classDef prep fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#0f172a;
  classDef core fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#0f172a;
  classDef eval fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a;
  classDef db fill:#fdf4ff,stroke:#ec4899,stroke-width:2px,color:#0f172a;
  classDef api fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#0f172a;

  subgraph Stage1["1. Experimental Data Ingestion"]
    A["Raw Datasets & Telemetry Streams"]:::ing --> B["Schema Validator & Provenance Tagger"]:::ing
  end

  subgraph Stage2["2. Preprocessing & Normalization"]
    B --> C["Outlier Cleanser & Statistical Scaler"]:::prep
    C --> D["Feature Extractor & Tensor Formatter"]:::prep
  end

  subgraph Stage3["3. Computational Modeling Core"]
    D --> E["{primary_algo[:30]} Backbone"]:::core
    E --> F["Latent State Representation Engine"]:::core
  end

  subgraph Stage4["4. Empirical Verification & Calibration"]
    F --> G["{secondary_algo[:30]} Module"]:::eval
    G --> H["Statistical Boundary Validator"]:::eval
  end

  subgraph Stage5["5. Experiment Persistence & Storage"]
    C -.-> I[("PostgreSQL Experiments & Runs")]:::db
    E -.-> J[("pgvector Embeddings & Checkpoints")]:::db
  end

  subgraph Stage6["6. Research API & Dashboard"]
    H --> K["FastAPI Analytical Gateway"]:::api
    K --> L["Interactive Research Dashboard"]:::api
  end

  J -.-> K\"\"\""""

new_uni_diag = """        algo1_clean = re.sub(r"\s*[\(\[\{].*", "", primary_algo).strip() or "Deep Neural Representation Core"
        algo2_clean = re.sub(r"\s*[\(\[\{].*", "", secondary_algo).strip() or "Adaptive Regularizer & Optimizer"

        diagram_source = f\"\"\"flowchart TD
  classDef ing fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
  classDef prep fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
  classDef core fill:#2e1065,stroke:#c084fc,stroke-width:2px,color:#f8fafc;
  classDef eval fill:#312e81,stroke:#a78bfa,stroke-width:2px,color:#f8fafc;
  classDef output fill:#022c22,stroke:#34d399,stroke-width:2px,color:#f8fafc;

  subgraph Stage1["1. Experimental Data Ingestion Flow"]
    A["Raw Datasets & Telemetry Streams"]:::ing --> B["Schema Validator & Provenance Tagger"]:::ing
  end

  subgraph Stage2["2. Preprocessing & Normalization Flow"]
    B --> C["Outlier Cleanser & Statistical Scaler"]:::prep
    C --> D["Feature Extractor & Tensor Formatter"]:::prep
  end

  subgraph Stage3["3. Core Computational Architecture"]
    D --> E["{algo1_clean[:38]} Backbone"]:::core
    E --> F["Latent State Representation Engine"]:::core
  end

  subgraph Stage4["4. Empirical Calibration & Optimization Flow"]
    F --> G["{algo2_clean[:38]} Module"]:::eval
    G --> H["Statistical Boundary & Uncertainty Validator"]:::eval
  end

  subgraph Stage5["5. Final Decision & Evaluation Output"]
    H --> I["Decision Projection & Empirical Metric Evaluator"]:::output
    I --> J["Final Scientific Prediction & Benchmark Result"]:::output
  end\"\"\""""

if old_uni_diag in content:
    content = content.replace(old_uni_diag, new_uni_diag)
    print("Replaced Universal diagram.")
else:
    print("Universal diagram NOT found.")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated domain_architectures.py successfully!")
