import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

const highlightText = (text, query) => {
  if (!query || !text) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
};

const CARDS_PER_PAGE = 30;

const CATEGORIES = {
  organizations: [
    "nonprofit organization",
    "youth support organization",
    "youth volunteer organization",
    "foster care nonprofit organization",
  ],
};

const TYPES = {
  organizations: [
    "point_of_interest",
    "establishment",
    "travel_agency",
    "health",
    "food",
    "local_government_office",
    "general_contractor",
    "church",
    "place_of_worship",
    "school",
  ],
};

const STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia",
  "Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey",
  "New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"
];

function OrganizationCard({ item, nameQuery }) {
  const a = item.attributes || {};
  return (
    <div className="col">
      <div className="card h-100 resource-card">
        {a.photo_url && (
          <img
            src={a.photo_url}
            alt={a.name || ""}
            className="card-img-top resource-card-img"
          />
        )}
        <div className="card-body">
          <h5
            className="card-title"
            dangerouslySetInnerHTML={{
              __html: highlightText(
                a.name || "Unknown Organization",
                nameQuery
              ),
            }}
          />
          <p className="card-text">
            <strong>Address:</strong>{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: highlightText(
                  a.address || "No address available",
                  nameQuery
                ),
              }}
            />
          </p>
          <p className="card-text">
            <strong>Category:</strong>{" "}
            <span
              dangerouslySetInnerHTML={{
                __html: highlightText(a.category || "Unknown", nameQuery),
              }}
            />
          </p>
          <Link
            to={`/organizations/${item.id}`}
            className="btn btn-dark mt-2"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationsPage() {
  const [data, setData] = useState([]);
  const [totalInstances, setTotalInstances] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedState, setSelectedState] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchData();
  }, [currentPage, selectedState, selectedType, selectedCategory, nameQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page[size]", CARDS_PER_PAGE);
      params.append("page[number]", currentPage);

      if (selectedState) params.append("filter[state]", selectedState);
      if (selectedType) params.append("filter[types]", selectedType);
      if (selectedCategory) params.append("filter[keyword]", selectedCategory);
      if (nameQuery) params.append("filter[name]", nameQuery);

      const res = await fetch(
        `https://fosterfledging.me/api/organizations?${params.toString()}`,
        { headers: { Accept: "application/vnd.api+json" } }
      );

      const api = await res.json();
      const items = api.data || [];
      const total = api.meta?.total || items.length;

      setData(items);
      setTotalInstances(total);
      setTotalPages(Math.ceil(total / CARDS_PER_PAGE));
    } catch (e) {
      console.error("Error fetching organizations data:", e);
    }
    setLoading(false);
  };

  const displayedData = [...data].sort((a, b) => {
    const nameA = (a.attributes?.name || "").toLowerCase();
    const nameB = (b.attributes?.name || "").toLowerCase();
    return sortOrder === "asc"
      ? nameA.localeCompare(nameB)
      : nameB.localeCompare(nameA);
  });

  return (
    <div>
      <section className="section-container">
        <div className="container text-center">
          <h1 className="section-title mb-3">Organization Resources</h1>
          <p className="lead text-muted mb-4">
            Discover nonprofits and community organizations supporting young
            adults aging out of foster care across the United States.
          </p>

          <div className="custom-search-container">
            <div className="custom-search-wrapper">
              <input
                type="text"
                className="form-control"
                placeholder="Search by organization name..."
                value={nameQuery}
                onChange={(e) => {
                  setCurrentPage(1);
                  setNameQuery(e.target.value);
                }}
              />
              <button
                type="button"
                className="btn btn-dark custom-search-button"
                onClick={() => setCurrentPage(1)}
              >
                Search
              </button>
            </div>
          </div>

          <p className="text-muted mb-0">
            Total Organization Instances: <strong>{totalInstances}</strong>
          </p>
        </div>
      </section>

      <section className="section-container section-container-alt">
        <div className="container">
          <div className="org-filters mb-4 d-flex flex-wrap justify-content-between align-items-end">
            <div className="d-flex flex-wrap gap-3">
              <div>
                <div className="form-label mb-1">Filter by state</div>
                <select
                  className="form-select"
                  value={selectedState}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSelectedState(e.target.value);
                  }}
                >
                  <option value="">All states</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="form-label mb-1">Filter by place type</div>
                <select
                  className="form-select"
                  value={selectedType}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSelectedType(e.target.value);
                  }}
                >
                  <option value="">All place types</option>
                  {TYPES.organizations.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="form-label mb-1">Filter by nonprofit category</div>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => {
                    setCurrentPage(1);
                    setSelectedCategory(e.target.value);
                  }}
                >
                  <option value="">All categories</option>
                  {CATEGORIES.organizations.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 mt-md-0 d-flex align-items-center">
              <label className="me-2 fw-semibold mb-0">Sort by:</label>
              <select
                className="form-select w-auto"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="asc">Name A → Z</option>
                <option value="desc">Name Z → A</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {displayedData.map((item) => (
                <OrganizationCard
                  key={item.id}
                  item={item}
                  nameQuery={nameQuery}
                />
              ))}
            </div>
          )}

          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <li
                  key={n}
                  className={`page-item ${n === currentPage ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(n)}
                  >
                    {n}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </div>
  );
}
