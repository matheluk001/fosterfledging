import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line
} from "recharts";

export default function DevVisualizations() {
  const [orgs, setOrgs] = useState([]);
  const [events, setEvents] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("https://api.utfirsts.me/orgs").then((r) => r.json()),
      fetch("https://api.utfirsts.me/events").then((r) => r.json()),
      fetch("https://api.utfirsts.me/scholarships").then((r) => r.json()),
    ])
      .then(([orgData, eventData, scholarshipData]) => {
        setOrgs(orgData);
        setEvents(eventData);
        setScholarships(scholarshipData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <h3>Loading data...</h3>;

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];

    // ==============================
    // ORGANIZATIONS — BY CAMPUS
    // ==============================
    const orgCampusMap = orgs.reduce((acc, org) => {
    if (!org.campus) return acc;
    acc[org.campus] = (acc[org.campus] || 0) + 1;
    return acc;
    }, {});

    const orgCampusChart = Object.entries(orgCampusMap).map(
    ([campus, count]) => ({ campus, count })
    );

  // ==============================
  // 2️⃣ EVENTS — BY MONTH
  // ==============================
  const eventsMonthlyMap = events.reduce((acc, e) => {
    if (!e.date || typeof e.date !== "string") return acc;
    const parts = e.date.split(",").slice(0, 2);
    const datePart = parts.join(",");
    const date = new Date(datePart);
    if (isNaN(date)) {
      console.warn("Invalid date:", e.date);
      return acc;
    }
    const month = date.toLocaleString("en-US", { month: "short" });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const monthsOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const eventsMonthlyChart = monthsOrder.map(month => ({
    month,
    count: eventsMonthlyMap[month] || 0
  }));

  const totalEvents = events.length; // already computed

  // ==============================
  // 3️⃣ SCHOLARSHIPS — AMOUNT DISTRIBUTION
  // ==============================
  const bins = [
    { label: "$0–$499", min: 0, max: 499, count: 0 },
    { label: "$500–$1999", min: 500, max: 1999, count: 0 },
    { label: "$2000–$4999", min: 2000, max: 4999, count: 0 },
    { label: "$5000+", min: 5000, max: Infinity, count: 0 }
  ];

  scholarships.forEach(s => {
    const amount = Math.max(Number(s.amount) || 0, 0);
    const bin = bins.find(b => amount >= b.min && amount <= b.max);
    if (bin) bin.count++;
  });

  const scholarshipAmountChart = bins.map(b => ({
    range: b.label,
    count: b.count
  }));
  const totalScholarships = events.length; // already computed

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif" }}>
    <h1>First-Gen Visualization Dashboard</h1>

        {/* Organizations by Campus */}
        <section style={{ marginTop: "40px" }}>
        <h2>Organizations by Campus</h2>
        <BarChart
            width={900}
            height={400}
            data={orgCampusChart}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
            dataKey="campus"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={60}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" label />
        </BarChart>
        </section>

      {/* 2 — Events */}
      <section style={{ marginTop: "40px" }}>
        <h2>Events per Month</h2>
        <p>Total Events: {totalEvents}</p>
        <LineChart width={700} height={300} data={eventsMonthlyChart}>
          <XAxis dataKey="month" interval={0} angle={-30} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip />
          <CartesianGrid stroke="#ccc" />
          <Line type="monotone" dataKey="count" stroke="#82ca9d" label />
        </LineChart>
      </section>

      {/* 3 — Scholarships */}
      <section style={{ marginTop: "40px" }}>
        <h2>Scholarship Amount Distribution</h2>
        <p>Total Scholarships: {totalScholarships}</p>
        <BarChart width={700} height={300} data={scholarshipAmountChart}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" interval={0} angle={-30} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#82ca9d" label />
        </BarChart>
      </section>
    </div>
  );
}
