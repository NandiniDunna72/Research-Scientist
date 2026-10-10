import sys
import httpx

sys.stdout.reconfigure(encoding="utf-8")

# 1. Login
login_resp = httpx.post("http://127.0.0.1:8000/api/auth/signin", json={"email": "testuser@example.com", "password": "password123"})
if login_resp.status_code != 200:
    print("Login failed:", login_resp.text)
    sys.exit(1)

token = login_resp.json()["token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Get papers
papers_resp = httpx.get("http://127.0.0.1:8000/api/papers", headers=headers)
papers = papers_resp.json()
print(f"Retrieved {len(papers)} saved papers")
if not papers:
    print("No papers found")
    sys.exit(0)

paper = papers[0]
print(f"Selected paper {paper['id']}: {paper['title']}")

# 3. Get analysis
analysis_resp = httpx.get(f"http://127.0.0.1:8000/api/papers/{paper['id']}/analysis", headers=headers)
if analysis_resp.status_code != 200:
    print("Get analysis failed:", analysis_resp.text)
    sys.exit(1)

analysis = analysis_resp.json()
print("\n=================== ANALYSIS DEPTH VERIFICATION ===================")
print(f"Source Type: {analysis.get('source_type')}")
print(f"\n[Research Problem] ({len(analysis.get('research_problem', ''))} chars):")
print(analysis.get("research_problem"))

print(f"\n[Research Objective] ({len(analysis.get('research_objective', ''))} chars):")
print(analysis.get("research_objective"))

print(f"\n[Research Questions] ({len(analysis.get('research_questions', []))} items):")
for rq in analysis.get("research_questions", []):
    print("  *", rq)

print(f"\n[Approach] ({len(analysis.get('approach', ''))} chars):")
print(analysis.get("approach"))

print(f"\n[Methodology] ({len(analysis.get('methodology', ''))} chars):")
print(analysis.get("methodology"))

print(f"\n[Key Results] ({len(analysis.get('key_results', []))} items):")
for kr in analysis.get("key_results", []):
    print("  *", kr)

print(f"\n[Key Findings] ({len(analysis.get('key_findings', []))} items):")
for kf in analysis.get("key_findings", []):
    print("  *", kf)

print(f"\n[Contributions] ({len(analysis.get('contributions', []))} items):")
for c in analysis.get("contributions", []):
    print("  *", c)

print(f"\n[Limitations] ({len(analysis.get('limitations', []))} items):")
for lim in analysis.get("limitations", []):
    print("  *", lim)

print(f"\n[Overview Length]: {len(analysis.get('overview', ''))} chars")
print("[Overview Preview]:")
print(analysis.get("overview")[:600] + "...")
print("====================================================================")
