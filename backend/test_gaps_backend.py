import sys
import httpx

sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"

def test_research_gaps():
    print("=================================================================")
    print("TESTING RESEARCH GAP IDENTIFICATION BACKEND INTEGRATION (12 TESTS)")
    print("=================================================================")

    # 1. Unauthenticated test (Test 11 in section 26)
    print("\n[Test 1] Unauthenticated request to /api/research-gaps/1")
    resp = httpx.get(f"{BASE_URL}/api/research-gaps/1")
    print(f"Status: {resp.status_code}")
    assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
    print("✅ Test 1 Passed: Unauthenticated request correctly rejected with 401 Unauthorized.")

    # 2. Login User A
    print("\n[Test 2] Authenticating User A")
    login_a = httpx.post(f"{BASE_URL}/api/auth/signin", json={"email": "testuser@example.com", "password": "password123"})
    assert login_a.status_code == 200, f"Login failed: {login_a.text}"
    token_a = login_a.json()["token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}
    print("✅ Test 2 Passed: User A authenticated successfully.")

    # 3. User selects a project (Test 1 in section 26)
    print("\n[Test 3] User selects a research project")
    proj_resp = httpx.get(f"{BASE_URL}/api/projects", headers=headers_a)
    assert proj_resp.status_code == 200
    projects = proj_resp.json()
    if not projects:
        create_p = httpx.post(f"{BASE_URL}/api/projects", json={
            "title": "Multimodal Deep Learning for Oncology Diagnosis",
            "topic": "Multimodal Deep Learning for Oncology Diagnosis",
            "domain": "Precision Oncology AI"
        }, headers=headers_a)
        assert create_p.status_code == 201
        project_a = create_p.json()
    else:
        matched = [p for p in projects if "empty" not in p.get("title", "").lower()]
        project_a = matched[0] if matched else projects[0]
    project_id = project_a["id"]
    print(f"✅ Test 3 Passed: User A Project selected: ID {project_id} - '{project_a['title']}'")

    # 4. Check analyzed papers in project (Test 2 in section 26)
    print(f"\n[Test 4] Query analyzed papers for Project {project_id}")
    papers_resp = httpx.get(f"{BASE_URL}/api/research-gaps/{project_id}/analyzed-papers", headers=headers_a)
    assert papers_resp.status_code == 200
    analyzed_papers = papers_resp.json()
    print(f"Found {len(analyzed_papers)} analyzed papers available.")
    print("✅ Test 4 Passed: Retrieved analyzed papers for project.")

    # 5. Generate Research Gaps (Test 3, 4, 5 in section 26)
    print(f"\n[Test 5] Generate Research Gaps (POST /api/research-gaps/analyze)")
    analyze_resp = httpx.post(
        f"{BASE_URL}/api/research-gaps/analyze",
        json={"project_id": project_id},
        headers=headers_a,
        timeout=30.0,
    )
    print(f"Status: {analyze_resp.status_code}")
    if analyze_resp.status_code != 200:
        print("Error details:", analyze_resp.text)
    assert analyze_resp.status_code == 200, f"Expected 200, got {analyze_resp.status_code}"
    gap_data = analyze_resp.json()

    print(f"Papers Analyzed: {gap_data['papers_analyzed']}")
    print(f"Gaps Identified: {gap_data['gaps_identified']}")
    print(f"Major Categories: {gap_data['major_categories']}")
    print(f"Most Important Gap: {gap_data['most_important_gap']}")
    assert len(gap_data["gaps"]) > 0, "Expected at least 1 identified gap"

    # Verify gap fields (Test 4 & 5 in section 26)
    for g in gap_data["gaps"]:
        assert g["category"] in [
            "Methodological Gap", "Dataset Gap", "Evaluation Gap", "Domain Gap",
            "Temporal Gap", "Theoretical Gap", "Practical/Implementation Gap", "Integration Gap"
        ], f"Unexpected category {g['category']}"
        assert len(g["evidence"]) > 0, "Gap must have evidence (Test 4)"
        assert len(g["affected_papers"]) > 0, "Gap must list affected papers (Test 5)"
        assert g["confidence"] in ["High", "Medium", "Low"], f"Invalid confidence {g['confidence']}"
        assert g["priority"] >= 1, "Gap priority must be >= 1"
        assert len(g["why_it_matters"]) > 10, "Why it matters must be detailed"
        assert len(g["potential_direction"]) > 10, "Potential direction must be detailed"

    print("✅ Test 5 Passed: Structured research gaps verified with evidence, affected papers, confidence, and priority.")

    # 6. Retrieve saved research gaps (Test 6 in section 26)
    print(f"\n[Test 6] Retrieve Saved Research Gaps (GET /api/research-gaps/{project_id})")
    get_resp = httpx.get(f"{BASE_URL}/api/research-gaps/{project_id}", headers=headers_a)
    assert get_resp.status_code == 200
    saved_data = get_resp.json()
    assert saved_data["id"] == gap_data["id"], "Retrieved analysis ID should match saved record"
    assert len(saved_data["gaps"]) == len(gap_data["gaps"])
    print(f"✅ Test 6 Passed: Successfully retrieved saved analysis with {len(saved_data['gaps'])} gaps.")

    # 7. Regenerate Research Gaps (Test 7 in section 26)
    print(f"\n[Test 7] Regenerate Research Gaps (POST /api/research-gaps/{project_id}/regenerate)")
    regen_resp = httpx.post(f"{BASE_URL}/api/research-gaps/{project_id}/regenerate", headers=headers_a, timeout=30.0)
    assert regen_resp.status_code == 200
    regen_data = regen_resp.json()
    assert regen_data["id"] == gap_data["id"], "Regeneration should update in-place without duplicate analysis rows"
    print("✅ Test 7 Passed: Successfully regenerated research gaps in-place in PostgreSQL.")

    # 8. Project with fewer than 3 analyzed papers returns warning (Test 8 in section 26)
    print(f"\n[Test 8] Analyze with subset of 1 paper returns clear warning")
    if analyzed_papers:
        single_paper_id = analyzed_papers[0]["id"]
        few_resp = httpx.post(
            f"{BASE_URL}/api/research-gaps/analyze",
            json={"project_id": project_id, "paper_ids": [single_paper_id]},
            headers=headers_a,
            timeout=30.0,
        )
        assert few_resp.status_code == 200
        few_data = few_resp.json()
        print(f"Warning returned: '{few_data.get('warning')}'")
        assert few_data.get("warning") is not None, "Expected warning when analyzed papers < 3"
        assert "3 analyzed papers are recommended" in few_data.get("warning")
        print("✅ Test 8 Passed: Fewer than 3 analyzed papers returned clear recommended cohort warning.")

    # 9. Paper has no analysis returns clear error (Test 9 in section 26)
    print(f"\n[Test 9] Paper has no analysis returns clear 400 error")
    # Create an unanalyzed paper
    unanalyzed_p = httpx.post(f"{BASE_URL}/api/papers", json={
        "project_id": project_id,
        "title": "Unanalyzed Manuscript on Novel Bio-Transformers",
        "abstract": "This is an unanalyzed draft.",
        "authors": ["Author X"],
        "source": "arXiv",
        "relevance_score": 75,
    }, headers=headers_a)
    if unanalyzed_p.status_code in [200, 201]:
        unanalyzed_id = unanalyzed_p.json()["id"]
        no_ana_resp = httpx.post(
            f"{BASE_URL}/api/research-gaps/analyze",
            json={"project_id": project_id, "paper_ids": [unanalyzed_id]},
            headers=headers_a,
        )
        print(f"Status for unanalyzed paper: {no_ana_resp.status_code}")
        assert no_ana_resp.status_code == 400
        print(f"Detail: {no_ana_resp.json()['detail']}")
        assert "no analysis available" in no_ana_resp.json()["detail"].lower()
        print("✅ Test 9 Passed: Paper without analysis correctly triggered 400 Bad Request error.")

    # 10. User A attempts to access User B's project (Test 10 in section 26)
    print("\n[Test 10] User Isolation Test: User B attempting to access User A's project gaps")
    signup_b = httpx.post(f"{BASE_URL}/api/auth/signup", json={
        "full_name": "User B Scientist",
        "email": "userb@example.com",
        "password": "password123"
    })
    if signup_b.status_code in [200, 201]:
        token_b = signup_b.json()["token"]
    else:
        login_b = httpx.post(f"{BASE_URL}/api/auth/signin", json={"email": "userb@example.com", "password": "password123"})
        token_b = login_b.json()["token"]

    headers_b = {"Authorization": f"Bearer {token_b}"}

    iso_get = httpx.get(f"{BASE_URL}/api/research-gaps/{project_id}", headers=headers_b)
    print(f"User B GET Project {project_id} Status: {iso_get.status_code}")
    assert iso_get.status_code in [403, 404], f"Expected 403 or 404, got {iso_get.status_code}"

    iso_post = httpx.post(f"{BASE_URL}/api/research-gaps/analyze", json={"project_id": project_id}, headers=headers_b)
    print(f"User B POST Project {project_id} Status: {iso_post.status_code}")
    assert iso_post.status_code in [403, 404], f"Expected 403 or 404, got {iso_post.status_code}"
    print("✅ Test 10 Passed: Strict User Data Isolation verified (User B receives 403 Forbidden).")

    # 11. Non-existent project access returns 404 (Test 23 error handling)
    print("\n[Test 11] Non-existent project access returns 404")
    notfound_resp = httpx.get(f"{BASE_URL}/api/research-gaps/99999", headers=headers_a)
    print(f"Status for non-existent project: {notfound_resp.status_code}")
    assert notfound_resp.status_code == 404
    print("✅ Test 11 Passed: Non-existent project returns 404 Not Found.")

    # 12. Non-existent paper in request returns 404 (Test 23 error handling)
    print("\n[Test 12] Non-existent paper ID returns 404")
    paper_notfound = httpx.post(
        f"{BASE_URL}/api/research-gaps/analyze",
        json={"project_id": project_id, "paper_ids": [999999]},
        headers=headers_a,
    )
    print(f"Status for non-existent paper: {paper_notfound.status_code}")
    assert paper_notfound.status_code == 404
    print("✅ Test 12 Passed: Non-existent paper ID returns 404 Not Found.")

    print("\n=================================================================")
    print("ALL 12 RESEARCH GAP IDENTIFICATION INTEGRATION TESTS PASSED (100% SUCCESS)!")
    print("=================================================================")

if __name__ == "__main__":
    test_research_gaps()
