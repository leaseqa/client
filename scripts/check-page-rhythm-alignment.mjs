const pages = [
  {path: "/", selector: ".landing-hero-copy", label: "home"},
  {path: "/ai-review", selector: ".review-header-section", label: "review"},
  {path: "/qa", selector: ".qa-feed-stack, .qa-compose-page, .auth-container-narrow", label: "qa"},
  {
    path: "/qa/resources",
    selector: ".resources-main-card, .auth-container-narrow",
    label: "resources",
  },
  {
    path: "/qa/stats",
    selector: ".qa-stats-section, .auth-container-narrow",
    label: "stats",
  },
];

const previewBase = process.env.LEASEQA_PREVIEW_URL || "http://127.0.0.1:3000";
const devtoolsBase = process.env.LEASEQA_DEVTOOLS_URL || "http://127.0.0.1:9223";
const maxVariance = 18;

async function getJson(url, options) {
  const response = await fetch(url, options);
  return response.json();
}

async function openTarget(url) {
  return getJson(`${devtoolsBase}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT",
  });
}

async function withPage(wsUrl, fn) {
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
      ws.send(JSON.stringify({id: messageId, method, params}));
    });

  await send("Page.enable");
  await send("Runtime.enable");

  try {
    return await fn(send);
  } finally {
    ws.close();
  }
}

async function evaluateInPage(target, expression) {
  return withPage(target.webSocketDebuggerUrl, async (send) => {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    return result.result.result.value;
  });
}

async function setGuestSession() {
  const target = await openTarget(previewBase);

  await withPage(target.webSocketDebuggerUrl, async (send) => {
    await send("Page.navigate", {url: `${previewBase}/`});
    await new Promise((resolve) => setTimeout(resolve, 700));
    await send("Runtime.evaluate", {
      expression: `localStorage.setItem("guest_session", "true")`,
    });
  });
}

async function measurePage(page) {
  const target = await openTarget(`${previewBase}${page.path}`);
  await new Promise((resolve) => setTimeout(resolve, 900));

  return evaluateInPage(
    target,
    `(() => {
      const anchor = document.querySelector(${JSON.stringify(page.selector)})?.getBoundingClientRect();
      const shell = document.querySelector('.page-shell')?.getBoundingClientRect();
      return {
        path: location.pathname + location.search,
        label: ${JSON.stringify(page.label)},
        anchorLeft: anchor?.left ?? null,
        shellLeft: shell?.left ?? null,
      };
    })()`,
  );
}

await setGuestSession();

const measurements = [];
for (const page of pages) {
  measurements.push(await measurePage(page));
}

console.log(JSON.stringify(measurements, null, 2));

const anchorValues = measurements
  .map((item) => item.anchorLeft)
  .filter((value) => typeof value === "number");

if (anchorValues.length !== pages.length) {
  throw new Error("Failed to measure all primary page anchors.");
}

const minLeft = Math.min(...anchorValues);
const maxLeft = Math.max(...anchorValues);

if (maxLeft - minLeft > maxVariance) {
  throw new Error(
    `Primary page rhythm mismatch: min=${minLeft}, max=${maxLeft}, variance=${maxLeft - minLeft}`,
  );
}
