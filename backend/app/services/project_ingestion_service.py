import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.paper import ResearchPaper
from app.models.analysis import PaperAnalysis
from app.models.gap import ResearchGapAnalysis, ResearchGap
from app.models.literature_review import (
    LiteratureReviewGeneration,
    LiteratureReviewTheme,
    LiteratureReviewPaperSummary,
)
from app.models.comparison import ResearchPaperComparison
from app.services.rag_vector_store import rag_vector_store
from app.services.pdf_ingestion_service import PDFIngestionService

logger = logging.getLogger("project_ingestion_service")
logger.setLevel(logging.INFO)


class ProjectIngestionService:
    """
    Research Document Ingestion Agent conforming to Section 4.A:
    Ingests research papers, abstracts, analyses, gaps, literature reviews,
    comparisons, and PDFs into ChromaDB with strict project isolation.
    """

    @classmethod
    def index_project_corpus(
        cls,
        project_id: int,
        user_id: int,
        db: Session
    ) -> Dict[str, Any]:
        """
        Scans all research assets belonging to project_id and indexes them into ChromaDB.
        """
        all_chunks: List[Dict[str, Any]] = []
        indexed_sources = []

        # 1. Fetch Research Papers belonging to project (or user)
        papers = (
            db.query(ResearchPaper)
            .filter(
                (ResearchPaper.project_id == project_id) |
                ((ResearchPaper.project_id.is_(None)) & (ResearchPaper.user_id == user_id))
            )
            .all()
        )

        for paper in papers:
            authors_str = ", ".join(paper.authors) if isinstance(paper.authors, list) else str(paper.authors or "Unknown")
            year_val = paper.publication_year or ""

            # Index Abstract
            if paper.abstract and len(paper.abstract.strip()) > 30:
                doc_id = f"paper_abstract_{paper.id}"
                # Delete existing to prevent duplicate indexing
                rag_vector_store.delete_document(doc_id, project_id)

                abstract_chunks = PDFIngestionService.chunk_page_text(
                    text=f"Paper Title: {paper.title}\nAuthors: {authors_str} ({year_val})\nVenue: {paper.venue or 'N/A'}\n\nAbstract:\n{paper.abstract}",
                    page_number=1,
                    chunk_size=700,
                    chunk_overlap=150,
                )
                for ac in abstract_chunks:
                    all_chunks.append({
                        "chunk_id": f"{doc_id}_c{ac['chunk_index']}",
                        "document_id": doc_id,
                        "paper_title": paper.title,
                        "authors": authors_str,
                        "publication_year": year_val,
                        "page_number": 1,
                        "source_type": "abstract",
                        "text": ac["text"],
                    })
                indexed_sources.append(f"Abstract: {paper.title[:35]}...")

            # 2. Index Structured Paper Analyses
            analyses = db.query(PaperAnalysis).filter(PaperAnalysis.paper_id == paper.id).all()
            for ana in analyses:
                doc_id = f"paper_analysis_{ana.id}"
                rag_vector_store.delete_document(doc_id, project_id)

                analysis_sections = []
                if ana.overview:
                    analysis_sections.append(f"Executive Overview: {ana.overview}")
                if ana.research_objective:
                    analysis_sections.append(f"Research Objective: {ana.research_objective}")
                if ana.research_problem:
                    analysis_sections.append(f"Problem Statement: {ana.research_problem}")
                if ana.methodology:
                    analysis_sections.append(f"Methodology: {ana.methodology}")
                if ana.dataset:
                    analysis_sections.append(f"Datasets Used: {ana.dataset}")
                if ana.key_findings:
                    findings_str = ", ".join(ana.key_findings) if isinstance(ana.key_findings, list) else str(ana.key_findings)
                    analysis_sections.append(f"Key Findings: {findings_str}")
                if ana.limitations:
                    limits_str = ", ".join(ana.limitations) if isinstance(ana.limitations, list) else str(ana.limitations)
                    analysis_sections.append(f"Limitations Reported: {limits_str}")
                if ana.future_work:
                    fw_str = ", ".join(ana.future_work) if isinstance(ana.future_work, list) else str(ana.future_work)
                    analysis_sections.append(f"Future Work: {fw_str}")

                full_analysis_text = f"Deep Analysis for Paper: {paper.title}\n" + "\n\n".join(analysis_sections)
                analysis_chunks = PDFIngestionService.chunk_page_text(
                    text=full_analysis_text,
                    page_number=1,
                    chunk_size=700,
                    chunk_overlap=150,
                )
                for ac in analysis_chunks:
                    all_chunks.append({
                        "chunk_id": f"{doc_id}_c{ac['chunk_index']}",
                        "document_id": doc_id,
                        "paper_title": paper.title,
                        "authors": authors_str,
                        "publication_year": year_val,
                        "page_number": 1,
                        "source_type": "analysis",
                        "text": ac["text"],
                    })

        # 3. Index Research Gaps
        gap_analyses = db.query(ResearchGapAnalysis).filter(ResearchGapAnalysis.project_id == project_id).all()
        for ga in gap_analyses:
            doc_id = f"gap_analysis_{ga.id}"
            rag_vector_store.delete_document(doc_id, project_id)

            gap_texts = [f"Overall Research Gap Summary: {ga.overall_summary}"]
            for gap in ga.gaps:
                gap_ev = ", ".join(gap.evidence) if isinstance(gap.evidence, list) else str(gap.evidence)
                gap_paps = ", ".join(gap.affected_papers) if isinstance(gap.affected_papers, list) else str(gap.affected_papers)
                gap_texts.append(
                    f"Research Gap: {gap.gap_title} (Category: {gap.category}, Priority: {gap.priority})\n"
                    f"Description: {gap.description}\n"
                    f"Supporting Evidence: {gap_ev}\n"
                    f"Affected Papers: {gap_paps}\n"
                    f"Significance: {gap.why_it_matters}\n"
                    f"Recommended Future Direction: {gap.potential_direction}"
                )

            full_gap_text = "\n\n".join(gap_texts)
            gap_chunks = PDFIngestionService.chunk_page_text(
                text=full_gap_text,
                page_number=1,
                chunk_size=700,
                chunk_overlap=150,
            )
            for gc in gap_chunks:
                all_chunks.append({
                    "chunk_id": f"{doc_id}_c{gc['chunk_index']}",
                    "document_id": doc_id,
                    "paper_title": "Project Research Gaps & Limitations Matrix",
                    "authors": "AI Research Scientist Synthesis",
                    "publication_year": "",
                    "page_number": 1,
                    "source_type": "gap",
                    "text": gc["text"],
                })
            indexed_sources.append(f"Research Gaps Analysis ({len(ga.gaps)} gaps)")

        # 4. Index Literature Reviews
        lit_reviews = db.query(LiteratureReviewGeneration).filter(LiteratureReviewGeneration.project_id == project_id).all()
        for lr in lit_reviews:
            doc_id = f"lit_review_{lr.id}"
            rag_vector_store.delete_document(doc_id, project_id)

            sections = [
                f"Literature Review on Topic: {lr.topic}",
                f"Introduction: {lr.introduction}",
                f"Research Landscape: {lr.research_landscape}",
                f"Methodological Synthesis: {lr.methodological_analysis}",
                f"Comparative Synthesis: {lr.comparative_synthesis}",
                f"Literature Limitations: {lr.limitations_in_literature}",
                f"Conclusion: {lr.conclusion}",
            ]
            full_lit_text = "\n\n".join(sections)
            lr_chunks = PDFIngestionService.chunk_page_text(
                text=full_lit_text,
                page_number=1,
                chunk_size=750,
                chunk_overlap=150,
            )
            for lc in lr_chunks:
                all_chunks.append({
                    "chunk_id": f"{doc_id}_c{lc['chunk_index']}",
                    "document_id": doc_id,
                    "paper_title": f"Literature Review: {lr.topic}",
                    "authors": "AI Research Scientist Synthesis",
                    "publication_year": "",
                    "page_number": 1,
                    "source_type": "literature_review",
                    "text": lc["text"],
                })
            indexed_sources.append(f"Literature Review: {lr.topic[:35]}...")

        # 5. Index Paper Comparisons
        comparisons = db.query(ResearchPaperComparison).filter(ResearchPaperComparison.project_id == project_id).all()
        for comp in comparisons:
            doc_id = f"comparison_{comp.id}"
            rag_vector_store.delete_document(doc_id, project_id)

            comp_title = comp.title or "Comparative Synthesis Matrix"
            comp_text = f"Paper Comparison Matrix: {comp_title}\nPapers Compared: {comp.papers_compared}\nDetails:\n{comp.structured_comparison_result}"
            comp_chunks = PDFIngestionService.chunk_page_text(
                text=comp_text,
                page_number=1,
                chunk_size=750,
                chunk_overlap=150,
            )
            for cc in comp_chunks:
                all_chunks.append({
                    "chunk_id": f"{doc_id}_c{cc['chunk_index']}",
                    "document_id": doc_id,
                    "paper_title": comp_title,
                    "authors": "Comparative Synthesis Engine",
                    "publication_year": "",
                    "page_number": 1,
                    "source_type": "comparison",
                    "text": cc["text"],
                })
            indexed_sources.append(f"Comparison: {comp_title[:35]}...")

        # Persist all chunks into ChromaDB
        indexed_count = rag_vector_store.add_chunks(
            chunks=all_chunks,
            project_id=project_id,
            user_id=user_id,
        )

        return {
            "status": "success",
            "project_id": project_id,
            "papers_found": len(papers),
            "chunks_indexed": indexed_count,
            "sources": indexed_sources,
        }

    @classmethod
    def index_pdf_file(
        cls,
        file_path: str,
        paper_title: str,
        project_id: int,
        user_id: int,
        authors: Optional[str] = None,
        publication_year: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Ingests an uploaded research paper PDF file, extracts text page-by-page,
        and indexes the chunks preserving exact page_number metadata.
        """
        pages_data = PDFIngestionService.extract_text_from_pdf(file_path)
        if not pages_data:
            raise ValueError("No readable text found in PDF.")

        doc_id = f"pdf_{hash(file_path)}_{project_id}"
        rag_vector_store.delete_document(doc_id, project_id)

        all_pdf_chunks = []
        for p in pages_data:
            page_num = p["page_number"]
            chunks = PDFIngestionService.chunk_page_text(
                text=p["text"],
                page_number=page_num,
                chunk_size=650,
                chunk_overlap=120,
            )
            for c in chunks:
                all_pdf_chunks.append({
                    "chunk_id": f"{doc_id}_p{page_num}_c{c['chunk_index']}",
                    "document_id": doc_id,
                    "paper_title": paper_title,
                    "authors": authors or "Unknown",
                    "publication_year": publication_year or "",
                    "page_number": page_num,
                    "source_type": "pdf",
                    "text": c["text"],
                })

        indexed_count = rag_vector_store.add_chunks(
            chunks=all_pdf_chunks,
            project_id=project_id,
            user_id=user_id,
        )

        return {
            "status": "success",
            "paper_title": paper_title,
            "total_pages": len(pages_data),
            "chunks_indexed": indexed_count,
            "project_id": project_id,
        }
