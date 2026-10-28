(function () {
  "use strict";

  const resolver = globalThis.ShortLinkResolver;
  const sourceUrl = location.href;
  const direct = resolver.fromUrl(sourceUrl);
  if (direct) {
    location.replace(direct);
    return;
  }

  // Only destination fields and explicit outbound buttons are considered.
  const selectors = [
    "a#continue[href]", "a#download[href]", "a#go-link[href]",
    "a[data-destination]", "a[data-url]", "a[data-target]",
    "button[data-destination]", "button[data-url]", "button[data-target]"
  ];
  if (location.hostname === "tinyurl.com" && location.pathname.startsWith("/preview/")) {
    selectors.unshift("a#long-link[href]");
  }
  let finished = false;
  let observer;
  let timeout;
  let ouoPoll;

  const isOuo = /(^|\.)ouo\.(io|press)$/.test(location.hostname);
  let ouoScheduled = false;

  function handleOuoForm() {
    if (!isOuo || ouoScheduled) return;
    const form = document.querySelector(
      location.pathname.startsWith("/go") ? "form#form-go" : "form#form-captcha"
    );
    if (!form) return;
    const key = `shortlink-ouo-submit:${location.pathname}`;
    if (sessionStorage.getItem(key)) return;

    const challenge = form.querySelector(
      "iframe[src*='recaptcha'], iframe[src*='hcaptcha'], iframe[src*='challenges.cloudflare.com'], .cf-turnstile, .g-recaptcha, .h-captcha"
    ) || document.querySelector(".cf-turnstile, .g-recaptcha, .h-captcha");
    const tokens = form.querySelectorAll(
      "[name='cf-turnstile-response'], [name='g-recaptcha-response'], [name='h-captcha-response']"
    );
    if (challenge && (!tokens.length || !Array.from(tokens).some((token) => token.value))) return;

    ouoScheduled = true;
    setTimeout(() => {
      if (!form.isConnected) return;
      sessionStorage.setItem(key, "1");
      HTMLFormElement.prototype.submit.call(form);
    }, 500);
  }

  function inspect() {
    if (finished) return;
    handleOuoForm();
    for (const element of document.querySelectorAll(selectors.join(","))) {
      for (const attribute of ["data-destination", "data-url", "data-target", "href"]) {
        const candidate = element.getAttribute(attribute);
        if (!candidate) continue;
        const destination = resolver.safeDestination(candidate, sourceUrl);
        if (!destination) continue;
        finished = true;
        observer?.disconnect();
        clearTimeout(timeout);
        clearInterval(ouoPoll);
        location.replace(destination);
        return;
      }
    }
  }

  observer = new MutationObserver(inspect);
  observer.observe(document, { childList: true, subtree: true, attributes: true });
  if (isOuo) ouoPoll = setInterval(handleOuoForm, 500);
  timeout = setTimeout(() => {
    observer.disconnect();
    clearInterval(ouoPoll);
  }, isOuo ? 120000 : 15000);
  inspect();
})();
