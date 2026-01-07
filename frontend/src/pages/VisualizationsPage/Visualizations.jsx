import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
  ResponsiveContainer
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function Visualizations() {
  const [housing, setHousing] = useState([]);
  const [counseling, setCounseling] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);

  const BASE = "https://fosterfledging.me/api";
  const threshold = 2; // Anything with less than this count goes into "Miscellaneous"

  // Fetch all 3 models
  async function fetchData() {
    const endpoints = ["housing", "counseling", "organizations"];
    const responses = await Promise.all(
      endpoints.map(async (e) => {
        const res = await fetch(`${BASE}/${e}?page[size]=250`);
        const json = await res.json();
        return json.data.map((x) => x.attributes);
      })
    );
    setHousing(responses[0]);
    setCounseling(responses[1]);
    setOrgs(responses[2]);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <h3>Loading data…</h3>;

  // ----------------------------- Helper Functions -----------------------------
  const processData = (data) => {
    const allTypes = data.flatMap((h) => h.types);

    const typeCounts = allTypes.reduce((acc, type) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const processedTypes = allTypes.map(
      (t) => (typeCounts[t] < threshold ? "Miscellaneous" : t)
    );

    const chartData = Object.entries(
      processedTypes.reduce((acc, t) => {
        acc[t] = (acc[t] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, count]) => ({ type, count }));

    const miscCount = chartData.find((d) => d.type === "Miscellaneous")?.count || 0;
    const mainCount = chartData.reduce((sum, d) => sum + d.count, 0) - miscCount;
    const chartDataMisc = [
      { type: "Main Types", count: mainCount },
      { type: "Miscellaneous", count: miscCount },
    ];

    const stateCounts = data.reduce((acc, h) => {
      acc[h.state] = (acc[h.state] || 0) + 1;
      return acc;
    }, {});
    const chartDataByState = Object.entries(stateCounts).map(([state, count]) => ({
      state,
      count,
    }));

    return { chartData, chartDataByState, chartDataMisc };
  };

  function getRatingHistogram(data, bins = 5) {
    const ratings = data.map((d) => d.rating || 0);
    const maxRating = Math.max(...ratings, 5);
    const step = maxRating / bins;
    const histogram = Array(bins).fill(0);

    ratings.forEach((r) => {
      let index = Math.min(Math.floor(r / step), bins - 1);
      histogram[index]++;
    });

    return histogram.map((count, i) => ({
      range: `${(i * step).toFixed(1)}-${((i + 1) * step).toFixed(1)}`,
      count,
    }));
  }

  // ----------------------------- Chart Data -----------------------------
  const housingCharts = processData(housing);
  const counselingCharts = processData(counseling);
  const orgCharts = processData(orgs);

  const housingHist = getRatingHistogram(housing);
  const counselingHist = getRatingHistogram(counseling);
  const orgsHist = getRatingHistogram(orgs);

  const ratingChartData = housingHist.map((bin, i) => ({
    range: bin.range,
    Housing: bin.count,
    Counseling: counselingHist[i]?.count || 0,
    Organizations: orgsHist[i]?.count || 0,
  }));

  // MAPS
  const iconColors = {
    Housing: "green",
    Counseling: "blue",
    Organizations: "orange",
  };

  const createIcon = (color) =>
    new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

  // Merge all data with a type field for color/icon
  const allData = [
    ...housing.map((d) => ({ ...d, category: "Housing" })),
    ...counseling.map((d) => ({ ...d, category: "Counseling" })),
    ...orgs.map((d) => ({ ...d, category: "Organizations" })),
  ];

  // Center roughly on the US
  const center = [39.8283, -98.5795]; // Lat/Lng of the US center
  const zoom = 4;

  // ----------------------------- Render -----------------------------
  return (
    <div style={{ padding: 30 }}>
      {/* ---------- HOUSING ---------- */}
      <section style={{ marginTop: 40 }}>
        <h2>Housing Instances by Type</h2>
        <BarChart width={800} height={400} data={housingCharts.chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </section>

      {/* ---------- COUNSELING ---------- */}
      <section style={{ marginTop: 60 }}>
        <h2>Counseling Instances by Type</h2>
        <BarChart width={800} height={400} data={counselingCharts.chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </section>

      {/* ---------- ORGANIZATIONS ---------- */}
      <section style={{ marginTop: 60 }}>
        <h2>Organizations Instances by Type</h2>
        <BarChart width={800} height={400} data={orgCharts.chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </section>

      {/* ---------- RATING DISTRIBUTION ---------- */}
      <section style={{ marginTop: 60 }}>
        <h2>Rating Distribution Across Models</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={ratingChartData} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" label={{ value: "Rating Range", position: "insideBottom", offset: -10 }} />
            <YAxis label={{ value: "Count", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend verticalAlign="top" />
            <Line type="monotone" dataKey="Housing" stroke="#82ca9d" />
            <Line type="monotone" dataKey="Counseling" stroke="#8884d8" />
            <Line type="monotone" dataKey="Organizations" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </section>
      <section style={{ marginTop: 60 }}>
        <h2>All Data Points Across the US</h2>
        <div style={{ height: "600px", width: "100%" }}>
          <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {allData.map((d, i) =>
              d.lat && d.lng ? (
                <Marker
                  key={i}
                  position={[d.lat, d.lng]}
                  icon={createIcon(iconColors[d.category] || "red")}
                >
                  <Popup>
                    <strong>{d.name || d.title || "No Name"}</strong>
                    <br />
                    Type: {d.category}
                    <br />
                    {d.rating && <>Rating: {d.rating} <br /></>}
                    {d.state && <>State: {d.state}</>}
                  </Popup>
                </Marker>
              ) : null
            )}
          </MapContainer>
        </div>
      </section>
    </div>
  );
}
