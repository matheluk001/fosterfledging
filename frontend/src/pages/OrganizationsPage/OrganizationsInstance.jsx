import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const LAT_LNG_THRESHOLD = 0.5;

function isNearby(lat1, lng1, lat2, lng2) {
  return (
    Math.abs(lat1 - lat2) <= LAT_LNG_THRESHOLD &&
    Math.abs(lng1 - lng2) <= LAT_LNG_THRESHOLD
  );
}

function RelatedCard({ item }) {
  const attrs = item.attributes || item;
  return (
    <div className="col">
      <div className="card h-100 shadow-sm">
        {attrs.photo_url && (
          <img src={attrs.photo_url} className="card-img-top" alt={attrs.name || ""} />
        )}
        <div className="card-body">
          <h5 className="card-title">{attrs.name || "Unknown Name"}</h5>
          <p className="card-text">{attrs.address || "No address available"}</p>
          <p><strong>Category:</strong> {attrs.category || "N/A"}</p>
          {attrs.website && (
            <a href={attrs.website} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function RelatedSection({ title, items, color }) {
  return (
    <div className="card mb-4 shadow-sm">
      <div className={`card-header text-white bg-${color}`}>
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
          {items && items.length > 0 ? items.map((item, i) => <RelatedCard key={i} item={item} />)
            : <p>No related instances found.</p>}
        </div>
      </div>
    </div>
  );
}

export default function OrganizationInstance() {
  const { id } = useParams();  // ✅ get ID from URL path param
  const numericId = parseInt(id, 10);

  const [organization, setOrganization] = useState(null);
  const [relatedCounseling, setRelatedCounseling] = useState([]);
  const [relatedHousing, setRelatedHousing] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isNaN(numericId)) {
      setError("Invalid instance ID");
      return;
    }

    fetch(`https://fosterfledging.me/api/organizations/${id}`, {
      headers: { Accept: "application/vnd.api+json" },
    })
      .then((res) => res.json())
      .then((org) => {
        const attrs = org.data?.attributes || org;
        setOrganization(attrs);

        const instanceLat = parseFloat(attrs.lat);
        const instanceLng = parseFloat(attrs.lng);

        // Related counseling
        fetch("/api/counseling?page[size]=100", { headers: { Accept: "application/vnd.api+json" } })
          .then((res) => res.json())
          .then((data) => {
            const allItems = Array.isArray(data.data) ? data.data : [data.data];
            setRelatedCounseling(allItems.filter(i => {
              const lat = parseFloat(i.attributes?.lat);
              const lng = parseFloat(i.attributes?.lng);
              return !isNaN(lat) && !isNaN(lng) && isNearby(instanceLat, instanceLng, lat, lng);
            }));
          });

        // Related housing
        fetch("/api/housing?page[size]=100", { headers: { Accept: "application/vnd.api+json" } })
          .then((res) => res.json())
          .then((data) => {
            const allItems = Array.isArray(data.data) ? data.data : [data.data];
            setRelatedHousing(allItems.filter(i => {
              const lat = parseFloat(i.attributes?.lat);
              const lng = parseFloat(i.attributes?.lng);
              return !isNaN(lat) && !isNaN(lng) && isNearby(instanceLat, instanceLng, lat, lng);
            }));
          });
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading organization");
      });
  }, [numericId]);

  if (error) return <div className="container my-5"><p>{error}</p></div>;
  if (!organization) return <div className="container my-5"><p>Loading...</p></div>;

  const lat = parseFloat(organization.lat);
  const lng = parseFloat(organization.lng);

  return (
    <div className="container my-5">
      <Link to="/organizations" className="btn btn-secondary mb-4">← Back to Organizations</Link>

      <div className="card shadow-sm p-4 mb-5" id="instance-card">
        <div className="row g-3">
          <div className="col-md-6">
            {organization.photo_url && <img src={organization.photo_url} alt={organization.name} className="img-fluid rounded shadow-sm" />}
          </div>
          <div className="col-md-6">
            <h2>{organization.name || "Unknown Organization"}</h2>
            <p><strong>Address:</strong> {organization.address || "N/A"}</p>
            <p><strong>Lat/Lng:</strong> {organization.lat}, {organization.lng}</p>
            <p><strong>Category:</strong> {organization.category || "N/A"}</p>
            <p><strong>Keyword:</strong> {organization.keyword || "N/A"}</p>
            <p><strong>Phone:</strong> {organization.phone || "N/A"}</p>
            <p><strong>Website:</strong> <a href={organization.website} target="_blank" rel="noopener noreferrer">{organization.website || "N/A"}</a></p>
            <p><strong>Source:</strong> {organization.source || "N/A"}</p>
            <p><strong>Rating:</strong> {organization.rating || "N/A"}</p>
            <p><strong>Retrieved at:</strong> {organization.retrieved_at || "N/A"}</p>
          </div>
        </div>

        <div className="mt-3">
          <iframe
            title="map"
            width="100%"
            height="300"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDxdnMN98-DPS0W4TuaJwsiV0-3D6dIv4Y&q=${lat},${lng}`}
          ></iframe>
        </div>
      </div>

      <RelatedSection title="Related Counseling Services" color="primary" items={relatedCounseling} />
      <RelatedSection title="Related Housing" color="success" items={relatedHousing} />
    </div>
  );
}
