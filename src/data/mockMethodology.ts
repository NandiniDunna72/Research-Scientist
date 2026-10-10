import { Methodology } from '../types';

export const mockMethodologies: Record<string, Methodology> = {
  'paper-1': {
    paperId: 'paper-1',
    paperTitle: 'Multimodal Vision-Language Foundations for Precision Oncology and Histopathological Biomarker Discovery',
    researchProblem: 'Overcoming high pathologist inter-observer variability in early cancer margin identification while providing interpretable natural language diagnostic rationales.',
    dataset: 'TCGA, PAIP, and multi-institutional biopsy cohorts totaling 1.2M Whole Slide Images (WSIs) across 14 tissue origins.',
    datasetSize: '1.2 Million Whole-Slide Images (~480 Terabytes uncompressed)',
    preprocessing: 'Automated tissue segmentation via Otsu thresholding; non-overlapping 256x256 patch extraction at 20x magnification; Macenko optical density stain normalization; foreground filter.',
    modelAlgorithm: 'OncVision-LM: Hierarchical Vision Transformer (ViT-H/16) coupled with a 32-layer Cross-Attention Token Fusion transformer and autoregressive rationale decoder.',
    trainingStrategy: 'Two-stage pre-training: (1) Self-supervised masked autoencoding on histology patches; (2) Cross-modal contrastive alignment with infoNCE loss temperature $\\tau = 0.07$.',
    evaluationMetrics: 'Area Under ROC Curve (AUC), F1-Score at 95% Specificity, Cohen\'s Kappa ($\\kappa$), ROUGE-L / BLEU-4 for diagnostic text.',
    results: '0.962 multi-center AUC; 89.2% concordance with board-certified pathologists; 34% reduction in clinical review time.',
    limitations: 'High hardware requirements (64 A100 GPUs); vulnerable to staining drift from non-standard glass preparation; high inference memory footprint.',
    workflowSteps: [
      {
        step: 1,
        name: 'Gigapixel Slide Ingestion & Quality Control',
        description: 'Read multi-resolution digital whole-slide pyramids, discard blurred or folded coverslip artifacts using blur Laplacian metrics.',
        toolOrTechnique: 'OpenSlide C-API & PyTorch WSI Loader',
        input: 'Raw SVS / NDPI Slide Files (100,000 x 80,000 px)',
        output: 'Clean segmented tissue masks'
      },
      {
        step: 2,
        name: 'Patch Tiling & Stain Normalization',
        description: 'Extract 256x256 patch tiles at 20x optical zoom, standardize hematoxylin and eosin dye absorption profiles.',
        toolOrTechnique: 'Macenko Matrix Decomposition',
        input: 'Segmented tissue mask regions',
        output: 'Normalized RGB patch bag (avg. 12,000 tiles/slide)'
      },
      {
        step: 3,
        name: 'Hierarchical Feature Encoding',
        description: 'Encode individual microscopic patch tiles into 768-dimensional latent representations using self-supervised ViT-H.',
        toolOrTechnique: 'Vision Transformer (ViT-H/16)',
        input: 'Normalized patch bag',
        output: 'Patch embedding tensor $Z \\in \\mathbb{R}^{N \\times 768}$'
      },
      {
        step: 4,
        name: 'Cross-Attention Token Fusion',
        description: 'Fuse visual patch tokens with patient clinical history embeddings using cross-modal multi-head attention.',
        toolOrTechnique: 'Cross-Attention Transformer (32 layers)',
        input: 'Visual patch embeddings + Clinical token vectors',
        output: 'Unified multimodal patient representation'
      },
      {
        step: 5,
        name: 'Multi-Task Diagnostic & Text Rationale Head',
        description: 'Output cancer subtype classification probabilities alongside autoregressive clinical justification report generation.',
        toolOrTechnique: 'Autoregressive Transformer Decoder with Beam Search',
        input: 'Fused multimodal representation',
        output: 'Predicted diagnosis, confidence calibration, narrative rationale'
      },
      {
        step: 6,
        name: 'Clinician Blind Audit & Metric Verification',
        description: 'Evaluate ROC curves across 5 external hospitals and conduct blinded concordance scoring with 8 senior pathologists.',
        toolOrTechnique: 'Statistical DeLong ROC testing & Kappa agreement',
        input: 'Model outputs vs Ground Truth expert annotations',
        output: 'Validation report with AUC 0.962 and $\\kappa = 0.91$'
      }
    ]
  },
  'paper-2': {
    paperId: 'paper-2',
    paperTitle: 'Cross-Modal Contrastive Learning for Radiology Report Generation with Clinical Graph Alignment',
    researchProblem: 'Preventing severe factual hallucinations in deep automated radiology report generation systems.',
    dataset: 'MIMIC-CXR and CheXpert public datasets totaling 601,426 radiographic image-report pairs.',
    datasetSize: '601,426 chest X-rays paired with verified free-text radiology reports',
    preprocessing: 'Histogram normalization, 512x512 resolution resampling, CheXbert rule-based disease entity tag extraction.',
    modelAlgorithm: 'MedGraph-Align: DenseNet-121 visual extractor, 4-layer GCN over UMLS anatomical ontology, GPT-2 clinical report generator.',
    trainingStrategy: 'Joint loss optimizing image-text contrastive similarity, cross-entropy language modeling, and graph structural consistency penalty.',
    evaluationMetrics: 'CheXbert 14-disease F1 score, BLEU-4, ROUGE-L, Radiologist Factual Error Rate.',
    results: 'CheXbert F1 improved from 0.724 to 0.812; clinical factual hallucinations reduced by 41%.',
    limitations: 'Knowledge graph currently hardcoded to thoracic anatomy; inference requires graph message passing steps.',
    workflowSteps: [
      {
        step: 1,
        name: 'Radiograph Normalization & Feature Extraction',
        description: 'Process chest X-rays through calibrated DenseNet to capture pulmonary infiltrates, cardiac contours, and pleural spaces.',
        toolOrTechnique: 'DenseNet-121 + Feature Pyramid Network',
        input: 'DICOM Chest Radiographs',
        output: 'Spatial visual feature map $F_v$'
      },
      {
        step: 2,
        name: 'Ontology Graph Construction',
        description: 'Construct a graph of thoracic organs and potential pathologies using UMLS medical knowledge triples.',
        toolOrTechnique: 'NetworkX & PyTorch Geometric',
        input: 'UMLS Medical Knowledge Base',
        output: 'Static anatomical dependency graph $G = (V, E)$'
      },
      {
        step: 3,
        name: 'Cross-Modal Graph Node Alignment',
        description: 'Project visual features onto graph node positions using contrastive alignment so regions match anatomical entities.',
        toolOrTechnique: 'Graph Convolutional Network (GCN)',
        input: 'Visual features $F_v$ + Graph $G$',
        output: 'Grounded entity feature vectors'
      },
      {
        step: 4,
        name: 'Graph-Constrained Sequence Decoding',
        description: 'Generate report sentences token-by-token while penalizing paths that conflict with positive graph nodes.',
        toolOrTechnique: 'Constrained Transformer Decoder',
        input: 'Grounded entity features',
        output: 'Clinically consistent diagnostic narrative report'
      },
      {
        step: 5,
        name: 'Hallucination Auditing',
        description: 'Verify generated report against 14 clinical disease presence categories using CheXbert labeler.',
        toolOrTechnique: 'CheXbert Automated Clinical Auditor',
        input: 'Generated report vs Reference radiologist report',
        output: 'F1 = 0.812, Hallucination Rate = 8.7%'
      }
    ]
  }
};
