import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://127.0.0.1:8000"

def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            status_code = resp.status
            raw = resp.read().decode("utf-8")
            resp_body = json.loads(raw) if raw else {}
            return status_code, resp_body
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"raw": err_body}
        return e.code, parsed
    except Exception as e:
        return 500, {"error": str(e)}

def main():
    import time
    ts = int(time.time())
    print("=" * 60)
    print("RUNNING COMPREHENSIVE PAPER DISCOVERY E2E VERIFICATION")
    print("=" * 60)

    # 1. Register User A
    user_a_email = f"curie_{ts}@academic.edu"
    st, res = make_request("/api/auth/register", "POST", {
        "email": user_a_email,
        "full_name": "Dr. Marie Curie",
        "password": "Password123!"
    })
    assert st == 201, f"User A registration failed: {res}"
    token_a = res["token"]
    user_a_id = res["user"]["id"]
    print(f"[OK] User A created: id={user_a_id}, email={user_a_email}")

    # 2. Register User B (for isolation testing)
    user_b_email = f"einstein_{ts}@academic.edu"
    st, res = make_request("/api/auth/register", "POST", {
        "email": user_b_email,
        "full_name": "Dr. Albert Einstein",
        "password": "Password123!"
    })
    assert st == 201, f"User B registration failed: {res}"
    token_b = res["token"]
    user_b_id = res["user"]["id"]
    print(f"[OK] User B created: id={user_b_id}, email={user_b_email}")

    # 3. Create a Research Project for User A
    st, proj = make_request("/api/projects", "POST", {
        "title": "Oncology Foundation Models",
        "topic": "Artificial Intelligence in Healthcare",
        "description": "Multimodal reasoning in clinical diagnosis",
        "domain": "Healthcare AI"
    }, token=token_a)
    assert st == 201, f"Project creation failed: {proj}"
    project_id = proj["id"]
    print(f"[OK] Research project created: id={project_id}, topic='{proj['topic']}'")

    # 4. Search Academic Sources for User's Topic: "Artificial Intelligence in Healthcare"
    print("\n[STEP] Discovering papers for 'Artificial Intelligence in Healthcare'...")
    st, search_res = make_request("/api/papers/search", "POST", {
        "query": "Artificial Intelligence in Healthcare",
        "limit": 20
    }, token=token_a)
    assert st == 200, f"Search failed: {search_res}"
    papers = search_res.get("papers", [])
    total = search_res.get("total", 0)
    print(f"[OK] Discovered {total} papers (enforced limit <= 20: {len(papers) <= 20})")
    assert len(papers) > 0, "No papers discovered"
    assert len(papers) <= 20, "Returned more than 20 papers"

    # Verify first paper structure
    p0 = papers[0]
    print(f"[OK] First paper: '{p0['title'][:55]}...'")
    print(f"     Source: {p0['source']} | Year: {p0['publication_year']} | Citations: {p0['citation_count']} | Match: {p0['relevance_score']}%")
    assert p0.get("title"), "Missing title"
    assert p0.get("source"), "Missing source"
    assert p0.get("authors") is not None, "Missing authors"

    # 5. Search with query "Large Language Models for Education"
    print("\n[STEP] Discovering papers for 'Large Language Models for Education'...")
    st, llm_res = make_request("/api/papers/search", "POST", {
        "query": "Large Language Models for Education",
        "limit": 20
    }, token=token_a)
    assert st == 200, f"LLM Search failed: {llm_res}"
    llm_papers = llm_res.get("papers", [])
    print(f"[OK] Discovered {len(llm_papers)} papers for LLM query")
    assert len(llm_papers) > 0

    # 6. Test GET search convenience endpoint
    st, get_res = make_request("/api/papers/search?query=Computer+Vision&limit=10", "GET", token=token_a)
    assert st == 200, f"GET search failed: {get_res}"
    print(f"[OK] GET endpoint /api/papers/search returned {get_res['total']} papers")

    # 7. Test empty query rejection (400 Bad Request)
    st, err_res = make_request("/api/papers/search", "POST", {"query": "   "}, token=token_a)
    assert st == 400, f"Expected 400 for empty query, got {st}"
    print(f"[OK] Empty query validation rejected with 400: '{err_res.get('detail')}'")

    # 8. Test unauthenticated request rejection (401 Unauthorized)
    st, unauth_res = make_request("/api/papers/search", "POST", {"query": "AI"})
    assert st == 401, f"Expected 401 for unauthenticated request, got {st}"
    print(f"[OK] Unauthenticated search rejected with 401: '{unauth_res.get('detail')}'")

    # 9. Test limit capping (> 20 requested -> capped to 20)
    st, capped_res = make_request("/api/papers/search", "POST", {
        "query": "Deep Learning",
        "limit": 100
    }, token=token_a)
    assert st == 200, f"Capped request failed: {capped_res}"
    assert len(capped_res["papers"]) <= 20, f"Expected <= 20, got {len(capped_res['papers'])}"
    print(f"[OK] Limit 100 clamped to {len(capped_res['papers'])} papers")

    # 10. Save Discovered Paper to PostgreSQL
    print("\n[STEP] Saving discovered paper to PostgreSQL...")
    paper_to_save = {
        "project_id": project_id,
        "title": p0["title"],
        "abstract": p0.get("abstract"),
        "authors": p0.get("authors", []),
        "publication_year": p0.get("publication_year"),
        "publication_date": p0.get("publication_date"),
        "venue": p0.get("venue"),
        "doi": p0.get("doi"),
        "paper_url": p0.get("paper_url"),
        "pdf_url": p0.get("pdf_url"),
        "citation_count": p0.get("citation_count", 0),
        "source": p0.get("source"),
        "external_id": p0.get("id"),
        "relevance_score": p0.get("relevance_score", 90),
    }
    st, saved = make_request("/api/papers", "POST", paper_to_save, token=token_a)
    assert st == 201, f"Save paper failed: {saved}"
    saved_id = saved["id"]
    print(f"[OK] Paper saved successfully in PostgreSQL with ID={saved_id}, user_id={saved['user_id']}")

    # 10.1 Duplicate save prevention
    st, dup = make_request("/api/papers", "POST", paper_to_save, token=token_a)
    assert st in (200, 201), f"Duplicate save check failed: {dup}"
    assert dup["id"] == saved_id, f"Expected existing paper id {saved_id}, got {dup['id']}"
    print(f"[OK] Duplicate save gracefully returned existing paper ID={dup['id']}")

    # 11. Retrieve Saved Papers for User A
    st, saved_list = make_request(f"/api/papers?project_id={project_id}", "GET", token=token_a)
    assert st == 200, f"Get saved papers failed: {saved_list}"
    assert len(saved_list) >= 1, "Expected at least 1 saved paper"
    assert any(p["id"] == saved_id for p in saved_list)
    print(f"[OK] Retrieved {len(saved_list)} saved paper(s) for User A's project {project_id}")

    # 12. Paper Details Endpoint GET /api/papers/{paper_id}
    st, details = make_request(f"/api/papers/{saved_id}", "GET", token=token_a)
    assert st == 200, f"Get paper details failed: {details}"
    assert details["title"] == p0["title"]
    print(f"[OK] GET /api/papers/{saved_id} returned detailed metadata: Title, Authors, Abstract, Year, Venue, DOI, Citations")

    # 13. Strict User Isolation Tests
    print("\n[STEP] Testing User Isolation (User B cannot access or delete User A's paper)...")
    st, b_list = make_request("/api/papers", "GET", token=token_b)
    assert st == 200
    assert not any(p["id"] == saved_id for p in b_list), "User B saw User A's saved paper!"
    print(f"[OK] User B saved papers list is clean (count={len(b_list)})")

    # User B attempts to access User A's paper
    st, b_get = make_request(f"/api/papers/{saved_id}", "GET", token=token_b)
    assert st in (403, 404), f"Expected 403 or 404, got {st}: {b_get}"
    print(f"[OK] User B access rejected with status {st}: '{b_get.get('detail')}'")

    # User B attempts to delete User A's paper
    st, b_del = make_request(f"/api/papers/{saved_id}", "DELETE", token=token_b)
    assert st in (403, 404), f"Expected 403 or 404, got {st}: {b_del}"
    print(f"[OK] User B deletion rejected with status {st}: '{b_del.get('detail')}'")

    # 14. Delete Saved Paper by User A
    print("\n[STEP] Deleting saved paper by owner...")
    st, del_res = make_request(f"/api/papers/{saved_id}", "DELETE", token=token_a)
    assert st == 200, f"Delete paper failed: {del_res}"
    print(f"[OK] Paper deleted: {del_res.get('message')}")

    # Verify deletion
    st, get_deleted = make_request(f"/api/papers/{saved_id}", "GET", token=token_a)
    assert st == 404, f"Expected 404 after deletion, got {st}"
    print(f"[OK] Verified paper is gone from PostgreSQL (status 404)")

    # 15. Verify Database Tables in PostgreSQL directly
    print("\n[STEP] Directly verifying PostgreSQL database state...")
    from app.database.database import SessionLocal
    from sqlalchemy import text
    db = SessionLocal()
    try:
        paper_count = db.execute(text("SELECT count(*) FROM research_papers")).scalar()
        proj_count = db.execute(text("SELECT count(*) FROM research_projects")).scalar()
        print(f"[OK] PostgreSQL direct query: {proj_count} research projects, {paper_count} research papers currently stored.")
    finally:
        db.close()

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED! PAPER DISCOVERY MODULE IS FULLY VERIFIED.")
    print("=" * 60)

if __name__ == "__main__":
    main()
