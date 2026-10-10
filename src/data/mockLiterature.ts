import { LiteratureReview } from '../types';

export const mockLiteratureReview: LiteratureReview = {
  topic: 'Multimodal Deep Learning & Vision-Language Models for Early Oncology Diagnosis and Clinical Decision Support',
  totalPapersAnalyzed: 20,
  synthesisSummary: 'The literature exhibits a clear historical progression from early single-modality convolutional classification (2020-2021) to weakly supervised multiple instance learning (2022-2023), culminating in contemporary multimodal vision-language foundation models and neuro-symbolic knowledge graph alignment (2024-2025). Critical bottlenecks persist regarding real-time continual scanner adaptation, clinical hallucination mitigation, and edge hardware deployment.',
  timeline: [
    {
      year: 2020,
      count: 2,
      landmarkPapers: ['ResNet CNN feature extractors for gross biopsy classification', 'Initial multi-instance learning for WSIs'],
      paradigmShift: 'Transition from manual handcrafted image features to deep CNN representation learning.'
    },
    {
      year: 2021,
      count: 3,
      landmarkPapers: ['Attention-based deep MIL (CLAM)', 'Self-supervised SimCLR on histology patches'],
      paradigmShift: 'Adoption of attention pooling over gigapixel slide bags without patch-level pixel labels.'
    },
    {
      year: 2022,
      count: 4,
      landmarkPapers: ['TransMIL: Transformer architectures for WSI', 'Multi-modal EHR + Imaging early fusion'],
      paradigmShift: 'Emergence of Vision Transformers (ViTs) capturing long-range spatial morphological dependencies.'
    },
    {
      year: 2023,
      count: 5,
      landmarkPapers: ['FedOnco: Decentralized self-supervision', 'HyperBio-Embed: Non-Euclidean hyperbolic oncology', 'DualAttn-MIL'],
      paradigmShift: 'Shift toward privacy-preserving federated models and non-Euclidean geometric manifolds.'
    },
    {
      year: 2024,
      count: 6,
      landmarkPapers: ['OncVision-LM: Multimodal VLP', 'MedGraph-Align: Neuro-symbolic hallucination control', 'LungFormer-3D', 'DiffTranslate'],
      paradigmShift: 'State-of-the-art vision-language foundation models, generative diffusion translation, and grounded clinical rationales.'
    }
  ],
  methodologyBreakdown: [
    { method: 'Multimodal Vision-Language Transformers', percentage: 35, count: 7 },
    { method: 'Multiple Instance Learning (MIL)', percentage: 25, count: 5 },
    { method: 'Federated & Privacy-Preserving ML', percentage: 15, count: 3 },
    { method: 'Neuro-Symbolic & Graph Neural Networks', percentage: 15, count: 3 },
    { method: 'Diffusion & Generative Synthetics', percentage: 10, count: 2 },
  ],
  matrix: [
    {
      paperId: 'paper-1',
      paperTitle: 'Multimodal Vision-Language Foundations for Precision Oncology and Histopathological Biomarker Discovery',
      year: 2024,
      method: 'Cross-Attention Token Fusion (CATF) ViT',
      dataset: '1.2M Whole Slide Images (TCGA, PAIP, 4 Hospital EHRs)',
      keyFinding: 'Improves diagnostic AUC by 9.4% (0.962) with 89.2% pathologist text rationale agreement.',
      limitation: 'Requires 64 A100 GPUs; high inference latency on gigapixel slides.',
      researchGap: 'Lack of continual adaptation to novel scanner optics and staining shifts.',
      citationKey: 'Rostova et al., 2024',
      authorsShort: 'Rostova, Vance, & Chen'
    },
    {
      paperId: 'paper-2',
      paperTitle: 'Cross-Modal Contrastive Learning for Radiology Report Generation with Clinical Graph Alignment',
      year: 2024,
      method: 'Neuro-symbolic GCN + Contrastive Vision-Language Alignment',
      dataset: 'MIMIC-CXR (377k images), CheXpert (224k images)',
      keyFinding: 'Reduced clinical factual hallucinations in generated reports by 41% (CheXbert F1 = 0.812).',
      limitation: 'Knowledge graph restricted to thoracic anatomy; high message-passing latency.',
      researchGap: 'Cannot handle multisystem complex comorbidities outside thoracic cavity.',
      citationKey: 'Dubois & Sundaram, 2024',
      authorsShort: 'Dubois & Sundaram'
    },
    {
      paperId: 'paper-3',
      paperTitle: 'Federated Self-Supervised Learning for Privacy-Preserving Collaborative Oncology Diagnostics',
      year: 2023,
      method: 'Federated Momentum Contrast (MoCo) with Rényi Differential Privacy',
      dataset: '84,000 Multi-Institutional Cancer Biopsies across 14 Hospitals',
      keyFinding: 'Maintained 96.8% accuracy parity with centralized training while zero raw data shared.',
      limitation: 'High communication overhead across intercontinental hospital WANs.',
      researchGap: 'Vulnerable to stragglers and high dropout rates in low-bandwidth rural sites.',
      citationKey: 'Lindqvist et al., 2023',
      authorsShort: 'Lindqvist, Takahashi, & Nair'
    },
    {
      paperId: 'paper-4',
      paperTitle: 'Explainable AI for Early Lung Adenocarcinoma Screening using 3D CT Volumetric Transformers',
      year: 2024,
      method: '3D Axial-Spatial Sparse Attention Transformer',
      dataset: 'LIDC-IDRI (1,018 CT scans) + MSKCC clinical cohort',
      keyFinding: 'Achieved 0.946 AUC for sub-centimeter pulmonary nodules with 1.4s scan inference.',
      limitation: 'High sensitivity to slice thickness variations across scanner models.',
      researchGap: 'Interpretability heatmaps struggle with diffuse ground-glass opacities.',
      citationKey: 'Zimmerman & Miller, 2024',
      authorsShort: 'Zimmerman & Miller'
    },
    {
      paperId: 'paper-5',
      paperTitle: 'Genomic-Histologic Co-Embedding with Hyperbolic Geometry for Cancer Survival Prognostication',
      year: 2023,
      method: 'Lorentz Hyperbolic Manifold Co-Embedding',
      dataset: 'TCGA Pan-Cancer (11,000 patients across 32 tumor types)',
      keyFinding: 'Hyperbolic geodesic distance improved survival concordance index (C-index) by +0.078.',
      limitation: 'High mathematical complexity; numerical instability near Poincaré disk boundary.',
      researchGap: 'Unclear how to interface hyperbolic embeddings with standard Euclidean LLM tokens.',
      citationKey: 'Al-Mansoor & Benedetti, 2023',
      authorsShort: 'Al-Mansoor & Benedetti'
    },
    {
      paperId: 'paper-6',
      paperTitle: 'Uncertainty Quantification in Real-Time Critical Care AI: Out-of-Distribution Detection via Evidential Deep Learning',
      year: 2024,
      method: 'Evidential Dirichlet Neural Network',
      dataset: 'eICU Collaborative Research Database (200k admissions)',
      keyFinding: 'Predicted acute clinical decompensation shifts 18 minutes in advance with calibrated epistemic uncertainty.',
      limitation: 'Sensitivity to extreme sensor noise and missing arterial telemetry values.',
      researchGap: 'Does not model multi-task clinical decision interventions.',
      citationKey: 'Narayanan & Meyer, 2024',
      authorsShort: 'Narayanan & Meyer'
    },
    {
      paperId: 'paper-7',
      paperTitle: 'Weakly Supervised Pathology Whole-Slide Classification with Dual-Stream Attention Mechanisms',
      year: 2023,
      method: 'Dual-Stream Multiple Instance Learning (DualAttn-MIL)',
      dataset: 'CAMELYON16 & TCGA-NSCLC (2,800 whole slides)',
      keyFinding: 'Delivers 0.941 AUC while slashing training memory requirements by 68%.',
      limitation: 'Struggles when tumor regions comprise less than 0.5% of total gigapixel area.',
      researchGap: 'No natural language explanation generation capability.',
      citationKey: 'Lu & Yang, 2023',
      authorsShort: 'Lu & Yang'
    },
    {
      paperId: 'paper-16',
      paperTitle: 'Edge AI Acceleration for Portable Point-of-Care Ultrasound via 4-Bit Integer Quantization',
      year: 2024,
      method: 'Integer-Only Post-Training Quantization (UltraQuant)',
      dataset: 'EchoNet-Dynamic (10,030 echocardiogram videos)',
      keyFinding: 'Achieved 45 FPS inference under 1.8W power on low-cost edge NPUs with 98.4% Dice score retention.',
      limitation: 'Slight boundary degradation on heavily shadowed acoustic windows.',
      researchGap: 'Does not support multimodal patient history context.',
      citationKey: 'Gupta & Rossi, 2024',
      authorsShort: 'Gupta & Rossi'
    }
  ]
};
