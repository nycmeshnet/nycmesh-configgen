import React from "react";

function Tags({ tags, tagValues, onChange }) {
  if (!tags) return null;

  return tags.map((tag) => (
    <div key={tag} className="w-100 flex items-center justify-between mt2">
      <label htmlFor={tag}>{tag}</label>
      <input
        name={tag}
        required
        spellCheck={false}
        value={tagValues[tag] || ""}
        className="flex w-100 ml3 mw5"
        onChange={({ target }) => onChange(tag, target.value)}
      />
    </div>
  ));
}

export default Tags;
