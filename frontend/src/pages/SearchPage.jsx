import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";

const API_BASE = "https://fosterfledging.me/api";
const CARDS_PER_PAGE = 10; // smaller for global search

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

function ResultSection({ title, items, basePath }) {
  if (!items.length) return null;

  return (
    <section className="mb-5">
      <h2 className="h4 mb-3">{title}</h2>
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {items.map((item) => {
          const attrs = item.attributes || {};
          return (
            <div key={item.id} className="col">
              <div className="card h-100 shadow-sm">
                {attrs.photo_url && (
                  <img
                    src={attrs.photo_url}
                    alt={attrs.name || "Resource photo"}
                    className="card-img-top"
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{attrs.name || "Unknown name"}</h5>
                  <p className="card-text">
                    <strong>Location:</strong>{" "}
                    {attrs.address || attrs.city || "No address available"}
                  </p>
                  {attrs.category && (
                    <p className="card-text">
                      <strong>Type:</strong> {attrs.category}
                    </p>
                  )}
                  <Link
                    to={`/${basePath}/${item.id}`}
                    className="btn btn-primary btn-sm"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function SearchPage() {
  const query = useQuery().get("q") || "";
  const [loading, setLoading] = useState(false);
  const [housingResults, setHousingResults] = useState([]);
  const [counselingResults, setCounselingResults] = useState([]);
  const [orgResults, setOrgResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchAll = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.append("page[size]", CARDS_PER_PAGE);
        params.append("page[number]", 1);

        // 🔴 IMPORTANT:
        // For CounselingModel, you already support filter[name].
        // If your backend has a dedicated 'filter[search]' for global search,
        // change this line in ALL THREE requests accordingly.
        params.append("filter[name]", query);

        const [housingRes, counselingRes, orgRes] = await Promise.all([
          fetch(`${API_BASE}/housing?${params.toString()}`, {
            headers: { Accept: "application/vnd.api+json" },
          }),
          fetch(`${API_BASE}/counseling?${params.toString()}`, {
            headers: { Accept: "application/vnd.api+json" },
          }),
          fetch(`${API_BASE}/organizations?${params.toString()}`, {
            headers: { Accept: "application/vnd.api+json" },
          }),
        ]);

        const [housingJson, counselingJson, orgJson] = await Promise.all([
          housingRes.json(),
          counselingRes.json(),
          orgRes.json(),
        ]);

        setHousingResults(housingJson.data || []);
        setCounselingResults(counselingJson.data || []);
        setOrgResults(orgJson.data || []);
      } catch (err) {
        console.error("Error fetching global search data:", err);
        setError("There was a problem fetching search results.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [query]);

  return (
    <div className="container my-5">
      <h1 className="mb-4">
        Search results for “{query || "…"}”
      </h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!query.trim() && (
        <p>
          No search query provided. Go back to the{" "}
          <Link to="/">landing page</Link> to search.
        </p>
      )}

      {query.trim() && loading && <p>Loading results…</p>}

      {query.trim() && !loading && !error && (
        <>
          <ResultSection
            title="Housing"
            items={housingResults}
            basePath="housing"
          />
          <ResultSection
            title="Counseling"
            items={counselingResults}
            basePath="counseling"
          />
          <ResultSection
            title="Organizations"
            items={orgResults}
            basePath="organizations"
          />

          {!housingResults.length &&
            !counselingResults.length &&
            !orgResults.length && (
              <p>No results found. Try a different search term.</p>
            )}

          <p className="mt-4">
            ← <Link to="/">Back to landing page</Link>
          </p>
        </>
      )}
    </div>
  );
}
