/** Escape a string for safe use inside HTML attribute values and text content. */
export function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Allow only http(s) URLs — blocks javascript: and other scheme injection. */
export function safeHref(href: string): string {
  return /^https?:\/\//.test(href) ? href : '#';
}
