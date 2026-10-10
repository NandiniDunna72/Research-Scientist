import io
import json
import logging
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Union

import httpx
from app.core.config import settings

# DOCX and ReportLab for genuine document exports
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    PageBreak,
    HRFlowable,
)
from reportlab.lib import colors
from reportlab.pdfgen import canvas

logger = logging.getLogger("documentation_service")
logger.setLevel(logging.INFO)


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas for ReportLab to inject dynamic 'Page X of Y' footers."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header running line on pages > 1
        if self._pageNumber > 1:
            self.drawString(54, 755, "AI Research Scientist — Manuscript Draft")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 748, 558, 748)

        # Footer running line & page number
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 36, page_text)
        self.drawString(54, 36, "Confidential — Generated Academic Working Draft")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 46, 558, 46)
        self.restoreState()


class DocumentationService:
    """
    AI & Analytical Service for generating doctoral-grade Academic Research Documentation
    grounded strictly in all upstream research assets (Modules 1 through 8).
    Supports validation, section-level regeneration, and native Markdown, DOCX, and PDF exports.
    """

    DEFAULT_SECTION_SPECS = [
        {"id": "sec-title", "number": 1, "title": "Title Page", "key": "title_page"},
        {"id": "sec-abstract", "number": 2, "title": "Abstract", "key": "abstract"},
        {"id": "sec-intro", "number": 3, "title": "Introduction", "key": "introduction"},
        {"id": "sec-problem", "number": 4, "title": "Problem Statement and Objectives", "key": "problem_statement"},
        {"id": "sec-questions", "number": 5, "title": "Research Questions", "key": "research_questions"},
        {"id": "sec-lit-review", "number": 6, "title": "Literature Review", "key": "literature_review"},
        {"id": "sec-gaps", "number": 7, "title": "Research Gap Analysis", "key": "research_gaps"},
        {"id": "sec-methodology", "number": 8, "title": "Research Methodology", "key": "methodology"},
        {"id": "sec-architecture", "number": 9, "title": "Proposed System Architecture", "key": "architecture"},
        {"id": "sec-comparison", "number": 10, "title": "Comparative Analysis", "key": "comparative_analysis"},
        {"id": "sec-solution", "number": 11, "title": "Proposed Solution & Expected Contributions", "key": "solution_contributions"},
        {"id": "sec-results", "number": 12, "title": "Planned Evaluation & Protocol", "key": "planned_evaluation"},
        {"id": "sec-limitations", "number": 13, "title": "Limitations & Future Work", "key": "limitations_future_work"},
        {"id": "sec-conclusion", "number": 14, "title": "Conclusion", "key": "conclusion"},
        {"id": "sec-references", "number": 15, "title": "References", "key": "references"},
    ]

    @classmethod
    def _count_words(cls, text: str) -> int:
        """Counts words in a markdown string accurately."""
        if not text:
            return 0
        # Clean markdown symbols
        cleaned = re.sub(r"[#*`_\-\[\]\(\)]", " ", text)
        words = cleaned.strip().split()
        return len(words)

    @classmethod
    def format_citations_and_references(
        cls,
        papers_data: List[Dict[str, Any]],
        style: str = "IEEE",
    ) -> Tuple[Dict[Any, str], List[str], str]:
        """
        Creates genuine bibliographic citations from actual surveyed papers.
        Returns:
            - citation_map: paper_id or index -> "[1]"
            - references_list: list of bibliographic strings
            - references_markdown: formatted markdown references section
        """
        citation_map: Dict[Any, str] = {}
        references_list: List[str] = []

        if not papers_data:
            ref_md = "*No external reference papers selected in the current research project.*"
            return citation_map, [], ref_md

        for idx, p in enumerate(papers_data):
            marker = f"[{idx + 1}]"
            pid = p.get("id") or idx + 1
            citation_map[pid] = marker
            citation_map[str(pid)] = marker

            # Author formatting
            authors_raw = p.get("authors") or []
            authors_str = "Unknown Authors"
            if isinstance(authors_raw, list) and authors_raw:
                formatted_authors = []
                for a in authors_raw:
                    if isinstance(a, dict):
                        name = a.get("name") or a.get("author") or "Unknown"
                        formatted_authors.append(name)
                    elif isinstance(a, str):
                        formatted_authors.append(a)
                if len(formatted_authors) > 3:
                    authors_str = f"{formatted_authors[0]} et al."
                elif formatted_authors:
                    authors_str = ", ".join(formatted_authors)
            elif isinstance(authors_raw, str):
                authors_str = authors_raw

            year = p.get("publication_year") or p.get("year") or "n.d."
            title = p.get("title") or "Untitled Paper"
            venue = p.get("venue") or p.get("journalOrConference") or p.get("source") or "Conference Proceedings"
            doi = p.get("doi")
            url = p.get("paper_url") or p.get("paperUrl") or p.get("pdf_url") or p.get("pdfUrl")

            if style.upper() == "APA":
                ref_entry = f"{marker} {authors_str} ({year}). {title}. *{venue}*."
                if doi:
                    ref_entry += f" https://doi.org/{doi}"
                elif url:
                    ref_entry += f" Available: {url}"
            else:  # Default IEEE
                ref_entry = f"{marker} {authors_str}, \"{title},\" in *{venue}*, {year}."
                if doi:
                    ref_entry += f" DOI: {doi}."
                elif url:
                    ref_entry += f" [Online]. Available: {url}"

            references_list.append(ref_entry)

        ref_md = "\n\n".join(references_list)
        return citation_map, references_list, ref_md

    @classmethod
    async def generate_documentation(
        cls,
        topic: str,
        project_description: Optional[str] = None,
        template: str = "IEEE Conference",
        target_journal: Optional[str] = None,
        reference_style: str = "IEEE",
        authors: Optional[Union[List[str], str]] = None,
        institution: Optional[str] = None,
        sections_to_include: Optional[List[str]] = None,
        # Upstream Module Assets
        papers_data: Optional[List[Dict[str, Any]]] = None,
        analyses_data: Optional[List[Dict[str, Any]]] = None,
        gaps_data: Optional[List[Dict[str, Any]]] = None,
        questions_data: Optional[List[Dict[str, Any]]] = None,
        lit_review_data: Optional[Dict[str, Any]] = None,
        methodology_data: Optional[Dict[str, Any]] = None,
        comparison_data: Optional[Dict[str, Any]] = None,
        architecture_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Orchestrates full research documentation generation.
        Combines AI synthesis with domain-grounded analytical fallback.
        """
        papers = papers_data or []
        analyses = analyses_data or []
        gaps = gaps_data or []
        questions = questions_data or []
        lit_review = lit_review_data or {}
        methodology = methodology_data or {}
        comparison = comparison_data or {}
        architecture = architecture_data or {}

        # Track missing upstream context
        missing_upstream_context: List[str] = []
        if not papers:
            missing_upstream_context.append("Paper Discovery & Collection (Module 1/2) has no papers.")
        if not gaps:
            missing_upstream_context.append("Research Gap Identification (Module 3) not completed.")
        if not questions:
            missing_upstream_context.append("Research Question Generation (Module 4) not formulated.")
        if not lit_review:
            missing_upstream_context.append("Literature Review Generation (Module 5) not synthesized.")
        if not methodology:
            missing_upstream_context.append("Research Methodology (Module 6) not formulated.")
        if not comparison:
            missing_upstream_context.append("Paper Comparison (Module 7) not completed.")
        if not architecture:
            missing_upstream_context.append("Proposed System Architecture (Module 8) not generated.")

        citation_map, references_list, ref_markdown = cls.format_citations_and_references(
            papers, style=reference_style
        )

        # Attempt LLM synthesis if AI_API_KEY is configured
        api_key = settings.AI_API_KEY
        if api_key:
            try:
                llm_sections = await cls._call_llm_documentation(
                    topic=topic,
                    project_description=project_description,
                    template=template,
                    target_journal=target_journal,
                    reference_style=reference_style,
                    authors=authors,
                    institution=institution,
                    papers=papers,
                    gaps=gaps,
                    questions=questions,
                    lit_review=lit_review,
                    methodology=methodology,
                    comparison=comparison,
                    architecture=architecture,
                    citation_map=citation_map,
                    api_key=api_key,
                )
                if llm_sections and isinstance(llm_sections, dict):
                    doc_data = cls._build_doc_data_from_section_dict(
                        topic=topic,
                        template=template,
                        target_journal=target_journal,
                        reference_style=reference_style,
                        authors=authors,
                        institution=institution,
                        section_contents=llm_sections,
                        sections_to_include=sections_to_include,
                        references_markdown=ref_markdown,
                        missing_upstream_context=missing_upstream_context,
                    )
                    return doc_data
            except Exception as e:
                logger.warning(f"LLM documentation generation failed: {e}. Falling back to analytical engine.")

        # Deterministic analytical academic synthesis engine
        analytical_sections = cls._analytical_documentation_engine(
            topic=topic,
            project_description=project_description,
            template=template,
            target_journal=target_journal,
            reference_style=reference_style,
            authors=authors,
            institution=institution,
            papers=papers,
            analyses=analyses,
            gaps=gaps,
            questions=questions,
            lit_review=lit_review,
            methodology=methodology,
            comparison=comparison,
            architecture=architecture,
            citation_map=citation_map,
            references_markdown=ref_markdown,
            missing_context=missing_upstream_context,
        )

        return cls._build_doc_data_from_section_dict(
            topic=topic,
            template=template,
            target_journal=target_journal,
            reference_style=reference_style,
            authors=authors,
            institution=institution,
            section_contents=analytical_sections,
            sections_to_include=sections_to_include,
            references_markdown=ref_markdown,
            missing_upstream_context=missing_upstream_context,
        )

    @classmethod
    def _build_doc_data_from_section_dict(
        cls,
        topic: str,
        template: str,
        target_journal: Optional[str],
        reference_style: str,
        authors: Optional[Union[List[str], str]],
        institution: Optional[str],
        section_contents: Dict[str, str],
        sections_to_include: Optional[List[str]],
        references_markdown: str,
        missing_upstream_context: List[str],
    ) -> Dict[str, Any]:
        """Constructs final structured response with sections, word counts, and compiled markdown."""
        sections: List[Dict[str, Any]] = []

        for spec in cls.DEFAULT_SECTION_SPECS:
            sec_id = spec["id"]
            sec_num = spec["number"]
            sec_title = spec["title"]
            sec_key = spec["key"]

            content = section_contents.get(sec_key, "")
            if sec_key == "references" and not content:
                content = references_markdown

            included = True
            if sections_to_include is not None:
                included = sec_id in sections_to_include

            word_count = cls._count_words(content)

            sections.append({
                "id": sec_id,
                "number": sec_num,
                "title": sec_title,
                "content": content.strip(),
                "included": included,
                "wordCount": word_count,
                "section_key": sec_key,
            })

        compiled_parts = [
            s["content"] for s in sections if s["included"] and s["content"].strip()
        ]
        compiled_markdown = "\n\n---\n\n".join(compiled_parts)
        total_word_count = sum(s["wordCount"] for s in sections if s["included"])

        return {
            "title": topic,
            "template": template,
            "target_journal": target_journal,
            "reference_style": reference_style,
            "authors": authors,
            "institution": institution,
            "status": "draft",
            "version": 1,
            "sections": sections,
            "compiled_markdown": compiled_markdown,
            "total_word_count": total_word_count,
            "missing_upstream_context": missing_upstream_context,
        }

    @classmethod
    def regenerate_sections(
        cls,
        existing_doc_data: Dict[str, Any],
        section_ids_to_regenerate: Optional[List[str]],
        project_context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Regenerates ONLY selected sections or all sections while strictly preserving
        manual edits on non-regenerated sections.
        """
        all_specs = {s["id"]: s for s in cls.DEFAULT_SECTION_SPECS}
        target_ids = set(section_ids_to_regenerate) if section_ids_to_regenerate else set(all_specs.keys())

        # Generate fresh content pool for the project
        papers = project_context.get("papers_data") or []
        citation_map, _, ref_markdown = cls.format_citations_and_references(
            papers, style=existing_doc_data.get("reference_style", "IEEE")
        )

        missing_context = []
        if not project_context.get("methodology_data"):
            missing_context.append("Methodology missing")
        if not project_context.get("architecture_data"):
            missing_context.append("Architecture missing")

        fresh_sections = cls._analytical_documentation_engine(
            topic=project_context.get("topic") or existing_doc_data.get("title", "Academic Research"),
            project_description=project_context.get("project_description"),
            template=existing_doc_data.get("template", "IEEE Conference"),
            target_journal=existing_doc_data.get("target_journal"),
            reference_style=existing_doc_data.get("reference_style", "IEEE"),
            authors=existing_doc_data.get("authors"),
            institution=existing_doc_data.get("institution"),
            papers=papers,
            analyses=project_context.get("analyses_data") or [],
            gaps=project_context.get("gaps_data") or [],
            questions=project_context.get("questions_data") or [],
            lit_review=project_context.get("lit_review_data") or {},
            methodology=project_context.get("methodology_data") or {},
            comparison=project_context.get("comparison_data") or {},
            architecture=project_context.get("architecture_data") or {},
            citation_map=citation_map,
            references_markdown=ref_markdown,
            missing_context=missing_context,
        )

        existing_sections = existing_doc_data.get("sections", [])
        existing_sections_dict = {s["id"]: s for s in existing_sections}

        updated_sections = []
        for spec in cls.DEFAULT_SECTION_SPECS:
            sid = spec["id"]
            skey = spec["key"]
            old_sec = existing_sections_dict.get(sid)

            if sid in target_ids:
                # Regenerate this specific section
                new_content = fresh_sections.get(skey, "")
                if skey == "references" and not new_content:
                    new_content = ref_markdown
                included = old_sec.get("included", True) if old_sec else True
                word_count = cls._count_words(new_content)
                updated_sections.append({
                    "id": sid,
                    "number": spec["number"],
                    "title": spec["title"],
                    "content": new_content.strip(),
                    "included": included,
                    "wordCount": word_count,
                    "section_key": skey,
                })
            else:
                # Preserve existing content and user edits!
                if old_sec:
                    updated_sections.append(old_sec)
                else:
                    new_content = fresh_sections.get(skey, "")
                    updated_sections.append({
                        "id": sid,
                        "number": spec["number"],
                        "title": spec["title"],
                        "content": new_content.strip(),
                        "included": True,
                        "wordCount": cls._count_words(new_content),
                        "section_key": skey,
                    })

        compiled_parts = [
            s["content"] for s in updated_sections if s.get("included") and s.get("content", "").strip()
        ]
        compiled_markdown = "\n\n---\n\n".join(compiled_parts)
        total_words = sum(s.get("wordCount", 0) for s in updated_sections if s.get("included"))

        result = dict(existing_doc_data)
        result["sections"] = updated_sections
        result["compiled_markdown"] = compiled_markdown
        result["total_word_count"] = total_words
        result["version"] = int(existing_doc_data.get("version", 1)) + 1
        return result

    # -------------------------------------------------------------------------
    # ANALYTICAL ACADEMIC SYNTHESIS ENGINE (Sections A through O)
    # -------------------------------------------------------------------------
    @classmethod
    def _analytical_documentation_engine(
        cls,
        topic: str,
        project_description: Optional[str],
        template: str,
        target_journal: Optional[str],
        reference_style: str,
        authors: Optional[Union[List[str], str]],
        institution: Optional[str],
        papers: List[Dict[str, Any]],
        analyses: List[Dict[str, Any]],
        gaps: List[Dict[str, Any]],
        questions: List[Dict[str, Any]],
        lit_review: Dict[str, Any],
        methodology: Dict[str, Any],
        comparison: Dict[str, Any],
        architecture: Dict[str, Any],
        citation_map: Dict[Any, str],
        references_markdown: str,
        missing_context: List[str],
    ) -> Dict[str, str]:
        """
        Generates doctoral-grade, publication-ready academic manuscript sections
        grounded strictly in empirical data from modules 1 through 8.
        Distinguishes proposed work from completed work and omits fabricated results.
        """
        now_date = datetime.now().strftime("%B %d, %Y")
        author_text = ""
        if authors:
            if isinstance(authors, list):
                author_text = ", ".join(authors)
            else:
                author_text = str(authors)

        # ---------------------------------------------------------------------
        # Section A: Title Page
        # ---------------------------------------------------------------------
        title_lines = [
            f"# {topic}",
            f"### Academic Research Working Manuscript ({template})",
        ]
        if target_journal:
            title_lines.append(f"**Target Venue / Journal:** {target_journal}")
        if author_text:
            title_lines.append(f"**Authors:** {author_text}")
        if institution:
            title_lines.append(f"**Affiliation / Institution:** {institution}")
        title_lines.append(f"**Date:** {now_date}")
        title_page_content = "\n\n".join(title_lines)

        # ---------------------------------------------------------------------
        # Section B: Abstract
        # ---------------------------------------------------------------------
        # Problem & Objective synthesis
        core_problem = ""
        if methodology and methodology.get("research_overview"):
            core_problem = methodology["research_overview"].get("problem_statement")
        elif gaps:
            core_problem = gaps[0].get("description") or gaps[0].get("gap_title")
        if not core_problem:
            core_problem = f"Addressing key algorithmic bottlenecks and domain limitations within {topic}."

        core_approach = ""
        if methodology and methodology.get("research_overview"):
            core_approach = methodology["research_overview"].get("proposed_research_direction")
        elif architecture and architecture.get("architecture_summary"):
            core_approach = architecture.get("architecture_summary")
        if not core_approach:
            core_approach = "A structured methodological pipeline incorporating evidence-based algorithmic designs."

        paper_citations_str = ""
        if papers:
            citations_sample = [citation_map.get(p.get("id"), f"[{i+1}]") for i, p in enumerate(papers[:4])]
            paper_citations_str = f" Recent empirical studies {', '.join(citations_sample)} have demonstrated promising advances but leave critical gaps unresolved."

        abstract_content = (
            "## Abstract\n\n"
            f"**Background:** The field of {topic} has experienced accelerated development driven by advances in modern computing and algorithmic formulations.{paper_citations_str}\n\n"
            f"**Problem Statement:** Despite recent progress, {core_problem} constitutes a foundational impediment to reliable, scalable deployment.\n\n"
            f"**Objective:** This investigation formulates an integrated research framework to systematically address these challenges through grounded empirical analysis and formal system design.\n\n"
            f"**Proposed Approach:** We introduce {core_approach}, emphasizing reproducible workflows, verified baseline comparisons, and rigorous evaluation criteria.\n\n"
            f"**Expected Contribution:** *Proposed Work Distinction:* Unlike prior heuristic treatments, this research establishes a verifiable, end-to-end framework. "
            "Untested claims are treated as formal hypotheses to be validated through planned experimental trials rather than established achievements."
        )

        # ---------------------------------------------------------------------
        # Section C: Introduction
        # ---------------------------------------------------------------------
        intro_lines = [
            "## 1. Introduction",
            f"The rapid evolution of {topic} is reshaping technical and scientific paradigms across domain applications. "
            "As foundational methodologies mature, transitioning from controlled laboratory benchmarks to robust operational environments requires overcoming unresolved architectural and empirical constraints.",
            "### 1.1 Context and Motivation",
            f"Modern research in this space demands high precision, reproducibility, and generalizability. "
            f"{project_description if project_description else 'The primary motivation of this research is to bridge the disconnect between theoretical algorithmic designs and empirical performance limitations.'}",
            "### 1.2 Problem Formulation",
            f"Formally, the research problem focuses on resolving: *{core_problem}*",
            "### 1.3 Scope and Delimitations",
            "This study delineates its operational scope to targeted computational methodologies, documented datasets, and comparative baseline benchmarks. "
            "Out-of-scope parameters include unverified third-party proprietary architectures and claims lacking empirical replication protocols.",
        ]
        intro_content = "\n\n".join(intro_lines)

        # ---------------------------------------------------------------------
        # Section D: Problem Statement and Objectives
        # ---------------------------------------------------------------------
        spec_objectives = []
        if methodology and methodology.get("research_overview", {}).get("specific_objectives"):
            spec_objectives = methodology["research_overview"]["specific_objectives"]
        elif questions:
            spec_objectives = [f"Investigate {q.get('question')} to establish empirical validity." for q in questions[:4]]
        else:
            spec_objectives = [
                f"Formulate a rigorous formalization of {topic} pipeline components.",
                "Execute comparative evaluations against established literature baselines.",
                "Quantify computational latency, scalability, and error distributions under standard conditions.",
            ]

        obj_markdown = "\n".join([f"- **Objective {i+1}:** {obj}" for i, obj in enumerate(spec_objectives)])

        prob_content = (
            "## 2. Problem Statement and Objectives\n\n"
            f"### 2.1 Core Problem Formulation\n{core_problem}\n\n"
            "### 2.2 Specific Research Objectives\n"
            "To resolve the formulated research challenge, this project pursues the following bounded objectives:\n\n"
            f"{obj_markdown}\n\n"
            "### 2.3 Intended Scientific Contributions\n"
            "- A unified, grounded technical framework addressing documented gaps in existing literature.\n"
            "- Formal comparative benchmarking with explicit error bounds and reproducibility guidelines.\n"
            "- Publicly reproducible evaluation protocols for independent verification."
        )

        # ---------------------------------------------------------------------
        # Section E: Research Questions
        # ---------------------------------------------------------------------
        rq_lines = ["## 3. Research Questions\n"]
        if questions:
            rq_lines.append(
                "The research inquiry is governed by the following questions formulated from analyzed literature and identified empirical gaps:\n"
            )
            for i, q in enumerate(questions):
                q_text = q.get("question") or "Research Question"
                q_type = q.get("question_type") or q.get("category") or "Primary Research Question"
                q_mot = q.get("motivation") or "Derived from documented literature limitations."
                q_ev = q.get("supporting_evidence") or "Supported by comparative survey findings."
                if isinstance(q_ev, list):
                    q_ev = "; ".join(q_ev)
                rq_lines.append(
                    f"#### RQ{i+1}: {q_text}\n"
                    f"- **Classification:** {q_type}\n"
                    f"- **Scientific Motivation:** {q_mot}\n"
                    f"- **Supporting Evidence:** {q_ev}\n"
                )
        else:
            rq_lines.append(
                "> **Note on Research Questions:** *Module 4 (Research Questions) was not explicitly populated prior to document generation. "
                "The primary research inquiry is structured as:* 'How can the proposed algorithmic architecture improve performance and generalizability over surveyed baseline models?'\n"
            )
        rq_content = "\n".join(rq_lines)

        # ---------------------------------------------------------------------
        # Section F: Literature Review
        # ---------------------------------------------------------------------
        lit_lines = ["## 4. Literature Review\n"]
        if lit_review and lit_review.get("introduction"):
            lit_lines.append(f"### 4.1 Field Synthesis & Landscape\n{lit_review.get('introduction')}\n")
            # Themes
            themes = lit_review.get("themes") or []
            if themes:
                lit_lines.append("### 4.2 Thematic Synthesis of Literature\n")
                for th in themes:
                    if isinstance(th, dict):
                        th_title = th.get("title") or th.get("theme_name") or "Research Theme"
                        th_desc = th.get("description") or th.get("synthesis") or ""
                        th_papers = th.get("papers") or []
                        paper_refs = []
                        for p_ref in th_papers:
                            if isinstance(p_ref, dict):
                                c = citation_map.get(p_ref.get("id"), "")
                                if c:
                                    paper_refs.append(f"{p_ref.get('title', 'Paper')} {c}")
                            elif isinstance(p_ref, str):
                                paper_refs.append(p_ref)
                        refs_str = f" (Referencing: {', '.join(paper_refs)})" if paper_refs else ""
                        lit_lines.append(f"**{th_title}**{refs_str}\n\n{th_desc}\n")
                    elif isinstance(th, str):
                        lit_lines.append(f"- {th}\n")

            # Methodological synthesis from lit review
            if lit_review.get("methodological_analysis"):
                ma = lit_review.get("methodological_analysis")
                if isinstance(ma, dict):
                    lit_lines.append(
                        f"### 4.3 Methodological Trends\n{ma.get('synthesis') or ma.get('common_methods', '')}\n"
                    )
                elif isinstance(ma, str):
                    lit_lines.append(f"### 4.3 Methodological Trends\n{ma}\n")
        else:
            lit_lines.append(
                "### 4.1 Cohort Synthesis of Analyzed Research Papers\n"
                "A comprehensive literature survey was conducted across relevant peer-reviewed publications. "
                "The analyzed cohort comprises the following foundational studies:\n"
            )
            if papers:
                for idx, p in enumerate(papers):
                    cite = citation_map.get(p.get("id"), f"[{idx+1}]")
                    title = p.get("title")
                    year = p.get("publication_year") or p.get("year") or "n.d."
                    abstract = p.get("abstract") or "Abstract not available."
                    abstract_summary = abstract[:280] + ("..." if len(abstract) > 280 else "")
                    lit_lines.append(f"- **{title}** ({year}) {cite}: {abstract_summary}\n")
            else:
                lit_lines.append("*No external benchmark papers selected. Please complete Paper Discovery to populate formal citations.*")

        lit_content = "\n".join(lit_lines)

        # ---------------------------------------------------------------------
        # Section G: Research Gap Analysis
        # ---------------------------------------------------------------------
        gap_lines = ["## 5. Research Gap Analysis\n"]
        if gaps:
            gap_lines.append(
                "Critical evaluation of current literature revealed several recurrent limitations and unaddressed challenges:\n"
            )
            for idx, g in enumerate(gaps):
                g_title = g.get("gap_title") or g.get("title") or f"Research Gap {idx+1}"
                g_cat = g.get("category") or "Methodological Gap"
                g_desc = g.get("description") or "Empirical gap in current literature."
                g_ev = g.get("evidence") or []
                if isinstance(g_ev, list):
                    g_ev_str = "; ".join(g_ev) if g_ev else "Documented in analyzed papers."
                else:
                    g_ev_str = str(g_ev)
                g_why = g.get("why_it_matters") or "Impedes reproducible real-world scaling."
                g_dir = g.get("potential_direction") or "Requires structured empirical investigation."

                # Associated papers
                aff_papers = g.get("affected_papers") or []
                aff_cites = []
                for ap in aff_papers:
                    if isinstance(ap, dict):
                        c = citation_map.get(ap.get("id"), "")
                        if c:
                            aff_cites.append(c)
                    elif isinstance(ap, str):
                        aff_cites.append(ap)
                aff_str = f" (Observed across: {', '.join(aff_cites)})" if aff_cites else ""

                gap_lines.append(
                    f"### Gap {idx+1}: {g_title} [{g_cat}]{aff_str}\n"
                    f"- **Description:** {g_desc}\n"
                    f"- **Empirical Evidence:** {g_ev_str}\n"
                    f"- **Scientific Significance:** {g_why}\n"
                    f"- **Proposed Remediation Direction:** {g_dir}\n"
                )
        else:
            gap_lines.append(
                "> **Note on Research Gaps:** *Module 3 (Research Gaps) was not populated prior to generation. "
                "Core identified gap represents the lack of standardized end-to-end evaluation protocols in current literature.*"
            )
        gap_content = "\n".join(gap_lines)

        # ---------------------------------------------------------------------
        # Section H: Research Methodology
        # ---------------------------------------------------------------------
        meth_lines = ["## 6. Research Methodology\n"]
        if methodology and methodology.get("research_design"):
            rd = methodology.get("research_design")
            meth_lines.append(
                f"### 6.1 Research Design\n"
                f"**Design Paradigm:** {rd.get('design_type', 'Experimental Design')}\n\n"
                f"**Methodological Justification:** {rd.get('justification', 'Selected to provide verifiable empirical validation.')}\n"
            )
            # Proposed approach stages
            stages = methodology.get("proposed_approach") or []
            if stages:
                meth_lines.append("### 6.2 Execution Stages\n")
                for st in stages:
                    st_num = st.get("stage_number", 1)
                    st_name = st.get("stage_name", f"Stage {st_num}")
                    st_prob = st.get("problem_addressed", "")
                    st_appr = st.get("proposed_approach", "")
                    meth_lines.append(f"**Stage {st_num}: {st_name}**\n- *Problem:* {st_prob}\n- *Approach:* {st_appr}\n")

            # Data & Preprocessing
            dc = methodology.get("data_collection") or {}
            if dc:
                meth_lines.append("### 6.3 Data Collection Strategy\n")
                req_data = dc.get("required_data") or []
                sources = dc.get("potential_sources") or []
                meth_lines.append(f"- **Target Data Types:** {', '.join(req_data) if req_data else 'Domain-specific datasets'}\n")
                meth_lines.append(f"- **Identified Sources:** {', '.join(sources) if sources else 'Standard open-access scientific repositories'}\n")

            # Algorithms
            algos = methodology.get("methods_and_algorithms") or []
            if algos:
                meth_lines.append("### 6.4 Algorithms and Models\n")
                for a in algos:
                    a_name = a.get("name") or a.get("algorithm_name") or "Proposed Algorithm"
                    a_role = a.get("purpose") or a.get("role") or ""
                    a_reason = a.get("reason_for_selection") or ""
                    meth_lines.append(f"- **{a_name}:** {a_role}. *Rationale:* {a_reason}\n")

            # Evaluation metrics
            metrics = methodology.get("evaluation_metrics") or []
            if metrics:
                meth_lines.append("### 6.5 Evaluation Metrics & Benchmarks\n")
                for m in metrics:
                    m_name = m.get("name") or "Metric"
                    m_purp = m.get("purpose") or ""
                    meth_lines.append(f"- **{m_name}:** {m_purp}\n")
        else:
            meth_lines.append(
                "### 6.1 Proposed Methodological Protocol\n"
                "The methodology implements a structured comparative experimental framework:\n"
                "1. **Cohort Data Preparation:** Standardization and tensor transformation of scientific input data.\n"
                "2. **Algorithmic Modeling:** Formulation of baseline benchmark models alongside proposed improvements.\n"
                "3. **Empirical Evaluation:** Strict cross-validation, bootstrap sampling, and standardized scoring across accuracy, latency, and parameter footprint.\n"
                "4. **Ablation Studies:** Component isolation to isolate the marginal contribution of each architectural module.\n"
            )
        meth_content = "\n".join(meth_lines)

        # ---------------------------------------------------------------------
        # Section I: Proposed System Architecture
        # ---------------------------------------------------------------------
        arch_lines = ["## 7. Proposed System Architecture\n"]
        if architecture and architecture.get("components"):
            arch_title = architecture.get("architecture_title") or f"{topic} System Architecture"
            arch_type = architecture.get("architecture_type") or "Modular Pipeline Architecture"
            arch_summary = architecture.get("architecture_summary") or ""

            arch_lines.append(
                f"### 7.1 Architecture Overview: {arch_title} ({arch_type})\n\n{arch_summary}\n\n"
                "### 7.2 Subsystem Component Decomposition\n"
            )
            for c in architecture.get("components", []):
                c_name = c.get("component_name") or "Component"
                c_type = c.get("component_type") or "Subsystem"
                c_purp = c.get("purpose") or ""
                c_tech = c.get("technologies") or []
                tech_str = f" (Technologies: {', '.join(c_tech)})" if c_tech else ""
                arch_lines.append(f"- **{c_name}** [{c_type}]{tech_str}: {c_purp}\n")

            # Mermaid Diagram if present
            diag = architecture.get("architecture_diagram") or {}
            if diag and diag.get("source"):
                arch_lines.append(
                    "### 7.3 System Data Flow Specification\n\n"
                    "```mermaid\n"
                    f"{diag.get('source').strip()}\n"
                    "```\n\n"
                    f"*{diag.get('description', 'Flowchart illustrating end-to-end data processing and module interaction.')}*\n"
                )

            # Security & Reliability
            sec = architecture.get("security_and_reliability") or []
            if sec:
                arch_lines.append("### 7.4 Security, Reliability, and Reproducibility\n")
                for s in sec:
                    dim = s.get("dimension") or "Security Aspect"
                    strat = s.get("mitigation_strategy") or s.get("description") or ""
                    arch_lines.append(f"- **{dim}:** {strat}\n")
        else:
            arch_lines.append(
                "> **Note on System Architecture:** *Module 8 (Architecture Generation) output was not available prior to document drafting. "
                "The architecture specification defines a modular three-tier pipeline: Input Data Ingestion, Processing & Inference Engine, and Evaluation & Verification Interface.*"
            )
        arch_content = "\n".join(arch_lines)

        # ---------------------------------------------------------------------
        # Section J: Comparative Analysis
        # ---------------------------------------------------------------------
        comp_lines = ["## 8. Comparative Analysis\n"]
        if comparison and comparison.get("comparison_matrix"):
            c_matrix = comparison.get("comparison_matrix", [])
            comp_lines.append(
                "### 8.1 Multi-Paper Benchmark Comparison\n\n"
                "A comparative analysis of existing peer-reviewed studies highlights key methodological trade-offs and performance boundaries:\n\n"
            )
            # Build Markdown table
            comp_lines.append("| Paper / Method | Focus Area | Core Methodology | Key Contribution | Primary Limitation |")
            comp_lines.append("| :--- | :--- | :--- | :--- | :--- |")
            for row in c_matrix[:8]:
                p_name = row.get("paper_title") or row.get("paper") or "Paper"
                p_focus = row.get("focus_area") or "General"
                p_meth = row.get("methodology") or row.get("method") or "Baseline"
                p_contr = row.get("contribution") or "Empirical benchmark"
                p_lim = row.get("limitations") or "Restricted dataset"
                comp_lines.append(f"| {p_name} | {p_focus} | {p_meth} | {p_contr} | {p_lim} |")
            comp_lines.append("\n*Note: Direct numerical comparisons across differing datasets and experimental conditions are avoided to preserve comparative integrity.*\n")
        elif papers:
            comp_lines.append(
                "### 8.1 Comparison of Surveyed Cohort\n\n"
                "| Paper Citation | Publication Year | Domain Focus | Documented Limitations |\n"
                "| :--- | :--- | :--- | :--- |\n"
            )
            for idx, p in enumerate(papers[:6]):
                c = citation_map.get(p.get("id"), f"[{idx+1}]")
                t = p.get("title")
                y = p.get("publication_year") or p.get("year") or "n.d."
                comp_lines.append(f"| {t} {c} | {y} | {topic} | Constrained scope, evaluation variance |\n")
        else:
            comp_lines.append("*No comparative paper cohort available in project context.*")
        comp_content = "\n".join(comp_lines)

        # ---------------------------------------------------------------------
        # Section K: Proposed Solution & Expected Contributions
        # ---------------------------------------------------------------------
        sol_content = (
            "## 9. Proposed Solution and Expected Contributions\n\n"
            "### 9.1 Solution Rationale\n"
            f"The proposed research addresses the identified challenges by synthesizing the strengths of existing approaches while rectifying documented limitations. "
            f"By grounding technical design decisions in established empirical benchmarks, the solution establishes a principled foundation for {topic}.\n\n"
            "### 9.2 Expected Theoretical and Practical Contributions\n"
            "- **Algorithmic Contribution:** Formulation of a coherent pipeline that avoids common failure modes identified in prior literature.\n"
            "- **Methodological Contribution:** Development of a standardized evaluation protocol enabling exact replication.\n"
            "- **System Design Contribution:** A modular architectural blueprint with separated data ingestion, inference, and audit trails.\n\n"
            "> **Scientific Integrity Notice:** *All claims of prospective benefits or expected performance improvements represent formal scientific hypotheses. "
            "They will be subjected to planned experimental scrutiny and are not claimed as verified outcomes prior to empirical execution.*"
        )

        # ---------------------------------------------------------------------
        # Section L: Planned Evaluation & Protocol (Results and Discussion)
        # ---------------------------------------------------------------------
        results_content = (
            "## 10. Planned Evaluation and Experimental Protocol\n\n"
            "> **Experimental Status:** *In compliance with academic honesty standards, this section defines the planned evaluation protocol. "
            "No experimental results are fabricated or claimed prematurely.*\n\n"
            "### 10.1 Planned Benchmarking Pipeline\n"
            "Empirical verification will execute along three structured axes:\n"
            "1. **Baseline Accuracy & Fidelity Verification:** Direct comparative scoring against surveyed baseline models under identical data splits.\n"
            "2. **Computational Footprint & Latency Profiling:** Measurement of memory footprint, FLOP counts, and execution latency across varying batch dimensions.\n"
            "3. **Statistical Significance Testing:** Application of paired Student's t-tests and Wilcoxon signed-rank tests across 5-fold cross-validation trials.\n\n"
            "### 10.2 Planned Ablation Experiments\n"
            "- Evaluating system performance with core algorithmic enhancements disabled.\n"
            "- Evaluating sensitivity to data sparsity, label noise, and domain shifts.\n\n"
            "### 10.3 Metrics Remaining to be Collected\n"
            "- Empirical convergence curves over training epochs.\n"
            "- Confusion matrices and per-class error distribution plots.\n"
            "- End-to-end wall-clock latency under production-grade hardware constraints."
        )

        # ---------------------------------------------------------------------
        # Section M: Limitations & Future Work
        # ---------------------------------------------------------------------
        lim_lines = ["## 11. Limitations and Future Work\n"]
        lim_lines.append(
            "### 11.1 Methodological and Scope Limitations\n"
            "- **Computational Requirements:** High-fidelity modeling requires dedicated hardware accelerators (e.g. CUDA-enabled GPUs).\n"
            "- **Data Dependency:** Effectiveness relies upon well-curated scientific benchmark datasets; extreme distribution shifts may require retraining.\n"
            "- **Generalizability Scope:** Empirical findings remain bounded to the specific domain categories surveyed in this project cohort.\n\n"
            "### 11.2 Directions for Future Research\n"
            "- Extension of the architectural pipeline to streaming and real-time low-latency edge deployments.\n"
            "- Integration of automated hyperparameter meta-learning to minimize manual tuning overhead.\n"
            "- Conducting cross-domain validation studies across multimodal data distributions."
        )
        lim_content = "\n".join(lim_lines)

        # ---------------------------------------------------------------------
        # Section N: Conclusion
        # ---------------------------------------------------------------------
        conc_content = (
            "## 12. Conclusion\n\n"
            f"This manuscript presents a structured research document addressing foundational challenges within {topic}. "
            "By synthesizing surveyed literature, identifying precise empirical gaps, and formulating rigorous research questions, "
            "the proposed work outlines a grounded architectural and methodological pathway toward scalable, verifiable progress. "
            "The planned evaluation protocol establishes clear benchmarks to validate theoretical hypotheses in subsequent experimental phases."
        )

        # ---------------------------------------------------------------------
        # Section O: References
        # ---------------------------------------------------------------------
        ref_header = f"## 13. References ({reference_style} Style)\n\n"
        ref_content = ref_header + references_markdown

        return {
            "title_page": title_page_content,
            "abstract": abstract_content,
            "introduction": intro_content,
            "problem_statement": prob_content,
            "research_questions": rq_content,
            "literature_review": lit_content,
            "research_gaps": gap_content,
            "methodology": meth_content,
            "architecture": arch_content,
            "comparative_analysis": comp_content,
            "solution_contributions": sol_content,
            "planned_evaluation": results_content,
            "limitations_future_work": lim_content,
            "conclusion": conc_content,
            "references": ref_content,
        }

    # -------------------------------------------------------------------------
    # LLM CALLER WITH STRICT GROUNDING
    # -------------------------------------------------------------------------
    @classmethod
    async def _call_llm_documentation(
        cls,
        topic: str,
        project_description: Optional[str],
        template: str,
        target_journal: Optional[str],
        reference_style: str,
        authors: Optional[Union[List[str], str]],
        institution: Optional[str],
        papers: List[Dict[str, Any]],
        gaps: List[Dict[str, Any]],
        questions: List[Dict[str, Any]],
        lit_review: Dict[str, Any],
        methodology: Dict[str, Any],
        comparison: Dict[str, Any],
        architecture: Dict[str, Any],
        citation_map: Dict[Any, str],
        api_key: str,
    ) -> Optional[Dict[str, str]]:
        """Invokes configured LLM with rich contextual prompt."""
        system_instruction = (
            "You are a distinguished academic professor and scientific writer. "
            "Generate an IEEE/ACM-grade academic research paper manuscript based strictly on the provided research assets. "
            "CRITICAL RULES:\n"
            "1. Ground all claims in the provided papers, gaps, questions, methodology, and architecture.\n"
            "2. Preserve citation markers like [1], [2] matching the supplied bibliography.\n"
            "3. DO NOT invent experimental numbers, percentages, or results that do not exist. Clearly format Section 10 as 'Planned Evaluation and Experimental Protocol'.\n"
            "4. Return valid JSON only with keys corresponding to the 15 manuscript sections."
        )

        # Context summary
        p_brief = [f"{citation_map.get(p.get('id'), f'[{i+1}]')}: {p.get('title')}" for i, p in enumerate(papers[:8])]
        q_brief = [f"RQ{i+1}: {q.get('question')}" for i, q in enumerate(questions[:5])]
        g_brief = [f"Gap {i+1}: {g.get('title') or g.get('gap_title')}" for i, g in enumerate(gaps[:5])]

        user_prompt = f"""
Research Topic: {topic}
Template Format: {template}
Target Venue: {target_journal or 'Academic Conference'}
Surveyed Papers:
{chr(10).join(p_brief) if p_brief else 'No external papers.'}

Identified Gaps:
{chr(10).join(g_brief) if g_brief else 'None explicitly listed.'}

Research Questions:
{chr(10).join(q_brief) if q_brief else 'None explicitly listed.'}

Return JSON with markdown string contents for keys:
- title_page
- abstract
- introduction
- problem_statement
- research_questions
- literature_review
- research_gaps
- methodology
- architecture
- comparative_analysis
- solution_contributions
- planned_evaluation
- limitations_future_work
- conclusion
- references
"""

        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                return json.loads(content)
        return None

    # -------------------------------------------------------------------------
    # EXPORT ENGINES (Markdown, DOCX, PDF)
    # -------------------------------------------------------------------------
    @classmethod
    def export_to_markdown(cls, doc_data: Dict[str, Any]) -> bytes:
        """Exports the complete manuscript as clean GitHub/Academic Markdown bytes."""
        sections = doc_data.get("sections", [])
        included_parts = []
        for s in sections:
            if s.get("included", True) and s.get("content", "").strip():
                included_parts.append(s["content"].strip())

        full_md = "\n\n---\n\n".join(included_parts)
        return full_md.encode("utf-8")

    @classmethod
    def export_to_docx(cls, doc_data: Dict[str, Any]) -> bytes:
        """
        Generates a professionally formatted academic Word (.docx) document
        with standard margins, academic typography, heading hierarchies, styled tables, and bullet lists.
        """
        doc = Document()

        # Page Setup: Standard 1-inch margins
        for section in doc.sections:
            section.top_margin = Inches(1.0)
            section.bottom_margin = Inches(1.0)
            section.left_margin = Inches(1.0)
            section.right_margin = Inches(1.0)

        # Style definitions
        styles = doc.styles
        normal_style = styles["Normal"]
        normal_style.font.name = "Calibri"
        normal_style.font.size = Pt(11)
        normal_style.font.color.rgb = RGBColor(0x1e, 0x29, 0x3b)  # Slate 800

        title = doc_data.get("title", "Academic Research Manuscript")
        template = doc_data.get("template", "IEEE Conference")

        # Document Header
        title_para = doc.add_paragraph()
        title_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        title_run = title_para.add_run(title)
        title_run.font.name = "Calibri"
        title_run.font.size = Pt(20)
        title_run.font.bold = True
        title_run.font.color.rgb = RGBColor(0x0f, 0x17, 0x2a)

        sub_para = doc.add_paragraph()
        sub_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        sub_run = sub_para.add_run(f"Manuscript Format: {template}")
        sub_run.font.size = Pt(11)
        sub_run.font.italic = True
        sub_run.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

        if doc_data.get("authors"):
            auth_para = doc.add_paragraph()
            auth_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            auth_val = doc_data["authors"]
            auth_str = ", ".join(auth_val) if isinstance(auth_val, list) else str(auth_val)
            auth_run = auth_para.add_run(f"Authors: {auth_str}")
            auth_run.font.size = Pt(10.5)

        doc.add_paragraph().paragraph_format.space_after = Pt(14)

        sections = doc_data.get("sections", [])
        for sec in sections:
            if not sec.get("included", True):
                continue
            content = sec.get("content", "").strip()
            if not content:
                continue

            # Process markdown lines
            lines = content.split("\n")
            in_table = False
            table_lines: List[str] = []

            for line in lines:
                stripped = line.strip()

                # Table handling
                if stripped.startswith("|") and stripped.endswith("|"):
                    in_table = True
                    table_lines.append(stripped)
                    continue
                elif in_table:
                    # Flush table
                    cls._render_docx_table(doc, table_lines)
                    in_table = False
                    table_lines = []

                if not stripped:
                    continue

                if stripped.startswith("# "):
                    h = doc.add_heading(stripped[2:].strip(), level=1)
                    h.paragraph_format.space_before = Pt(14)
                    h.paragraph_format.space_after = Pt(6)
                elif stripped.startswith("## "):
                    h = doc.add_heading(stripped[3:].strip(), level=1)
                    h.paragraph_format.space_before = Pt(12)
                    h.paragraph_format.space_after = Pt(4)
                elif stripped.startswith("### "):
                    h = doc.add_heading(stripped[4:].strip(), level=2)
                    h.paragraph_format.space_before = Pt(10)
                    h.paragraph_format.space_after = Pt(3)
                elif stripped.startswith("#### "):
                    h = doc.add_heading(stripped[5:].strip(), level=3)
                    h.paragraph_format.space_before = Pt(8)
                    h.paragraph_format.space_after = Pt(2)
                elif stripped.startswith("- ") or stripped.startswith("* "):
                    p = doc.add_paragraph(style="List Bullet")
                    cls._add_formatted_runs_docx(p, stripped[2:].strip())
                    p.paragraph_format.space_after = Pt(2)
                elif re.match(r"^\d+\.\s+", stripped):
                    p = doc.add_paragraph(style="List Number")
                    item_text = re.sub(r"^\d+\.\s+", "", stripped)
                    cls._add_formatted_runs_docx(p, item_text)
                    p.paragraph_format.space_after = Pt(2)
                elif stripped.startswith("> "):
                    p = doc.add_paragraph()
                    p.paragraph_format.left_indent = Inches(0.4)
                    p.paragraph_format.space_before = Pt(4)
                    p.paragraph_format.space_after = Pt(4)
                    r = p.add_run(stripped[2:].strip())
                    r.font.italic = True
                    r.font.color.rgb = RGBColor(0x47, 0x55, 0x69)
                elif stripped == "---":
                    p = doc.add_paragraph()
                    p.paragraph_format.space_before = Pt(8)
                    p.paragraph_format.space_after = Pt(8)
                    r = p.add_run("____________________________________________________")
                    r.font.color.rgb = RGBColor(0xcb, 0xd5, 0xe1)
                else:
                    p = doc.add_paragraph()
                    cls._add_formatted_runs_docx(p, stripped)
                    p.paragraph_format.space_after = Pt(4)

            if in_table:
                cls._render_docx_table(doc, table_lines)

        file_stream = io.BytesIO()
        doc.save(file_stream)
        file_stream.seek(0)
        return file_stream.getvalue()

    @classmethod
    def _add_formatted_runs_docx(cls, paragraph, text: str):
        """Helper to parse bold markdown tokens like **bold** in docx."""
        parts = re.split(r"(\*\*.*?\*\*)", text)
        for part in parts:
            if part.startswith("**") and part.endswith("**") and len(part) >= 4:
                run = paragraph.add_run(part[2:-2])
                run.font.bold = True
            else:
                paragraph.add_run(part)

    @classmethod
    def _render_docx_table(cls, doc: Document, lines: List[str]):
        """Renders markdown table lines into a styled docx table."""
        parsed_rows = []
        for line in lines:
            if re.match(r"^\|(\s*:?-+:?\s*\|)+$", line):
                continue
            cells = [c.strip() for c in line.strip("|").split("|")]
            if cells:
                parsed_rows.append(cells)

        if not parsed_rows:
            return

        col_count = max(len(r) for r in parsed_rows)
        table = doc.add_table(rows=len(parsed_rows), cols=col_count)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.style = "Table Grid"

        for row_idx, row_data in enumerate(parsed_rows):
            row = table.rows[row_idx]
            for col_idx, cell_value in enumerate(row_data):
                if col_idx < col_count:
                    cell = row.cells[col_idx]
                    cell.text = cell_value
                    if row_idx == 0:
                        for p in cell.paragraphs:
                            for r in p.runs:
                                r.font.bold = True

    @classmethod
    def export_to_pdf(cls, doc_data: Dict[str, Any]) -> bytes:
        """
        Generates a publication-grade Academic PDF using ReportLab with dynamic
        page numbering, running headers, table styling, and margins.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=54,
            rightMargin=54,
            topMargin=54,
            bottomMargin=54,
        )

        styles = getSampleStyleSheet()

        # Custom academic styles
        title_style = ParagraphStyle(
            "AcademicTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=18,
            leading=22,
            textColor=colors.HexColor("#0f172a"),
            alignment=1,  # Centered
            spaceAfter=8,
        )

        subtitle_style = ParagraphStyle(
            "AcademicSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#475569"),
            alignment=1,
            spaceAfter=14,
        )

        h1_style = ParagraphStyle(
            "AcademicH1",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=colors.HexColor("#1e293b"),
            spaceBefore=14,
            spaceAfter=6,
            keepWithNext=True,
        )

        h2_style = ParagraphStyle(
            "AcademicH2",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#334155"),
            spaceBefore=10,
            spaceAfter=4,
            keepWithNext=True,
        )

        body_style = ParagraphStyle(
            "AcademicBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#1e293b"),
            spaceAfter=5,
        )

        bullet_style = ParagraphStyle(
            "AcademicBullet",
            parent=body_style,
            leftIndent=15,
            firstLineIndent=-10,
            spaceAfter=3,
        )

        callout_style = ParagraphStyle(
            "AcademicCallout",
            parent=body_style,
            fontName="Helvetica-Oblique",
            textColor=colors.HexColor("#475569"),
            leftIndent=15,
            spaceBefore=4,
            spaceAfter=4,
        )

        story = []

        # Title Block
        title = doc_data.get("title", "Academic Research Manuscript")
        template = doc_data.get("template", "IEEE Conference")
        story.append(Paragraph(title, title_style))
        story.append(Paragraph(f"Working Manuscript — {template}", subtitle_style))

        if doc_data.get("authors"):
            auth_val = doc_data["authors"]
            auth_str = ", ".join(auth_val) if isinstance(auth_val, list) else str(auth_val)
            story.append(Paragraph(f"<b>Authors:</b> {auth_str}", subtitle_style))

        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0"), spaceAfter=12))

        # Render sections
        sections = doc_data.get("sections", [])
        for sec in sections:
            if not sec.get("included", True):
                continue
            content = sec.get("content", "").strip()
            if not content:
                continue

            lines = content.split("\n")
            in_table = False
            table_lines: List[str] = []

            for line in lines:
                stripped = line.strip()

                if stripped.startswith("|") and stripped.endswith("|"):
                    in_table = True
                    table_lines.append(stripped)
                    continue
                elif in_table:
                    cls._render_pdf_table(story, table_lines, body_style)
                    in_table = False
                    table_lines = []

                if not stripped:
                    continue

                if stripped.startswith("# "):
                    story.append(Paragraph(stripped[2:].strip(), h1_style))
                elif stripped.startswith("## "):
                    story.append(Paragraph(stripped[3:].strip(), h1_style))
                elif stripped.startswith("### "):
                    story.append(Paragraph(stripped[4:].strip(), h2_style))
                elif stripped.startswith("#### "):
                    story.append(Paragraph(stripped[5:].strip(), h2_style))
                elif stripped.startswith("- ") or stripped.startswith("* "):
                    bullet_text = f"• {stripped[2:].strip()}"
                    # replace **text** with <b>text</b>
                    html_text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", bullet_text)
                    story.append(Paragraph(html_text, bullet_style))
                elif re.match(r"^\d+\.\s+", stripped):
                    html_text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", stripped)
                    story.append(Paragraph(html_text, bullet_style))
                elif stripped.startswith("> "):
                    html_text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", stripped[2:].strip())
                    story.append(Paragraph(html_text, callout_style))
                elif stripped == "---":
                    story.append(Spacer(1, 4))
                    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceAfter=6))
                else:
                    html_text = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", stripped)
                    story.append(Paragraph(html_text, body_style))

            if in_table:
                cls._render_pdf_table(story, table_lines, body_style)

        doc.build(story, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer.getvalue()

    @classmethod
    def _render_pdf_table(cls, story: List[Any], lines: List[str], cell_style: ParagraphStyle):
        """Renders markdown table lines into a ReportLab Table."""
        parsed_rows = []
        for line in lines:
            if re.match(r"^\|(\s*:?-+:?\s*\|)+$", line):
                continue
            cells = [c.strip() for c in line.strip("|").split("|")]
            if cells:
                parsed_rows.append(cells)

        if not parsed_rows:
            return

        col_count = max(len(r) for r in parsed_rows)
        table_data = []
        for r_idx, row in enumerate(parsed_rows):
            row_paras = []
            for c_idx in range(col_count):
                val = row[c_idx] if c_idx < len(row) else ""
                val_html = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", val)
                if r_idx == 0:
                    val_html = f"<b>{val_html}</b>"
                row_paras.append(Paragraph(val_html, cell_style))
            table_data.append(row_paras)

        col_width = 504 / col_count  # 504 pt available between 54pt margins
        t = Table(table_data, colWidths=[col_width] * col_count)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#94a3b8")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        story.append(Spacer(1, 4))
        story.append(t)
        story.append(Spacer(1, 6))
