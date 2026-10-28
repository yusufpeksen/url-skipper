const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("Sniply yanıtındaki hedef mevcut sekmede açılır", () => {
  let listener;
  const updates = [];
  const sandbox = {
    importScripts() {},
    ShortLinkHeaders: require("./headers.js"),
    ShortLinkResolver: require("./resolver.js"),
    chrome: {
      webRequest: { onHeadersReceived: { addListener(fn) { listener = fn; } } },
      tabs: { update(tabId, options) { updates.push({ tabId, options }); } }
    }
  };
  vm.runInNewContext(fs.readFileSync("background.js", "utf8"), sandbox);
  listener({
    tabId: 7,
    type: "main_frame",
    statusCode: 200,
    url: "https://snip.ly/demo1",
    responseHeaders: [{ name: "Link", value: '<https://example.org/article>; rel="canonical"' }]
  });
  assert.equal(updates.length, 1);
  assert.equal(updates[0].tabId, 7);
  assert.equal(updates[0].options.url, "https://example.org/article");
});
