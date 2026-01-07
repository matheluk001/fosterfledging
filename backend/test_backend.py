import pytest
import os

os.environ["RUNNING_TESTS"] = "1"
from app import app, db, Housing, Counseling, Organizations, State


@pytest.fixture
def client():
    # Use testing config BEFORE db.init_app
    app.config["TESTING"] = True
    # Create app context
    with app.app_context():
        # Create all tables
        db.create_all()
        # Insert initial test data
        state_instance = State(name="Texas")
        housing = Housing(
            name="Housing A", category="Shelter", state="Texas", place_id="h1"
        )
        counseling = Counseling(
            name="Counseling A", category="Mental Health", state="Texas", place_id="c1"
        )
        organization = Organizations(
            name="Org A", category="Support", state="Texas", place_id="o1"
        )
        housing.states.append(state_instance)
        counseling.states.append(state_instance)
        organization.states.append(state_instance)
        db.session.add_all([state_instance, housing, counseling, organization])
        # Insert more test data
        state_instance2 = State(name="Ohio")
        housing2 = Housing(
            name="Housing B", category="Shelter", state="Ohio", place_id="h2"
        )
        counseling2 = Counseling(
            name="Counseling B", category="Mental Health", state="Ohio", place_id="c2"
        )
        organization2 = Organizations(
            name="Org B", category="Support", state="Ohio", place_id="o2"
        )
        housing2.states.append(state_instance2)
        counseling2.states.append(state_instance2)
        organization2.states.append(state_instance2)
        db.session.add_all([state_instance2, housing2, counseling2, organization2])
        db.session.commit()
        # Yield test client
        yield app.test_client()
        # drop all tables
        db.drop_all()


def test_get_housing_by_id(client):
    """Test /api/housing-resources/<id>"""
    response = client.get("/api/housing-resources/1")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["name"] == "Housing A"
    assert "counseling" in json_data["in_state_resources"]
    assert "organizations" in json_data["in_state_resources"]


def test_get_housing_all(client):
    """Test /api/housing-resources"""
    response = client.get("/api/housing")
    assert response.status_code == 200
    json_data = response.get_json()
    assert "data" in json_data
    assert "meta" in json_data
    assert "links" in json_data

    assert json_data["meta"]["total"] == 2
    assert len(json_data["data"]) == 2

    first_housing = json_data["data"][0]["attributes"]
    assert first_housing["name"] == "Housing A"
    assert first_housing["state"] == "Texas"
    assert first_housing["category"] == "Shelter"

    second_house = json_data["data"][1]["attributes"]
    assert second_house["name"] == "Housing B"
    assert second_house["state"] == "Ohio"
    assert second_house["category"] == "Shelter"


def test_get_counseling_by_id(client):
    """Test /api/counseling/<id>"""
    response = client.get("/api/counseling/1")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["name"] == "Counseling A"
    assert "housing" in json_data["in_state_resources"]
    assert "organizations" in json_data["in_state_resources"]


def test_get_counseling_all(client):
    """Test /api/counseling"""
    response = client.get("/api/counseling")
    assert response.status_code == 200
    json_data = response.get_json()
    assert "data" in json_data
    assert "meta" in json_data
    assert "links" in json_data

    assert json_data["meta"]["total"] == 2
    assert len(json_data["data"]) == 2

    first_coun = json_data["data"][0]["attributes"]
    assert first_coun["name"] == "Counseling A"
    assert first_coun["state"] == "Texas"
    assert first_coun["category"] == "Mental Health"

    second_coun = json_data["data"][1]["attributes"]
    assert second_coun["name"] == "Counseling B"
    assert second_coun["state"] == "Ohio"
    assert second_coun["category"] == "Mental Health"


def test_get_organization_by_id(client):
    """Test /api/organizations/<id>"""
    response = client.get("/api/organizations/1")
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data["name"] == "Org A"
    assert "counseling" in json_data["in_state_resources"]
    assert "housing" in json_data["in_state_resources"]


def test_get_organization_all(client):
    """Test /api/organizations"""
    response = client.get("/api/organizations")
    assert response.status_code == 200
    json_data = response.get_json()
    assert "data" in json_data
    assert "meta" in json_data
    assert "links" in json_data

    assert json_data["meta"]["total"] == 2
    assert len(json_data["data"]) == 2

    first_org = json_data["data"][0]["attributes"]
    assert first_org["name"] == "Org A"
    assert first_org["state"] == "Texas"
    assert first_org["category"] == "Support"

    second_org = json_data["data"][1]["attributes"]
    assert second_org["name"] == "Org B"
    assert second_org["state"] == "Ohio"
    assert second_org["category"] == "Support"


def test_search_all(client):
    """Test /api/search_all endpoint with and without filters"""
    # --- Test: Basic search for 'Housing' ---
    response = client.get("/api/search_all?search=Housing")
    assert response.status_code == 200
    json_data = response.get_json()

    # Should have expected keys
    assert "data" in json_data
    assert "meta" in json_data
    assert "links" in json_data
    assert "jsonapi" in json_data

    # Should return both housing entries (A, B)
    names = [item["attributes"]["name"] for item in json_data["data"]]
    assert "Housing A" in names
    assert "Housing B" in names
    assert json_data["meta"]["total"] >= 2  # since we have 2 housings

    # --- Test: Filter by model (only housing) ---
    response = client.get("/api/search_all?search=Housing&model=housing")
    assert response.status_code == 200
    json_data = response.get_json()
    model_types = [item["type"] for item in json_data["data"]]
    assert all(mt == "housing" for mt in model_types)

    # --- Test: Specific phrase search (Counseling A) ---
    response = client.get("/api/search_all?search=Counseling A")
    assert response.status_code == 200
    json_data = response.get_json()
    names = [item["attributes"]["name"] for item in json_data["data"]]
    assert "Counseling A" in names
    # Can include Counseling B as partial match due to term-based search
    assert json_data["meta"]["total"] >= 1

    # --- Test: Pagination ---
    response = client.get("/api/search_all?search=Support&page[number]=1&page[size]=1")
    assert response.status_code == 200
    json_data = response.get_json()
    assert len(json_data["data"]) == 1
    assert json_data["links"]["next"] is not None
    assert json_data["meta"]["total"] >= 2  # Org A, Org B exist

    # --- Test: Model filter invalid ---
    response = client.get("/api/search_all?search=Housing&model=invalid_model")
    assert response.status_code == 400
    json_data = response.get_json()
    assert "error" in json_data
    assert "No such model" in json_data["error"]

    # --- Test: Missing search query ---
    response = client.get("/api/search_all")
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data["error"] == "No search query provided"
