// Configs are RouterOS scripts, not HTML: don't let Mustache HTML-escape values
// (it would turn "/" into "&#x2F;").
export const RENDER_CONFIG = { escape: (value) => String(value) };
