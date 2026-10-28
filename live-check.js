// Run against a temporary Chromium/Edge profile started with --remote-debugging-port.
const [url, port = "9232"] = process.argv.slice(2);
if (!url) throw new Error("Usage: node live-check.js <url> [port]");

(async () => {
  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const target = targets.find((item) => item.type === "page" && item.webSocketDebuggerUrl);
  if (!target) throw new Error("No page target");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  const events = [];
  const responses = new Map();
  let id = 0;
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });
  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Network.responseReceived" && message.params.type === "Document") {
      const response = message.params.response;
      responses.set(message.params.requestId, response.url);
      events.push({ type: "response", status: response.status, url: response.url,
        link: response.headers.link || response.headers.Link || null });
    }
    if (message.method === "Network.loadingFailed") {
      events.push({ type: "failure", url: responses.get(message.params.requestId) || null,
        error: message.params.errorText });
    }
    if (message.method === "Page.frameNavigated" && !message.params.frame.parentId) {
      events.push({ type: "navigation", url: message.params.frame.url });
    }
  });
  const send = (method, params = {}) => ws.send(JSON.stringify({ id: ++id, method, params }));
  send("Page.enable");
  send("Network.enable");
  send("Page.navigate", { url });
  await new Promise((resolve) => setTimeout(resolve, 10000));
  console.log(JSON.stringify(events, null, 2));
  ws.close();
})().catch((error) => { console.error(error); process.exitCode = 1; });
