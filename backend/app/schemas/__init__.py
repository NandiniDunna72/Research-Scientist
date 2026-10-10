"""Pydantic request and response schemas."""

from app.schemas.user import UserBase, UserCreate, UserResponse
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    TokenResponse,
    RegisterResponse,
    MessageResponse,
    CurrentUserResponse,
)

from app.schemas.literature_review import (
    GenerateLiteratureReviewRequest,
    ThemeItem,
    PaperSummaryItem,
    ResearchLandscape,
    MethodologicalAnalysis,
    ComparativeSynthesis,
    LiteratureReviewGenerationResponse,
)

from app.schemas.methodology import (
    GenerateMethodologyRequest,
    MethodologyResponse,
    MethodologyStatusResponse,
)

from app.schemas.comparison import (
    GeneratePaperComparisonRequest,
    PaperComparisonResponse,
    EligiblePapersResponse,
    EligiblePaperItem,
)

from app.schemas.architecture import (
    GenerateArchitectureRequest,
    ArchitectureResponse,
    ArchitectureResult,
    ArchitectureComponent,
    ArchitectureDiagram,
    DataFlowStep,
    TechnologyStackItem,
    DataStorageDesign,
    DeploymentArchitecture,
    ArchitectureJustification,
    AlternativeArchitecture,
    ImplementationStage,
    LimitationAssumption,
)

from app.schemas.documentation import (
    GenerateDocumentationRequest,
    UpdateDocumentationRequest,
    RegenerateDocumentationRequest,
    DocumentationSectionSchema,
    DocumentationData,
    DocumentationResponse,
)

from app.schemas.presentation import (
    SlideSchema,
    GeneratePresentationRequest,
    UpdatePresentationRequest,
    RegeneratePresentationRequest,
    PresentationData,
    PresentationResponse,
)

__all__ = [
    "UserBase",
    "UserCreate",
    "UserResponse",
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "RegisterResponse",
    "MessageResponse",
    "CurrentUserResponse",
    "GenerateResearchQuestionsRequest",
    "ResearchQuestionItemResponse",
    "ResearchQuestionGenerationResponse",
    "GenerateLiteratureReviewRequest",
    "ThemeItem",
    "PaperSummaryItem",
    "ResearchLandscape",
    "MethodologicalAnalysis",
    "ComparativeSynthesis",
    "LiteratureReviewGenerationResponse",
    "GenerateMethodologyRequest",
    "MethodologyResponse",
    "MethodologyStatusResponse",
    "GeneratePaperComparisonRequest",
    "PaperComparisonResponse",
    "EligiblePapersResponse",
    "EligiblePaperItem",
    "GenerateArchitectureRequest",
    "ArchitectureResponse",
    "ArchitectureResult",
    "ArchitectureComponent",
    "ArchitectureDiagram",
    "DataFlowStep",
    "TechnologyStackItem",
    "DataStorageDesign",
    "DeploymentArchitecture",
    "ArchitectureJustification",
    "AlternativeArchitecture",
    "ImplementationStage",
    "LimitationAssumption",
    "GenerateDocumentationRequest",
    "UpdateDocumentationRequest",
    "RegenerateDocumentationRequest",
    "DocumentationSectionSchema",
    "DocumentationData",
    "DocumentationResponse",
    "SlideSchema",
    "GeneratePresentationRequest",
    "UpdatePresentationRequest",
    "RegeneratePresentationRequest",
    "PresentationData",
    "PresentationResponse",
]

