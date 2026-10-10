# AI Research Scientist

An advanced, production-quality, AI-powered academic research platform designed to transform research ideas into publication-ready, structured insights.

---

## 🔬 Project Overview

**AI Research Scientist** bridges the gap between raw scientific curiosity and rigorous academic synthesis. It provides an autonomous, multi-stage research workspace that automates:
- Cross-repository research paper discovery across PubMed, Nature, arXiv, IEEE Xplore, and ScienceDirect
- Deep multidimensional paper analysis (Contributions, Empirical Findings, Clinical Implications)
- Extraction of high-priority research gaps with empirical citation evidence
- Evolutionary literature review timelines and interactive comparative matrices
- Visual machine learning pipeline and methodology decomposition
- Benchmark comparison matrices with interactive analytics
- Interactive proposed system architecture modeling using React Flow
- Academic manuscript generation formatted for IEEE and ACM standards
- PowerPoint presentation slide deck generation with full-screen slideshow preview
- Context-aware AI research assistant with real-time research query support

---

## 🔄 The Research Workflow Pipeline

```
Research Topic Formulation
          ↓
Paper Discovery Engine
          ↓
Deep Paper Analysis
          ↓
Research Gaps & Hypotheses
          ↓
Systematic Literature Review
          ↓
Methodology Decomposition
          ↓
Comparative Benchmarking
          ↓
Proposed Architecture Diagram (React Flow)
          ↓
Automated Documentation Drafting (IEEE / ACM)
          ↓
Presentation Generator (PPTX Deck)
```

---

## 🛠️ Technology Stack

- **Core Framework**: React 19, TypeScript, Vite
- **Styling & Design System**: Tailwind CSS (Dark/Light mode, CSS variables, glassmorphism)
- **Component Architecture**: Modular component library with Radix UI patterns & Lucide React icons
- **State Management**: TanStack Query (React Query) + Global React Context with `localStorage` persistence
- **Form & Validation**: React Hook Form + Zod
- **Interactive Architecture Diagram**: `@xyflow/react` (React Flow) with custom step and cluster nodes
- **Data Visualization**: Recharts (Prevalence Bar Charts, Importance Pie Charts, Velocity Area Charts)
- **Markdown Rendering**: React Markdown with academic prose typography styling
- **Animations & Transitions**: Framer Motion smooth micro-animations
- **Celebration Effects**: Canvas Confetti

---

## 📁 Folder Structure

```
E:\Research\
├── index.html                  # HTML entry point with academic typography fonts
├── vite.config.ts              # Vite configuration with path aliases (@/)
├── tailwind.config.js          # Design system theme tokens (colors, borders, radii)
├── tsconfig.json               # Root TypeScript configuration
├── tsconfig.app.json           # Application TypeScript configuration with path aliases
├── package.json                # Dependencies, scripts, and build targets
└── src/
    ├── main.tsx                # React DOM root mounting
    ├── App.tsx                 # React Router routing configuration
    ├── index.css               # Global Tailwind CSS, theme tokens, and custom scrollbars
    ├── vite-env.d.ts           # Type references and CSS module declarations
    ├── types/
    │   └── index.ts            # TypeScript domain models (ResearchProject, Paper, Gap, etc.)
    ├── data/                   # Realistic, curated academic mock data
    │   ├── mockProjects.ts     # Sample research projects across AI domains
    │   ├── mockPapers.ts       # 20 detailed oncology/AI papers with metadata & abstracts
    │   ├── mockAnalysis.ts     # Deep multi-tab paper analyses
    │   ├── mockResearchGaps.ts # Gaps and generated hypotheses
    │   ├── mockLiterature.ts   # Evolutionary timeline and literature matrix
    │   ├── mockMethodology.ts  # Visual step-by-step methodology workflows
    │   ├── mockComparison.ts   # Comparative benchmark scores & hardware latencies
    │   ├── mockArchitecture.ts # React Flow nodes and edges configuration
    │   ├── mockDocumentation.ts# 13 IEEE/ACM compliant academic manuscript sections
    │   ├── mockPresentation.ts # 12-slide PowerPoint conference deck
    │   └── mockSettings.ts     # Default user profile and intelligence settings
    ├── services/
    │   ├── researchService.ts  # Mock asynchronous service layer with local persistence
    │   └── aiAssistantService.ts # Contextual AI assistant conversation engine
    ├── context/
    │   └── ResearchContext.tsx # Global state provider (active project, papers, theme, toasts)
    ├── lib/
    │   └── utils.ts            # cn helper (clsx + tailwind-merge), date formatters
    ├── components/
    │   ├── ui/                 # Reusable atomic UI components
    │   │   ├── Button.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Card.tsx
    │   │   ├── Input.tsx
    │   │   ├── Select.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Progress.tsx
    │   │   ├── PageHeader.tsx
    │   │   ├── LoadingState.tsx
    │   │   ├── EmptyState.tsx
    │   │   └── ToastContainer.tsx
    │   ├── layout/             # Application shell and navigation
    │   │   ├── AppLayout.tsx
    │   │   ├── Header.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── ResearchStepper.tsx
    │   └── assistant/          # AI Assistant interactive drawer
    │       └── AIAssistantPanel.tsx
    └── pages/                  # Top-level workspace pages
        ├── Dashboard.tsx       # Research velocity, stats, and recent projects
        ├── NewResearch.tsx     # Animated AI discovery sequence and topic input
        ├── PaperCollection.tsx # Filterable paper cards with batch analysis
        ├── PaperAnalysis.tsx   # Dual-column deep analysis workspace with tabs
        ├── ResearchGaps.tsx    # Gap charts and AI hypothesis generation
        ├── LiteratureReview.tsx# Historical timeline & horizontal scrolling matrix
        ├── MethodologyPage.tsx # Visual ML pipeline stages and technical cards
        ├── ComparisonPage.tsx  # Benchmark charts and comparison table
        ├── ArchitecturePage.tsx# Interactive React Flow canvas with zoom & export
        ├── DocumentationPage.tsx# Template selector and manuscript preview
        ├── PresentationPage.tsx# 12-slide PPT preview cards and slideshow mode
        ├── MyResearch.tsx      # Portfolio manager (table/grid, duplicate, delete)
        └── SettingsPage.tsx    # User profile, AI models, and theme switcher
```

---

## 🚀 Available Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle with TypeScript checking
npm run build

# Preview production build locally
npm run preview

# Run TypeScript type check
npm run type-check

# Run linter
npm run lint
```

---

## 📊 How Mock Data Works

The frontend operates completely independently without requiring an active backend or external API keys:
1. **Separation of Concerns**: All mock data is stored in `src/data/`, maintaining structured domain models defined in `src/types/index.ts`.
2. **Service Abstraction**: Components interact with `src/services/researchService.ts` via standard asynchronous promises (`async/await`) with simulated network latency.
3. **Session Persistence**: User actions (creating new research projects, selecting papers, regenerating analyses, saving research questions, updating settings) are automatically synchronized with `localStorage`.

---

## 🔮 Future Backend Integration

When connecting to a real Python (FastAPI) or Node.js backend:
1. Replace the implementations in `src/services/researchService.ts` and `src/services/aiAssistantService.ts` with standard `fetch` or `axios` API calls.
2. The TypeScript interfaces in `src/types/index.ts` serve as the exact contract / DTO schemas for backend endpoints:
   - `POST /api/research/discover` → Ingest papers from arXiv, PubMed, Semantic Scholar
   - `POST /api/research/analyze` → Trigger LLM paper analysis pipelines
   - `GET /api/research/gaps` → Retrieve extracted limitations and research gaps
   - `POST /api/research/export/docx` → Stream compiled Word documents
   - `POST /api/research/export/pptx` → Stream generated PowerPoint presentations
