import { PaperAnalysis } from '../types';

export const mockAnalyses: Record<string, PaperAnalysis> = {
  'paper-1': {
    paperId: 'paper-1',
    overview: 'This landmark 2024 paper proposes **OncVision-LM**, a foundational multimodal vision-language model trained across 1.2M whole-slide histology images and clinical EHR texts. It achieves a 9.4% AUC boost over single-modality models by using cross-attention token fusion to identify cancer margins and generate diagnostic rationales.',
    abstract: 'Pathology diagnostics currently suffer from high inter-observer variability. We introduce OncVision-LM, a foundational multimodal architecture pre-trained across 1.2 million whole-slide images (WSIs) and aligned electronic health records. Our framework employs cross-attention token fusion to identify microscopic neoplastic boundaries while synthesizing natural language diagnostic rationales. On five multi-center benchmarks, OncVision-LM improves diagnostic AUC by 9.4% over single-modality baselines while achieving unprecedented clinician concordance.',
    summary: {
      keyContributions: [
        'Introduced OncVision-LM: the first foundation model trained jointly on 1.2M gigapixel WSIs and multi-institutional EHR records.',
        'Developed Cross-Attention Token Fusion (CATF) to map patch-level visual tokens directly into medical narrative embedding spaces.',
        'Established an interpretable clinical decision-support rationale generator with 89.2% agreement with board-certified pathologists.',
        'Released a benchmark of 5 diverse multi-center validation cohorts across distinct ethnic demographics.'
      ],
      findings: [
        'Multimodal fusion outperforms unimodal vision models by +9.4% AUC (0.962 vs 0.868) on challenging early-stage lymph node metastases.',
        'Natural language diagnostic rationales drastically reduced pathologist review time by 34% without sacrificing precision.',
        'Pre-training on paired clinical summaries prevents catastrophic forgetting when adapting to rare sub-types of sarcoma.'
      ],
      implications: [
        'Demonstrates the viability of end-to-end multimodal foundation models in high-stakes clinical pathology.',
        'Sets a new precedent for regulatory-compliant explainability in AI diagnostic systems.',
        'Provides a blueprint for clinical decision support tools integrated directly with digital slide scanners.'
      ]
    },
    researchGaps: [
      'Current architecture requires massive GPU cluster memory (>80GB per node), limiting deployment in edge clinic hardware.',
      'Susceptible to domain shifts when slides are stained with non-standard hematoxylin and eosin (H&E) protocols from developing countries.',
      'Lack of real-time continual learning: cannot adapt online to novel emerging histological variants without complete retraining.'
    ],
    literatureReview: {
      theoreticalFramework: 'Anchored in Multi-Instance Learning (MIL) and Cross-Modal Contrastive Representation Theory (Radford et al., 2021; Chen et al., 2022). Extends Vision-Language Pre-training (VLP) to non-Euclidean gigapixel image hierarchies.',
      relationToPriorWork: 'Unlike previous weakly supervised MIL models (CLAM, TransMIL) that discard unstructured clinician notes, OncVision-LM bridges unstructured clinical text with gigapixel pathology.',
      keyDebates: [
        'Whether gigapixel image resolution necessitates patch sampling or full pyramidal attention sweeps.',
        'If synthetic EHR notes during pre-training induce hallucination risks in clinical diagnostic outputs.'
      ]
    },
    methodology: {
      problemFormulation: 'Formulated as a joint contrastive learning and multi-label classification task over gigapixel slide bags $B = \\{p_1, \\dots, p_N\\}$ and structured clinical context vectors $C$.',
      dataset: '1.2M Whole Slide Images from TCGA, PAIP, and 4 tertiary academic medical centers, paired with anonymized clinical diagnosis notes.',
      preprocessing: 'Otsu tissue segmentation thresholding, non-overlapping 256x256 patch extraction at 20x magnification, Macenko stain normalization.',
      modelArchitecture: 'Hierarchical Vision Transformer (ViT-H/16) backbone with 32 cross-attention transformer layers and 768-dimensional token projection.',
      trainingStrategy: 'Two-stage pre-training: (1) Self-supervised masked autoencoding on histology patches; (2) Cross-modal contrastive alignment with infoNCE loss temperature $\\tau = 0.07$.',
      evaluationMetrics: [
        'Area Under ROC Curve (AUC)',
        'F1-Score at 95% Specificity',
        'Clinician Concordance Kappa ($\\kappa$)',
        'BLEU-4 and ROUGE-L for diagnostic rationale synthesis'
      ],
      results: 'Achieved an overall AUC of 0.962 across 5 multi-center test sets, outperforming CLAM (0.891) and TransMIL (0.904). Pathologist concordance reached $\\kappa = 0.91$.',
      limitations: [
        'Extreme compute footprint requiring 64 NVIDIA A100 GPUs for 3 weeks.',
        'Limited evaluation on pediatric tumors and rare sarcomas due to data scarcity.',
        'Batch effects observed when processing slides from older glass scanner optics.'
      ]
    },
    analyzedAt: '2025-02-18T10:15:00Z'
  },
  'paper-2': {
    paperId: 'paper-2',
    overview: 'This paper introduces **MedGraph-Align**, which combines cross-modal contrastive learning with an anatomical dependency knowledge graph to slash hallucinations in automated radiology report generation by 41%.',
    abstract: 'Automated radiology report generation requires reconciling pixel-level radiographic evidence with nuanced medical terminologies. We propose MedGraph-Align, a novel cross-modal contrastive network that dynamically constructs an anatomical dependency knowledge graph alongside convolutional-transformer image representations. The graph explicitly penalizes clinically inconsistent phrase generation, slashing factual hallucinations in chest X-ray summaries by 41% across MIMIC-CXR and CheXpert cohorts.',
    summary: {
      keyContributions: [
        'Constructed dynamic anatomical dependency knowledge graph linking radiographic signs to clinical diagnoses.',
        'Proposed Cross-Modal Contrastive Loss with graph topology constraints (MedGraph-Align).',
        'Reduced hallucinated diagnostic findings by 41% compared to pure sequence-to-sequence transformer baselines.',
        'Validated on over 200,000 paired chest radiographs from MIMIC-CXR and CheXpert.'
      ],
      findings: [
        'Injecting structured medical knowledge graphs prevents generative LLMs from inventing non-existent cardiomegaly or pleural effusions.',
        'Clinical efficacy metrics (CheXbert vector similarity) improved by 18.2% over standard R2Gen models.'
      ],
      implications: [
        'Highlights that pure statistical language models are insufficient for medical report generation without explicit ontological grounding.'
      ]
    },
    researchGaps: [
      'Knowledge graph is currently static for thoracic radiography and cannot handle abdominal or musculoskeletal imaging.',
      'Computationally slow inference caused by dual graph neural network message-passing passes.'
    ],
    literatureReview: {
      theoreticalFramework: 'Neuro-symbolic AI integrating connectionist deep learning representations with symbolic knowledge representations (UMLS ontology).',
      relationToPriorWork: 'Surpasses standard vision-to-text models (R2Gen, CvT2Distill) by constraining decoding paths to verified anatomical ontology nodes.',
      keyDebates: [
        'Handcrafted medical ontologies vs. latent self-discovered knowledge graphs.',
        'Clinical relevance of BLEU/ROUGE metrics vs. CheXbert clinical accuracy.'
      ]
    },
    methodology: {
      problemFormulation: 'Graph-constrained sequence generation: $P(Y | X, G)$ where $X$ is the radiograph, $G$ is the thoracic knowledge graph, and $Y$ is the clinical report.',
      dataset: 'MIMIC-CXR (377,110 images) and CheXpert (224,316 images).',
      preprocessing: 'Histogram equalization, 512x512 resolution resampling, CheXbert label extraction for ground truth graph nodes.',
      modelArchitecture: 'DenseNet-121 visual encoder coupled with a 4-layer Graph Convolutional Network (GCN) and GPT-style decoder.',
      trainingStrategy: 'Joint loss combining Cross-Entropy, Graph Consistency Penalty, and Contrastive Radiograph-Report Alignment.',
      evaluationMetrics: ['CheXbert Clinical Metric', 'BLEU-2/4', 'ROUGE-L', 'Hallucination Rate'],
      results: 'CheXbert F1 score reached 0.812 (vs 0.724 baseline); hallucination rate reduced from 14.8% to 8.7%.',
      limitations: [
        'Struggles with lateral view chest radiographs.',
        'Graph cannot represent rare non-thoracic incidental findings.'
      ]
    },
    analyzedAt: '2025-02-18T10:30:00Z'
  },
  'paper-3': {
    paperId: 'paper-3',
    overview: '**FedOnco** demonstrates privacy-preserving federated self-supervised learning deployed across 14 international oncology hospitals, achieving 96.8% of centralized performance while preventing patient data leakage.',
    abstract: 'Data privacy constraints frequently hinder multi-institutional clinical machine learning. Here, we demonstrate FedOnco, a privacy-preserving federated self-supervised framework deployed across 14 international oncology hospitals. Without transferring raw patient slides or genomic arrays, FedOnco achieves 96.8% of the centralized training performance benchmark while proving mathematically resilient to model inversion attacks under differential privacy budgets.',
    summary: {
      keyContributions: [
        'First multi-continent federated self-supervised diagnostic trial across 14 oncology hospitals.',
        'Developed adaptive gradient masking with Rényi Differential Privacy ($\epsilon = 3.2, \delta = 10^{-5}$).',
        'Achieved 96.8% accuracy parity with centralized data pooling while keeping all patient data strictly on-premises.'
      ],
      findings: [
        'Heterogeneous staining protocols across institutions can be aligned in federated latent feature space without exchanging raw patient images.',
        'Communication bandwidth bottlenecks reduced by 78% using sparse gradient quantization.'
      ],
      implications: [
        'Enables compliance with GDPR, HIPAA, and international cross-border healthcare data transfer prohibitions.'
      ]
    },
    researchGaps: [
      'High latency during federated aggregation rounds across intercontinental hospital networks.',
      'Client dropout resilience when smaller community clinics experience server instability.'
    ],
    literatureReview: {
      theoreticalFramework: 'Federated Optimization (FedAvg / FedProx) combined with Differential Privacy theory (Dwork et al.).',
      relationToPriorWork: 'Improves over standard federated learning by introducing self-supervised pre-training to overcome non-IID hospital data distributions.',
      keyDebates: [
        'Privacy budget $\epsilon$ trade-off versus diagnostic sensitivity for rare cancers.'
      ]
    },
    methodology: {
      problemFormulation: 'Decentralized optimization: $\min_w \sum_{k=1}^K \frac{n_k}{N} F_k(w)$ subject to $(\epsilon, \delta)$-differential privacy guarantees.',
      dataset: '14 hospital cohorts totaling 84,000 cancer patient biopsies and genomics.',
      preprocessing: 'Local on-premise normalization and feature caching.',
      modelArchitecture: 'Vision Transformer (ViT-Base) with federated momentum contrast (MoCo v3).',
      trainingStrategy: 'Federated Proximal optimization with top-k gradient sparsification.',
      evaluationMetrics: ['Global AUC', 'Communication Overhead (GB)', 'Privacy Loss', 'Robustness to Non-IID'],
      results: 'Global AUC of 0.948 compared to 0.979 centralized baseline; 0% patient record re-identification.',
      limitations: ['Requires dedicated edge servers at each collaborating hospital.', 'Coordination overhead across timezones.']
    },
    analyzedAt: '2025-02-18T10:45:00Z'
  }
};
