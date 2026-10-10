import sys
import httpx

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

VALID_TYPES = [
    "Primary Research Question",
    "Secondary Research Question",
    "Methodological Question",
    "Comparative Question",
    "Dataset/Evaluation Question",
    "Application/Practical Question",
    "Optimization Question",
    "Integration Question",
]


def test_research_questions():
    print("=================================================================")
    print("TESTING RESEARCH QUESTION GENERATION (MODULE 4) BACKEND (12 TESTS)")
    print("=================================================================")

    # 1. Unauthenticated test (Test 1 - Security)
    print("\n[Test 1] Unauthenticated request to /api/research-questions/1")
    resp = httpx.get(f"{BASE_URL}/api/research-questions/1")
    print(f"Status: {resp.status_code}")
    assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
    print("✅ Test 1 Passed: Unauthenticated request rejected with 401 Unauthorized.")

    # 2. Login User A
    print("\n[Test 2] Authenticating User A")
    login_a = httpx.post(f"{BASE_URL}/api/auth/signin", json={"email": "testuser@example.com", "password": "password123"})
    assert login_a.status_code == 200, f"Login failed: {login_a.text}"
    token_a = login_a.json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    print("✅ Test 2 Passed: User A authenticated successfully.")

    # 3. User selects research project with analyzed papers
    print("\n[Test 3] User selects a research project")
    proj_resp = httpx.get(f"{BASE_URL}/api/projects", headers=headers_a)
    assert proj_resp.status_code == 200
    all_projects = proj_resp.json()
    matched = [p for p in all_projects if "multimodal" in p.get("title", "").lower() or "oncology" in p.get("title", "").lower()]
    if matched:
        project_a = matched[0]
    elif all_projects:
        project_a = all_projects[0]
    else:
        create_p = httpx.post(f"{BASE_URL}/api/projects", json={
            "title": "Multimodal Deep Learning for Oncology Diagnosis",
            "topic": "Multimodal Deep Learning for Oncology Diagnosis",
            "domain": "Precision Oncology AI"
        }, headers=headers_a)
        assert create_p.status_code == 201
        project_a = create_p.json()
    project_id = project_a["id"]
    print(f"✅ Test 3 Passed: User A Project selected: ID {project_id} - '{project_a['title']}'")

    # 4. Test project without analyzed papers returns 400
    print("\n[Test 4] Project without analyzed papers validation")
    empty_p = httpx.post(f"{BASE_URL}/api/projects", json={
        "title": "Empty Research Project Without Papers",
        "topic": "Empty Research Project Without Papers",
        "domain": "General AI"
    }, headers=headers_a)
    assert empty_p.status_code == 201
    empty_pid = empty_p.json()["id"]

    empty_gen = httpx.post(
        f"{BASE_URL}/api/research-questions/generate",
        json={"project_id": empty_pid},
        headers=headers_a,
    )
    print(f"Empty project generation status: {empty_gen.status_code}")
    assert empty_gen.status_code == 400, f"Expected 400, got {empty_gen.status_code}"
    err_msg = empty_gen.json().get("detail", "")
    print(f"Error message: '{err_msg}'")
    assert "no analyzed papers are available" in err_msg.lower()
    print("✅ Test 4 Passed: Returns clear message when no analyzed papers are available.")

    # 4b. Test project with analyzed papers but without research gaps returns 400
    print("\n[Test 4b] Project with analyzed papers but without research gaps validation")
    no_gaps_p = httpx.post(f"{BASE_URL}/api/projects", json={
        "title": "Project With Paper But No Gaps",
        "topic": "Project With Paper But No Gaps",
        "domain": "Bioinformatics"
    }, headers=headers_a)
    assert no_gaps_p.status_code == 201
    no_gaps_pid = no_gaps_p.json()["id"]
    # Save a paper and its analysis for this project
    import time
    unique_title = f"Sample Analyzed Paper on Bio-Seq Transformers {int(time.time() * 1000)}"
    paper_save = httpx.post(f"{BASE_URL}/api/papers", json={
        "project_id": no_gaps_pid,
        "title": unique_title,
        "abstract": "This paper presents transformer architectures for sequence analysis with empirical evaluations.",
        "authors": ["Researcher A"],
        "source": "arXiv",
        "relevance_score": 90,
    }, headers=headers_a)

    assert paper_save.status_code in [200, 201]
    saved_p_id = paper_save.json()["id"]
    # Analyze the paper
    ana_resp = httpx.post(f"{BASE_URL}/api/papers/{saved_p_id}/analyze", headers=headers_a, timeout=30.0)
    assert ana_resp.status_code in [200, 201]

    # Now attempt question generation without running gap analysis
    no_gap_gen = httpx.post(
        f"{BASE_URL}/api/research-questions/generate",
        json={"project_id": no_gaps_pid},
        headers=headers_a,
    )
    print(f"No gaps project generation status: {no_gap_gen.status_code}")
    assert no_gap_gen.status_code == 400
    no_gap_msg = no_gap_gen.json().get("detail", "")
    print(f"No gaps error message: '{no_gap_msg}'")
    assert "research gaps are required" in no_gap_msg.lower()
    print("✅ Test 4b Passed: Returns clear message when research gaps have not been generated.")



    # 5. Verify research gaps exist on project_id (generate gaps if not present)
    print(f"\n[Test 5] Verifying research gaps for Project {project_id}")
    gaps_resp = httpx.get(f"{BASE_URL}/api/research-gaps/{project_id}", headers=headers_a)
    if gaps_resp.status_code != 200 or not gaps_resp.json().get("gaps"):
        # Trigger gap analysis
        print("Triggering gap analysis for project...")
        gap_gen = httpx.post(
            f"{BASE_URL}/api/research-gaps/analyze",
            json={"project_id": project_id},
            headers=headers_a,
            timeout=30.0,
        )
        assert gap_gen.status_code == 200, f"Gap generation failed: {gap_gen.text}"
        gaps_resp = gap_gen
    gaps_data = gaps_resp.json()
    print(f"Found {len(gaps_data.get('gaps', []))} research gaps.")
    assert len(gaps_data.get("gaps", [])) > 0
    print("✅ Test 5 Passed: Project has verified research gaps.")

    # 6. Generate Research Questions (POST /api/research-questions/generate)
    print(f"\n[Test 6] Generate Research Questions (POST /api/research-questions/generate)")
    gen_resp = httpx.post(
        f"{BASE_URL}/api/research-questions/generate",
        json={"project_id": project_id},
        headers=headers_a,
        timeout=30.0,
    )
    print(f"Status: {gen_resp.status_code}")
    if gen_resp.status_code != 200:
        print("Error detail:", gen_resp.text)
    assert gen_resp.status_code == 200
    res_data = gen_resp.json()

    print(f"Papers Considered: {res_data['papers_considered']}")
    print(f"Gaps Considered: {res_data['gaps_considered']}")
    print(f"Overall Direction: {res_data['overall_research_direction'][:100]}...")
    print(f"Recommended Next Step: {res_data['recommended_next_step'][:100]}...")
    assert res_data["papers_considered"] > 0
    assert res_data["gaps_considered"] > 0
    assert len(res_data["overall_research_direction"]) > 10
    assert len(res_data["recommended_next_step"]) > 10

    # 7. Verify Primary Research Question
    print("\n[Test 7] Verify Primary Research Question")
    primary_q = res_data.get("primary_research_question")
    assert primary_q is not None, "Primary research question must be present"
    print(f"Primary Question: '{primary_q['question']}'")
    assert primary_q["type"] == "Primary Research Question"
    assert primary_q["related_gap_id"] is not None
    assert primary_q["related_gap_title"] is not None
    assert len(primary_q["motivation"]) > 10
    assert len(primary_q["supporting_evidence"]) > 10
    assert len(primary_q["expected_investigation"]) > 10
    assert primary_q["feasibility"] in ["High", "Medium", "Low"]
    assert primary_q["priority"] in ["High", "Medium", "Low"]
    print("✅ Test 7 Passed: Primary Research Question meets all structural requirements.")

    # 8. Verify Secondary and Overall Research Questions
    print("\n[Test 8] Verify Secondary and All Questions (5-10 total, valid types)")
    secondary_qs = res_data.get("secondary_questions", [])
    all_qs = res_data.get("research_questions", [])
    print(f"Total questions generated: {len(all_qs)} (Secondary: {len(secondary_qs)})")
    assert 5 <= len(all_qs) <= 10, f"Expected 5-10 questions, got {len(all_qs)}"

    for q in all_qs:
        assert q["type"] in VALID_TYPES, f"Invalid question type: {q['type']}"
        assert len(q["question"]) > 10
        assert q["related_gap_title"] is not None
        assert len(q["motivation"]) > 0
        assert len(q["supporting_evidence"]) > 0
        assert len(q["expected_investigation"]) > 0
        assert q["feasibility"] in ["High", "Medium", "Low"]
        assert q["priority"] in ["High", "Medium", "Low"]

    print("✅ Test 8 Passed: All generated questions validated with schema, evidence, and categories.")

    # 9. Retrieve saved questions (GET /api/research-questions/{project_id})
    print(f"\n[Test 9] Retrieve Saved Research Questions (GET /api/research-questions/{project_id})")
    get_resp = httpx.get(f"{BASE_URL}/api/research-questions/{project_id}", headers=headers_a)
    assert get_resp.status_code == 200
    saved_data = get_resp.json()
    assert saved_data["id"] == res_data["id"], "Retrieved generation ID must match saved record"
    assert len(saved_data["research_questions"]) == len(all_qs)
    assert saved_data["primary_research_question"]["question"] == primary_q["question"]
    print("✅ Test 9 Passed: Successfully retrieved saved research questions from PostgreSQL.")

    # 10. Regenerate research questions (POST /api/research-questions/{project_id}/regenerate)
    print(f"\n[Test 10] Regenerate Research Questions (POST /api/research-questions/{project_id}/regenerate)")
    regen_resp = httpx.post(f"{BASE_URL}/api/research-questions/{project_id}/regenerate", headers=headers_a, timeout=30.0)
    assert regen_resp.status_code == 200
    regen_data = regen_resp.json()
    assert regen_data["id"] == res_data["id"], "Regeneration must update in-place without duplicate generation rows"
    assert len(regen_data["research_questions"]) >= 5
    print("✅ Test 10 Passed: Successfully regenerated questions in-place in PostgreSQL.")

    # 11. User Isolation Test: User B attempting to access User A's questions
    print("\n[Test 11] User Isolation Test: User B attempting to access User A's research questions")
    signup_b = httpx.post(f"{BASE_URL}/api/auth/signup", json={
        "full_name": "User B Scientist",
        "email": "userb_questions@example.com",
        "password": "password123"
    })
    if signup_b.status_code in [200, 201]:
        token_b = signup_b.json()["token"]
    else:
        login_b = httpx.post(f"{BASE_URL}/api/auth/signin", json={"email": "userb_questions@example.com", "password": "password123"})
        token_b = login_b.json()["token"]

    headers_b = {"Authorization": f"Bearer {token_b}"}

    iso_get = httpx.get(f"{BASE_URL}/api/research-questions/{project_id}", headers=headers_b)
    print(f"User B GET Project {project_id} Status: {iso_get.status_code}")
    assert iso_get.status_code in [403, 404], f"Expected 403 or 404, got {iso_get.status_code}"

    iso_post = httpx.post(f"{BASE_URL}/api/research-questions/generate", json={"project_id": project_id}, headers=headers_b)
    print(f"User B POST Project {project_id} Status: {iso_post.status_code}")
    assert iso_post.status_code in [403, 404], f"Expected 403 or 404, got {iso_post.status_code}"
    print("✅ Test 11 Passed: Strict User Isolation verified (User B denied access).")

    # 12. Non-existent project access returns 404
    print("\n[Test 12] Non-existent project returns 404 Not Found")
    notfound_resp = httpx.get(f"{BASE_URL}/api/research-questions/99999", headers=headers_a)
    print(f"Status for non-existent project: {notfound_resp.status_code}")
    assert notfound_resp.status_code == 404
    print("✅ Test 12 Passed: Non-existent project returns 404 Not Found.")

    print("\n=================================================================")
    print("ALL 12 RESEARCH QUESTION GENERATION BACKEND TESTS PASSED (100%)!")
    print("=================================================================")


if __name__ == "__main__":
    test_research_questions()
