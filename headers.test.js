const test = require("node:test");
const assert = require("node:assert/strict");
const { canonicalFromHeaders } = require("./headers.js");
const resolver = require("./resolver.js");

test("Sniply canonical başlığından hedefi bulur", () => {
  assert.equal(
    canonicalFromHeaders(
      [{ name: "Link", value: '<https://example.org/article>; rel="canonical"' }],
      "https://snip.ly/demo1",
      resolver
    ),
    "https://example.org/article"
  );
});

test("canonical olmayan veya aynı alan adına dönen başlığı atlar", () => {
  assert.equal(
    canonicalFromHeaders(
      [{ name: "Link", value: '<https://snip.ly/other>; rel="canonical", <https://example.org/>; rel="alternate"' }],
      "https://snip.ly/demo1",
      resolver
    ),
    null
  );
});
