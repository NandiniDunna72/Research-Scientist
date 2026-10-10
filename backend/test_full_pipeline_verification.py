import sys
import httpx
from datetime import datetime

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def run_e2e_pipeline_verification():
    print("=================================================================")
    print("FULL END-TO-END PIPELINE VERIFICATION (MODULES 1 TO 6)")
    print("=================================================================")

    # 1. Login
    print("\n[Step 1] Authenticating User")
    login_resp = httpx.post(
        f"{BASE_URL}/api/auth/signin",
        json={"email": "testuser@example.com", "password": "password123"}
    )
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    token = login_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Authenticated successfully.")

    # 2. Select / Create Fresh Project
    ts = int(datetime.now().timestamp())
    print(f"\n[Step 2] Creating isolated project for full pipeline: 'Pipeline Test Project {ts}'")
    proj_resp = httpx.post(
        f"{BASE_URL}/api/projects",
        json={
            "title": f"Self-Supervised Multimodal Oncology {ts}",
            "topic": "Self-Supervised Multimodal Feature Alignment for Rare Cancer Biomarker Discovery",
            "domain": "Computational Oncology & Deep Learning"
        },
        headers=headers
    )
    assert proj_resp.status_code == 201, f"Project creation failed: {proj_resp.text}"
    project = proj_resp.json()
    project_id = project["id"]
    print(f"✅ Project created with ID {project_id}.")

    # 3. Module 1: Paper Discovery
    print("\n[Step 3] Module 1: Paper Discovery")
    paper_save = httpx.post(
        f"{BASE_URL}/api/papers",
        json={
            "project_id": project_id,
            "title": f"Cross-Modal Contrastive Learning in Computational Pathology {ts}",
            "abstract": "We formulate self-supervised vision-language models for whole-slide imaging paired with genomic profiles.",
            "authors": ["A. Chen", "B. Thorne", "C. Vasquez"],
            "venue": "Nature Machine Intelligence",
            "publication_year": 2024,
            "source": "arXiv",
            "relevance_score": 96,
        },
        headers=headers
    )
    assert paper_save.status_code in [200, 201], f"Paper save failed: {paper_save.text}"
    paper = paper_save.json()
    paper_id = paper["id"]
    print(f"✅ Discovered & saved paper ID {paper_id}: '{paper['title']}'.")

    # 4. Module 2: Paper Analysis
    print("\n[Step 4] Module 2: Paper Analysis")
    ana_resp = httpx.post(
        f"{BASE_URL}/api/papers/{paper_id}/analyze",
        headers=headers,
        timeout=45.0
    )
    assert ana_resp.status_code in [200, 201], f"Paper analysis failed: {ana_resp.text}"
    analysis = ana_resp.json()
    print(f"✅ Paper analyzed. Extracted methodology: '{analysis.get('methodology')[:60]}...'")

    # 5. Module 3: Research Gap Identification
    print("\n[Step 5] Module 3: Research Gap Identification")
    gap_gen = httpx.post(
        f"{BASE_URL}/api/research-gaps/generate",
        json={"project_id": project_id},
        headers=headers,
        timeout=45.0
    )
    assert gap_gen.status_code in [200, 201], f"Gap generation failed: {gap_gen.text}"
    gaps_result = gap_gen.json()
    gaps_count = len(gaps_result.get("gaps", []))
    assert gaps_count > 0, "No research gaps produced"
    print(f"✅ Identified {gaps_count} research gaps. Top gap: '{gaps_result['gaps'][0]['gap_title']}'.")

    # 6. Module 4: Research Question Generation
    print("\n[Step 6] Module 4: Research Question Generation")
    q_gen = httpx.post(
        f"{BASE_URL}/api/research-questions/generate",
        json={"project_id": project_id},
        headers=headers,
        timeout=45.0
    )
    assert q_gen.status_code in [200, 201], f"Question generation failed: {q_gen.text}"
    q_result = q_gen.json()
    qs_count = len(q_result.get("research_questions", []))
    assert qs_count > 0, "No research questions produced"
    print(f"✅ Generated {qs_count} research questions. Primary: '{q_result.get('primary_question', {}).get('question', '')[:60]}...'")

    # 7. Check Methodology Status (Should be ready now even before literature review)
    print("\n[Step 7] Checking Methodology Readiness Status before Literature Review")
    status_resp = httpx.get(f"{BASE_URL}/api/methodology/{project_id}/status", headers=headers)
    assert status_resp.status_code == 200
    st_data = status_resp.json()
    assert st_data["ready"] is True
    assert st_data["has_literature_review"] is False
    print("✅ Status Check: Methodology is READY without Literature Review (supporting context optional).")

    # 8. Module 5: Literature Review Generation
    print("\n[Step 8] Module 5: Literature Review Generation")
    lit_gen = httpx.post(
        f"{BASE_URL}/api/literature-review/generate",
        json={"project_id": project_id},
        headers=headers,
        timeout=60.0
    )
    assert lit_gen.status_code in [200, 201], f"Literature review generation failed: {lit_gen.text}"
    lit_result = lit_gen.json()
    print(f"✅ Literature Review synthesized: {len(lit_result.get('themes', []))} themes, {len(lit_result.get('paper_summaries', []))} paper summaries.")

    # 9. Check Status Again (Literature Review now marked as True)
    status_resp2 = httpx.get(f"{BASE_URL}/api/methodology/{project_id}/status", headers=headers)
    assert status_resp2.status_code == 200
    st_data2 = status_resp2.json()
    assert st_data2["has_literature_review"] is True
    print("✅ Status Check: Literature Review detected as supporting context.")

    # 10. Module 6: Research Methodology Generation
    print("\n[Step 9] Module 6: Research Methodology Generation")
    method_gen = httpx.post(
        f"{BASE_URL}/api/methodology/generate",
        json={"project_id": project_id},
        headers=headers,
        timeout=60.0
    )
    assert method_gen.status_code == 200, f"Methodology generation failed: {method_gen.text}"
    methodology = method_gen.json()
    print(f"✅ Research Methodology generated! Version: v{methodology['version']}, ID: {methodology['id']}")

    # 11. Validate All 14 Structured Sections (A to N)
    print("\n[Step 10] Validating All 14 Sections against Module 6 Specification:")
    sections = [
        ("A", "research_overview", dict),
        ("B", "research_design", dict),
        ("C", "proposed_approach", list),
        ("D", "data_collection", dict),
        ("E", "data_preprocessing", list),
        ("F", "methods_and_algorithms", list),
        ("G", "system_design", dict),
        ("H", "experimental_setup", dict),
        ("I", "evaluation_metrics", list),
        ("J", "comparison_strategy", list),
        ("K", "expected_outcomes", list),
        ("L", "limitations_and_risks", list),
        ("M", "reproducibility_and_ethics", dict),
        ("N", "execution_plan", list),
    ]

    for code, sec_key, expected_type in sections:
        assert sec_key in methodology, f"Missing section {sec_key}"
        assert isinstance(methodology[sec_key], expected_type), f"Section {sec_key} not of type {expected_type}"
        item_count = len(methodology[sec_key])
        print(f"  • Section {code}: {sec_key} ({expected_type.__name__}, {item_count} items/keys)")

    # Validate specific content requirements
    ro = methodology["research_overview"]
    assert ro.get("problem_statement"), "Missing problem_statement"
    assert ro.get("research_objective"), "Missing research_objective"
    assert ro.get("primary_research_question"), "Missing primary_research_question"

    rd = methodology["research_design"]
    assert rd.get("design_type"), "Missing design_type"
    assert rd.get("justification"), "Missing justification"

    eo = methodology["expected_outcomes"]
    assert len(eo) > 0
    assert "hypothesized" in eo[0].get("confidence_level", "").lower() or "hypothesized" in eo[0].get("hypothesis_or_outcome", "").lower()

    ep = methodology["execution_plan"]
    assert len(ep) >= 5, f"Expected at least 5 execution phases, got {len(ep)}"
    for step in ep:
        assert "approximate" in step.get("estimated_effort", "").lower() or "estimate" in step.get("estimated_effort", "").lower()

    # 12. Retrieve Saved Methodology (GET /api/methodology/{project_id})
    print("\n[Step 11] Retrieving Saved Methodology (GET /api/methodology/{project_id})")
    get_resp = httpx.get(f"{BASE_URL}/api/methodology/{project_id}", headers=headers)
    assert get_resp.status_code == 200
    saved_m = get_resp.json()
    assert saved_m["id"] == methodology["id"]
    assert saved_m["version"] == methodology["version"]
    print(f"✅ Successfully retrieved saved methodology v{saved_m['version']} from PostgreSQL.")

    # 13. Explicit Regeneration (POST /api/methodology/{project_id}/regenerate)
    print("\n[Step 12] Explicit In-Place Regeneration (POST /api/methodology/{project_id}/regenerate)")
    regen_resp = httpx.post(f"{BASE_URL}/api/methodology/{project_id}/regenerate", headers=headers, timeout=60.0)
    assert regen_resp.status_code == 200
    regen_m = regen_resp.json()
    assert regen_m["version"] == saved_m["version"] + 1
    print(f"✅ Regenerated successfully! Version updated: v{saved_m['version']} -> v{regen_m['version']}.")

    # 14. Verification Complete
    print("\n=================================================================")
    print("FULL PIPELINE END-TO-END VERIFICATION COMPLETED WITH 100% SUCCESS")
    print("=================================================================")

if __name__ == "__main__":
    run_e2e_pipeline_verification()
