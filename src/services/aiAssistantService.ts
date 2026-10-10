import { AIChatMessage } from '../types';

export const aiAssistantService = {
  getInitialMessages(): AIChatMessage[] {
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        content: `Hello! I am your **AI Research Scientist Assistant**. 

I have analyzed the current project workspace, including your **20 selected papers**, the **literature review matrix**, and identified **research gaps**. 

How can I accelerate your scientific investigation today? You can choose one of the suggested prompts below or ask any deep research question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'Summarize these papers',
          'What are the common research gaps?',
          'Which methodology is most effective?',
          'Generate research questions',
          'Compare these approaches',
          'Suggest a research direction',
        ],
      },
    ];
  },

  async askQuestion(question: string): Promise<AIChatMessage> {
    // Artificial thinking delay
    await new Promise((resolve) => setTimeout(resolve, 900));

    const qLower = question.toLowerCase();
    let responseText = '';
    let suggestions: string[] = [];

    if (qLower.includes('summarize') || qLower.includes('summary')) {
      responseText = `### Executive Synthesis of Ingested Papers (2020–2025)

1. **Multimodal Foundation Convergence**: Recent literature (e.g., *Rostova et al., Nature Biomed Eng 2024*) proves that co-embedding gigapixel histology with patient EHR narratives enhances diagnostic AUC by **+9.4%** compared to single-modality vision models.
2. **Clinical Grounding Breakthrough**: Integrating symbolic knowledge graphs (*Dubois et al., IEEE TPAMI 2024*) suppresses clinical factual hallucinations by **41%**, addressing a primary safety roadblock.
3. **Decentralized Privacy**: Federated self-supervision (*Lindqvist et al., Lancet Digital Health 2023*) achieves **96.8% parity** with centralized training, unlocking multi-institutional oncology research without data transfer.

Would you like me to extract a detailed comparative methodology table or jump to identified gaps?`;
      suggestions = ['What are the common research gaps?', 'Compare these approaches', 'Generate draft abstract'];
    } else if (qLower.includes('gap') || qLower.includes('unsolved') || qLower.includes('limitation')) {
      responseText = `### Top Identified Research Gaps Across Analyzed Papers

- **Gap #1 (High Criticality)**: *Optical Scanner Drift & Inadequate Test-Time Adaptation*. An average **18.5% confidence degradation** occurs when testing models on slides from novel scanner vendors.
- **Gap #2 (Safety Criticality)**: *Diagnostic Hallucinations in Free-Text Rationales*. Unconstrained autoregressive decoders fabricate non-existent pathology in up to **14.2%** of generated sentences.
- **Gap #3 (Translation Barrier)**: *High Hardware Overhead*. State-of-the-art models require **>80GB GPU VRAM**, preventing adoption in over 70% of global community clinics.
- **Gap #4 (Mathematical Formulation)**: Flat Euclidean models distort branching non-Euclidean clonal tumor phylogenies.`;
      suggestions = ['Generate research questions for Gap #1', 'Suggest a research direction', 'Export gaps report'];
    } else if (qLower.includes('methodology') || qLower.includes('effective') || qLower.includes('algorithm')) {
      responseText = `### Comparative Methodology Evaluation

The most effective current approach is **Cross-Attention Token Fusion with Vision Transformers (ViT-H/16)**:
- **Strengths**: Highest diagnostic sensitivity (AUC 0.962) and ability to generate multi-sentence clinical rationales.
- **Weakness**: Heavy computational footprint during patch bag aggregation.

**Alternative Recommended Architecture**: For resource-constrained or real-time clinical settings, **4-bit Quantized Multiple Instance Learning (UltraQuant / DualAttn-MIL)** achieves **0.941 AUC** with 68% lower memory usage and 45 FPS edge inference.`;
      suggestions = ['View proposed architecture diagram', 'Compare these approaches', 'Generate methodology section'];
    } else if (qLower.includes('question') || qLower.includes('hypothesis')) {
      responseText = `### Recommended Novel Research Questions

1. **Test-Time Adaptation Hypothesis**:
   > *"Can test-time entropy minimization on unlabelled whole-slide patches prevent scanner-induced accuracy drop without requiring full model retraining?"*
   - *Target Venue*: MICCAI / Nature Biomedical Engineering
   - *Feasibility*: High (Requires PyTorch + multi-scanner validation set)

2. **Neuro-Symbolic Hallucination Mitigation**:
   > *"Does constraining beam-search generation to UMLS medical ontology trees reduce clinical error rates below 0.5% in multi-modal report generation?"*
   - *Target Venue*: IEEE TPAMI / NeurIPS`;
      suggestions = ['Add these questions to project', 'Draft experimental methodology', 'Suggest a research direction'];
    } else if (qLower.includes('compare') || qLower.includes('comparison')) {
      responseText = `### Comparative Matrix Summary

| Method | Primary Benchmark | Latency / Hardware | Key Trade-off |
| :--- | :--- | :--- | :--- |
| **OncVision-LM (2024)** | AUC 0.962 | 3.2s / slide (64 A100s) | Maximum accuracy vs. massive compute |
| **MedGraph-Align (2024)** | CheXbert F1 0.812 | 420ms / scan | High factual precision vs. thoracic only |
| **FedOnco (2023)** | Parity 96.8% | 48 sync rounds | Zero data leakage vs. WAN communication |
| **UltraQuant (2024)** | Dice 0.918 | 22ms / 45 FPS (1.8W) | Mobile edge readiness vs. slight noise drop |`;
      suggestions = ['Export comparison to CSV', 'View comparison charts', 'Generate presentation slides'];
    } else {
      responseText = `Based on your query: *"**${question}**"*, I analyzed the active research repository. 

Our synthesized findings show a strong opportunity to build **OncoContinuum**—combining **neuro-symbolic graph constraints** with **test-time continual adaptation** on vision-language transformers. This bridges both the accuracy and clinical trustworthiness requirements demanded by medical peer review.

Would you like me to update the project documentation draft or configure the PowerPoint presentation slides?`;
      suggestions = ['Update documentation draft', 'Generate PowerPoint slides', 'Summarize these papers'];
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: suggestions,
    };
  },
};
