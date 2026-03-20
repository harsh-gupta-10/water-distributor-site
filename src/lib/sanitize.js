/**
 * Custom HTML sanitization utility to prevent XSS.
 * This is used as a fallback because environment restrictions prevent installing DOMPurify.
 * It uses a whitelist-based approach to only allow known safe tags and attributes.
 *
 * @param {string} html - The raw HTML string to sanitize.
 * @returns {string} - The sanitized HTML string.
 */
export function sanitizeHtml(html) {
  if (!html || typeof html !== 'string') return '';

  // Whitelist of safe tags
  const ALLOWED_TAGS = new Set([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'span', 'img'
  ]);

  // Whitelist of safe attributes per tag
  const ALLOWED_ATTRS = {
    '*': ['class', 'id', 'title'],
    'a': ['href', 'name', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height', 'loading']
  };

  // Protocols allowed for URI attributes
  const ALLOWED_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:', 'data:'];

  // Check if we are in a browser environment with DOMParser
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    try {
      const parser = new window.DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const sanitizeNode = (node) => {
        if (node.nodeType === 3) return node.cloneNode(true); // Text node
        if (node.nodeType !== 1) return null; // Not an element

        const tagName = node.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tagName)) return null;

        const newNode = doc.createElement(tagName);

        // Copy allowed attributes
        const allowedForTag = ALLOWED_ATTRS[tagName] || [];
        const globalAllowed = ALLOWED_ATTRS['*'];
        const allAllowed = [...allowedForTag, ...globalAllowed];

        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          const attrName = attr.name.toLowerCase();

          if (allAllowed.includes(attrName)) {
            let attrValue = attr.value;

            // Check URI attributes for dangerous protocols
            if (['href', 'src', 'formaction'].includes(attrName)) {
              // Basic URI validation
              const trimmedValue = attrValue.trim().toLowerCase();
              if (trimmedValue.startsWith('javascript:') || trimmedValue.startsWith('vbscript:')) {
                attrValue = '#';
              } else if (trimmedValue.includes(':') && !ALLOWED_PROTOCOLS.some(p => trimmedValue.startsWith(p))) {
                // If it has a protocol but not an allowed one
                attrValue = '#';
              }

              // Extra check for data: URIs - only allow images
              if (trimmedValue.startsWith('data:') && !trimmedValue.startsWith('data:image/')) {
                attrValue = '#';
              }
            }

            newNode.setAttribute(attrName, attrValue);
          }
        }

        // Recursively sanitize children
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          const sanitizedChild = sanitizeNode(child);
          if (sanitizedChild) {
            newNode.appendChild(sanitizedChild);
          }
        }

        return newNode;
      };

      const sanitizedBody = doc.createElement('div');
      for (let i = 0; i < doc.body.childNodes.length; i++) {
        const sanitizedChild = sanitizeNode(doc.body.childNodes[i]);
        if (sanitizedChild) {
          sanitizedBody.appendChild(sanitizedChild);
        }
      }

      return sanitizedBody.innerHTML;
    } catch (e) {
      console.error('Browser-based sanitization failed, falling back to regex:', e);
    }
  }

  // Fallback regex-based sanitization for environments without DOMParser (like Node.js tests)
  // This is a last-resort and should be as robust as possible for a regex approach.
  let sanitized = html;

  // 1. Remove script, style, and other dangerous tags and their content
  sanitized = sanitized.replace(/<(script|style|iframe|object|embed|applet|meta|link|base|form|input|textarea|select|option|frameset|frame|svg|math)\b[^>]*>([\s\S]*?)<\/\1>/gim, '');
  sanitized = sanitized.replace(/<(script|style|iframe|object|embed|applet|meta|link|base|form|input|textarea|select|option|frameset|frame|svg|math)\b[^>]*\/?>/gim, '');

  // 2. Remove on* event handler attributes
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*(?:(['"])(?:(?!\1).)*\1|[^\s>]+)/gim, '');

  // 3. Remove dangerous URIs
  const dangerousUriPattern = /(href|src|formaction)\s*=\s*(?:(['"])\s*(?:javascript|vbscript|data\s*:(?!\s*image\/))(?:(?!\2).)*\2|(?:\s*javascript|vbscript|data\s*:(?!\s*image\/))[^\s>]+)/gim;
  sanitized = sanitized.replace(dangerousUriPattern, '$1="#"');

  // 4. Strip tags that are not in the whitelist (and their attributes)
  // This is a simplified version of a whitelist for regex
  const tagRegex = /<\/?([a-z0-9]+)\b([^>]*)>/gim;
  sanitized = sanitized.replace(tagRegex, (match, tagName, attrs) => {
    tagName = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(tagName)) return '';

    // Sanitize attributes within the tag
    const sanitizedAttrs = attrs.replace(/([a-z0-9-]+)\s*=\s*(?:(['"])(?:(?!\2).)*\2|[^\s>]+)/gim, (attrMatch, attrName) => {
      attrName = attrName.toLowerCase();
      const allowedForTag = ALLOWED_ATTRS[tagName] || [];
      const globalAllowed = ALLOWED_ATTRS['*'];
      if ([...allowedForTag, ...globalAllowed].includes(attrName)) {
        return attrMatch;
      }
      return '';
    });

    return `<${match.startsWith('</') ? '/' : ''}${tagName}${sanitizedAttrs.replace(/\s+/g, ' ').trimEnd()}>`;
  });

  // 5. Remove HTML comments
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');

  return sanitized;
}
