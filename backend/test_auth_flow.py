import asyncio
import time
import jwt
import httpx
from main import app
import config
from sqlmodel import Session, select
from database import engine
from models import Job, Thumbnail

# Configure test JWT secret
TEST_SECRET = "test-supabase-jwt-secret-for-unit-tests-12345"
config.SUPABASE_JWT_SECRET = TEST_SECRET

def make_token(user_id: str, email: str = "test@example.com") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "role": "authenticated",
        "exp": int(time.time()) + 3600,
        "user_metadata": {"name": f"User {user_id}"}
    }
    return jwt.encode(payload, TEST_SECRET, algorithm="HS256")

async def run_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        print("=== 1. Health check ===")
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        print("  [PASS] /api/health returned 200")

        print("=== 2. Unauthenticated requests to protected endpoints ===")
        # Without token
        res = await client.get("/api/history")
        assert res.status_code == 401, f"Expected 401 for /api/history without token, got {res.status_code}"
        print("  [PASS] GET /api/history without token returned 401")

        res = await client.post("/api/jobs", json={"prompt": "test", "headshot_url": "https://example.com/a.png", "num_thumbnails": 1})
        assert res.status_code == 401, f"Expected 401 for POST /api/jobs without token, got {res.status_code}"
        print("  [PASS] POST /api/jobs without token returned 401")

        res = await client.get("/api/jobs/fake-id")
        assert res.status_code == 401, f"Expected 401 for GET /api/jobs/{id} without token, got {res.status_code}"
        print("  [PASS] GET /api/jobs/fake-id without token returned 401")

        res = await client.get("/api/jobs/fake-id/stream")
        assert res.status_code == 401, f"Expected 401 for stream without token, got {res.status_code}"
        print("  [PASS] GET /api/jobs/fake-id/stream without token returned 401")

        # With invalid / expired token
        bad_headers = {"Authorization": "Bearer invalid.token.value"}
        res = await client.get("/api/history", headers=bad_headers)
        assert res.status_code == 401, f"Expected 401 for invalid token, got {res.status_code}"
        print("  [PASS] GET /api/history with invalid token returned 401")

        print("=== 3. Authenticated Job Creation & Ownership (User A) ===")
        user_a_id = "user-a-1111-2222-3333"
        token_a = make_token(user_a_id, "user_a@example.com")
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # User A creates job
        create_res = await client.post(
            "/api/jobs",
            headers=headers_a,
            json={
                "prompt": "Epic YouTube Gaming Thumbnail",
                "headshot_url": "https://ik.imagekit.io/demo/headshot.jpg",
                "num_thumbnails": 1
            }
        )
        assert create_res.status_code == 200, f"Failed to create job: {create_res.text}"
        job_a_id = create_res.json()["job_id"]
        print(f"  [PASS] User A created job {job_a_id}")

        # Verify job in DB has User A's ID
        with Session(engine) as session:
            db_job = session.get(Job, job_a_id)
            assert db_job is not None
            assert db_job.user_id == user_a_id, f"Expected job.user_id == {user_a_id}, got {db_job.user_id}"
        print("  [PASS] Job in database contains verified user_id")

        # User A retrieves job
        get_res = await client.get(f"/api/jobs/{job_a_id}", headers=headers_a)
        assert get_res.status_code == 200, f"User A failed to get own job: {get_res.text}"
        assert get_res.json()["id"] == job_a_id
        print("  [PASS] User A can retrieve own job")

        # User A checks history
        hist_res = await client.get("/api/history", headers=headers_a)
        assert hist_res.status_code == 200
        history_a = hist_res.json()
        assert any(j["id"] == job_a_id for j in history_a), "Created job not found in User A history"
        print(f"  [PASS] User A history contains job {job_a_id}")

        print("=== 4. Cross-User Authorization & Isolation (User B) ===")
        user_b_id = "user-b-9999-8888-7777"
        token_b = make_token(user_b_id, "user_b@example.com")
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # User B attempts to access User A's job -> MUST return 404 (do not leak existence)
        unauth_get = await client.get(f"/api/jobs/{job_a_id}", headers=headers_b)
        assert unauth_get.status_code == 404, f"Expected 404 when User B accesses User A job, got {unauth_get.status_code}"
        print("  [PASS] User B cannot access User A's job (returned 404)")

        # User B attempts to stream User A's job -> MUST return 404
        unauth_stream = await client.get(f"/api/jobs/{job_a_id}/stream", headers=headers_b)
        assert unauth_stream.status_code == 404, f"Expected 404 when User B streams User A job, got {unauth_stream.status_code}"
        print("  [PASS] User B cannot stream User A's job (returned 404)")

        # User B checks history -> MUST NOT contain User A's jobs
        hist_b_res = await client.get("/api/history", headers=headers_b)
        assert hist_b_res.status_code == 200
        history_b = hist_b_res.json()
        assert not any(j["id"] == job_a_id for j in history_b), "User B history leaked User A's job!"
        print("  [PASS] User B history does not contain User A's job")

        # Clean up test job
        with Session(engine) as session:
            for t in session.exec(select(Thumbnail).where(Thumbnail.job_id == job_a_id)).all():
                session.delete(t)
            j = session.get(Job, job_a_id)
            if j:
                session.delete(j)
            session.commit()

        print("\nALL BACKEND AUTH & ISOLATION TESTS PASSED SUCCESSFULLY! [PASS]")

if __name__ == "__main__":
    asyncio.run(run_tests())
