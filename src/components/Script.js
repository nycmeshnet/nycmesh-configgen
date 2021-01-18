import React from "react";
import Mustache from "mustache";

function Script({ template, tagValues }) {
  if (!template || !tagValues) return null;
  return (
    <div className="overflow-x-scroll pa4 bg-bluec f6">
      <pre className="mv0">
        <code>{Mustache.render(template.content, tagValues)}</code>
      </pre>
    </div>
  );
}

export default Script;
