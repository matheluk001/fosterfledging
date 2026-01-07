import React from "react";

export default function SearchBar({ query, setQuery }) {
  return (
    <div className="mb-4">
      <input
        type="text"
        className="form-control"
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ maxWidth: "400px" }}
      />
    </div>
  );
}
