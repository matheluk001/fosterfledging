import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

const LAT_LNG_THRESHOLD = 0.5;

function isNearby(lat1, lng1, lat2, lng2) {
  return Math.abs(lat1 - lat2) <= LAT_LNG_THRESHOLD && Math.abs(lng1 - lng2) <= LAT_LNG_THRESHOLD;
}

export default function CounselingInstance() {
  const { id } = useParams();
  const [instance, setInstance] = useState(null);
  const [relatedHousing, setRelatedHousing] = useState([]);
  const [relatedOrganizations, setRelatedOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchInstance() {
      try {
        const res = await fetch(`https://fosterfledging.me/api/counseling/${id}`, {
          headers: { Accept: "application/vnd.api+json" },
        });
        const data = await res.json();
        const attrs = data.data?.attributes || data.attributes || data;
        setInstance(attrs);

        const instanceLat = parseFloat(attrs.lat);
        const instanceLng = parseFloat(attrs.lng);

        // Fetch related housing
        const housingRes = await fetch(`https://fosterfledging.me/api/housing?page[size]=100`, {
          headers: { Accept: "application/vnd.api+json" },
        });
        const housingData = await housingRes.json();
        const housingItems = Array.isArray(housingData.data) ? housingData.data : [housingData.data];
        const nearbyHousing = housingItems.filter((i) => {
          const lat = parseFloat(i.attributes?.lat);
          const lng = parseFloat(i.attributes?.lng);
          return !isNaN(lat) && !isNaN(lng) && isNearby(instanceLat, instanceLng, lat, lng);
        });
        setRelatedHousing(nearbyHousing);

        // Fetch related organizations
        const orgRes = await fetch(`https://fosterfledging.me/api/organizations?page[size]=100`, {
          headers: { Accept: "application/vnd.api+json" },
        });
        const orgData = await orgRes.json();
        const orgItems = Array.isArray(orgData.data) ? orgData.data : [orgData.data];
        const nearbyOrgs = orgItems.filter((i) => {
          const lat = parseFloat(i.attributes?.lat);
          const lng = parseFloat(i.attributes?.lng);
          return !isNaN(lat) && !isNaN(lng) && isNearby(instanceLat, instanceLng, lat, lng);
        });
        setRelatedOrganizations(nearbyOrgs);
      } catch (err) {
        console.error("Error fetching counseling instance or related data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInstance();
  }, [id]);

  if (!id) return <p>Invalid instance ID</p>;
  if (loading) return <p>Loading...</p>;
  if (!instance) return <p>Instance not found or missing attributes</p>;

  const {
    name,
    photo_url,
    address,
    lat,
    lng,
    category,
    phone,
    website,
    source,
    retrieved_at,
  } = instance;

  return (
    <div className="container my-5">
      <Link to="/counseling" className="btn btn-secondary mb-4">← Back to Counseling</Link>

      {/* Main Counseling Card */}
      <div className="card shadow-sm p-4 mb-5">
        <div className="row g-3">
          <div className="col-md-6">
            {photo_url && <img src={photo_url} alt={name || ""} className="img-fluid rounded shadow-sm mb-3" />}
          </div>
          <div className="col-md-6">
            <h2>{name || "Unknown Counseling Name"}</h2>
            <p><strong>Address:</strong> {address || "No address available"}</p>
            <p><strong>Lat/Lng:</strong> {lat || "N/A"}, {lng || "N/A"}</p>
            <p><strong>Category:</strong> {category || "N/A"}</p>
            <p><strong>Phone:</strong> {phone || "N/A"}</p>
            <p><strong>Website:</strong> <a href={website || "#"} target="_blank">{website || "N/A"}</a></p>
            <p><strong>Source:</strong> {source || "N/A"}</p>
            <p><strong>Retrieved at:</strong> {retrieved_at || "N/A"}</p>
          </div>
        </div>
        <div className="mt-3">
          <iframe
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

      {/* Related Housing */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-primary text-white">
          Related Housing Resources
        </div>
        <div className="card-body">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            {relatedHousing.length === 0 ? (
              <p>No related housing found.</p>
            ) : (
              relatedHousing.map((item) => {
                const attrs = item.attributes || {};
                return (
                  <div className="col" key={item.id}>
                    <div className="card h-100 shadow-sm">
                      {attrs.photo_url && <img src={attrs.photo_url} alt={attrs.name || ""} className="card-img-top" />}
                      <div className="card-body">
                        <h5 className="card-title">{attrs.name || "Unknown Name"}</h5>
                        <p className="card-text">{attrs.address || "No address available"}</p>
                        <p><strong>Category:</strong> {attrs.category || "N/A"}</p>
                        <a href={attrs.website || "#"} target="_blank" className="btn btn-primary btn-sm">Website</a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Related Organizations */}
      <div className="card mb-4 shadow-sm">
        <div className="card-header bg-success text-white">
          Related Organizations
        </div>
        <div className="card-body">
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            {relatedOrganizations.length === 0 ? (
              <p>No related organizations found.</p>
            ) : (
              relatedOrganizations.map((item) => {
                const attrs = item.attributes || {};
                return (
                  <div className="col" key={item.id}>
                    <div className="card h-100 shadow-sm">
                      {attrs.photo_url && <img src={attrs.photo_url} alt={attrs.name || ""} className="card-img-top" />}
                      <div className="card-body">
                        <h5 className="card-title">{attrs.name || "Unknown Name"}</h5>
                        <p className="card-text">{attrs.address || "No address available"}</p>
                        <p><strong>Category:</strong> {attrs.category || "N/A"}</p>
                        <a href={attrs.website || "#"} target="_blank" className="btn btn-primary btn-sm">Website</a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
