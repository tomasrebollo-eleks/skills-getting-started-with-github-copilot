import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data

def test_signup_and_remove_participant():
    activity = "Chess Club"
    email = "testuser@mergington.edu"
    # Signup
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200 or response.status_code == 400  # 400 if already signed up
    # Remove
    response = client.delete(f"/activities/{activity}/participant?email={email}")
    assert response.status_code == 200 or response.status_code == 404  # 404 if not present

def test_signup_full_activity():
    activity = "Chess Club"
    # Fill up the activity
    for i in range(20):
        email = f"fulltest{i}@mergington.edu"
        client.post(f"/activities/{activity}/signup?email={email}")
    # Try to overfill
    response = client.post(f"/activities/{activity}/signup?email=overflow@mergington.edu")
    assert response.status_code == 400
    assert "full" in response.json().get("detail", "")
