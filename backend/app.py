# app.py
from flask import Flask, jsonify, request, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_restless import APIManager
from datetime import datetime, timezone
from flask_cors import CORS
from dotenv import load_dotenv
from pathlib import Path
import os
from sqlalchemy import asc, desc, or_, func
from sqlalchemy.orm import joinedload
import re

TYPES = {
    "counseling": [
        "doctor",
        "point_of_interest",
        "health",
        "establishment",
        "physiotherapist",
        "secondary_school",
        "school",
        "hospital",
        "finance",
        "travel_agency",
    ],
    "housing": [
        "finance",
        "local_government_office",
        "point_of_interest",
        "establishment",
        "food",
        "health",
        "real_estate_agency",
        "doctor",
        "store",
    ],
    "organizations": [
        "point_of_interest"
        "establishment"
        "travel_agency"
        "health"
        "food"
        "local_government_office"
        "general_contractor"
        "church"
        "place_of_worship"
        "school"
    ],
}

# Used in data_scraping.py, used for a filter implementation
CATEGORIES = {
    "counseling": [
        "foster care counseling",
        "youth mental health counseling",
        "youth trauma therapy",
        "bilingual youth counseling",
    ],
    "organizations": [
        "nonprofit organization",
        "youth support organization",
        "youth volunteer organization",
        "foster care nonprofit organization",
    ],
    "housing": [
        "housing authority",
        "supportive housing",
        "housing assistance",
        "transitional housing",
    ],
}

# need to ignore these terms for each model.
IGNORE_WORDS = {
    "Organizations": ["organization"],
    "Housing": ["housing"],
    "Counseling": ["counseling"],
}


# env path needed for
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

# connect to mysql database using sql alchemy
app = Flask(__name__)
CORS(app, origins=["https://www.fosterfledging.me"])  # enable Cross Origin Sharing

# Decide which DB to use (when running tests vs. when not)
if os.environ.get("RUNNING_TESTS") == "1":
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
else:
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{os.environ['MYSQL_USER']}:"
        f"{os.environ['MYSQL_PASSWORD']}@"
        f"{os.environ['MYSQL_HOST']}:3306/"
        f"{os.environ['MYSQL_DB']}"
    )

# get the database
db = SQLAlchemy(app)

# Association tables
housing_state = db.Table(
    "housing_state",
    db.Column("housing_id", db.Integer, db.ForeignKey("housing.id"), primary_key=True),
    db.Column("state_id", db.Integer, db.ForeignKey("state.id"), primary_key=True),
)

counseling_state = db.Table(
    "counseling_state",
    db.Column(
        "counseling_id", db.Integer, db.ForeignKey("counseling.id"), primary_key=True
    ),
    db.Column("state_id", db.Integer, db.ForeignKey("state.id"), primary_key=True),
)

organization_state = db.Table(
    "organization_state",
    db.Column(
        "organization_id",
        db.Integer,
        db.ForeignKey("organizations.id"),
        primary_key=True,
    ),
    db.Column("state_id", db.Integer, db.ForeignKey("state.id"), primary_key=True),
)


class Housing(db.Model):
    __tablename__ = "housing"
    states = db.relationship("State", secondary=housing_state, backref="housings")
    id = db.Column(db.Integer, primary_key=True)
    place_id = db.Column(db.String(255), unique=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    rating = db.Column(db.Float)
    types = db.Column(db.JSON)
    category = db.Column(db.String(50), nullable=False)
    keyword = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    website = db.Column(db.String(255))
    photo_url = db.Column(db.Text)
    state = db.Column(db.String(50))
    source = db.Column(db.String(50))
    retrieved_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Counseling(db.Model):
    __tablename__ = "counseling"
    states = db.relationship("State", secondary=counseling_state, backref="counselings")
    id = db.Column(db.Integer, primary_key=True)
    place_id = db.Column(db.String(255), unique=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    rating = db.Column(db.Float)
    types = db.Column(db.JSON)
    category = db.Column(db.String(50), nullable=False)
    keyword = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    website = db.Column(db.String(255))
    photo_url = db.Column(db.Text)
    state = db.Column(db.String(50))
    source = db.Column(db.String(50))
    retrieved_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Organizations(db.Model):
    __tablename__ = "organizations"
    states = db.relationship(
        "State", secondary=organization_state, backref="organizations"
    )
    id = db.Column(db.Integer, primary_key=True)
    place_id = db.Column(db.String(255), unique=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    rating = db.Column(db.Float)
    types = db.Column(db.JSON)
    category = db.Column(db.String(50), nullable=False)
    keyword = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    website = db.Column(db.String(255))
    photo_url = db.Column(db.Text)
    state = db.Column(db.String(50))
    source = db.Column(db.String(50))
    retrieved_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class State(db.Model):
    __tablename__ = "state"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


@app.route("/api/health", methods=["GET"])
def health():
    return {"ok": True}, 200


# Example route
@app.route("/")
def index():
    return "Backend is working!"


@app.route("/api/housing-resources/<int:id>", methods=["GET"])
def get_housing_by_id(id):
    housing = db.session.get(Housing, id)
    if not housing:
        return {"error": "Not found"}, 404

    state_ids = [s.id for s in housing.states]
    if not state_ids:
        state_ids = [-1]  # no match
    related_counseling = (
        db.session.query(Counseling.id, Counseling.name, Counseling.category)
        .join(counseling_state)
        .filter(counseling_state.c.state_id.in_(state_ids))
        .all()
    )
    related_organizations = (
        db.session.query(Organizations.id, Organizations.name, Organizations.category)
        .join(organization_state)
        .filter(organization_state.c.state_id.in_(state_ids))
        .all()
    )

    """related_counseling = Counseling.query.filter_by(state=housing.state).all()
    related_organizations = Organizations.query.filter_by(state=housing.state).all()"""
    return {
        "id": housing.id,
        "place_id": housing.place_id,
        "name": housing.name,
        "address": housing.address,
        "lat": housing.lat,
        "lng": housing.lng,
        "rating": housing.rating,
        "types": housing.types,
        "category": housing.category,
        "keyword": housing.keyword,
        "phone": housing.phone,
        "website": housing.website,
        "photo_url": housing.photo_url,
        "state": housing.state,
        "source": housing.source,
        "retrieved_at": housing.retrieved_at.isoformat(),
        "in_state_resources": {
            "counseling": [
                {"id": c.id, "name": c.name, "category": c.category}
                for c in related_counseling
            ],
            "organizations": [
                {"id": o.id, "name": o.name, "category": o.category}
                for o in related_organizations
            ],
        },
    }


@app.route("/api/counseling/<int:id>", methods=["GET"])
def get_counseling_by_id(id):
    counseling = db.session.get(Counseling, id)
    if not counseling:
        return {"error": "Not found"}, 404

    state_ids = [s.id for s in counseling.states]
    if not state_ids:
        state_ids = [-1]  # no match
    related_housing = (
        db.session.query(Housing.id, Housing.name, Housing.category)
        .join(housing_state)
        .filter(housing_state.c.state_id.in_(state_ids))
        .all()
    )
    related_organizations = (
        db.session.query(Organizations.id, Organizations.name, Organizations.category)
        .join(organization_state)
        .filter(organization_state.c.state_id.in_(state_ids))
        .all()
    )

    """related_housing = Housing.query.filter_by(state=counseling.state).all()
    related_organizations = Organizations.query.filter_by(state=counseling.state).all()"""
    return {
        "id": counseling.id,
        "place_id": counseling.place_id,
        "name": counseling.name,
        "address": counseling.address,
        "lat": counseling.lat,
        "lng": counseling.lng,
        "rating": counseling.rating,
        "types": counseling.types,
        "category": counseling.category,
        "keyword": counseling.keyword,
        "phone": counseling.phone,
        "website": counseling.website,
        "photo_url": counseling.photo_url,
        "state": counseling.state,
        "source": counseling.source,
        "retrieved_at": counseling.retrieved_at.isoformat(),
        "in_state_resources": {
            "housing": [
                {"id": h.id, "name": h.name, "category": h.category}
                for h in related_housing
            ],
            "organizations": [
                {"id": o.id, "name": o.name, "category": o.category}
                for o in related_organizations
            ],
        },
    }


@app.route("/api/organizations/<int:id>", methods=["GET"])
def get_organizations_by_id(id):
    organization = db.session.get(Organizations, id)
    if not organization:
        return {"error": "Not found"}, 404

    state_ids = [s.id for s in organization.states]
    if not state_ids:
        state_ids = [-1]  # no match
    related_housing = (
        db.session.query(Housing.id, Housing.name, Housing.category)
        .join(housing_state)
        .filter(housing_state.c.state_id.in_(state_ids))
        .all()
    )
    related_counseling = (
        db.session.query(Counseling.id, Counseling.name, Counseling.category)
        .join(counseling_state)
        .filter(counseling_state.c.state_id.in_(state_ids))
        .all()
    )
    """related_housing = Housing.query.filter_by(state=organization.state).all()
    related_counseling = Counseling.query.filter_by(state=organization.state).all()"""
    return {
        "id": organization.id,
        "place_id": organization.place_id,
        "name": organization.name,
        "address": organization.address,
        "lat": organization.lat,
        "lng": organization.lng,
        "rating": organization.rating,
        "types": organization.types,
        "category": organization.category,
        "keyword": organization.keyword,
        "phone": organization.phone,
        "website": organization.website,
        "photo_url": organization.photo_url,
        "state": organization.state,
        "source": organization.source,
        "retrieved_at": organization.retrieved_at.isoformat(),
        "in_state_resources": {
            "housing": [
                {"id": h.id, "name": h.name, "category": h.category}
                for h in related_housing
            ],
            "counseling": [
                {"id": c.id, "name": c.name, "category": c.category}
                for c in related_counseling
            ],
        },
    }


# Helper function to generate links

BASE_URL = app.config.get("PUBLIC_API_BASE_URL")


def make_page_link(page, page_size, name):
    relative = url_for(
        name,
        **{"page[number]": page, "page[size]": page_size},
    )
    return f"{BASE_URL}{relative}"


def serialize_model(model, related_a, related_b, a_name, b_name):
    return {
        "id": model.id,
        "place_id": model.place_id,
        "name": model.name,
        "address": model.address,
        "lat": model.lat,
        "lng": model.lng,
        "rating": model.rating,
        "types": model.types,
        "category": model.category,
        "keyword": model.keyword,
        "phone": model.phone,
        "website": model.website,
        "photo_url": model.photo_url,
        "state": model.state,
        "source": model.source,
        "retrieved_at": model.retrieved_at.isoformat(),
        "in_state_resources": {
            a_name: [
                {"id": a.id, "name": a.name, "category": a.category} for a in related_a
            ],
            b_name: [
                {"id": b.id, "name": b.name, "category": b.category} for b in related_b
            ],
        },
    }


def as_resource(item, resource_type):
    return {
        "id": str(item["id"]),
        "type": resource_type,
        "attributes": {k: v for k, v in item.items() if k != "id"},
    }


import re


def compute_matches(data_dict, search_query, terms):
    matches = {}
    if not (search_query or terms):
        return matches

    # escape search for regex
    phrase = re.escape(search_query) if search_query else None

    def scan_field(path, text):
        found = []
        text = str(text)

        # phrase match
        if phrase:
            for m in re.finditer(phrase, text, flags=re.IGNORECASE):
                found.append(
                    {
                        "term": search_query,
                        "indices": [(m.start(), m.end())],
                    }
                )

        # individual term matches (skip if same as search_query)
        for term in terms:
            if search_query and term.lower() == search_query.lower():
                continue
            t = re.escape(term)
            indices = [
                (m.start(), m.end()) for m in re.finditer(t, text, flags=re.IGNORECASE)
            ]
            if indices:
                found.append(
                    {
                        "term": term,
                        "indices": indices,
                    }
                )

        if found:
            # deduplicate by term + indices
            unique_found = []
            seen = set()
            for item in found:
                key = (item["term"].lower(), tuple(item["indices"]))
                if key not in seen:
                    seen.add(key)
                    unique_found.append(item)
            matches[path] = unique_found

    # recursive traversal
    def walk(path, value):
        if isinstance(value, str):
            scan_field(path, value)
        elif isinstance(value, list):
            for i, item in enumerate(value):
                walk(f"{path}[{i}]", item)
        elif isinstance(value, dict):
            for k, v in value.items():
                walk(f"{path}.{k}", v)
        # numbers, None, bool, etc. are ignored

    walk("", data_dict)
    return matches


def apply_query_options(query, request, Model):
    # ---- FILTERS ----
    for key, value in request.args.items():
        if key.startswith("filter[") and key.endswith("]"):
            field = key[7:-1]  # Extract the field name inside brackets
            if field == "state":
                states = [s.strip() for s in value.split(",")]
                query = query.join(Model.states).filter(State.name.in_(states))
            elif field == "types":
                types_list = [t.strip() for t in value.split(",")]
                query = query.filter(
                    or_(
                        *[func.JSON_CONTAINS(Model.types, f'"{t}"') for t in types_list]
                    )
                )
            elif field == "keyword":
                value = value.strip()
                # Check if it looks like a list: [item1, item2, ...]
                if value.startswith("[") and value.endswith("]"):
                    # Remove brackets and split by commas
                    keyword_list = [
                        t.strip() for t in value[1:-1].split(",") if t.strip()
                    ]
                else:
                    # Single keyword or comma-separated values
                    keyword_list = [t.strip() for t in value.split(",") if t.strip()]
                # Only keep valid keywords from CATEGORIES
                valid_keywords = [k for k in CATEGORIES.get(Model.__name__.lower(), [])]
                matched_keywords = [t for t in keyword_list if t in valid_keywords]
                if matched_keywords:
                    query = query.filter(
                        or_(*[Model.keyword == t for t in matched_keywords])
                    )
            elif hasattr(Model, field):
                column = getattr(Model, field)
                # Apply case-insensitive partial match for strings
                if isinstance(value, str):
                    query = query.filter(column.ilike(f"%{value}%"))
                else:
                    query = query.filter(column == value)

    # ---- SEARCH ----
    search_query = request.args.get("search")
    if search_query:
        # Split into individual terms
        terms = [
            term.strip()
            for term in search_query.split()
            if term.strip() and term.lower() not in IGNORE_WORDS[Model.__name__]
        ]
        full_phrase = search_query.strip()
        # Collect all text-like columns
        text_columns = [
            column
            for column in Model.__table__.columns
            if "char" in str(column.type).lower() or "text" in str(column.type).lower()
        ]
        # Build filters: full phrase match gets higher weight, individual terms get lower
        search_filters = []
        for column in text_columns:
            # Full phrase match
            search_filters.append(column.ilike(f"%{full_phrase}%"))
            # Individual term matches
            for term in terms:
                search_filters.append(column.ilike(f"%{term}%"))
        if search_filters:
            # Combine all conditions with OR
            query = query.filter(or_(*search_filters))

    # ---- SORTING ----
    sort_value = request.args.get("sort")
    if sort_value:
        reverse = sort_value.startswith("-")
        field = sort_value.lstrip("-")
        if hasattr(Model, field):
            column = getattr(Model, field)
            query = query.order_by(desc(column) if reverse else asc(column))
    else:
        # Default order if nothing specified
        if hasattr(Model, "id"):
            query = query.order_by(asc(Model.id))
    return query


@app.route("/api/housing", methods=["GET"])
def get_all_housing():
    query = db.session.query(Housing)
    housing_return = apply_query_options(query, request, Housing)
    all_housing = housing_return.all()
    search_query = request.args.get("search", "").strip()
    terms = [t.strip() for t in search_query.split() if t.strip()]
    housing_return = []
    if not all_housing:
        return {"error": "Not found"}, 404
    for housing in all_housing:
        state_ids = [s.id for s in housing.states]
        if not state_ids:
            state_ids = [-1]  # no match
        related_counseling = (
            db.session.query(Counseling.id, Counseling.name, Counseling.category)
            .join(counseling_state)
            .filter(counseling_state.c.state_id.in_(state_ids))
            .all()
        )
        related_organizations = (
            db.session.query(
                Organizations.id, Organizations.name, Organizations.category
            )
            .join(organization_state)
            .filter(organization_state.c.state_id.in_(state_ids))
            .all()
        )
        item = serialize_model(
            housing,
            related_counseling,
            related_organizations,
            "counseling",
            "organizations",
        )
        # Add matches metadata
        if search_query:
            item["matches"] = compute_matches(item, search_query, terms)
        else:
            item["matches"] = {}
        housing_return.append(item)

    page_number = int(request.args.get("page[number]", 1))
    page_size = int(request.args.get("page[size]", 3))
    total_items = len(housing_return)
    total_pages = (total_items + page_size - 1) // page_size
    # start/end indices
    start = (page_number - 1) * page_size
    end = start + page_size
    paged_items = [as_resource(item, "housing") for item in housing_return[start:end]]
    links = {
        "self": "/api/housing",
        "first": make_page_link(1, page_size, "get_all_housing"),
        "last": make_page_link(total_pages, page_size, "get_all_housing"),
        "prev": (
            make_page_link(page_number - 1, page_size, "get_all_housing")
            if page_number > 1
            else None
        ),
        "next": (
            make_page_link(page_number + 1, page_size, "get_all_housing")
            if page_number < total_pages
            else None
        ),
    }
    response = {
        "data": paged_items,
        "jsonapi": {"version": "1.0"},
        "links": links,
        "meta": {"total": len(housing_return)},
    }
    return jsonify(response)


@app.route("/api/counseling", methods=["GET"])
def get_all_counseling():
    query = db.session.query(Counseling)
    counseling_return = apply_query_options(query, request, Counseling)
    all_counseling = counseling_return.all()
    search_query = request.args.get("search", "").strip()
    terms = [t.strip() for t in search_query.split() if t.strip()]
    if not all_counseling:
        return {"error": "Not found"}, 404
    counseling_return = []
    for counseling in all_counseling:
        state_ids = [s.id for s in counseling.states]
        if not state_ids:
            state_ids = [-1]  # no match
        related_housing = (
            db.session.query(Housing.id, Housing.name, Housing.category)
            .join(housing_state)
            .filter(housing_state.c.state_id.in_(state_ids))
            .all()
        )
        related_organizations = (
            db.session.query(
                Organizations.id, Organizations.name, Organizations.category
            )
            .join(organization_state)
            .filter(organization_state.c.state_id.in_(state_ids))
            .all()
        )
        item = serialize_model(
            counseling,
            related_housing,
            related_organizations,
            "housing",
            "organizations",
        )
        if search_query:
            item["matches"] = compute_matches(item, search_query, terms)
        else:
            item["matches"] = {}
        counseling_return.append(item)

    page_number = int(request.args.get("page[number]", 1))
    page_size = int(request.args.get("page[size]", 3))
    total_items = len(counseling_return)
    total_pages = (total_items + page_size - 1) // page_size
    # start/end indices
    start = (page_number - 1) * page_size
    end = start + page_size
    paged_items = [
        as_resource(item, "counseling") for item in counseling_return[start:end]
    ]
    links = {
        "self": "/api/counseling",
        "first": make_page_link(1, page_size, "get_all_counseling"),
        "last": make_page_link(total_pages, page_size, "get_all_counseling"),
        "prev": (
            make_page_link(page_number - 1, page_size, "get_all_counseling")
            if page_number > 1
            else None
        ),
        "next": (
            make_page_link(page_number + 1, page_size, "get_all_counseling")
            if page_number < total_pages
            else None
        ),
    }
    response = {
        "data": paged_items,
        "jsonapi": {"version": "1.0"},
        "links": links,
        "meta": {"total": len(counseling_return)},
    }
    return jsonify(response)


@app.route("/api/organizations", methods=["GET"])
def get_all_organizations():
    query = db.session.query(Organizations)
    # apply query options
    organizations_return = apply_query_options(query, request, Organizations)
    # get all query options
    all_organizations = organizations_return.all()
    search_query = request.args.get("search", "").strip()
    terms = [t.strip() for t in search_query.split() if t.strip()]
    organizations_return = []
    if not all_organizations:
        return {"error": "Not found"}, 404
    # building the table connections while also serializing the data entries to return
    for organizations in all_organizations:
        state_ids = [s.id for s in organizations.states]
        if not state_ids:
            state_ids = [-1]  # no match
        related_housing = (
            db.session.query(Housing.id, Housing.name, Housing.category)
            .join(housing_state)
            .filter(housing_state.c.state_id.in_(state_ids))
            .all()
        )
        related_counseling = (
            db.session.query(Counseling.id, Counseling.name, Counseling.category)
            .join(counseling_state)
            .filter(counseling_state.c.state_id.in_(state_ids))
            .all()
        )
        item = serialize_model(
            organizations,
            related_housing,
            related_counseling,
            "housing",
            "counseling",
        )
        if search_query:
            item["matches"] = compute_matches(item, search_query, terms)
        else:
            item["matches"] = {}
        organizations_return.append(item)

    page_number = int(request.args.get("page[number]", 1))
    page_size = int(request.args.get("page[size]", 3))
    total_items = len(organizations_return)
    total_pages = (total_items + page_size - 1) // page_size
    # start/end indices
    start = (page_number - 1) * page_size
    end = start + page_size
    paged_items = [
        as_resource(item, "organizations") for item in organizations_return[start:end]
    ]
    links = {
        "self": "/api/organizations",
        "first": make_page_link(1, page_size, "get_all_organizations"),
        "last": make_page_link(total_pages, page_size, "get_all_organizations"),
        "prev": (
            make_page_link(page_number - 1, page_size, "get_all_organizations")
            if page_number > 1
            else None
        ),
        "next": (
            make_page_link(page_number + 1, page_size, "get_all_organizations")
            if page_number < total_pages
            else None
        ),
    }
    response = {
        "data": paged_items,
        "jsonapi": {"version": "1.0"},
        "links": links,
        "meta": {"total": len(organizations_return)},
    }
    return jsonify(response)


@app.route("/api/search_all", methods=["GET"])
def search_all():
    search_query = request.args.get("search")
    if not search_query:
        return jsonify({"error": "No search query provided"}), 400

    model_filter = request.args.get("model")  # optional filter by model
    results = []
    # Define models and their names
    model_list = [
        (Organizations, "organizations"),
        (Housing, "housing"),
        (Counseling, "counseling"),
    ]

    # Apply model filter if provided
    if model_filter:
        model_list = [
            (m, name) for m, name in model_list if name.lower() == model_filter.lower()
        ]
        if not model_list:
            return jsonify({"error": f"No such model: {model_filter}"}), 400

    for Model, model_name in model_list:
        query = db.session.query(Model)

        # --- SEARCH LOGIC ---
        # Split into terms and remove ignored words
        terms = [
            term.strip()
            for term in search_query.split()
            if term.strip() and term.lower() not in IGNORE_WORDS.get(Model.__name__, [])
        ]
        full_phrase = search_query.strip().lower()

        # Collect text-like columns
        text_columns = [
            column
            for column in Model.__table__.columns
            if "char" in str(column.type).lower() or "text" in str(column.type).lower()
        ]

        # Build search filters (SQL filtering)
        search_filters = []
        for column in text_columns:
            search_filters.append(column.ilike(f"%{full_phrase}%"))  # full phrase match
            for term in terms:  # individual term match
                search_filters.append(column.ilike(f"%{term}%"))

        if search_filters:
            query = query.filter(or_(*search_filters))

        query_results = query.all()

        # --- SCORING & SERIALIZATION ---
        for item in query_results:
            # Calculate relevance score
            score = 0
            for column in text_columns:
                col_text = (getattr(item, column.name) or "").lower()
                if full_phrase in col_text:
                    score += 10  # full phrase match
                score += sum(1 for term in terms if term in col_text)

            # Get related resources via states
            state_ids = [s.id for s in item.states] if item.states else [-1]

            related_counseling = (
                db.session.query(Counseling.id, Counseling.name, Counseling.category)
                .join(counseling_state)
                .filter(counseling_state.c.state_id.in_(state_ids))
                .all()
            )
            related_organizations = (
                db.session.query(
                    Organizations.id, Organizations.name, Organizations.category
                )
                .join(organization_state)
                .filter(organization_state.c.state_id.in_(state_ids))
                .all()
            )

            serialized = serialize_model(
                item,
                related_counseling,
                related_organizations,
                "counseling",
                "organizations",
            )

            # --- Add matches metadata ---
            serialized["matches"] = (
                compute_matches(serialized, full_phrase, terms) if search_query else {}
            )

            results.append(
                {
                    "data": serialized,
                    "model_type": model_name,
                    "_score": score,
                }
            )

    # --- SORT BY RELEVANCE ---
    results.sort(key=lambda x: x["_score"], reverse=True)

    # --- PAGINATION ---
    page_number = int(request.args.get("page[number]", 1))
    page_size = int(request.args.get("page[size]", 3))
    total_items = len(results)
    total_pages = (total_items + page_size - 1) // page_size
    start = (page_number - 1) * page_size
    end = start + page_size
    paged_items = [
        as_resource(item["data"], item["model_type"]) for item in results[start:end]
    ]

    links = {
        "self": "/api/search_all",
        "first": make_page_link(1, page_size, "search_all"),
        "last": make_page_link(total_pages, page_size, "search_all"),
        "prev": (
            make_page_link(page_number - 1, page_size, "search_all")
            if page_number > 1
            else None
        ),
        "next": (
            make_page_link(page_number + 1, page_size, "search_all")
            if page_number < total_pages
            else None
        ),
    }
    response = {
        "data": paged_items,
        "jsonapi": {"version": "1.0"},
        "links": links,
        "meta": {"total": total_items},
    }
    return jsonify(response)


@app.route("/api/test")
def test():
    return "OK"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
