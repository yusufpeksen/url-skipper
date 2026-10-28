const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("TinyURL önizleme sayfasındaki gerçek hedefe gider", () => {
  const navigations = [];
  const href = "http://www.facebook.com";
  const sandbox = {
    ShortLinkResolver: require("./resolver.js"),
    location: {
      href: "https://tinyurl.com/preview/as2hruy",
      hostname: "tinyurl.com",
      pathname: "/preview/as2hruy",
      replace(url) { navigations.push(url); }
    },
    document: {
      querySelectorAll(selector) {
        return selector.includes("a#long-link[href]")
          ? [{ getAttribute(name) { return name === "href" ? href : null; } }]
          : [];
      }
    },
    MutationObserver: class { observe() {} disconnect() {} },
    setTimeout() { return 1; },
    clearTimeout() {},
    clearInterval() {}
  };
  vm.runInNewContext(fs.readFileSync("content.js", "utf8"), sandbox);
  assert.deepEqual(navigations, [href + "/"]);
});
