const test = require("node:test");
const assert = require("node:assert/strict");
const { fromUrl, safeDestination } = require("./resolver.js");

test("query parametresindeki kodlanmış hedefi çözer", () => {
  assert.equal(
    fromUrl("https://ouo.io/x?url=https%3A%2F%2Fexample.org%2Ffile%3Fa%3D1"),
    "https://example.org/file?a=1"
  );
});

test("hash içindeki hedefi çözer", () => {
  assert.equal(
    fromUrl("https://exe.io/x#target=https%3A%2F%2Fexample.org%2F"),
    "https://example.org/"
  );
});

test("tehlikeli ve aynı alan adına dönen hedefleri reddeder", () => {
  assert.equal(safeDestination("javascript:alert(1)", "https://ouo.io/x"), null);
  assert.equal(safeDestination("https://ouo.io/again", "https://ouo.io/x"), null);
  assert.equal(safeDestination("https://user:pass@example.org/", "https://ouo.io/x"), null);
});
