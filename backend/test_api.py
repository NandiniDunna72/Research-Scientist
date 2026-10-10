"""Automated test suite verifying all 8 Section 26 backend requirements."""

import json
import urllib.request
import urllib.error
import sys

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_URL = "http://127.0.0.1:8000"


def make_request(path, method="GET", data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as resp:
            status_code = resp.status
            resp_body = json.loads(resp.read().decode("utf-8"))
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


def run_tests():
    print("========================================")
    print("RUNNING AI RESEARCH SCIENTIST BACKEND TESTS")
    print("========================================")

    # Test 0: Health Check
    status, body = make_request("/api/health")
    print(f"Health Check: status={status}, body={body}")
    assert status == 200, f"Expected 200, got {status}"
    assert body.get("status") == "ok", "Expected status ok"
    print("[PASS] TEST 0 (Health Check): PASSED")

    # Health Check DB
    status, body = make_request("/api/health/db")
    print(f"Database Health: status={status}, body={body}")
    assert status == 200, f"Expected 200, got {status}"
    assert body.get("database") == "connected"
    print("[PASS] TEST 0.1 (Database Connection): PASSED")

    # Generate unique test email
    import time
    test_email = f"researcher_{int(time.time())}@university.edu"
    test_password = "SecureResearchPassword123!"
    test_name = "Dr. Alan Turing"

    # TEST 1: POST /api/auth/register
    print(f"\n[TEST 1] Register new user: {test_email}")
    reg_payload = {
        "full_name": test_name,
        "email": test_email,
        "password": test_password,
    }
    status, body = make_request("/api/auth/register", method="POST", data=reg_payload)
    print(f"Registration response: status={status}, body={body}")
    assert status == 201, f"Expected 201, got {status}: {body}"
    assert "user" in body, "Response missing 'user'"
    assert body["user"]["email"] == test_email.lower()
    assert body["user"]["full_name"] == test_name
    assert "password" not in body["user"], "Password leaked in response!"
    assert "password_hash" not in body["user"], "Password hash leaked in response!"
    print("[PASS] TEST 1 (Registration): PASSED")

    # TEST 2: Attempt duplicate registration
    print(f"\n[TEST 2] Duplicate registration with same email: {test_email}")
    status, body = make_request("/api/auth/register", method="POST", data=reg_payload)
    print(f"Duplicate registration response: status={status}, body={body}")
    assert status == 409, f"Expected 409 Conflict, got {status}: {body}"
    print("[PASS] TEST 2 (Duplicate Registration 409 Conflict): PASSED")

    # TEST 3: POST /api/auth/login
    print(f"\n[TEST 3] Login with registered credentials")
    login_payload = {
        "email": test_email,
        "password": test_password,
    }
    status, body = make_request("/api/auth/login", method="POST", data=login_payload)
    print(f"Login response: status={status}, token_type={body.get('token_type')}")
    assert status == 200, f"Expected 200, got {status}: {body}"
    assert "access_token" in body, "Missing access_token"
    token = body["access_token"]
    assert token, "Token should not be empty"
    assert "password" not in body["user"]
    assert "password_hash" not in body["user"]
    print("[PASS] TEST 3 (Login & JWT Issuance): PASSED")

    # TEST 4: GET /api/auth/me with valid token
    print(f"\n[TEST 4] GET /api/auth/me with valid token")
    status, body = make_request("/api/auth/me", method="GET", token=token)
    print(f"/api/auth/me response: status={status}, email={body.get('email')}")
    assert status == 200, f"Expected 200, got {status}: {body}"
    assert body.get("email") == test_email.lower()
    assert body.get("full_name") == test_name
    assert "password" not in body
    assert "password_hash" not in body
    print("[PASS] TEST 4 (Authenticated /api/auth/me): PASSED")

    # TEST 5: GET /api/auth/me without token
    print(f"\n[TEST 5] GET /api/auth/me without token")
    status, body = make_request("/api/auth/me", method="GET")
    print(f"/api/auth/me unauthenticated: status={status}, body={body}")
    assert status == 401, f"Expected 401 Unauthorized, got {status}"
    print("[PASS] TEST 5 (Unauthenticated Request 401 Unauthorized): PASSED")

    # TEST 6: GET /api/auth/me with invalid token
    print(f"\n[TEST 6] GET /api/auth/me with invalid token")
    status, body = make_request("/api/auth/me", method="GET", token="invalid_tampered_token_xyz")
    print(f"/api/auth/me invalid token: status={status}, body={body}")
    assert status == 401, f"Expected 401 Unauthorized, got {status}"
    print("[PASS] TEST 6 (Invalid Token 401 Unauthorized): PASSED")

    # TEST 7: Logout
    print(f"\n[TEST 7] POST /api/auth/logout")
    status, body = make_request("/api/auth/logout", method="POST")
    print(f"Logout response: status={status}, body={body}")
    assert status == 200, f"Expected 200, got {status}: {body}"
    print("[PASS] TEST 7 (Logout): PASSED")

    # TEST 8: Verify password is stored only as secure hash in PostgreSQL
    print(f"\n[TEST 8] Verify password hashing directly in PostgreSQL")
    from app.database.database import SessionLocal
    from app.models.user import User
    import bcrypt

    db = SessionLocal()
    try:
        user_in_db = db.query(User).filter(User.email == test_email.lower()).first()
        assert user_in_db is not None, "User not found in DB"
        assert user_in_db.password_hash != test_password, "Plain password stored in DB!"
        assert user_in_db.password_hash.startswith("$2b$") or user_in_db.password_hash.startswith("$2a$"), \
            f"Expected bcrypt hash format, got {user_in_db.password_hash[:10]}"
        # Verify checkpw succeeds with the plain password
        is_valid = bcrypt.checkpw(test_password.encode('utf-8'), user_in_db.password_hash.encode('utf-8'))
        assert is_valid, "bcrypt verify failed on stored hash"
        print(f"Stored hash sample: {user_in_db.password_hash[:25]}... (bcrypt verified!)")
        print("[PASS] TEST 8 (PostgreSQL Secure Hash Verification): PASSED")
    finally:
        db.close()

    # TEST 9: Frontend alias routes /api/auth/signup and /api/auth/signin
    print(f"\n[TEST 9] Verify frontend alias routes /api/auth/signup and /api/auth/signin")
    alias_email = f"alias_{int(time.time())}@research.org"
    status, body = make_request("/api/auth/signup", method="POST", data={
        "full_name": "Alias User",
        "email": alias_email,
        "password": "PasswordAlias99!",
    })
    assert status == 201, f"Expected 201 from /api/auth/signup, got {status}"

    status, body = make_request("/api/auth/signin", method="POST", data={
        "email": alias_email,
        "password": "PasswordAlias99!",
    })
    assert status == 200, f"Expected 200 from /api/auth/signin, got {status}"
    assert "token" in body and "user" in body
    print("[PASS] TEST 9 (Frontend /signup and /signin Aliases): PASSED")

    print("\n========================================")
    print("ALL TESTS PASSED WITH 100% SUCCESS!")
    print("========================================")



if __name__ == "__main__":
    run_tests()
