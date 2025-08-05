import React, { useEffect, useRef } from "react";
import Mustache from "mustache";
import hljs from 'highlight.js';
import routeros from 'highlight.js/lib/languages/routeros';

// Register only the needed language in Highlight.js
hljs.registerLanguage('routeros', routeros);

function Script({ template, tagValues }) {
  if (!template || !tagValues) return null;
  return (
    <div className="overflow-x-scroll f6">
      <Highlight className="mv0 pa4" language="routeros">
        {Mustache.render(template.content, tagValues)}
      </Highlight>
    </div>
  );
}

export default Script;

function Highlight({ children, className, language }) {
  const codeRef = useRef();

  useEffect(() => {
    if (!codeRef.current) return;
    hljs.highlightElement(codeRef.current);
  }, [codeRef, children]);

  return (
    <pre className={className}>
      <code className={language} ref={codeRef}>
        {children}
      </code>
    </pre>
  );
}
