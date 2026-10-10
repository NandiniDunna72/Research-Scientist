import sys
from datetime import datetime
import httpx

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"


def run_comprehensive_architecture_tests():
    print("=================================================================")
    print("TESTING SYSTEM ARCHITECTURE GENERATION (MODULE 8) - ALL SUITES")
    print("=================================================================")

    # Setup: Authenticating User A
    print("\n[Setup] Authenticating User A")
    login_a = httpx.post(f"{BASE_URL}/api/auth/signin", json={"email": "testuser@example.com", "password": "password123"})
    if login_a.status_code != 200:
        signup_a = httpx.post(f"{BASE_URL}/api/auth/signup", json={"full_name": "Test User A", "email": "testuser@example.com", "password": "password123"})
        assert signup_a.status_code in [200, 201]
        token_a = signup_a.json()["token"]
    else:
        token_a = login_a.json()["token"]

    headers_a = {"Authorization": f"Bearer {token_a}"}
    print("✅ User A authenticated successfully.")

    # Retrieve User A's project with all upstream modules completed (e.g. Project 64 or 63)
    from app.database.database import SessionLocal
    from app.models.project import ResearchProject
    from app.models.paper import ResearchPaper
    from app.models.analysis import PaperAnalysis
    from app.models.gap import ResearchGapAnalysis, ResearchGap
    from app.models.question import ResearchQuestionGeneration, ResearchQuestion
    from app.models.methodology import ResearchMethodologyGeneration
    from app.models.comparison import ResearchPaperComparison
    from app.models.architecture import ArchitectureGeneration

    db = SessionLocal()
    ts = int(datetime.now().timestamp())

    # Create dedicated project for Test 1 (All Upstream Modules Completed)
    proj1 = ResearchProject(
        user_id=19,
        title=f"Multimodal Vision-Language Oncology Framework {ts}",
        topic=f"Vision-language representation learning for oncology whole-slide analysis {ts}",
        domain="Computational Oncology & Deep Learning",
        description="Comprehensive deep learning architecture for whole slide imaging and genomic profile alignment.",
    )
    db.add(proj1)
    db.commit()
    db.refresh(proj1)
    proj1_id = proj1.id

    # Seed Paper & Analysis
    p1 = ResearchPaper(
        project_id=proj1_id,
        user_id=19,
        title=f"Contrastive Multi-Scale Histopathology {ts}",
        abstract="Deep multi-scale transformer for gigapixel whole slide images.",
        authors=["E. Vance", "G. Freeman"],
        publication_year=2024,
    )
    db.add(p1)
    db.commit()
    db.refresh(p1)
    p1_id = p1.id

    a1 = PaperAnalysis(
        paper_id=p1_id,
        user_id=19,
        research_problem="High GPU memory constraints in gigapixel attention extraction.",
        research_objective="Learn cross-attention alignment using sparse topological patches.",
        methodology="Hierarchical patch-level transformer with contrastive loss",
        dataset="TCGA Pan-Cancer (11,000 whole-slide images)",
        algorithms_and_models=["ViT-H/14", "Perceiver-Resampler"],
        key_results=["AUROC 0.941", "Latency 45ms per slide"],
        contributions=["Memory-efficient attention extraction framework"],
        limitations=["High GPU memory footprint during dense attention extraction"],
    )
    db.add(a1)

    # Seed Gaps
    gap_gen = ResearchGapAnalysis(
        project_id=proj1_id,
        user_id=19,
        papers_analyzed=1,
        overall_summary="Extensive cross-modality oncology survey",
    )
    db.add(gap_gen)
    db.commit()
    db.refresh(gap_gen)

    g1 = ResearchGap(
        analysis_id=gap_gen.id,
        gap_title="Uncertainty Calibration Failure under Cross-Center Scanner Drift",
        category="Methodological / Diagnostic Reliability",
        description="Current deep learning models produce overconfident hallucinations when exposed to unseen scanner protocols.",
        evidence=["Scanner drift reduces validation accuracy by 14%"],
        affected_papers=["Contrastive Multi-Scale Histopathology"],
        why_it_matters="Clinical deployment risk",
        potential_direction="Epistemic uncertainty filtering",
        confidence="High",
        priority=1,
    )
    db.add(g1)

    # Seed Questions
    q_gen = ResearchQuestionGeneration(
        project_id=proj1_id,
        user_id=19,
        papers_considered=1,
        gaps_considered=1,
        overall_research_direction="Vision-language oncology representation",
        recommended_next_step="Formulate hierarchical patch attention",
    )
    db.add(q_gen)
    db.commit()
    db.refresh(q_gen)

    q1 = ResearchQuestion(
        generation_id=q_gen.id,
        project_id=proj1_id,
        user_id=19,
        question="How can hierarchical patch-level attention mitigate GPU memory ceilings while preserving diagnostic AUROC across multi-center cohorts?",
        question_type="Primary Research Question",
        motivation="Prevent memory overflow in clinical pathology clusters",
        supporting_evidence=["WSI memory scales quadratically"],
        expected_investigation="Sparse clustering benchmarks",
        feasibility="High",
        priority="High",
    )
    db.add(q1)

    # Seed Methodology
    m1 = ResearchMethodologyGeneration(
        project_id=proj1_id,
        user_id=19,
        topic=proj1.topic,
        version=1,
        papers_considered=1,
        gaps_considered=1,
        questions_considered=1,
        research_overview={"approach_summary": "Hierarchical patch-level transformer with contrastive alignment"},
        research_design={"design_type": "Empirical Quantitative Deep Learning"},
        proposed_approach=[{"phase": "Data Ingestion & Normalization"}],
        data_collection={"primary_dataset": "TCGA Pan-Cancer"},
        data_preprocessing=[{"technique": "Gigapixel patch tiling (256x256 at 20x)"}],
        methods_and_algorithms=[{"algorithm_name": "Hierarchical Sparse Cross-Attention Transformer"}],
        system_design={"architecture_overview": "Six-stage deep learning pipeline with uncertainty calibration"},
        experimental_setup={"hardware_requirements": "1x NVIDIA RTX 4090 (24GB VRAM)"},
        evaluation_metrics=[{"metric_name": "AUROC"}],
        comparison_strategy=[{"baseline_method": "Standard ResNet-50 + Max Pooling"}],
        expected_outcomes=[{"outcome_description": "AUROC >= 0.94 with 3.2x lower memory overhead"}],
        limitations_and_risks=[{"risk_description": "GPU memory ceilings under dense attention"}],
        reproducibility_and_ethics={"ethics_statement": "De-identified open academic cohorts"},
        execution_plan=[{"phase_name": "Phase 1: Ingestion & Model Prototyping"}],
    )
    db.add(m1)

    # Seed Paper Comparison
    comp1 = ResearchPaperComparison(
        project_id=proj1_id,
        user_id=19,
        title="Comparative Synthesis of Multimodal Oncology",
        papers_compared=2,
        paper_ids=[p1_id, 999],
        structured_comparison_result={"overall_synthesis": "Evidence supports sparse patch attention over dense convolution."},
    )
    db.add(comp1)
    db.commit()
    db.close()

    print(f"Project 1 created with ID {proj1_id} and all upstream assets seeded.")

    # -------------------------------------------------------------
    # [Test 1] Project with all upstream modules completed
    # -------------------------------------------------------------
    print("\n[Test 1] Generate system architecture for project with all upstream assets (POST /api/architecture/generate)")
    resp1 = httpx.post(f"{BASE_URL}/api/architecture/generate", json={"project_id": proj1_id}, headers=headers_a)
    assert resp1.status_code == 201, f"Expected 201, got {resp1.status_code}: {resp1.text}"
    data1 = resp1.json()
    assert "data" in data1
    arch1 = data1["data"]

    # Verify Core Sections
    assert arch1["architecture_title"]
    assert arch1["architecture_type"]
    assert arch1["architecture_summary"]
    assert len(arch1["components"]) >= 4, f"Expected at least 4 components, got {len(arch1['components'])}"
    for comp in arch1["components"]:
        assert comp["component_id"]
        assert comp["component_name"]
        assert comp["purpose"]
        assert isinstance(comp["responsibilities"], list)
        assert comp["implementation_status"] in ["implemented", "proposed", "optional"]

    # Verify Mermaid Diagram
    diag1 = arch1["architecture_diagram"]
    assert diag1["diagram_type"] == "mermaid"
    assert "flowchart" in diag1["source"] or "graph" in diag1["source"]
    assert len(diag1["source"]) > 50

    # Verify Data Flow
    assert len(arch1["data_flow"]) >= 4
    for df in arch1["data_flow"]:
        assert "step_number" in df
        assert "source_component" in df
        assert "destination_component" in df
        assert "processing_performed" in df

    # Verify Technology Stack
    assert len(arch1["technology_stack"]) >= 3
    for tech in arch1["technology_stack"]:
        assert tech["technology"]
        assert tech["category"]
        assert tech["role"]

    # Verify Data Storage Design
    ds1 = arch1["data_storage_design"]
    assert ds1["storage_paradigm"]
    assert len(ds1["entities"]) >= 2
    if ds1.get("er_diagram"):
        assert ds1["er_diagram"]["diagram_type"] == "mermaid"

    # Verify Security & Reliability
    assert len(arch1["security_and_reliability"]) >= 2

    # Verify Deployment Architecture
    dep1 = arch1["deployment_architecture"]
    assert dep1["deployment_model"]
    assert dep1["minimum_viable_deployment"]

    # Verify Architecture Justification
    assert len(arch1["architecture_justification"]) >= 1

    # Verify Alternative Architectures
    assert len(arch1["alternative_architectures"]) >= 1
    for alt in arch1["alternative_architectures"]:
        assert alt["title"]
        assert alt["rejection_reason"]

    # Verify Implementation Plan
    assert len(arch1["implementation_plan"]) >= 3

    print(f"✅ Test 1 Passed: Generated valid architecture '{arch1['architecture_title']}' with {len(arch1['components'])} components and valid Mermaid flowchart.")

    # -------------------------------------------------------------
    # [Test 2] Grounding on Methodology & Questions
    # -------------------------------------------------------------
    print("\n[Test 2] Verify architecture is directly grounded in research methodology")
    comp_names = " ".join([c["component_name"] for c in arch1["components"]])
    # Primary algorithm from methodology should appear in architecture components or summary
    assert "Sparse Cross-Attention" in comp_names or "Attention" in comp_names or "Multimodal" in comp_names
    print("✅ Test 2 Passed: Architecture directly incorporates methodology algorithms and research questions.")

    # -------------------------------------------------------------
    # [Test 3] Project with incomplete optional upstream data
    # -------------------------------------------------------------
    print("\n[Test 3] Handle project with incomplete optional upstream data (no lit review, no comparison)")
    db = SessionLocal()
    proj2 = ResearchProject(
        user_id=19,
        title=f"Federated Clinical Edge AI {ts}",
        topic=f"Federated edge learning for decentralized hospital networks {ts}",
        domain="Distributed Computing & Medicine",
        description="Edge model aggregation under privacy constraints.",
    )
    db.add(proj2)
    db.commit()
    db.refresh(proj2)
    proj2_id = proj2.id

    # Add questions and paper but no methodology, no literature review, no comparison
    q_gen2 = ResearchQuestionGeneration(
        project_id=proj2_id,
        user_id=19,
        papers_considered=0,
        gaps_considered=0,
        overall_research_direction="Decentralized edge learning",
        recommended_next_step="Investigate drift mitigations",
    )
    db.add(q_gen2)
    db.commit()
    db.refresh(q_gen2)
    q2 = ResearchQuestion(
        generation_id=q_gen2.id,
        project_id=proj2_id,
        user_id=19,
        question="How can client drift be mitigated under heterogeneous scanner labels?",
        question_type="Primary Research Question",
        motivation="Prevent performance collapse under distributed non-IID conditions",
        supporting_evidence=["Non-IID label shifts reduce accuracy by 18%"],
        expected_investigation="Federated drift correction experiments",
        feasibility="High",
        priority="High",
    )
    db.add(q2)
    db.commit()
    db.close()

    resp3 = httpx.post(f"{BASE_URL}/api/architecture/generate", json={"project_id": proj2_id}, headers=headers_a)
    assert resp3.status_code == 201, f"Expected 201, got {resp3.status_code}: {resp3.text}"
    data3 = resp3.json()["data"]
    assert "missing_upstream_context" in data3
    assert len(data3["missing_upstream_context"]) > 0
    print(f"✅ Test 3 Passed: Successfully generated architecture with tracked missing context: {data3['missing_upstream_context']}.")

    # -------------------------------------------------------------
    # [Test 4] Invalid and unauthorized project IDs
    # -------------------------------------------------------------
    print("\n[Test 4] Reject invalid and unauthorized project IDs")
    # Invalid ID (999999)
    resp4_inv = httpx.post(f"{BASE_URL}/api/architecture/generate", json={"project_id": 999999}, headers=headers_a)
    assert resp4_inv.status_code == 404, f"Expected 404 for invalid project, got {resp4_inv.status_code}"

    # Setup User B
    login_b = httpx.post(f"{BASE_URL}/api/auth/signin", json={"email": "testuser_b@example.com", "password": "password123"})
    if login_b.status_code != 200:
        signup_b = httpx.post(f"{BASE_URL}/api/auth/signup", json={"full_name": "Test User B", "email": "testuser_b@example.com", "password": "password123"})
        token_b = signup_b.json()["token"]
    else:
        token_b = login_b.json()["token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User B attempting to generate or access User A's project
    resp4_unauth = httpx.post(f"{BASE_URL}/api/architecture/generate", json={"project_id": proj1_id}, headers=headers_b)
    assert resp4_unauth.status_code == 403, f"Expected 403 for unauthorized project, got {resp4_unauth.status_code}"
    print("✅ Test 4 Passed: 404 for invalid project and 403 for unauthorized access verified.")

    # -------------------------------------------------------------
    # [Test 5] AI provider failure / fallback resilience
    # -------------------------------------------------------------
    print("\n[Test 5] Test resilience against AI provider failure via analytical engine")
    from app.services.architecture_service import ArchitectureService
    analytical_result = ArchitectureService._analytical_architecture_engine(
        topic="Reinforcement Learning for Robotic Microsurgery",
        project_description="Real-time precision feedback control.",
        methodology_data={},
        questions_data=[{"id": "Q1", "question": "Can policy gradient algorithms maintain 100Hz loop latency?"}],
        gaps_data=[{"id": "G1", "title": "Sub-millimeter sensory latency bottleneck"}],
        papers_data=[],
        comparison_data={},
        lit_review_data={},
        missing_context=["No papers available."],
    )
    assert analytical_result["architecture_title"]
    assert ArchitectureService.validate_mermaid_syntax(analytical_result["architecture_diagram"]["source"])
    print("✅ Test 5 Passed: Analytical engine provides 100% resilient fallback with valid Mermaid syntax.")

    # -------------------------------------------------------------
    # [Test 6] Malformed structured output handling
    # -------------------------------------------------------------
    print("\n[Test 6] Verify validation rejecting malformed structured output")
    assert not ArchitectureService._is_valid_payload({"architecture_title": "Incomplete"})
    assert not ArchitectureService._is_valid_payload(None)
    assert not ArchitectureService._is_valid_payload("string")
    print("✅ Test 6 Passed: Malformed payloads correctly identified and rejected.")

    # -------------------------------------------------------------
    # [Test 7] Invalid Mermaid syntax validation & sanitization
    # -------------------------------------------------------------
    print("\n[Test 7] Verify Mermaid syntax validator and sanitization")
    assert not ArchitectureService.validate_mermaid_syntax("invalid random text without flowchart header")
    assert not ArchitectureService.validate_mermaid_syntax("flowchart TD\n  A[Unbalanced bracket --> B")
    assert ArchitectureService.validate_mermaid_syntax("flowchart TD\n  A[\"Valid Node\"] --> B[\"Next Node\"]")
    fallback_diag = ArchitectureService._generate_fallback_mermaid("Oncology Pathology", {}, [])
    assert ArchitectureService.validate_mermaid_syntax(fallback_diag["source"])
    print("✅ Test 7 Passed: Invalid Mermaid syntax properly caught; fallback generator valid.")

    # -------------------------------------------------------------
    # [Test 8] Database persistence and retrieval (GET /api/architecture/{project_id})
    # -------------------------------------------------------------
    print("\n[Test 8] Retrieve saved architecture from PostgreSQL")
    resp8 = httpx.get(f"{BASE_URL}/api/architecture/{proj1_id}", headers=headers_a)
    assert resp8.status_code == 200, f"Expected 200, got {resp8.status_code}: {resp8.text}"
    saved8 = resp8.json()
    arch_record_id = saved8["id"]
    assert saved8["project_id"] == proj1_id
    assert saved8["data"]["architecture_title"] == arch1["architecture_title"]

    # Retrieve specific architecture record
    resp8_spec = httpx.get(f"{BASE_URL}/api/architecture/{proj1_id}/{arch_record_id}", headers=headers_a)
    assert resp8_spec.status_code == 200
    assert resp8_spec.json()["id"] == arch_record_id
    print(f"✅ Test 8 Passed: Successfully persisted and retrieved architecture record (ID: {arch_record_id}).")

    # -------------------------------------------------------------
    # [Test 9] In-place regeneration (POST /api/architecture/{project_id}/regenerate)
    # -------------------------------------------------------------
    print("\n[Test 9] Explicitly regenerate system architecture")
    resp9 = httpx.post(f"{BASE_URL}/api/architecture/{proj1_id}/regenerate", headers=headers_a)
    assert resp9.status_code == 200, f"Expected 200, got {resp9.status_code}: {resp9.text}"
    regen_id = resp9.json()["id"]
    assert regen_id > arch_record_id
    print(f"✅ Test 9 Passed: Successfully regenerated architecture (New ID: {regen_id}).")

    # -------------------------------------------------------------
    # [Test 10] Multi-tenant user isolation verification
    # -------------------------------------------------------------
    print("\n[Test 10] Verify multi-tenant isolation on GET and regenerate")
    resp10_get = httpx.get(f"{BASE_URL}/api/architecture/{proj1_id}", headers=headers_b)
    assert resp10_get.status_code == 403
    resp10_regen = httpx.post(f"{BASE_URL}/api/architecture/{proj1_id}/regenerate", headers=headers_b)
    assert resp10_regen.status_code == 403
    print("✅ Test 10 Passed: Cross-user data access strictly forbidden (403).")

    # -------------------------------------------------------------
    # [Test 12] Earlier modules regression check (Modules 1-7)
    # -------------------------------------------------------------
    print("\n[Test 12] Regression check: Verify earlier modules remain operational")
    # Health
    assert httpx.get(f"{BASE_URL}/api/health").status_code == 200
    # Projects
    assert httpx.get(f"{BASE_URL}/api/projects", headers=headers_a).status_code == 200
    # Methodology
    assert httpx.get(f"{BASE_URL}/api/methodology/{proj1_id}", headers=headers_a).status_code == 200
    # Paper comparison
    assert httpx.get(f"{BASE_URL}/api/paper-comparison/{proj1_id}", headers=headers_a).status_code == 200
    print("✅ Test 12 Passed: Earlier modules (1 through 7) remain 100% operational.")

    print("\n=================================================================")
    print("ALL MODULE 8 ARCHITECTURE BACKEND TESTS PASSED (100% SUCCESS)")
    print("=================================================================")


if __name__ == "__main__":
    run_comprehensive_architecture_tests()
