import { Node, Edge } from '@xyflow/react';

export const initialArchitectureNodes: Node[] = [
  {
    id: 'user-node',
    type: 'customStep',
    position: { x: 380, y: 0 },
    data: {
      label: 'Academic Researcher / Clinician',
      category: 'User Actor',
      icon: 'User',
      description: 'Defines research hypotheses, queries, and constraints.',
      color: 'blue',
    },
  },
  {
    id: 'topic-node',
    type: 'customStep',
    position: { x: 380, y: 110 },
    data: {
      label: 'Research Topic Formulation',
      category: 'Input Specification',
      icon: 'Lightbulb',
      description: 'Domain parameters, keyword expansions, year & source filters.',
      color: 'indigo',
    },
  },
  {
    id: 'discovery-node',
    type: 'customStep',
    position: { x: 380, y: 220 },
    data: {
      label: 'Paper Discovery Engine',
      category: 'Information Retrieval',
      icon: 'Search',
      description: 'Cross-index querying across PubMed, arXiv, IEEE, & Nature.',
      color: 'indigo',
    },
  },
  {
    id: 'processing-node',
    type: 'customStep',
    position: { x: 380, y: 330 },
    data: {
      label: 'Paper Ingestion & Preprocessing',
      category: 'Data Pipeline',
      icon: 'FileText',
      description: 'PDF structural parsing, section chunking, metadata extraction.',
      color: 'violet',
    },
  },
  {
    id: 'ai-engine-node',
    type: 'customStep',
    position: { x: 380, y: 440 },
    data: {
      label: 'AI Research Analysis Engine',
      category: 'Foundation Intelligence',
      icon: 'Cpu',
      description: 'Multimodal LLMs (Claude 3.5 / GPT-4o / DeepSeek-R1).',
      color: 'purple',
    },
  },

  // Parallel Engine Sub-tasks (Cluster)
  {
    id: 'subtask-abstract',
    type: 'customFeature',
    position: { x: 60, y: 580 },
    data: {
      label: 'Abstract Synthesis',
      description: 'Structured clinical background & objectives.',
      icon: 'BookOpen',
      badge: 'Core',
    },
  },
  {
    id: 'subtask-summary',
    type: 'customFeature',
    position: { x: 260, y: 580 },
    data: {
      label: 'Summary & Contributions',
      description: 'Findings, clinical takeaways, and impact.',
      icon: 'ListChecks',
      badge: 'Core',
    },
  },
  {
    id: 'subtask-gaps',
    type: 'customFeature',
    position: { x: 460, y: 580 },
    data: {
      label: 'Research Gap Detection',
      description: 'Evidence extraction & unsolved limitations.',
      icon: 'AlertCircle',
      badge: 'Critical',
    },
  },
  {
    id: 'subtask-lit',
    type: 'customFeature',
    position: { x: 660, y: 580 },
    data: {
      label: 'Literature Matrix Extraction',
      description: 'Timeline taxonomy & cross-method synthesis.',
      icon: 'Table',
      badge: 'Synthesis',
    },
  },
  {
    id: 'subtask-method',
    type: 'customFeature',
    position: { x: 860, y: 580 },
    data: {
      label: 'Methodology Decomposition',
      description: 'Pipelines, dataset metrics, & algorithm flows.',
      icon: 'Workflow',
      badge: 'Technical',
    },
  },

  // Downstream Modules
  {
    id: 'knowledge-base-node',
    type: 'customStep',
    position: { x: 380, y: 730 },
    data: {
      label: 'Research Knowledge Base (Graph + Vector)',
      category: 'Semantic Storage',
      icon: 'Database',
      description: 'Structured ontologies, embeddings, and evidence citations.',
      color: 'emerald',
    },
  },
  {
    id: 'comparison-node',
    type: 'customStep',
    position: { x: 380, y: 840 },
    data: {
      label: 'Multi-Paper Comparison Engine',
      category: 'Synthesis Analytics',
      icon: 'GitCompare',
      description: 'Benchmarking metrics, hardware tradeoffs, & limitation matrices.',
      color: 'cyan',
    },
  },
  {
    id: 'questions-node',
    type: 'customStep',
    position: { x: 380, y: 950 },
    data: {
      label: 'Research Question & Hypothesis Generator',
      category: 'Ideation Module',
      icon: 'HelpCircle',
      description: 'Actionable novel problem statements with difficulty ratings.',
      color: 'amber',
    },
  },
  {
    id: 'doc-gen-node',
    type: 'customStep',
    position: { x: 200, y: 1070 },
    data: {
      label: 'Documentation Generator',
      category: 'Publishing Engine',
      icon: 'FileCode',
      description: 'IEEE/ACM compliant manuscript draft with 13 standard sections.',
      color: 'rose',
    },
  },
  {
    id: 'ppt-gen-node',
    type: 'customStep',
    position: { x: 560, y: 1070 },
    data: {
      label: 'Presentation (PPT) Generator',
      category: 'Dissemination Engine',
      icon: 'Presentation',
      description: 'Automated 12-slide conference slide decks & defense decks.',
      color: 'orange',
    },
  },
];

export const initialArchitectureEdges: Edge[] = [
  { id: 'e1-2', source: 'user-node', target: 'topic-node', animated: true },
  { id: 'e2-3', source: 'topic-node', target: 'discovery-node', animated: true },
  { id: 'e3-4', source: 'discovery-node', target: 'processing-node', animated: true },
  { id: 'e4-5', source: 'processing-node', target: 'ai-engine-node', animated: true },

  // AI Engine to sub-tasks
  { id: 'e5-sub1', source: 'ai-engine-node', target: 'subtask-abstract', type: 'smoothstep' },
  { id: 'e5-sub2', source: 'ai-engine-node', target: 'subtask-summary', type: 'smoothstep' },
  { id: 'e5-sub3', source: 'ai-engine-node', target: 'subtask-gaps', type: 'smoothstep' },
  { id: 'e5-sub4', source: 'ai-engine-node', target: 'subtask-lit', type: 'smoothstep' },
  { id: 'e5-sub5', source: 'ai-engine-node', target: 'subtask-method', type: 'smoothstep' },

  // Sub-tasks to Knowledge Base
  { id: 'esub1-kb', source: 'subtask-abstract', target: 'knowledge-base-node', type: 'smoothstep' },
  { id: 'esub2-kb', source: 'subtask-summary', target: 'knowledge-base-node', type: 'smoothstep' },
  { id: 'esub3-kb', source: 'subtask-gaps', target: 'knowledge-base-node', type: 'smoothstep' },
  { id: 'esub4-kb', source: 'subtask-lit', target: 'knowledge-base-node', type: 'smoothstep' },
  { id: 'esub5-kb', source: 'subtask-method', target: 'knowledge-base-node', type: 'smoothstep' },

  // Knowledge Base to Comparison & Questions
  { id: 'e-kb-comp', source: 'knowledge-base-node', target: 'comparison-node', animated: true },
  { id: 'e-comp-q', source: 'comparison-node', target: 'questions-node', animated: true },

  // Final outputs
  { id: 'e-q-doc', source: 'questions-node', target: 'doc-gen-node', type: 'smoothstep', animated: true },
  { id: 'e-q-ppt', source: 'questions-node', target: 'ppt-gen-node', type: 'smoothstep', animated: true },
];
