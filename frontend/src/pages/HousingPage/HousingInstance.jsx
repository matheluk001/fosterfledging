import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const LAT_LNG_THRESHOLD = 0.5;

function isNearby(lat1, lng1, lat2, lng2) {
  return Math.abs(lat1 - lat2) <= LAT_LNG_THRESHOLD && Math.abs(lng1 - lng2) <= LAT_LNG_THRESHOLD;
}

function RelatedSection({ title, items }) {
  if (!items || items.length === 0) {
    return (
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-secondary text-white">
          <h5 className="mb-0">{title}</h5>
        </div>
        <div className="card-body">
          <p>No related instances found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card mb-4 shadow-sm">
      <div
        className={`card-header ${title.includes("Counseling") ? "bg-primary" : "bg-success"
          } text-white`}
      >
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {items.map((item) => {
            const attrs = item.attributes || {};
            return (
              <div className="col" key={item.id}>
                <div className="card h-100 shadow-sm">
                  {attrs.photo_url && (
                    <img
                      src={attrs.photo_url}
                      className="card-img-top"
                      alt={attrs.name || ""}
                    />
                  )}
                  <div className="card-body">
                    <h5 className="card-title">{attrs.name || "Unknown Name"}</h5>
                    <p className="card-text">
                      {attrs.address || "No address available"}
                    </p>
                    <p>
                      <strong>Category:</strong> {attrs.category || "N/A"}
                    </p>
                    {attrs.website && (
                      <a
                        href={attrs.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm"
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HousingInstance() {
  const { id } = useParams();
  const [housing, setHousing] = useState(null);
  const [relatedCounseling, setRelatedCounseling] = useState([]);
  const [relatedOrganizations, setRelatedOrganizations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid instance ID");
      return;
    }

    fetch(`https://fosterfledging.me/api/housing-resources/${id}`, {
      headers: { Accept: "application/json" }
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data) {
          setError("Instance data missing");
          return;
        }
        setHousing(data);
        const instanceLat = parseFloat(data.lat);
        const instanceLng = parseFloat(data.lng);


        // Fetch counseling
        fetch("https://fosterfledging.me/api/counseling?page[size]=100", {
          headers: { Accept: "application/vnd.api+json" },
        })
          .then((res) => res.json())
          .then((data) => {
            const allItems = Array.isArray(data.data) ? data.data : [data.data];
            const nearby = allItems.filter((i) => {
              const lat = parseFloat(i.attributes?.lat);
              const lng = parseFloat(i.attributes?.lng);
              return (
                !isNaN(lat) &&
                !isNaN(lng) &&
                isNearby(instanceLat, instanceLng, lat, lng)
              );
            });
            setRelatedCounseling(nearby);
          });

        // Fetch organizations
        fetch("https://fosterfledging.me/api/organizations?page[size]=100", {
          headers: { Accept: "application/vnd.api+json" },
        })
          .then((res) => res.json())
          .then((data) => {
            const allItems = Array.isArray(data.data) ? data.data : [data.data];
            const nearby = allItems.filter((i) => {
              const lat = parseFloat(i.attributes?.lat);
              const lng = parseFloat(i.attributes?.lng);
              return (
                !isNaN(lat) &&
                !isNaN(lng) &&
                isNearby(instanceLat, instanceLng, lat, lng)
              );
            });
            setRelatedOrganizations(nearby);
          });
      })
      .catch(() => setError("Error fetching housing data"));
  }, [id]);

  if (error) {
    return (
      <div className="container my-5">
        <p>{error}</p>
      </div>
    );
  }

  if (!housing) {
    return (
      <div className="container my-5">
        <p>Loading...</p>
      </div>
    );
  }

  const lat = parseFloat(housing.lat);
  const lng = parseFloat(housing.lng);
  const mapKey = "AIzaSyDxdnMN98-DPS0W4TuaJwsiV0-3D6dIv4Y";

  return (
    <div className="container my-5">
      <Link to="/housing" className="btn btn-secondary mb-3">
        ← Back to Housing
      </Link>

      <div className="card shadow-sm p-4 mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            {housing.photo_url && (
              <img
                src={housing.photo_url}
                alt={housing.name}
                className="img-fluid rounded shadow-sm"
              />
            )}
          </div>
          <div className="col-md-6">
            <h2>{housing.name || "Unknown Housing Name"}</h2>
            <p>
              <strong>Address:</strong> {housing.address || "No address available"}
            </p>
            <p>
              <strong>Lat/Lng:</strong> {housing.lat || "N/A"}, {housing.lng || "N/A"}
            </p>
            <p>
              <strong>Rating:</strong> {housing.rating || "N/A"}
            </p>
            <p>
              <strong>Category:</strong> {housing.category || "N/A"}
            </p>
            <p>
              <strong>Keyword:</strong> {housing.keyword || "N/A"}
            </p>
            <p>
              <strong>Phone:</strong> {housing.phone || "N/A"}
            </p>
            <p>
              <strong>Website:</strong>{" "}
              {housing.website ? (
                <a
                  href={housing.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {housing.website}
                </a>
              ) : (
                "N/A"
              )}
            </p>
            <p>
              <strong>Source:</strong> {housing.source || "N/A"}
            </p>
            <p>
              <strong>Retrieved at:</strong> {housing.retrieved_at || "N/A"}
            </p>
          </div>
        </div>
        {lat && lng && (
          <div className="mt-3">
            <iframe
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${mapKey}&q=${lat},${lng}`}
            ></iframe>
          </div>
        )}
      </div>

      <RelatedSection title="Related Counseling Services" items={relatedCounseling} />
      <RelatedSection title="Related Organizations" items={relatedOrganizations} />
    </div>
  );
}
