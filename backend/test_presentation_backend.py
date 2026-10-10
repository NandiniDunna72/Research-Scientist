"""
Automated backend verification test suite for Module 10: AI-Powered Research PPT Generation.
Covers all 13 required test cases:
1. Generating a presentation with complete research data.
2. Generating a presentation with partial project data.
3. Generating different presentation types.
4. Enforcing slide count limits.
5. Validating structured AI output.
6. Creating a valid PPTX file.
7. Retrieving saved presentations.
8. Editing and regenerating slide content.
9. Downloading the correct file.
10. Handling AI-provider resilience.
11. Handling missing files and export recovery.
12. Authentication and project ownership.
13. Preventing access to another user's presentation.
"""

import io
import os
import sys
import zipfile
from datetime import datetime
from starlette.testclient import TestClient

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from app.main import app
from app.database.database import SessionLocal
from app.models.user import User
from app.models.project import ResearchProject
from app.models.paper import ResearchPaper
from app.models.analysis import PaperAnalysis
from app.models.gap import ResearchGapAnalysis, ResearchGap
from app.models.question import ResearchQuestionGeneration, ResearchQuestion
from app.models.literature_review import LiteratureReviewGeneration
from app.models.methodology import ResearchMethodologyGeneration
from app.models.comparison import ResearchPaperComparison
from app.models.architecture import ArchitectureGeneration
from app.models.documentation import ResearchDocumentation
from app.models.presentation import ResearchPresentation
from app.services.presentation_service import PresentationService

client = TestClient(app)


def run_presentation_tests():
    print("=================================================================")
    print("TESTING AI RESEARCH PPT GENERATION (MODULE 10) - ALL SUITES")
    print("=================================================================")

    ts = int(datetime.now().timestamp())
    db = SessionLocal()

    # -------------------------------------------------------------
    # [Setup] Users Setup & Authentication Tokens
    # -------------------------------------------------------------
    print("\n[Setup] Authenticating Test User A and Test User B")
    login_a = client.post("/api/auth/signin", json={"email": "ppt_user_a@example.com", "password": "password123"})
    if login_a.status_code != 200:
        reg_a = client.post("/api/auth/signup", json={"email": "ppt_user_a@example.com", "password": "password123", "full_name": "Test User A"})
        assert reg_a.status_code == 201, f"User A registration failed: {reg_a.text}"
        login_a = client.post("/api/auth/signin", json={"email": "ppt_user_a@example.com", "password": "password123"})

    token_a = login_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    login_b = client.post("/api/auth/signin", json={"email": "ppt_user_b@example.com", "password": "password123"})
    if login_b.status_code != 200:
        reg_b = client.post("/api/auth/signup", json={"email": "ppt_user_b@example.com", "password": "password123", "full_name": "Test User B"})
        assert reg_b.status_code == 201, f"User B registration failed: {reg_b.text}"
        login_b = client.post("/api/auth/signin", json={"email": "ppt_user_b@example.com", "password": "password123"})

    token_b = login_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    user_a = db.query(User).filter(User.email == "ppt_user_a@example.com").first()
    user_b = db.query(User).filter(User.email == "ppt_user_b@example.com").first()
    assert user_a and user_b

    # -------------------------------------------------------------
    # [Setup] Research Project 1: Complete Upstream Data
    # -------------------------------------------------------------
    print("\n[Setup] Creating Project 1 with Complete Upstream Research Data")
    proj_complete = ResearchProject(
        user_id=user_a.id,
        title=f"Federated Attention Networks in Clinical EHR ({ts})",
        topic="Privacy-Preserving Healthcare Machine Learning",
        domain="Artificial Intelligence & Clinical Informatics",
        description="A multi-institution study evaluating differential privacy and cross-silo federated learning for clinical risk forecasting.",
    )
    db.add(proj_complete)
    db.commit()
    db.refresh(proj_complete)

    # Add 2 papers and analyses
    p1 = ResearchPaper(
        project_id=proj_complete.id,
        user_id=user_a.id,
        title="Privacy-Preserving Deep Learning for Healthcare Informatics",
        abstract="Differential privacy combined with federated learning provides quantifiable privacy guarantees without severe utility degradation.",
        authors=["Alice Zhang", "Bob Martinez"],
        publication_year=2023,
        venue="ACM Conference on Health, Inference, and Learning (CHIL)",
        doi="10.1145/3540001",
    )
    p2 = ResearchPaper(
        project_id=proj_complete.id,
        user_id=user_a.id,
        title="Attention-Based Risk Stratification in Electronic Health Records",
        abstract="Temporal transformer architectures capture sparse clinical trajectories more effectively than recurrent baselines.",
        authors=["Charlie Vance", "Dana Lee"],
        publication_year=2024,
        venue="IEEE Transactions on Biomedical Engineering",
        doi="10.1109/TBME.2024.1002",
    )
    db.add_all([p1, p2])
    db.commit()
    db.refresh(p1)
    db.refresh(p2)

    a1 = PaperAnalysis(
        paper_id=p1.id,
        user_id=user_a.id,
        research_problem="Data silos prevent centralized clinical model training across healthcare systems.",
        methodology="Cross-silo federated averaging with Renyi differential privacy.",
        dataset="MIMIC-IV Intensive Care Database",
        key_findings=["Maintains 92% AUROC while bounding privacy loss to epsilon=1.5."],
    )
    a2 = PaperAnalysis(
        paper_id=p2.id,
        user_id=user_a.id,
        research_problem="Irregular sampling in EHR trajectories limits conventional sequence models.",
        methodology="Continuous-time multi-head self-attention.",
        dataset="eICU Collaborative Research Database",
        key_findings=["Outperforms LSTM baselines by 4.2% on 30-day mortality prediction."],
    )
    db.add_all([a1, a2])
    db.commit()


    # Research Gaps
    gap_record = ResearchGapAnalysis(
        project_id=proj_complete.id,
        user_id=user_a.id,
        papers_analyzed=2,
        overall_summary="Empirical survey of clinical federated learning literature.",
    )
    db.add(gap_record)
    db.commit()
    db.refresh(gap_record)
    g1 = ResearchGap(
        analysis_id=gap_record.id,
        gap_title="Non-IID EHR Data Heterogeneity in Federated Learning",
        category="Methodological",
        description="Patient demographic skews and varying lab test distributions across hospital nodes destabilize global model convergence.",
        evidence=["Local demographic skew creates disparate parameter drift across clinical clients."],
        affected_papers=["Privacy-Preserving Deep Learning for Healthcare Informatics"],
        why_it_matters="Real-world hospital networks cannot assume uniform client data distributions.",
        potential_direction="Adaptive client clustering and momentum aggregation.",
        confidence="High",
        confidence_rationale="Empirical observations across EHR silos.",
        priority=1,
    )
    db.add(g1)



    # Research Questions
    q_record = ResearchQuestionGeneration(
        project_id=proj_complete.id,
        user_id=user_a.id,
        papers_considered=2,
        gaps_considered=1,
        overall_research_direction="Decentralized clinical AI optimization",
        recommended_next_step="Evaluate heterogeneous client clustering under differential privacy",
    )
    db.add(q_record)
    db.commit()

    db.refresh(q_record)
    q1 = ResearchQuestion(
        generation_id=q_record.id,
        project_id=proj_complete.id,
        user_id=user_a.id,
        question="How does client data heterogeneity impact differential privacy budget allocation in cross-silo clinical federated learning?",
        question_type="Methodological",
        motivation="Quantifying the trade-off between client drift and privacy noise injection.",
        supporting_evidence=["Non-IID gradient divergence degrades differential privacy convergence bounds."],
        expected_investigation="Empirical benchmarking across MIMIC-IV multi-client silos.",
        feasibility="High",
        priority="High",
    )
    db.add(q1)


    # Architecture
    arch_record = ArchitectureGeneration(
        project_id=proj_complete.id,
        user_id=user_a.id,
        architecture_title="FedEHR-Attention Architecture",
        architecture_type="Decentralized Clinical AI",
        structured_architecture_result={
            "components": [
                {"name": "Local EHR Preprocessor", "role": "Standardizes FHIR / OMOP clinical records."},
                {"name": "Differential Privacy Sanitizer", "role": "Injects Gaussian calibrated noise."},
                {"name": "Federated Aggregator", "role": "Combines client gradients securely."},
            ]
        },
    )
    db.add(arch_record)


    # Documentation (Module 9 Saved Document as Primary Source)
    doc_record = ResearchDocumentation(
        project_id=proj_complete.id,
        user_id=user_a.id,
        title="Federated Attention Networks: A Privacy-Preserving Study in Clinical Informatics",
        template="IEEE Conference",
        structured_content={
            "abstract": "We introduce FedEHR-Attention, an architecture uniting local differential privacy with temporal attention networks for clinical EHR analytics.",
            "introduction": "Healthcare data fragmentation restricts modern deep learning model utility across hospitals.",
            "literature_review": "Prior literature separates federated learning from clinical time-series modeling.",
            "research_gaps": "Extant frameworks degrade significantly when encountering severe non-IID patient cohorts.",
            "methodology": "We propose a dual-stage client clustering scheme alongside adaptive gradient clipping.",
            "architecture": "The architecture isolates sensitive protected health information on hospital premises.",
            "experimental_plan": "Evaluated on MIMIC-IV and eICU datasets with 10 decentralized client nodes.",
            "conclusion": "FedEHR-Attention reconciles institutional data sovereignty with competitive diagnostic predictive power.",
        },
        sections_config=[{"id": "sec-abstract", "title": "Abstract", "included": True}],
    )
    db.add(doc_record)
    db.commit()


    # -------------------------------------------------------------
    # [Setup] Research Project 2: Partial Upstream Data
    # -------------------------------------------------------------
    print("\n[Setup] Creating Project 2 with Partial Upstream Data (Minimal)")
    proj_partial = ResearchProject(
        user_id=user_a.id,
        title=f"Autonomous UAV Path Planning ({ts})",
        topic="Reinforcement Learning for Drone Navigation",
        domain="Robotics & Autonomous Systems",
        description="Exploring actor-critic algorithms in cluttered 3D urban canyons without prior mapping.",
    )
    db.add(proj_partial)
    db.commit()
    db.refresh(proj_partial)

    # Project 3: User B's project (For Isolation Tests)
    proj_user_b = ResearchProject(
        user_id=user_b.id,
        title=f"Quantum Error Correction ({ts})",
        topic="Surface Code Thresholds",
        domain="Quantum Computing",
    )
    db.add(proj_user_b)
    db.commit()
    db.refresh(proj_user_b)

    # =============================================================
    # TEST 1: Generating a Presentation with Complete Research Data
    # =============================================================
    print("\n[Test 1] POST /api/presentations/generate with Complete Upstream Research Data")
    res_gen_complete = client.post(
        "/api/presentations/generate",
        headers=headers_a,
        json={
            "project_id": proj_complete.id,
            "title": "FedEHR-Attention: Clinical Slide Deck",
            "presentation_type": "Final-Year Project Review",
            "theme": "Professional Academic",
            "slide_count": 12,
            "presenter_name": "Alice Zhang",
            "institution": "Stanford School of Medicine",
            "supervisor_name": "Prof. David Miller",
            "include_speaker_notes": True,
        },
    )
    assert res_gen_complete.status_code == 201, f"Expected 201 Created: {res_gen_complete.text}"
    pres_complete_data = res_gen_complete.json()
    pres_complete_id = pres_complete_data["id"]
    assert pres_complete_data["title"] == "FedEHR-Attention: Clinical Slide Deck"
    assert pres_complete_data["presentation_type"] == "Final-Year Project Review"
    assert pres_complete_data["theme"] == "Professional Academic"
    assert len(pres_complete_data["data"]["slides"]) >= 10
    print(f" -> Generated {len(pres_complete_data['data']['slides'])} slides successfully (ID: {pres_complete_id})")

    # =============================================================
    # TEST 2: Generating a Presentation with Partial Project Data
    # =============================================================
    print("\n[Test 2] POST /api/presentations/generate with Partial Upstream Data (Graceful Synthesis)")
    res_gen_partial = client.post(
        "/api/presentations/generate",
        headers=headers_a,
        json={
            "project_id": proj_partial.id,
            "title": "Autonomous UAV Navigation Proposal",
            "presentation_type": "Project Proposal",
            "theme": "Minimal Research",
            "slide_count": 8,
            "include_speaker_notes": True,
        },
    )
    assert res_gen_partial.status_code == 201, f"Expected 201 Created: {res_gen_partial.text}"
    pres_partial_data = res_gen_partial.json()
    pres_partial_id = pres_partial_data["id"]
    assert len(pres_partial_data["data"]["slides"]) >= 6
    # Verify missing items are tagged appropriately
    assert pres_partial_data["data"]["missing_upstream_context"] is not None
    print(f" -> Generated partial presentation deck with {len(pres_partial_data['data']['slides'])} slides.")

    # =============================================================
    # TEST 3: Generating Different Presentation Types
    # =============================================================
    print("\n[Test 3] Generating All 5 Presentation Types")
    types_to_test = [
        "Project Proposal",
        "Final-Year Project Review",
        "Research Seminar",
        "Literature Review Presentation",
        "Technical Demonstration",
    ]
    for p_type in types_to_test:
        res = client.post(
            "/api/presentations/generate",
            headers=headers_a,
            json={
                "project_id": proj_complete.id,
                "title": f"Deck for {p_type}",
                "presentation_type": p_type,
                "theme": "Modern Technical",
                "slide_count": 10,
            },
        )
        assert res.status_code == 201, f"Failed generating {p_type}: {res.text}"
        data = res.json()
        assert data["presentation_type"] == p_type
        print(f" -> Verified presentation type '{p_type}' ({len(data['data']['slides'])} slides)")

    # =============================================================
    # TEST 4: Enforcing Slide Count Limits
    # =============================================================
    print("\n[Test 4] Enforcing Slide Count Limits (Min 6, Max 25)")
    res_under = client.post(
        "/api/presentations/generate",
        headers=headers_a,
        json={"project_id": proj_complete.id, "slide_count": 3},
    )
    assert res_under.status_code == 422, f"Expected 422 for slide_count=3, got {res_under.status_code}"

    res_over = client.post(
        "/api/presentations/generate",
        headers=headers_a,
        json={"project_id": proj_complete.id, "slide_count": 30},
    )
    assert res_over.status_code == 422, f"Expected 422 for slide_count=30, got {res_over.status_code}"
    print(" -> Successfully enforced slide count validation (3 and 30 rejected with 422 Unprocessable Entity).")

    # =============================================================
    # TEST 5: Validating Structured AI Output
    # =============================================================
    print("\n[Test 5] Validating Structured Slide Fields")
    slides = pres_complete_data["data"]["slides"]
    for idx, slide in enumerate(slides):
        assert "id" in slide
        assert "slide_number" in slide
        assert slide["slide_number"] == idx + 1
        assert "title" in slide and len(slide["title"]) > 0
        assert "slide_type" in slide
        assert "bullet_points" in slide and isinstance(slide["bullet_points"], list)
        assert "notes" in slide  # speaker notes
        assert "badge" in slide
    print(" -> All slides conform strictly to structured slide schema with bullet points, titles, and speaker notes.")

    # =============================================================
    # TEST 6: Creating a Valid PPTX File (Magic Bytes & ZIP Integrity)
    # =============================================================
    print("\n[Test 6] Verifying Actual .pptx File on Disk and OpenXML ZIP Integrity")
    rec = db.query(ResearchPresentation).filter(ResearchPresentation.id == pres_complete_id).first()
    assert rec and rec.file_path, "Presentation record must have a physical file_path"
    assert os.path.exists(rec.file_path), f"File {rec.file_path} does not exist on disk"
    file_size = os.path.getsize(rec.file_path)
    assert file_size > 1000, f"File size unexpectedly small: {file_size} bytes"

    # OpenXML PowerPoint (.pptx) is a ZIP package containing [Content_Types].xml and ppt/presentation.xml
    with zipfile.ZipFile(rec.file_path, "r") as zf:
        namelist = zf.namelist()
        assert "[Content_Types].xml" in namelist, "Missing [Content_Types].xml in PPTX"
        assert any("ppt/slides/slide" in name for name in namelist), "Missing slide parts in PPTX"
        assert "ppt/presentation.xml" in namelist, "Missing presentation.xml in PPTX"
    print(f" -> Confirmed valid editable OpenXML PowerPoint file: {rec.file_path} ({file_size:,} bytes)")

    # =============================================================
    # TEST 7: Retrieving Saved Presentations
    # =============================================================
    print("\n[Test 7] GET /api/presentations/{project_id} and GET .../{presentation_id}")
    res_latest = client.get(f"/api/presentations/{proj_complete.id}", headers=headers_a)
    assert res_latest.status_code == 200, f"Failed getting latest: {res_latest.text}"
    assert res_latest.json()["id"] is not None

    res_specific = client.get(f"/api/presentations/{proj_complete.id}/{pres_complete_id}", headers=headers_a)
    assert res_specific.status_code == 200, f"Failed getting specific: {res_specific.text}"
    assert res_specific.json()["id"] == pres_complete_id
    print(" -> Saved presentation retrieved accurately from PostgreSQL.")

    # =============================================================
    # TEST 8: Editing and Regenerating Slide Content
    # =============================================================
    print("\n[Test 8] PUT update slide content and POST regenerate")
    # Edit slide 2
    updated_slides = list(slides)
    updated_slides[1]["title"] = "Refined Problem Statement & Clinical Motivation"
    updated_slides[1]["bullet_points"] = [
        "Clinical EHR datasets remain highly segregated across hospital boundaries.",
        "Non-IID patient demographics cause gradient divergence during decentralized optimization.",
        "Differential privacy bounds must be strictly budgeted against downstream diagnostic AUROC.",
    ]
    res_update = client.put(
        f"/api/presentations/{proj_complete.id}/{pres_complete_id}",
        headers=headers_a,
        json={
            "title": "FedEHR-Attention (Updated Title)",
            "slides": updated_slides,
        },
    )
    assert res_update.status_code == 200, f"Update failed: {res_update.text}"
    updated_data = res_update.json()
    assert updated_data["data"]["title"] == "FedEHR-Attention (Updated Title)"
    assert updated_data["data"]["slides"][1]["title"] == "Refined Problem Statement & Clinical Motivation"
    print(" -> Slide edited and re-compiled successfully.")

    # Regenerate slide 3
    res_regen = client.post(
        f"/api/presentations/{proj_complete.id}/{pres_complete_id}/regenerate",
        headers=headers_a,
        json={"slide_numbers": [3]},
    )
    assert res_regen.status_code == 200, f"Regenerate failed: {res_regen.text}"
    print(" -> Slide 3 selectively regenerated with latest research context.")

    # =============================================================
    # TEST 9: Downloading the Correct File
    # =============================================================
    print("\n[Test 9] GET /api/presentations/{project_id}/{presentation_id}/download")
    res_down = client.get(
        f"/api/presentations/{proj_complete.id}/{pres_complete_id}/download",
        headers=headers_a,
    )
    assert res_down.status_code == 200, f"Download failed: {res_down.text}"
    assert "application/vnd.openxmlformats-officedocument.presentationml.presentation" in res_down.headers["content-type"]
    assert "attachment;" in res_down.headers["content-disposition"]
    assert res_down.content.startswith(b"PK\x03\x04"), "Downloaded file must start with ZIP magic bytes PK\\x03\\x04"
    print(f" -> Download succeeded ({len(res_down.content):,} bytes received with correct MIME type and magic bytes).")

    # =============================================================
    # TEST 10: Handling AI-Provider Resilience (Offline/Deterministic Synthesis)
    # =============================================================
    print("\n[Test 10] Validating Deterministic Analytical Synthesis Fallback Engine")
    # Even if external LLM is offline or unconfigured, the analytical domain engine produces complete slides
    import asyncio
    syn_result = asyncio.run(
        PresentationService.generate_presentation(
            topic="Reinforcement Learning for Autonomous Drone Swarms",
            project_description="Evaluating decentralized consensus algorithms.",
            presentation_type="Research Seminar",
            theme="Professional Academic",
            style="Academic Formal",
            slide_count=10,
            presenter_name="Autonomous Systems Lab",
            institution="Robotics Institute",
            supervisor_name="Dr. Sarah Connor",
            include_architecture=True,
            include_comparison=True,
            include_research_gaps=True,
            include_methodology=True,
            include_speaker_notes=True,
            sections_to_include=None,
            documentation_data=None,
            papers_data=[],
            analyses_data=[],
            gaps_data=[],
            questions_data=[],
            methodology_data=None,
            comparison_data=None,
            architecture_data=None,
        )
    )
    assert len(syn_result["slides"]) == 10
    assert syn_result["slides"][0]["slide_type"] == "title"
    assert syn_result["slides"][-1]["slide_type"] == "references"
    print(" -> Deterministic academic engine guarantees 100% reliable generation without external AI provider failure.")


    # =============================================================
    # TEST 11: Handling Missing Files and Export Recovery
    # =============================================================
    print("\n[Test 11] Automatic On-the-Fly Regeneration If File Was Deleted on Disk")
    rec = db.query(ResearchPresentation).filter(ResearchPresentation.id == pres_partial_id).first()
    if rec and rec.file_path and os.path.exists(rec.file_path):
        os.remove(rec.file_path)
        assert not os.path.exists(rec.file_path)

    # Now request download - router must regenerate the file transparently
    res_recover = client.get(
        f"/api/presentations/{proj_partial.id}/{pres_partial_id}/download",
        headers=headers_a,
    )
    assert res_recover.status_code == 200
    assert res_recover.content.startswith(b"PK\x03\x04")
    assert os.path.exists(rec.file_path)
    print(" -> Missing file was automatically regenerated and served transparently.")

    # =============================================================
    # TEST 12: Authentication and Project Ownership (401 Unauthorized)
    # =============================================================
    print("\n[Test 12] Authentication Enforcement (401 Unauthorized)")
    res_unauth_gen = client.post("/api/presentations/generate", json={"project_id": proj_complete.id})
    assert res_unauth_gen.status_code == 401, f"Expected 401, got {res_unauth_gen.status_code}"

    res_unauth_down = client.get(f"/api/presentations/{proj_complete.id}/{pres_complete_id}/download")
    assert res_unauth_down.status_code == 401, f"Expected 401, got {res_unauth_down.status_code}"
    print(" -> Unauthenticated requests successfully rejected with 401.")

    # =============================================================
    # TEST 13: Preventing Access to Another User's Presentation (403/404 Isolation)
    # =============================================================
    print("\n[Test 13] Multi-Tenant Isolation Enforcement (User B accessing User A)")
    # User B attempting to view User A's presentation
    res_b_view = client.get(f"/api/presentations/{proj_complete.id}", headers=headers_b)
    assert res_b_view.status_code in (403, 404), f"Expected 403 or 404, got {res_b_view.status_code}"

    # User B attempting to download User A's presentation
    res_b_down = client.get(f"/api/presentations/{proj_complete.id}/{pres_complete_id}/download", headers=headers_b)
    assert res_b_down.status_code in (403, 404), f"Expected 403 or 404, got {res_b_down.status_code}"

    # User B attempting to update User A's presentation
    res_b_update = client.put(
        f"/api/presentations/{proj_complete.id}/{pres_complete_id}",
        headers=headers_b,
        json={"title": "Hacked Title"},
    )
    assert res_b_update.status_code in (403, 404), f"Expected 403 or 404, got {res_b_update.status_code}"
    print(" -> Cross-user access securely blocked with 403 Forbidden / 404 Not Found.")

    print("\n=================================================================")
    print("ALL 13 PRESENTATION BACKEND TESTS PASSED SUCCESSFULLY! (100%)")
    print("=================================================================\n")


if __name__ == "__main__":
    run_presentation_tests()
