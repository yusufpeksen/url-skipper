importScripts("resolver.js", "headers.js");

chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId < 0 || details.type !== "main_frame" || details.statusCode !== 200) return;
    const destination = ShortLinkHeaders.canonicalFromHeaders(
      details.responseHeaders,
      details.url,
      ShortLinkResolver
    );
    if (destination) chrome.tabs.update(details.tabId, { url: destination });
  },
  { urls: ["*://snip.ly/*", "*://*.snip.ly/*"], types: ["main_frame"] },
  ["responseHeaders"]
);
