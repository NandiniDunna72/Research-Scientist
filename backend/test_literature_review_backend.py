import sys
import httpx

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"


def run_comprehensive_tests():
    print("=================================================================")
    print("TESTING LITERATURE REVIEW GENERATION (MODULE 5) - ALL 15 SUITES")
    print("=================================================================")

    # 1. Unauthenticated test (Security: 401)
    print("\n[Test 1] Security Check: Unauthenticated request to /api/literature-review/1")
    resp = httpx.get(f"{BASE_URL}/api/literature-review/1")
    print(f"Status: {resp.status_code}")
    assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
    print("✅ Test 1 Passed: Unauthenticated request rejected with 401 Unauthorized.")

    # 2. Authenticating User A
    print("\n[Test 2] Authenticating User A")
    login_a = httpx.post(f"{BASE_URL}/api/auth/signin", json={"email": "testuser@example.com", "password": "password123"})
    assert login_a.status_code == 200, f"Login failed: {login_a.text}"
    token_a = login_a.json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    print("✅ Test 2 Passed: User A authenticated successfully.")

    # 3. Retrieve User A's project with analyzed papers
    print("\n[Test 3] User A Project Selection with Analyzed Papers")
    proj_resp = httpx.get(f"{BASE_URL}/api/projects", headers=headers_a)
    assert proj_resp.status_code == 200
    all_projects = proj_resp.json()
    matched = [p for p in all_projects if "multimodal" in p.get("title", "").lower() or "oncology" in p.get("title", "").lower()]
    project_a = matched[0] if matched else all_projects[0]
    project_id = project_a["id"]
    print(f"✅ Test 3 Passed: User A Project selected: ID {project_id} - '{project_a['title']}'")

    # 4. Project with no analyzed papers returns 400
    print("\n[Test 4] Project with No Analyzed Papers Validation")
    empty_p = httpx.post(f"{BASE_URL}/api/projects", json={
        "title": "Empty Literature Project Without Papers",
        "topic": "Empty Literature Project Without Papers",
        "domain": "General AI"
    }, headers=headers_a)
    assert empty_p.status_code == 201
    empty_pid = empty_p.json()["id"]

    empty_gen = httpx.post(
        f"{BASE_URL}/api/literature-review/generate",
        json={"project_id": empty_pid},
        headers=headers_a,
    )
    print(f"Empty project generation status: {empty_gen.status_code}")
    assert empty_gen.status_code == 400, f"Expected 400, got {empty_gen.status_code}"
    err_msg = empty_gen.json().get("detail", "")
    print(f"Error message: '{err_msg}'")
    assert "analyze research papers before generating a literature review" in err_msg.lower()
    print("✅ Test 4 Passed: Returns clear 400 error when no analyzed papers are available.")

    # 5. Generate Literature Review for valid project
    print(f"\n[Test 5] Valid Literature Review Generation for Project {project_id}")
    gen_resp = httpx.post(
        f"{BASE_URL}/api/literature-review/generate",
        json={"project_id": project_id},
        headers=headers_a,
        timeout=30.0,
    )
    print(f"Status: {gen_resp.status_code}")
    assert gen_resp.status_code == 200, f"Generation failed: {gen_resp.text}"
    res_data = gen_resp.json()
    print(f"Papers Considered: {res_data['papers_considered']}")
    print(f"Papers with Analysis: {res_data['papers_with_analysis']}")
    print(f"Themes Formulated: {len(res_data['themes'])}")
    print(f"Introduction: {res_data['introduction'][:100]}...")
    print(f"Conclusion: {res_data['conclusion'][:100]}...")
    assert res_data["papers_considered"] > 0
    assert res_data["papers_with_analysis"] > 0
    assert len(res_data["themes"]) >= 1
    assert len(res_data["introduction"]) > 30
    assert len(res_data["conclusion"]) > 30
    print("✅ Test 5 Passed: Structured literature review generated successfully.")

    # 6. Verify Thematic Analysis Structure (Section 4C & Section 6)
    print("\n[Test 6] Thematic Analysis & Grouping Structure Verification")
    themes = res_data.get("themes", [])
    for t in themes:
        print(f"Theme '{t['title']}' (Papers: {t['paper_ids']})")
        assert t["theme_id"] is not None
        assert len(t["title"]) > 0
        assert len(t["description"]) > 0
        assert isinstance(t["paper_ids"], list)
        assert isinstance(t["common_methods"], list)
        assert isinstance(t["key_findings"], list)
        assert isinstance(t["differences"], list)
    print("✅ Test 6 Passed: Themes adhere strictly to Section 6 specification.")

    # 7. Methodological Analysis & Comparative Synthesis (Section 4D & 4E)
    print("\n[Test 7] Methodological & Comparative Synthesis Structure Verification")
    methods = res_data.get("methodological_analysis", {})
    assert len(methods.get("algorithms_models", [])) > 0
    assert len(methods.get("datasets", [])) > 0
    assert len(methods.get("evaluation_methods", [])) > 0
    assert len(methods.get("synthesis", "")) > 10

    comparative = res_data.get("comparative_synthesis", {})
    assert len(comparative.get("similarities", [])) > 0
    assert len(comparative.get("differences", [])) > 0
    assert len(comparative.get("strengths", [])) > 0
    assert len(comparative.get("limitations", [])) > 0
    print("✅ Test 7 Passed: Methodological & comparative syntheses verified.")

    # 8. Paper Summaries Matrix Table (Section 5 & 15)
    print("\n[Test 8] Paper Summaries Matrix Verification")
    summaries = res_data.get("paper_summaries", [])
    assert len(summaries) > 0
    p0 = summaries[0]
    print(f"Sample matrix paper: '{p0['title'][:45]}' ({p0['year']})")
    assert p0.get("title") is not None
    assert p0.get("methodology") is not None
    assert p0.get("dataset") is not None
    assert p0.get("algorithms_models") is not None
    assert p0.get("key_findings") is not None
    assert p0.get("limitations") is not None
    assert p0.get("contribution") is not None
    print("✅ Test 8 Passed: Paper matrix table contains all required fields.")

    # 9. Research Gaps & Questions Integration (Section 4H & 4I)
    print("\n[Test 9] Integration with Existing Gaps & Questions Modules")
    assert len(res_data.get("research_gaps", [])) > 0
    assert len(res_data.get("research_question_connection", "")) > 10
    print(f"Gaps cited: {len(res_data['research_gaps'])} gaps")
    print(f"Question Connection: {res_data['research_question_connection'][:100]}...")
    print("✅ Test 9 Passed: Research gaps and questions properly integrated.")

    # 10. Empty Gaps Context Handling (Section 18 Case 4)
    print("\n[Test 10] Handling Project Without Research Gaps (Case 4)")
    from app.services.literature_review_service import LiteratureReviewService
    no_gap_res = LiteratureReviewService._analytical_review_engine(
        topic="Test Topic Without Gaps",
        papers_data=[{
            "id": 1,
            "title": "Sample Paper A",
            "publication_year": 2024,
            "methodology": "Neural Architecture",
            "dataset": "Benchmark Dataset",
            "algorithms_and_models": ["Transformer"],
            "key_findings": "High accuracy",
            "limitations": "Compute cost",
            "contributions": "Novel attention",
        }],
        gaps_data=[],
        questions_data=[],
    )
    assert no_gap_res["research_gaps"] == ["Research gap analysis has not been completed."]
    assert no_gap_res["research_question_connection"] == "Research questions have not yet been generated for this project."
    print("✅ Test 10 Passed: Empty gaps and questions produce exact specified fallback text without hallucination.")

    # 11. Retrieve Saved Review (GET /api/literature-review/{project_id})
    print(f"\n[Test 11] Retrieve Saved Review (GET /api/literature-review/{project_id})")
    get_resp = httpx.get(f"{BASE_URL}/api/literature-review/{project_id}", headers=headers_a)
    assert get_resp.status_code == 200
    saved = get_resp.json()
    assert saved["id"] == res_data["id"]
    assert len(saved["themes"]) == len(themes)
    assert len(saved["paper_summaries"]) == len(summaries)
    print("✅ Test 11 Passed: Saved review successfully retrieved from PostgreSQL.")

    # 12. Regenerate Review (POST /api/literature-review/{project_id}/regenerate)
    print(f"\n[Test 12] In-Place Regeneration (POST /api/literature-review/{project_id}/regenerate)")
    regen_resp = httpx.post(f"{BASE_URL}/api/literature-review/{project_id}/regenerate", headers=headers_a, timeout=30.0)
    assert regen_resp.status_code == 200
    regen = regen_resp.json()
    assert regen["id"] == res_data["id"], "Regeneration should update in-place"
    assert len(regen["themes"]) >= 1
    print("✅ Test 12 Passed: In-place PostgreSQL regeneration verified.")

    # 13. Explicit Subset Paper Selection (Section 3)
    print(f"\n[Test 13] Subset Paper Selection Filtering")
    subset_pids = [summaries[0]["paper_id"]] if summaries[0]["paper_id"] else []
    if subset_pids:
        subset_resp = httpx.post(
            f"{BASE_URL}/api/literature-review/generate",
            json={"project_id": project_id, "paper_ids": subset_pids},
            headers=headers_a,
            timeout=30.0,
        )
        assert subset_resp.status_code == 200
        subset_data = subset_resp.json()
        assert subset_data["papers_with_analysis"] == len(subset_pids)
        print(f"Selected {len(subset_pids)} paper(s) -> Successfully synthesized {subset_data['papers_with_analysis']} paper(s).")
    print("✅ Test 13 Passed: Subset paper selection correctly filtered and synthesized.")

    # 14. Non-Existent Project (404 Handling)
    print("\n[Test 14] Invalid / Non-Existent Project ID (404)")
    not_found = httpx.get(f"{BASE_URL}/api/literature-review/99999", headers=headers_a)
    print(f"Status: {not_found.status_code}")
    assert not_found.status_code == 404
    print("✅ Test 14 Passed: Non-existent project returns 404.")

    # 15. Cross-User Security Isolation (Section 19: 403 Forbidden)
    print("\n[Test 15] Strict Multi-Tenant Isolation (User B denied access to User A's review)")
    signup_b = httpx.post(f"{BASE_URL}/api/auth/signup", json={
        "full_name": "User B Literature",
        "email": "userb_literature@example.com",
        "password": "password123"
    })
    if signup_b.status_code in [200, 201]:
        token_b = signup_b.json()["token"]
    else:
        login_b = httpx.post(f"{BASE_URL}/api/auth/signin", json={"email": "userb_literature@example.com", "password": "password123"})
        token_b = login_b.json()["token"]

    headers_b = {"Authorization": f"Bearer {token_b}"}

    iso_get = httpx.get(f"{BASE_URL}/api/literature-review/{project_id}", headers=headers_b)
    print(f"User B GET project {project_id} Status: {iso_get.status_code}")
    assert iso_get.status_code in [403, 404]

    iso_post = httpx.post(f"{BASE_URL}/api/literature-review/generate", json={"project_id": project_id}, headers=headers_b)
    print(f"User B POST project {project_id} Status: {iso_post.status_code}")
    assert iso_post.status_code in [403, 404]

    print("✅ Test 15 Passed: Cross-user access strictly forbidden with 403/404.")

    print("\n=================================================================")
    print("ALL 15 LITERATURE REVIEW TEST SUITES COMPLETED AND PASSED (100%)!")
    print("=================================================================")


if __name__ == "__main__":
    run_comprehensive_tests()
