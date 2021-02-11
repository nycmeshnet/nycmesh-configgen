import React from "react";

function Tags({ tags, tagValues, onChange }) {
  if (!tags) return null;
  return tags.map((tag) => {
    const label = getLabel(tag);
    const type = getType(tag);
    const value = tagValues[tag] || "";
    const handleChange = ({ target }) => {
      if (tag === "nodenumber") {
        const isValid = target.value > 0 && target.value <= 8000;
        if (!isValid) {
          alert("Network numbers must be between 1 and 8000!");
          return;
        }
      }
      onChange(tag, target.value);
    };

    return (
      <div key={tag} className="w-100 flex items-center justify-between mt2">
        <label htmlFor={tag}>{label}</label>
        <input
          required
          type={type}
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

function getType(tag) {
  if (tag === "nodenumber") return "number";
  return "text";
}

export default Tags;
