const previewBase = process.env.LEASEQA_PREVIEW_URL || "http://127.0.0.1:3000";
const devtoolsBase = process.env.LEASEQA_DEVTOOLS_URL || "http://127.0.0.1:9223";

const transitions = [
  { name: "home-to-review", start: "/", clickSelector: '.site-nav-link[href="/ai-review"]' },
  { name: "home-to-qa", start: "/", clickSelector: '.site-nav-link[href="/qa"]' },
  { name: "review-to-qa", start: "/ai-review", clickSelector: '.site-nav-link[href="/qa"]' },
  { name: "qa-to-resources", start: "/qa", clickSelector: '.qa-nav-tab:nth-child(2)' },
  { name: "qa-to-stats", start: "/qa", clickSelector: '.qa-nav-tab:nth-child(3)' },
];

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
    if ( pending.has(message.id) ) {
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

  try {
    return await fn(send);
  } finally {
    ws.close();
  }
}

async function setGuestSession() {
  const target = await openTarget(previewBase);
  await withPage(target.webSocketDebuggerUrl, async (send) => {
    await send("Page.navigate", { url: `${previewBase}/` });
    await new Promise((resolve) => setTimeout(resolve, 700));
    await send("Runtime.evaluate", {
      expression: `localStorage.setItem("guest_session", "true")`,
    });
  });
}

async function traceTransition(transition) {
  const target = await openTarget(`${previewBase}${transition.start}`);

  return withPage(target.webSocketDebuggerUrl, async (send) => {
    await send("Page.navigate", { url: `${previewBase}${transition.start}` });
    await new Promise((resolve) => setTimeout(resolve, 900));

    const expression = `(() => new Promise((resolve) => {
      const selector = ${JSON.stringify(transition.clickSelector)};
      const samples = [];
      const capture = (label) => {
        const shell = document.querySelector('.page-shell')?.getBoundingClientRect();
        const page = document.querySelector('.landing-page, .review-flow, .qa-page, .resources-page, .qa-stats-page, .auth-page')?.getBoundingClientRect();
        const header = document.querySelector('.site-header .container-fluid')?.getBoundingClientRect();
        const topNav = document.querySelector('.site-nav')?.getBoundingClientRect();
        const qaNav = document.querySelector('.qa-nav-tabs')?.getBoundingClientRect();
        const activeTop = document.querySelector('.site-nav-link.is-active')?.getBoundingClientRect();
        const activeQa = document.querySelector('.qa-nav-tab.active')?.getBoundingClientRect();
        samples.push({
          label,
          href: location.pathname + location.search,
          shellLeft: shell?.left ?? null,
          pageLeft: page?.left ?? null,
          headerLeft: header?.left ?? null,
          topNavLeft: topNav?.left ?? null,
          qaNavLeft: qaNav?.left ?? null,
          activeTopLeft: activeTop?.left ?? null,
          activeTopWidth: activeTop?.width ?? null,
          activeQaLeft: activeQa?.left ?? null,
          activeQaWidth: activeQa?.width ?? null,
        });
      };

      capture('before');

      const targetEl = document.querySelector(selector);
      if (!targetEl) {
        resolve({ error: 'missing click target', selector, samples });
        return;
      }

      let frame = 0;
      const totalFrames = 45;
      targetEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

      const step = () => {
        capture('frame-' + frame);
        frame += 1;
        if (frame < totalFrames) {
          requestAnimationFrame(step);
        } else {
          resolve({ selector, samples });
        }
      };

      requestAnimationFrame(step);
    }))()`;

    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });

    return {
      name: transition.name,
      data: result.result.result.value,
    };
  });
}

await setGuestSession();

const traces = [];
for ( const transition of transitions ) {
  traces.push(await traceTransition(transition));
}

console.log(JSON.stringify(traces, null, 2));
