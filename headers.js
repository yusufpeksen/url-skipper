(function (root) {
  "use strict";

  function canonicalFromHeaders(headers, sourceUrl, resolver) {
    for (const header of headers || []) {
      if (header.name?.toLowerCase() !== "link" || !header.value) continue;
      for (const part of header.value.split(/,(?=\s*<)/)) {
        const match = part.match(/^\s*<([^>]+)>\s*;(.*)$/);
        if (!match || !/(?:^|;)\s*rel\s*=\s*(?:"[^"]*\bcanonical\b[^"]*"|'[^']*\bcanonical\b[^']*'|canonical)(?:\s*;|\s*$)/i.test(match[2])) continue;
        const destination = resolver.safeDestination(match[1], sourceUrl);
        if (destination) return destination;
      }
    }
    return null;
  }

  root.ShortLinkHeaders = { canonicalFromHeaders };
  if (typeof module !== "undefined" && module.exports) module.exports = root.ShortLinkHeaders;
})(globalThis);
