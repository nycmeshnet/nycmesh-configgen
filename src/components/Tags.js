import React from "react";

function Tags({ tags, tagValues, onChange }) {
  if (!tags) return null;
  return tags.map((tag) => {
    let label = tag
    let type = "text"
    let max=""
    let min=""
    if (tag === "nodenumber") {
      label = "Network Number"
      type="number"
      max="8000"
      min="1"
    }
    return (
      <div key={tag} className="w-100 flex items-center justify-between mt2">
        <label htmlFor={tag}>{label}</label>
        <input
          required
          spellCheck={false}
          type={type}
          max={max}
          min={min}
          value={tagValues[tag] || ""}
          className="flex w-100 ml3 mw5"
          onChange={({ target }) => onChange(tag, target.value)}
        />
      </div>
    );
  });
}
export default Tags;