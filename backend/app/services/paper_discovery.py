import re
import time
import logging
import asyncio
import urllib.parse
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional, Tuple
import httpx

logger = logging.getLogger("paper_discovery")
logger.setLevel(logging.INFO)

# Lightweight In-Memory Search Cache: {(user_id, query_str, limit): (timestamp, list_of_papers)}
_SEARCH_CACHE: Dict[Tuple[int, str, int], Tuple[float, List[Dict[str, Any]]]] = {}
CACHE_TTL_SECONDS = 300.0  # 5 minutes


def _clean_text(text: Optional[str]) -> Optional[str]:
    """Clean text by stripping HTML/XML tags and excessive whitespaces."""
    if not text:
        return None
    # Strip HTML/XML tags like <jats:p>, <i>, etc.
    cleaned = re.sub(r"<[^>]+>", " ", text)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned if cleaned else None


def _normalize_doi(doi: Optional[str]) -> Optional[str]:
    """Normalize DOI to standard lowercase format without URLs."""
    if not doi:
        return None
    clean = doi.strip().lower()
    for prefix in ["https://doi.org/", "http://doi.org/", "doi:"]:
        if clean.startswith(prefix):
            clean = clean[len(prefix):]
    clean = clean.strip().rstrip("/")
    return clean if clean else None


def _normalize_title(title: Optional[str]) -> str:
    """Normalize title for fuzzy duplicate detection."""
    if not title:
        return ""
    # Lowercase and keep only alphanumeric chars
    normalized = re.sub(r"[^a-z0-9]", "", title.lower())
    return normalized


def _extract_arxiv_id(id_str: Optional[str]) -> Optional[str]:
    """Extract standard arXiv ID from URL or ID string."""
    if not id_str:
        return None
    match = re.search(r"(\d{4}\.\d{4,5}(v\d+)?)", id_str)
    if match:
        return match.group(1).split("v")[0]  # Strip version
    return None


class PaperDiscoveryService:
    """Modular Paper Discovery Service fetching and synthesizing research from academic APIs."""

    USER_AGENT = "AIResearchScientist/1.0 (academic research platform; mailto:ai-research@university.edu)"
    REQUEST_TIMEOUT = 8.0  # Seconds per source request

    @classmethod
    async def fetch_semantic_scholar(cls, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch papers from Semantic Scholar Public Graph API."""
        url = "https://api.semanticscholar.org/graph/v1/paper/search"
        params = {
            "query": query,
            "limit": min(limit, 20),
            "fields": "paperId,title,abstract,authors,year,publicationDate,venue,publicationVenue,citationCount,openAccessPdf,externalIds,url,publicationTypes",
        }
        headers = {"User-Agent": cls.USER_AGENT}
        results = []

        try:
            async with httpx.AsyncClient(timeout=cls.REQUEST_TIMEOUT) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    papers = data.get("data", [])
                    for p in papers:
                        external_ids = p.get("externalIds") or {}
                        doi = _normalize_doi(external_ids.get("DOI"))
                        arxiv_id = external_ids.get("ArXiv")
                        
                        authors_raw = p.get("authors") or []
                        authors = [a.get("name", "").strip() for a in authors_raw if a.get("name")]
                        
                        open_access = p.get("openAccessPdf") or {}
                        pdf_url = open_access.get("url")
                        
                        venue_str = p.get("venue")
                        if not venue_str and p.get("publicationVenue"):
                            venue_str = (p.get("publicationVenue") or {}).get("name")
                        
                        pub_types = p.get("publicationTypes") or []
                        pub_type = pub_types[0] if pub_types else None

                        results.append({
                            "id": f"s2-{p.get('paperId')}",
                            "external_id": p.get("paperId"),
                            "title": _clean_text(p.get("title")),
                            "authors": authors,
                            "abstract": _clean_text(p.get("abstract")),
                            "publication_year": p.get("year"),
                            "publication_date": p.get("publicationDate"),
                            "venue": _clean_text(venue_str),
                            "doi": doi,
                            "arxiv_id": arxiv_id,
                            "paper_url": p.get("url") or f"https://www.semanticscholar.org/paper/{p.get('paperId')}",
                            "pdf_url": pdf_url,
                            "citation_count": p.get("citationCount") or 0,
                            "source": "Semantic Scholar",
                            "publication_type": pub_type,
                        })
                else:
                    logger.warning(f"Semantic Scholar returned status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Semantic Scholar query failed: {e}")

        return results

    @classmethod
    async def fetch_arxiv(cls, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch papers from arXiv API via Atom XML."""
        url = "https://export.arxiv.org/api/query"
        encoded_query = f"all:{query}"
        params = {
            "search_query": encoded_query,
            "start": 0,
            "max_results": min(limit, 20),
            "sortBy": "relevance",
            "sortOrder": "descending",
        }
        headers = {"User-Agent": cls.USER_AGENT}
        results = []

        try:
            async with httpx.AsyncClient(timeout=cls.REQUEST_TIMEOUT) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    root = ET.fromstring(resp.content)
                    ns = {
                        "atom": "http://www.w3.org/2005/Atom",
                        "arxiv": "http://arxiv.org/schemas/atom",
                    }

                    for entry in root.findall("atom:entry", ns):
                        raw_id = entry.findtext("atom:id", default="", namespaces=ns)
                        arxiv_id = _extract_arxiv_id(raw_id)
                        title = _clean_text(entry.findtext("atom:title", default="", namespaces=ns))
                        summary = _clean_text(entry.findtext("atom:summary", default="", namespaces=ns))
                        published = entry.findtext("atom:published", default="", namespaces=ns)

                        # Extract year
                        year = None
                        if published and len(published) >= 4:
                            try:
                                year = int(published[:4])
                            except ValueError:
                                pass

                        # Authors
                        authors = []
                        for author in entry.findall("atom:author", ns):
                            name = author.findtext("atom:name", default="", namespaces=ns).strip()
                            if name:
                                authors.append(name)

                        # Links (abs vs pdf)
                        paper_url = raw_id
                        pdf_url = None
                        for link in entry.findall("atom:link", ns):
                            rel = link.attrib.get("rel")
                            title_attr = link.attrib.get("title")
                            href = link.attrib.get("href")
                            if title_attr == "pdf" or (href and href.endswith(".pdf")):
                                pdf_url = href
                            elif rel == "alternate" and href:
                                paper_url = href

                        if not pdf_url and arxiv_id:
                            pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"

                        # DOI
                        doi_elem = entry.find("arxiv:doi", ns)
                        doi = _normalize_doi(doi_elem.text) if doi_elem is not None else None

                        journal_ref = entry.findtext("arxiv:journal_ref", default="", namespaces=ns)
                        venue = _clean_text(journal_ref) if journal_ref else "arXiv Preprint"

                        results.append({
                            "id": f"arxiv-{arxiv_id or abs(hash(title))}",
                            "external_id": arxiv_id or raw_id,
                            "title": title,
                            "authors": authors,
                            "abstract": summary,
                            "publication_year": year,
                            "publication_date": published[:10] if published else None,
                            "venue": venue,
                            "doi": doi,
                            "arxiv_id": arxiv_id,
                            "paper_url": paper_url,
                            "pdf_url": pdf_url,
                            "citation_count": 0,  # arXiv does not provide citation count in Atom
                            "source": "arXiv",
                            "publication_type": "Preprint",
                        })
                else:
                    logger.warning(f"arXiv API returned status {resp.status_code}")
        except Exception as e:
            logger.warning(f"arXiv query failed: {e}")

        return results

    @classmethod
    async def fetch_crossref(cls, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch papers from Crossref Public API."""
        url = "https://api.crossref.org/works"
        params = {
            "query": query,
            "rows": min(limit, 20),
            "sort": "relevance",
        }
        headers = {"User-Agent": cls.USER_AGENT}
        results = []

        try:
            async with httpx.AsyncClient(timeout=cls.REQUEST_TIMEOUT) as client:
                resp = await client.get(url, params=params, headers=headers)
                if resp.status_code == 200:
                    data = resp.json()
                    items = data.get("message", {}).get("items", [])
                    for item in items:
                        raw_title = item.get("title") or []
                        title = _clean_text(raw_title[0] if raw_title else None)
                        if not title:
                            continue

                        raw_doi = item.get("DOI")
                        doi = _normalize_doi(raw_doi)

                        # Authors
                        authors = []
                        for a in item.get("author", []):
                            given = a.get("given", "").strip()
                            family = a.get("family", "").strip()
                            name = f"{given} {family}".strip() if given or family else a.get("name", "").strip()
                            if name:
                                authors.append(name)

                        # Abstract
                        abstract = _clean_text(item.get("abstract"))

                        # Year & date
                        date_parts = (item.get("published") or item.get("created") or {}).get("date-parts", [[None]])
                        year = date_parts[0][0] if date_parts and date_parts[0] else None
                        pub_date = None
                        if year:
                            try:
                                year = int(year)
                                month = date_parts[0][1] if len(date_parts[0]) > 1 else 1
                                day = date_parts[0][2] if len(date_parts[0]) > 2 else 1
                                pub_date = f"{year}-{month:02d}-{day:02d}"
                            except (ValueError, TypeError):
                                pass

                        container = item.get("container-title") or []
                        venue = _clean_text(container[0] if container else None)

                        citation_count = item.get("is-referenced-by-count") or 0
                        paper_url = item.get("URL") or (f"https://doi.org/{doi}" if doi else None)

                        # Extract PDF URL if available
                        pdf_url = None
                        for link in item.get("link", []):
                            if link.get("content-type") == "application/pdf":
                                pdf_url = link.get("URL")
                                break

                        results.append({
                            "id": f"cr-{doi or abs(hash(title))}",
                            "external_id": raw_doi,
                            "title": title,
                            "authors": authors,
                            "abstract": abstract,
                            "publication_year": year,
                            "publication_date": pub_date,
                            "venue": venue,
                            "doi": doi,
                            "arxiv_id": None,
                            "paper_url": paper_url,
                            "pdf_url": pdf_url,
                            "citation_count": citation_count,
                            "source": "Crossref",
                            "publication_type": item.get("type"),
                        })
                else:
                    logger.warning(f"Crossref API returned status {resp.status_code}")
        except Exception as e:
            logger.warning(f"Crossref query failed: {e}")

        return results

    @classmethod
    def _deduplicate_papers(cls, papers: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove duplicates using DOI, external IDs, and normalized titles."""
        unique_papers: List[Dict[str, Any]] = []
        seen_dois: Dict[str, int] = {}
        seen_arxiv: Dict[str, int] = {}
        seen_titles: Dict[str, int] = {}

        for p in papers:
            doi = p.get("doi")
            arxiv_id = p.get("arxiv_id")
            norm_title = _normalize_title(p.get("title"))

            existing_idx: Optional[int] = None

            if doi and doi in seen_dois:
                existing_idx = seen_dois[doi]
            elif arxiv_id and arxiv_id in seen_arxiv:
                existing_idx = seen_arxiv[arxiv_id]
            elif norm_title and len(norm_title) >= 12 and norm_title in seen_titles:
                existing_idx = seen_titles[norm_title]

            if existing_idx is not None:
                # Merge into existing paper, keeping richer metadata
                existing = unique_papers[existing_idx]
                if not existing.get("abstract") and p.get("abstract"):
                    existing["abstract"] = p["abstract"]
                if not existing.get("pdf_url") and p.get("pdf_url"):
                    existing["pdf_url"] = p["pdf_url"]
                if not existing.get("doi") and p.get("doi"):
                    existing["doi"] = p["doi"]
                if (p.get("citation_count") or 0) > (existing.get("citation_count") or 0):
                    existing["citation_count"] = p["citation_count"]
                if not existing.get("venue") and p.get("venue"):
                    existing["venue"] = p["venue"]
                if not existing.get("publication_year") and p.get("publication_year"):
                    existing["publication_year"] = p["publication_year"]
                if len(p.get("authors") or []) > len(existing.get("authors") or []):
                    existing["authors"] = p["authors"]
            else:
                idx = len(unique_papers)
                unique_papers.append(p)
                if doi:
                    seen_dois[doi] = idx
                if arxiv_id:
                    seen_arxiv[arxiv_id] = idx
                if norm_title and len(norm_title) >= 12:
                    seen_titles[norm_title] = idx

        return unique_papers

    @classmethod
    def _rank_papers(cls, papers: List[Dict[str, Any]], query: str) -> List[Dict[str, Any]]:
        """Rank papers based on transparent keyword relevance, citations, and source signal."""
        query_terms = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 2]

        for idx, paper in enumerate(papers):
            title = (paper.get("title") or "").lower()
            abstract = (paper.get("abstract") or "").lower()
            venue = (paper.get("venue") or "").lower()

            score = 45.0  # Base starting relevance

            if query_terms:
                # Title term matches (up to 30 points)
                title_matches = sum(1 for term in query_terms if term in title)
                title_ratio = title_matches / len(query_terms)
                score += title_ratio * 30.0

                # Exact phrase match in title bonus
                if query.lower() in title:
                    score += 10.0

                # Abstract term matches (up to 15 points)
                abstract_matches = sum(1 for term in query_terms if term in abstract)
                abstract_ratio = abstract_matches / len(query_terms)
                score += abstract_ratio * 15.0

                # Venue term match bonus (up to 5 points)
                if any(term in venue for term in query_terms):
                    score += 5.0

            # Provider rank decay (earlier results scored higher, up to 5 points)
            position_score = max(0.0, 5.0 - (idx * 0.2))
            score += position_score

            # Citation bonus (up to 5 points)
            citations = paper.get("citation_count") or 0
            if citations > 100:
                score += 5.0
            elif citations > 20:
                score += 3.0
            elif citations > 0:
                score += 1.5

            # Recent publication year bonus (up to 5 points)
            year = paper.get("publication_year")
            if year:
                if year >= 2024:
                    score += 5.0
                elif year >= 2022:
                    score += 3.0
                elif year >= 2020:
                    score += 1.0

            # Cap score between 40 and 99
            final_score = int(min(99.0, max(42.0, round(score))))
            paper["relevance_score"] = final_score

        # Sort descending by relevance score, then citation count
        papers.sort(
            key=lambda x: (x.get("relevance_score", 0), x.get("citation_count", 0)),
            reverse=True,
        )
        return papers

    @classmethod
    async def discover_papers(
        cls,
        user_id: int,
        query: str,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Search academic sources concurrently, deduplicate, rank, and return top 20 papers."""
        cleaned_query = query.strip()
        if not cleaned_query:
            return []

        enforced_limit = min(max(1, limit), 20)

        # Check in-memory cache
        cache_key = (user_id, cleaned_query.lower(), enforced_limit)
        now = time.time()
        if cache_key in _SEARCH_CACHE:
            cached_time, cached_papers = _SEARCH_CACHE[cache_key]
            if now - cached_time < CACHE_TTL_SECONDS:
                logger.info(f"Returning {len(cached_papers)} cached papers for query '{cleaned_query}'")
                return cached_papers

        # Query all 3 providers concurrently
        logger.info(f"Querying Semantic Scholar, arXiv, and Crossref concurrently for '{cleaned_query}'")
        tasks = [
            cls.fetch_semantic_scholar(cleaned_query, limit=enforced_limit),
            cls.fetch_arxiv(cleaned_query, limit=enforced_limit),
            cls.fetch_crossref(cleaned_query, limit=enforced_limit),
        ]

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        candidate_papers: List[Dict[str, Any]] = []
        source_names = ["Semantic Scholar", "arXiv", "Crossref"]
        for i, res in enumerate(responses):
            if isinstance(res, Exception):
                logger.warning(f"Source {source_names[i]} failed with exception: {res}")
            elif isinstance(res, list):
                logger.info(f"Source {source_names[i]} returned {len(res)} papers")
                candidate_papers.extend(res)

        # Deduplicate papers
        deduped = cls._deduplicate_papers(candidate_papers)
        logger.info(f"After deduplication: {len(deduped)} unique papers (from {len(candidate_papers)} candidates)")

        # Rank by relevance
        ranked = cls._rank_papers(deduped, cleaned_query)

        # Enforce maximum 20 papers
        final_papers = ranked[:enforced_limit]

        # Cache result
        _SEARCH_CACHE[cache_key] = (now, final_papers)

        return final_papers
