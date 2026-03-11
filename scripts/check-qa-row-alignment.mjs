const pages = ["/qa/resources", "/qa/stats"];
const previewBase = process.env.LEASEQA_PREVIEW_URL || "http://127.0.0.1:3000";
const devtoolsBase = process.env.LEASEQA_DEVTOOLS_URL || "http://127.0.0.1:9223";

async function getJson(url, options) {
  const response = await fetch(url, options);
  return response.json();
}

async function evaluateInPage(wsUrl, expression) {
  const ws = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (pending.has(message.id)) {
      pending.get(message.id)(message);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const messageId = ++id;
      pending.set(messageId, (message) => {
        pending.delete(messageId);
        resolve(message);
      });
      ws.send(JSON.stringify({ id: messageId, method, params }));
    });

  await send("Page.enable");
  await send("Runtime.enable");
  const result = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
  });

  ws.close();
  return result.result.result.value;
}

async function measurePage(path) {
  const target = await getJson(
    `${devtoolsBase}/json/new?${encodeURIComponent(`${previewBase}${path}`)}`,
    { method: "PUT" },
  );

  await new Promise((resolve) => setTimeout(resolve, 900));

  return evaluateInPage(
    target.webSocketDebuggerUrl,
    `(() => {
      const row = document.querySelector('.resources-layout-row, .qa-stats-grid')?.getBoundingClientRect();
      const title = document.querySelector('.qa-page-title')?.getBoundingClientRect();
      return {
        path: location.pathname,
        rowLeft: row?.left,
        rowWidth: row?.width,
        titleLeft: title?.left,
      };
    })()`,
  );
}

const measurements = [];
for (const path of pages) {
  measurements.push(await measurePage(path));
}

console.log(JSON.stringify(measurements, null, 2));

if (measurements.length !== 2) {
  throw new Error("Expected exactly two QA page measurements.");
}

const [resourcesPage, statsPage] = measurements;
if (resourcesPage.rowLeft !== statsPage.rowLeft) {
  throw new Error(
    `QA row alignment mismatch: resources=${resourcesPage.rowLeft}, stats=${statsPage.rowLeft}`,
  );
}
