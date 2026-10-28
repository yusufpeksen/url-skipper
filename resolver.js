(function (root) {
  "use strict";

  const DESTINATION_KEYS = [
    "url", "target", "destination", "dest", "redirect", "redirect_url",
    "redirect_uri", "to", "link", "go", "u"
  ];

  function decodeCandidate(value) {
    if (typeof value !== "string") return null;
    let current = value.trim();
    for (let i = 0; i < 3; i += 1) {
      if (/^https?:\/\//i.test(current)) return current;
      try {
        const decoded = decodeURIComponent(current);
        if (decoded === current) break;
        current = decoded;
      } catch {
        break;
      }
    }
    return /^https?:\/\//i.test(current) ? current : null;
  }

  function safeDestination(value, sourceUrl) {
    const decoded = decodeCandidate(value);
    if (!decoded) return null;
    try {
      const source = new URL(sourceUrl);
      const destination = new URL(decoded);
      if (!["http:", "https:"].includes(destination.protocol)) return null;
      if (destination.username || destination.password) return null;
      if (destination.hostname === source.hostname) return null;
      return destination.href;
    } catch {
      return null;
    }
  }

  function fromUrl(sourceUrl) {
    let url;
    try {
      url = new URL(sourceUrl);
    } catch {
      return null;
    }
    const groups = [url.searchParams];
    if (url.hash.length > 1) {
      const hash = url.hash.slice(1).replace(/^\?/, "");
      groups.push(new URLSearchParams(hash));
      const directHash = safeDestination(hash, sourceUrl);
      if (directHash) return directHash;
    }
    for (const params of groups) {
      for (const key of DESTINATION_KEYS) {
        const value = params.get(key);
        if (!value) continue;
        const destination = safeDestination(value, sourceUrl);
        if (destination) return destination;
      }
    }
    return null;
  }

  root.ShortLinkResolver = { fromUrl, safeDestination };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.ShortLinkResolver;
  }
})(globalThis);
