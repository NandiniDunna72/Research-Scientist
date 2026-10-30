import sys
from typing import Dict, Any, List, Optional
from app.services.architecture_service import ArchitectureService
from app.schemas.architecture import ArchitectureResult

def build_universal(topic, description, q_ids, g_ids, p_ids, methods, missing_context, papers, questions, gaps):
    primary_algo = methods[0] if methods else "Adaptive Multi-Scale Representation & Optimization Core"
    secondary_algo = methods[1] if len(methods) > 1 else "Empirical Verification & Uncertainty Calibration Engine"

    arch_title = f"{topic[:45]} System Architecture"
    arch_type = "Adaptive Data-Driven & Intelligent Computational Architecture"
    arch_summary = (
        f"An end-to-end intelligent research architecture engineered for '{topic}'. "
        f"The platform ingests multi-source experimental datasets, conducts rigorous feature extraction and representation normalization, "
        f"executes core computational modeling via {primary_algo}, validates hypothesis constraints and uncertainty via "
        f"{secondary_algo}, and exposes reproducible analytical findings through an interactive research dashboard."
    )

    components = [
        {
            "component_id": "comp-data-ingestion",
            "component_name": "Multi-Source Data Ingestion & Stream Processing Gateway",
            "component_type": "data_pipeline",
            "purpose": "Ingest heterogeneous data sources, benchmark corpora, and experimental streams.",
            "responsibilities": [
                "Acquire and parse multi-modal input payloads with strict schema validation",
                "Apply asynchronous rate-limiting and stream buffer management",
                "Generate cryptographic integrity hashes and lineage tracking manifests",
            ],
            "inputs": ["Raw Experimental Data Streams", "External Benchmark Corpora", "Configuration Metadata"],
            "outputs": ["Normalized Ingestion Payloads", "Data Provenance Records", "Validation Event Streams"],
            "technologies": ["FastAPI", "Pydantic", "Redis", "Apache Kafka"],
            "dependencies": [],
            "related_research_questions": q_ids[:1],
            "related_research_gaps": g_ids[:1],
            "implementation_status": "implemented",
        },
        {
            "component_id": "comp-feature-preprocessing",
            "component_name": "Feature Extraction & Representation Normalization Engine",
            "component_type": "data_preprocessing",
            "purpose": "Normalize raw measurements, clean anomalous records, and extract informative latent representations.",
            "responsibilities": [
                "Normalize numerical, text, or signal features to standardized statistical scales",
                "Impute missing values and filter non-stationary signal outliers",
                "Transform high-dimensional raw observations into compact feature embeddings",
            ],
            "inputs": ["Normalized Ingestion Payloads", "Validation Event Streams"],
            "outputs": ["Standardized Feature Tensors", "Normalized Embedding Batches", "Quality Metric Reports"],
            "technologies": ["NumPy", "Pandas", "Scikit-Learn", "PyTorch"],
            "dependencies": ["comp-data-ingestion"],
            "related_research_questions": q_ids[:2],
            "related_research_gaps": g_ids[:2],
            "implementation_status": "proposed",
        },
        {
            "component_id": "comp-core-engine",
            "component_name": f"{primary_algo[:35]} Computational Core",
            "component_type": "model_training_and_inference",
            "purpose": f"Execute state-of-the-art computational modeling and representation learning via {primary_algo}.",
            "responsibilities": [
                f"Train and optimize core mathematical algorithms utilizing {primary_algo}",
                "Compute quantitative predictions, loss formulations, and gradient updates",
                "Generate latent representation vectors and prediction probabilities",
            ],
            "inputs": ["Standardized Feature Tensors", "Normalized Embedding Batches"],
            "outputs": ["Primary Model Predictions", "Parameter Gradient Checkpoints", "Latent State Embeddings"],
            "technologies": ["PyTorch", "CUDA 12.x", "HuggingFace", "SciPy"],
            "dependencies": ["comp-feature-preprocessing"],
            "related_research_questions": q_ids[:3],
            "related_research_gaps": g_ids[:3],
            "implementation_status": "proposed",
        },
        {
            "component_id": "comp-eval-verification",
            "component_name": f"{secondary_algo[:35]} Evaluation & Verification Engine",
            "component_type": "decision_engine",
            "purpose": f"Quantify empirical uncertainty, validate hypothesis constraints, and benchmark performance via {secondary_algo}.",
            "responsibilities": [
                f"Perform rigorous statistical validation and uncertainty estimation using {secondary_algo}",
                "Benchmark empirical outputs against baseline algorithms and ground-truth metrics",
                "Detect distribution drift and evaluate boundary stability",
            ],
            "inputs": ["Primary Model Predictions", "Latent State Embeddings"],
            "outputs": ["Calibrated Evaluation Metrics", "Statistical Significance Bounds", "Validation Decision Flags"],
            "technologies": ["Scikit-Learn", "Statsmodels", "FastAPI"],
            "dependencies": ["comp-core-engine"],
            "related_research_questions": q_ids[1:3] if len(q_ids) > 2 else q_ids,
            "related_research_gaps": g_ids[1:3] if len(g_ids) > 2 else g_ids,
            "implementation_status": "proposed",
        },
        {
            "component_id": "comp-experiment-persistence",
            "component_name": "Experiment Registry & State Persistence Store",
            "component_type": "database",
            "purpose": "Store experiment artifacts, model weights, evaluation metrics, and queryable vector indices.",
            "responsibilities": [
                "Persist structured experiment logs, hyperparameter manifests, and performance tables in PostgreSQL",
                "Store high-dimensional vector embeddings for fast nearest-neighbor similarity in pgvector",
                "Maintain complete provenance lineage across experimental runs",
            ],
            "inputs": ["Parameter Gradient Checkpoints", "Calibrated Evaluation Metrics", "Validation Decision Flags"],
            "outputs": ["Queryable Experiment History", "Similarity Search Results", "Reproducibility Manifests"],
            "technologies": ["PostgreSQL with pgvector", "SQLAlchemy", "ChromaDB"],
            "dependencies": ["comp-data-ingestion", "comp-core-engine"],
            "related_research_questions": q_ids[:1],
            "related_research_gaps": g_ids[:1],
            "implementation_status": "implemented",
        },
        {
            "component_id": "comp-interactive-ui",
            "component_name": "Research API & Interactive Visualization Dashboard",
            "component_type": "api_and_ui",
            "purpose": "Provide researchers with REST API endpoints, real-time metrics, interactive charts, and exportable reports.",
            "responsibilities": [
                "Expose REST endpoints for model inference, data querying, and job status monitoring",
                "Render responsive UI components with metric curves, confusion matrices, and parameter sliders",
                "Generate downloadable analytical summaries and exportable figures",
            ],
            "inputs": ["Researcher Interaction Queries", "Inference Requests", "Dashboard Filters"],
            "outputs": ["Interactive Visualizations", "API Response Payloads", "Exportable Research Reports"],
            "technologies": ["FastAPI", "React / TypeScript", "Tailwind CSS", "Recharts"],
            "dependencies": ["comp-eval-verification", "comp-experiment-persistence"],
            "related_research_questions": q_ids[:2],
            "related_research_gaps": g_ids[:2],
            "implementation_status": "optional",
        },
    ]

    diagram_source = f"""flowchart TD
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

  J -.-> K"""

    diagram = {
        "diagram_type": "mermaid",
        "source": diagram_source,
        "description": f"End-to-end computational and empirical architecture for '{topic[:40]}'.",
    }

    data_flow = [
        {
            "step_number": 1,
            "source_component": "Raw Experimental Data Sources",
            "destination_component": "Multi-Source Data Ingestion & Stream Processing Gateway",
            "data_transferred": "Heterogeneous file formats, CSV/JSON payloads, sensor records",
            "processing_performed": "Schema parsing, integrity checksum generation, queue ingestion",
            "output_produced": "Structured ingestion records with provenance tracking IDs",
            "phase": "general",
        },
        {
            "step_number": 2,
            "source_component": "Multi-Source Data Ingestion Gateway",
            "destination_component": "Feature Extraction & Representation Normalization Engine",
            "data_transferred": "Structured raw records and metadata",
            "processing_performed": "Outlier filtering, feature scaling, missing value imputation",
            "output_produced": "Standardized feature tensors and embedding matrices",
            "phase": "preprocessing",
        },
        {
            "step_number": 3,
            "source_component": "Feature Extraction & Normalization Engine",
            "destination_component": f"{primary_algo[:35]} Computational Core",
            "data_transferred": "Normalized feature tensors and batch indices",
            "processing_performed": "Core algorithm execution, mathematical optimization, representation learning",
            "output_produced": "Predicted model outcomes and latent state vectors",
            "phase": "training",
        },
        {
            "step_number": 4,
            "source_component": f"{primary_algo[:35]} Computational Core",
            "destination_component": "Experiment Registry & State Persistence Store",
            "data_transferred": "Model checkpoints, loss metrics, latent embeddings",
            "processing_performed": "pgvector indexing, relational row commit, artifact storage",
            "output_produced": "Persisted experiment run logs and searchable vector indices",
            "phase": "training",
        },
        {
            "step_number": 5,
            "source_component": f"{primary_algo[:35]} Computational Core",
            "destination_component": f"{secondary_algo[:35]} Evaluation & Verification Engine",
            "data_transferred": "Model outcomes, latent states, ground-truth labels",
            "processing_performed": "Uncertainty quantification, statistical hypothesis testing, drift checks",
            "output_produced": "Empirically validated performance metrics and confidence intervals",
            "phase": "inference",
        },
        {
            "step_number": 6,
            "source_component": f"{secondary_algo[:35]} Evaluation & Verification Engine",
            "destination_component": "Research API & Interactive Visualization Dashboard",
            "data_transferred": "Performance metrics, prediction summaries, chart data points",
            "processing_performed": "JSON serialization, WebSocket client push, visualization formatting",
            "output_produced": "Real-time dashboard rendering and client API responses",
            "phase": "inference",
        },
    ]

    technology_stack = [
        {
            "category": "Core Computational Framework",
            "technology": "PyTorch & NumPy",
            "role": "Tensor algebra, deep learning representations, and mathematical optimization",
            "reason_for_selection": "High-throughput GPU-accelerated computing with extensive scientific library support.",
            "alternatives": ["JAX", "TensorFlow", "Scipy"],
            "status": "suggested",
        },
        {
            "category": "Statistical Analysis & Preprocessing",
            "technology": "Scikit-Learn, Pandas & Statsmodels",
            "role": "Feature engineering, statistical normalization, and empirical hypothesis testing",
            "reason_for_selection": "Comprehensive, battle-tested scientific tooling for data preprocessing and evaluation.",
            "alternatives": ["Polars", "Dask"],
            "status": "suggested",
        },
        {
            "category": "Database & Vector Store",
            "technology": "PostgreSQL 16 with pgvector",
            "role": "Relational storage of experiments, runs, and high-dimensional vector representations",
            "reason_for_selection": "Single unified ACID database supporting both transactional logs and vector search.",
            "alternatives": ["ChromaDB", "MongoDB", "Qdrant"],
            "status": "current",
        },
        {
            "category": "Backend Serving & APIs",
            "technology": "FastAPI & Uvicorn",
            "role": "High-concurrency RESTful API endpoints and WebSocket telemetry channels",
            "reason_for_selection": "Fast modern Python ASGI framework with automatic OpenAPI documentation.",
            "alternatives": ["Flask", "Django"],
            "status": "current",
        },
        {
            "category": "Frontend UI & Visualization",
            "technology": "React, TypeScript & Recharts",
            "role": "Interactive dashboard for metric visualization, experiment comparison, and control",
            "reason_for_selection": "Modular component-based UI architecture with smooth reactive charts.",
            "alternatives": ["Vue.js", "Streamlit"],
            "status": "current",
        },
    ]

    data_storage_design = {
        "storage_paradigm": "Relational (PostgreSQL) with High-Dimensional Vector Support (pgvector)",
        "description": "Unified research schema organizing experiment runs, input datasets, model predictions, and vector representations.",
        "entities": [
            {
                "entity_name": "experiment_runs",
                "purpose": "Tracks distinct experiment executions, parameter configurations, and timestamps.",
                "fields": ["id (UUID)", "experiment_name (VARCHAR)", "parameters (JSONB)", "started_at (TIMESTAMP)", "status (VARCHAR)"],
                "relationships": ["1:N with model_predictions", "1:N with evaluation_metrics"],
            },
            {
                "entity_name": "input_datasets",
                "purpose": "Stores dataset manifests, file hashes, source descriptors, and split partitions.",
                "fields": ["id (UUID)", "dataset_name (VARCHAR)", "sample_count (INT)", "feature_dimensions (INT)", "data_hash (VARCHAR)"],
                "relationships": ["1:N with experiment_runs"],
            },
            {
                "entity_name": "model_predictions",
                "purpose": "Records predicted outcomes, loss values, and confidence scores across evaluation samples.",
                "fields": ["id (UUID)", "run_id (FK)", "sample_index (INT)", "predicted_value (FLOAT)", "confidence_bound (FLOAT)"],
                "relationships": ["N:1 with experiment_runs"],
            },
            {
                "entity_name": "latent_representations",
                "purpose": "High-dimensional embedding vectors extracted by the computational core.",
                "fields": ["id (UUID)", "run_id (FK)", "vector_embedding (VECTOR(512))", "dimension (INT)"],
                "relationships": ["N:1 with experiment_runs"],
            },
        ],
        "er_diagram": {
            "diagram_type": "mermaid",
            "source": """erDiagram
  INPUT_DATASETS ||--o{ EXPERIMENT_RUNS : configures
  EXPERIMENT_RUNS ||--o{ MODEL_PREDICTIONS : produces
  EXPERIMENT_RUNS ||--o{ LATENT_REPRESENTATIONS : generates""",
        },
    }

    security_and_reliability = [
        {
            "dimension": "Data Integrity & Reproducibility Auditability",
            "description": "Uncontrolled data drift or unversioned transformations compromise experimental repeatability.",
            "mitigation_strategy": "Record cryptographic SHA-256 hashes of all input data batches and hyperparameter manifests alongside model outputs.",
        },
        {
            "dimension": "System Boundary & Out-of-Distribution Handling",
            "description": "Extreme outliers or degenerate inputs may produce numerical instability or invalid inferences.",
            "mitigation_strategy": "Deploy input clamping, variance bounds checking, and NaN/Inf sanitization filters in the preprocessing layer.",
        },
    ]

    deployment_architecture = {
        "deployment_model": "Modular Containerized Scientific Computing Architecture",
        "minimum_viable_deployment": "Standard computing environment with 8-core CPU, 16GB RAM, optional CUDA GPU, running Docker Compose.",
        "production_enhancements": "Distributed Kubernetes cluster with dedicated GPU worker pools and horizontal API scaling.",
        "hosting_components": [
            "FastAPI Computational Gateway (Dockerized)",
            "PyTorch Scientific Execution Engine",
            "PostgreSQL 16 Database with pgvector Extension",
            "React Web Analytics Dashboard",
        ],
        "environment_configuration": [
            "COMPUTATIONAL_BATCH_SIZE=64",
            "MAX_FEATURE_DIMENSIONS=1024",
            "POSTGRES_DB=research_analytics_db",
        ],
        "scaling_considerations": "Scale worker nodes horizontally behind Redis task queues for high-throughput parallel parameter sweeps.",
    }

    architecture_justification = [
        {
            "objective_or_gap": "Establishing rigorous computational accuracy and representation capability",
            "architectural_choice": f"Decoupled Feature Processing Pipeline with {primary_algo[:30]}",
            "justification": "Separating statistical preprocessing from the core computational engine ensures clean inputs and stable numerical convergence.",
            "trade_offs": "Introduces minor serial preprocessing overhead (~15ms per batch).",
            "related_question_ids": q_ids[:1],
            "related_gap_ids": g_ids[:1],
        },
        {
            "objective_or_gap": "Guaranteeing statistical verification and uncertainty calibration",
            "architectural_choice": f"Dedicated Evaluation & Calibration Engine using {secondary_algo[:30]}",
            "justification": "Quantifying predictive uncertainty prevents overconfident conclusions and highlights critical edge cases.",
            "trade_offs": "Requires computational sampling or ensemble evaluations during inference.",
            "related_question_ids": q_ids[1:2] if len(q_ids) > 1 else q_ids,
            "related_gap_ids": g_ids[1:2] if len(g_ids) > 1 else g_ids,
        },
    ]

    alternative_architectures = [
        {
            "title": "Monolithic Script-Based Execution Workflow",
            "description": "Run monolithic notebook scripts without modular APIs, database persistence, or separate validation engines.",
            "advantages": ["Rapid single-file exploratory prototyping"],
            "disadvantages": ["Zero reproducibility, high risk of state contamination, no automated API serving"],
            "complexity": "Low",
            "suitable_conditions": "Initial scratch exploratory notebooks during preliminary brainstorming.",
            "rejection_reason": "Fails academic reproducibility standards and cannot support multi-user interactive web applications.",
        },
    ]

    implementation_plan = [
        {
            "stage_number": 1,
            "stage_name": "Data Ingestion & Preprocessing Foundation Setup",
            "tasks": [
                "Construct modular data loaders with automated schema validation",
                "Deploy PostgreSQL schema with pgvector extensions and audit logging",
                "Implement feature normalization and outlier cleansing routines",
            ],
            "dependencies": ["Target research datasets"],
            "deliverable": "Working data preprocessing pipeline with unit test suite",
            "verification_method": "Pass automated data ingestion test across 10,000 samples with 100% schema compliance",
        },
        {
            "stage_number": 2,
            "stage_name": f"{primary_algo[:30]} Core Implementation & Optimization",
            "tasks": [
                "Implement core mathematical models and optimization routines",
                "Execute hyperparameter tuning and convergence benchmarks",
                "Export validated model checkpoints and vector representations",
            ],
            "dependencies": ["Stage 1 preprocessing pipeline"],
            "deliverable": "Trained computational model artifact with benchmark performance report",
            "verification_method": "Achieve statistically significant improvement over baseline methods (p < 0.05)",
        },
        {
            "stage_number": 3,
            "stage_name": "Verification, API Gateway & Dashboard Integration",
            "tasks": [
                "Implement uncertainty calibration and statistical verification modules",
                "Deploy FastAPI REST endpoints and WebSocket feeds",
                "Construct interactive React visualization dashboard",
            ],
            "dependencies": ["Stage 2 core model"],
            "deliverable": "Full-stack reproducible research system with interactive UI",
            "verification_method": "Sub-200ms end-to-end API response time under concurrent query loads",
        },
    ]

    limitations_and_assumptions = [
        {
            "category": "Data Distribution Stationarity",
            "description": "Assumes input data distributions remain reasonably stationary within the tested domain bounds.",
        },
        {
            "category": "Computational Resource Ceilings",
            "description": "Large-scale parameter sweeps require adequate GPU compute allocations to avoid execution bottlenecks.",
        },
    ]

    return {
        "project_id": 1,
        "topic": topic,
        "architecture_title": arch_title,
        "architecture_type": arch_type,
        "architecture_summary": arch_summary,
        "components": components,
        "architecture_diagram": diagram,
        "data_flow": data_flow,
        "technology_stack": technology_stack,
        "data_storage_design": data_storage_design,
        "security_and_reliability": security_and_reliability,
        "deployment_architecture": deployment_architecture,
        "architecture_justification": architecture_justification,
        "alternative_architectures": alternative_architectures,
        "implementation_plan": implementation_plan,
        "limitations_and_assumptions": limitations_and_assumptions,
        "missing_upstream_context": missing_context,
    }

univ_test = build_universal("Quantum Key Distribution Network Optimization", "", ["Q1"], ["G1"], ["P1"], ["Adaptive Quantum Routing"], [], [], [], [])
univ_val = ArchitectureResult(**univ_test)
print("Universal valid! Mermaid syntax valid?", ArchitectureService.validate_mermaid_syntax(univ_val.architecture_diagram.source))
