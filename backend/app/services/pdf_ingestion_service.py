import os
import re
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("pdf_ingestion_service")
logger.setLevel(logging.INFO)


class PDFIngestionService:
    """
    Service for extracting page-by-page text from research paper PDFs,
    preserving exact page numbers and metadata for academic citation grounding.
    """

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> List[Dict[str, Any]]:
        """
        Extracts text page-by-page from a PDF file.
        Returns a list of dicts:
        [
            {"page_number": 1, "text": "...", "char_count": 1200},
            ...
        ]
        """
        if not os.path.exists(file_path):
            logger.error(f"PDF file does not exist: {file_path}")
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        pages_data = []

        # Try PyMuPDF (fitz) first as preferred by prompt
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(file_path)
            for page_idx in range(len(doc)):
                page = doc.load_page(page_idx)
                text = page.get_text("text") or ""
                # Clean up null bytes and weird control characters
                clean_text = re.sub(r"[\x00-\x08\x0b-\x0c\x0e-\x1f]", "", text).strip()
                if clean_text:
                    pages_data.append({
                        "page_number": page_idx + 1,
                        "text": clean_text,
                        "char_count": len(clean_text)
                    })
            doc.close()
            if pages_data:
                return pages_data
        except ImportError:
            logger.info("PyMuPDF (fitz) not imported, attempting pypdf fallback...")
        except Exception as e:
            logger.warning(f"PyMuPDF extraction error, attempting fallback: {e}")

        # Fallback: pypdf (which is already in existing project requirements)
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                clean_text = re.sub(r"[\x00-\x08\x0b-\x0c\x0e-\x1f]", "", text).strip()
                if clean_text:
                    pages_data.append({
                        "page_number": idx + 1,
                        "text": clean_text,
                        "char_count": len(clean_text)
                    })
        except Exception as e:
            logger.error(f"Failed to extract PDF via pypdf: {e}")
            raise RuntimeError(f"Unable to extract text from PDF: {str(e)}")

        if not pages_data:
            logger.warning(f"No readable text extracted from {file_path} (may be scanned image or empty).")

        return pages_data

    @staticmethod
    def chunk_page_text(
        text: str,
        page_number: int,
        chunk_size: int = 700,
        chunk_overlap: int = 150
    ) -> List[Dict[str, Any]]:
        """
        Splits page text into overlapping semantic passages while preserving page_number.
        """
        # Attempt langchain text splitters if available
        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                separators=["\n\n", "\n", ". ", " ", ""]
            )
            raw_chunks = splitter.split_text(text)
        except Exception:
            # Deterministic character-based recursive fallback
            raw_chunks = []
            step = chunk_size - chunk_overlap
            for i in range(0, len(text), step if step > 0 else chunk_size):
                chunk = text[i:i + chunk_size].strip()
                if chunk:
                    raw_chunks.append(chunk)

        result = []
        for i, chunk_text in enumerate(raw_chunks):
            if len(chunk_text) < 40:
                continue
            result.append({
                "chunk_index": i,
                "page_number": page_number,
                "text": chunk_text
            })
        return result
