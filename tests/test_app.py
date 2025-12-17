import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_root_redirect():
    response = client.get("/", follow_redirects=False)
    # Should redirect to /static/index.html
    assert response.status_code in (307, 302)
    assert "/static/index.html" in response.headers["location"]

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Basketball Club" in data
    assert "participants" in data["Basketball Club"]

def test_signup_for_activity_success():
    # Use a unique email to avoid duplicate error
    email = "pytestuser@mergington.edu"
    response = client.post(f"/activities/Basketball Club/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for Basketball Club" in response.json()["message"]
    # Clean up: remove the test user
    data = client.get("/activities").json()
    data["Basketball Club"]["participants"].remove(email)

def test_signup_for_activity_duplicate():
    # Use an existing participant
    email = "alex@mergington.edu"
    response = client.post(f"/activities/Basketball Club/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

def test_signup_for_activity_not_found():
    response = client.post("/activities/Nonexistent/signup?email=someone@mergington.edu")
    assert response.status_code == 404
    assert "Activity not found" in response.json()["detail"]
