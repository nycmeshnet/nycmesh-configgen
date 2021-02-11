import React from "react";

function Tags({ tags, tagValues, onChange }) {
  if (!tags) return null;
  return tags.map((tag) => {
    const label = getLabel(tag);
    const value = tagValues[tag] || "";
    const handleChange = ({ target }) => {
      const { value } = target;
      if (tag === "nodenumber") {
        const inRange = value > 0 && value <= 8000;
        const isValid = !isNaN(value) && inRange;
        if (value && !isValid) {
          alert("Network numbers must be between 1 and 8000!");
          return;
        }
      }
      onChange(tag, value);
    };

    return (
      <div key={tag} className="w-100 flex items-center justify-between mt2">
        <label htmlFor={tag}>{label}</label>
        <input
          required
          value={value}
          spellCheck={false}
          className="flex w-100 ml3 mw5"
          onChange={handleChange}
        />
      </div>
    );
  });
}

function getLabel(tag) {
  if (tag === "nodenumber") return "network number";
  return tag;
}

export default Tags;
