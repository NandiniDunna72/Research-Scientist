import re
from typing import Tuple, Optional

REJECTION_MESSAGE = (
    "I'm your AI Research Scientist assistant. I can help you explore research papers, "
    "understand methodologies and findings, compare studies, identify research gaps, "
    "and develop your research project. Please ask a research-related question."
)

UNSUPPORTED_EVIDENCE_MESSAGE = (
    "I couldn't find sufficient supporting evidence in the research documents available in this project. "
    "Please add the relevant paper or provide more information."
)

# Deterministic patterns for prompt injection or system override attempts
PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior|above)\s+instructions?",
    r"you\s+are\s+now\s+(a|an|dan|developer|jailbroken)",
    r"act\s+as\s+(dan|an\s+unfiltered|an\s+unrestricted)",
    r"disregard\s+(all\s+)?rules",
    r"pretend\s+to\s+be",
    r"bypass\s+(safety|filter|restrictions?)",
    r"reveal\s+your\s+system\s+(prompt|instructions)",
    r"jailbreak",
]

# Patterns for off-topic non-academic queries
ENTERTAINMENT_SPORTS_PATTERNS = [
    r"\b(who\s+won|score\s+of|match|world\s+cup|super\s+bowl|nba|fifa|ipl|cricket|football|soccer|baseball|basketball|tennis|nfl)\b",
    r"\b(movie|cinema|actor|actress|hollywood|bollywood|netflix|song|lyrics|singer|pop\s+star|celebrity|album)\b",
    r"\b(recipe|cocktail|bake\s+a\s+cake|how\s+to\s+cook|pancake|pizza|dinner\s+tonight)\b",
    r"\b(dating\s+advice|relationship\s+advice|horoscope|zodiac|fortune\s+teller)\b",
    r"\b(weather\s+in|forecast\s+for|tourist\s+places\s+in|flight\s+tickets?)\b",
    r"\b(tell\s+me\s+a\s+joke|write\s+(me\s+)?a\s+(poem|story|song)\s+about)\b",
]

# Generic programming/leetcode questions unrelated to research or scientific architecture
GENERIC_CODING_PATTERNS = [
    r"\b(invert\s+(a\s+)?binary\s+tree|two\s+sum|fizz\s*buzz|reverse\s+(a\s+)?linked\s+list|leetcode|hackerrank)\b",
    r"\b(how\s+to\s+center\s+a\s+div|css\s+button\s+hover|react\s+todo\s+app|html\s+boilerplate)\b",
    r"\b(write\s+(a\s+)?python\s+script\s+to\s+scrape|regex\s+for\s+email\s+validation)\b",
]

# Academic / Research indicators
RESEARCH_KEYWORDS = [
    "paper", "papers", "abstract", "summary", "summarize", "methodology", "method", "algorithm",
    "dataset", "experiment", "result", "finding", "limitation", "gap", "literature", "review",
    "citation", "author", "baseline", "model", "architecture", "accuracy", "benchmark",
    "hypothesis", "contribution", "evaluation", "framework", "study", "studies", "proposed",
    "analysis", "comparison", "compare", "future work", "ieee", "acm", "arxiv", "doi",
    "novelty", "metric", "precision", "recall", "loss", "training", "parameter", "corpus"
]


class DomainGuard:
    """
    Lightweight, deterministic domain verification agent to enforce the strict
    research-only scope required by Section 5 of the AI Research Scientist specifications.
    """

    @staticmethod
    def validate_query(query: str, project_topic: Optional[str] = None) -> Tuple[bool, str]:
        """
        Validates if the user query is strictly academic/research-oriented.
        Returns:
            (True, "") if the query is valid and permitted.
            (False, REJECTION_MESSAGE) if rejected.
        """
        cleaned = query.strip()
        if not cleaned:
            return False, REJECTION_MESSAGE

        q_lower = cleaned.lower()

        # 1. Check prompt injection / jailbreak attempts
        for pattern in PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, q_lower):
                return False, REJECTION_MESSAGE

        # 2. Check clear entertainment, sports, cooking, personal advice
        for pattern in ENTERTAINMENT_SPORTS_PATTERNS:
            if re.search(pattern, q_lower):
                # Ensure it's not actually an academic paper query (e.g., "sports analytics in paper X")
                if not any(k in q_lower for k in ["paper", "study", "research", "methodology", "dataset", "literature"]):
                    return False, REJECTION_MESSAGE

        # 3. Check generic programming questions unrelated to research
        for pattern in GENERIC_CODING_PATTERNS:
            if re.search(pattern, q_lower):
                return False, REJECTION_MESSAGE

        # 4. Check for positive academic indicators or project relevance
        has_academic_keyword = any(k in q_lower for k in RESEARCH_KEYWORDS)

        # Also check if terms from the project topic appear in the query
        has_topic_match = False
        if project_topic:
            topic_words = [w for w in re.findall(r"\w+", project_topic.lower()) if len(w) > 3]
            has_topic_match = any(tw in q_lower for tw in topic_words)

        # Allow query if it possesses academic terminology, project correlation, or research framing
        if has_academic_keyword or has_topic_match:
            return True, ""

        # For short or ambiguous queries, check if inquiry is a research question format
        question_starters = ["what", "how", "why", "which", "can", "does", "is", "are", "explain", "describe", "show"]
        first_word = q_lower.split()[0] if q_lower.split() else ""
        if first_word in question_starters:
            # Check length: if it's substantial, give benefit of the doubt if not strictly off-topic
            words = q_lower.split()
            if len(words) >= 4:
                return True, ""

        # If it has no research connection and doesn't match academic patterns, reject
        return False, REJECTION_MESSAGE
