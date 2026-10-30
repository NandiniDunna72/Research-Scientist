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

## 🤖 Free Agentic RAG Chatbot Integration

The application includes an **Agentic Retrieval-Augmented Generation (RAG)** chatbot engineered specifically for academic investigation. It operates completely **free and open-source**, with zero mandatory commercial or paid API keys.

### 🏛️ Agentic RAG Architecture

The chatbot does not simply feed entire documents into an LLM. It executes a multi-agent orchestration graph:

```
[User Inquiry]
      ↓
[Domain Guard] ──(Unrelated/Off-topic)──→ Rejection Notice
      ↓ (Strict Research Scope)
[Query Planning Agent] ──→ Resolves Conversational Antecedents & Selects Target Sources
      ↓
[Research Retrieval Agent] ──→ ChromaDB Semantic Search (Project-Isolated Filter)
      ↓
[Evidence Verification Agent] ──→ Checks Passage Grounding & Sufficiency Threshold
      ↓
  [Sufficient?] ──(No, Iteration < 2)──→ [Additional Retrieval Pass]
      ↓ (Yes)                                      │
[Research Synthesis Agent] ←───────────────────────┘
      ↓ (Ollama Local Inference or Verified Direct Fallback)
[Citation Validation Agent] ──→ Ensures Page-Level Fidelity (Zero Hallucination)
      ↓
[Structured Academic Response + Expandable Citations]
```

### 🧠 The Core Agents

1. **Research Document Ingestion Agent** (`backend/app/services/project_ingestion_service.py`):
   - Ingests database papers, abstracts, methodologies, findings, limitations, literature reviews, and comparison matrices.
   - Page-by-page PDF text extraction via PyMuPDF (`fitz`) and `pypdf`, preserving exact `page_number` metadata.
   - Splits documents into overlapping semantic chunks and generates normalized dense embeddings (`BAAI/bge-small-en-v1.5`).
   - Stores chunks in persistent **ChromaDB** with strict metadata filtering by `project_id`.

2. **Query Planning Agent** (`backend/app/services/agentic_rag_graph.py`):
   - Uses multi-turn conversation memory to resolve ambiguous follow-up pronouns (e.g. *"What limitations did the authors report?"* automatically links to the previously discussed paper).
   - Detects whether cross-paper comparison or single-paper deep dive is required.

3. **Research Retrieval Agent** (`backend/app/services/rag_vector_store.py`):
   - Executes semantic similarity search strictly filtered by `project_id` and `user_id`.
   - Never allows documents or findings from one research project to bleed into another.

4. **Evidence Verification Agent**:
   - Assesses relevance scores of retrieved passages.
   - Triggers bounded re-retrieval (up to `MAX_RETRIEVAL_ITERATIONS=2`) if evidence is sparse.
   - If evidence cannot be found, responds with zero hallucination:
     *"I couldn't find sufficient supporting evidence in the research documents available in this project. Please add the relevant paper or provide more information."*

5. **Research Synthesis Agent & Citation Validator**:
   - Connects to local **Ollama** (`llama3.2:3b` or `mistral`) via HTTP.
   - If Ollama is offline, gracefully degrades to direct evidence synthesis with an explicit local setup notice.
   - Every citation includes paper title, authors, year, page number (for PDFs), and supporting excerpt.

---

### 🚀 Windows Quickstart Guide

#### 1. Prerequisites
- **Python**: 3.10 to 3.14 (Virtual environment in `backend/venv`)
- **Node.js**: v18+ & npm
- **PostgreSQL**: Port 5432 (database `ai_research_scientist`)
- **Ollama**: (Free local LLM engine) [https://ollama.com](https://ollama.com)

#### 2. Install Dependencies
```powershell
# In project root: Install React frontend packages
npm.cmd install

# In backend directory: Install Python packages
cd backend
& "venv\Scripts\pip.exe" install -r requirements.txt
cd ..
```

#### 3. Install & Start Ollama (Free Local Inference)
1. Download and run the Windows installer from [ollama.com/download/windows](https://ollama.com/download/windows).
2. Pull and test the recommended lightweight instruction model:
```powershell
ollama pull llama3.2:3b
# Or for ultra-low memory systems (1GB VRAM):
ollama pull llama3.2:1b
```
3. Ollama runs automatically as a background service on `http://localhost:11434`.

#### 4. Configure Environment Variables
Create or verify `backend/.env`:
```ini
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/ai_research_scientist
JWT_SECRET_KEY=ai_research_scientist_secret_jwt_key_2026_super_secure_32b
FRONTEND_URL=http://localhost:5173

# Free Agentic RAG Configuration
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=llama3.2:3b
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
VECTOR_STORE_PATH=./data/chroma
RAG_TOP_K=5
MAX_RETRIEVAL_ITERATIONS=2
```

#### 5. Start the Application
Open two PowerShell terminals:

**Terminal 1 (Backend FastAPI)**:
```powershell
& "backend\venv\Scripts\uvicorn.exe" app.main:app --app-dir backend --port 8000 --reload
```

**Terminal 2 (Frontend React)**:
```powershell
npm.cmd run dev
```
Open your browser at `http://localhost:5173`.

---

### 🧪 Testing the Agentic RAG Chatbot

#### Run the Automated Test Suite (14 Verification Cases)
The test suite in `backend/test_agentic_rag.py` executes without requiring paid API keys or live Ollama inference:
```powershell
& "backend\venv\Scripts\python.exe" backend/test_agentic_rag.py
```
**Test Coverage**:
- ✅ Valid research question
- ✅ Unrelated programming question rejection
- ✅ Unrelated sports/entertainment rejection
- ✅ Supporting evidence retrieval & citations
- ✅ Zero hallucination on unsupported claims
- ✅ Exact PDF page number citations
- ✅ Multi-turn follow-up antecedent resolution
- ✅ Multi-paper comparative query planning
- ✅ Missing or corrupted PDF handling
- ✅ Graceful Ollama offline fallback handling
- ✅ Document deduplication on re-indexing
- ✅ Project isolation & multi-tenant security
- ✅ Adversarial prompt injection defense
- ✅ Fabricated citation rejection

---

### 🔒 Strict Domain Enforcement

Unrelated inquiries (sports, entertainment, generic leetcode questions, personal advice) are rejected deterministically by the backend with:
> *"I'm your AI Research Scientist assistant. I can help you explore research papers, understand methodologies and findings, compare studies, identify research gaps, and develop your research project. Please ask a research-related question."*

---

### 📦 Licensing & Dependencies
- **LangGraph & LangChain**: MIT License (Free, Open Source)
- **ChromaDB**: Apache 2.0 (Free, Open Source)
- **Sentence-Transformers**: Apache 2.0 (Free, Open Source)
- **PyMuPDF**: AGPL / Commercial (Fallbacks to `pypdf` under BSD License)
- **Ollama**: MIT License (Free, Open Source)
