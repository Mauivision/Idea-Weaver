const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const serviceWorkerSource = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'service-worker.js'),
  'utf8'
);

function createResponse(body) {
  return {
    body,
    status: 200,
    type: 'basic',
    clone() {
      return createResponse(body);
    }
  };
}

function createHarness({ cachedEntries, fetchResponse, fetchError }) {
  const listeners = {};
  const entries = new Map(Object.entries(cachedEntries));
  const fetchRequests = [];
  const cache = {
    addAll: async () => undefined,
    put: async (request, response) => {
      const key = typeof request === 'string' ? request : request.url;
      entries.set(key, response);
    }
  };
  const caches = {
    open: async () => cache,
    match: async request => {
      const key = typeof request === 'string' ? request : request.url;
      return entries.get(key);
    },
    keys: async () => [],
    delete: async () => true
  };
  const self = {
    addEventListener: (name, listener) => {
      listeners[name] = listener;
    },
    skipWaiting: () => undefined,
    clients: {
      claim: () => undefined
    }
  };
  const fetch = async request => {
    fetchRequests.push(request);
    if (fetchError) {
      throw fetchError;
    }
    return fetchResponse;
  };

  vm.runInNewContext(serviceWorkerSource, { caches, console, fetch, self });

  async function dispatchFetch(request) {
    const lifetimePromises = [];
    let responsePromise;
    listeners.fetch({
      request,
      respondWith: promise => {
        responsePromise = promise;
      },
      waitUntil: promise => {
        lifetimePromises.push(promise);
      }
    });

    const response = await responsePromise;
    await Promise.all(lifetimePromises);
    return response;
  }

  return { dispatchFetch, entries, fetchRequests };
}

test('online navigation uses and caches the latest app shell', async () => {
  const staleShell = createResponse('old release');
  const latestShell = createResponse('new release');
  const harness = createHarness({
    cachedEntries: {
      '/index.html': staleShell,
      'https://idea-weaver.example/': staleShell
    },
    fetchResponse: latestShell
  });

  const response = await harness.dispatchFetch({
    method: 'GET',
    mode: 'navigate',
    url: 'https://idea-weaver.example/'
  });

  assert.equal(response.body, 'new release');
  assert.equal(harness.fetchRequests.length, 1);
  assert.equal(harness.entries.get('/index.html').body, 'new release');
});

test('offline navigation falls back to the cached app shell', async () => {
  const cachedShell = createResponse('offline release');
  const harness = createHarness({
    cachedEntries: { '/index.html': cachedShell },
    fetchError: new Error('offline')
  });

  const response = await harness.dispatchFetch({
    method: 'GET',
    mode: 'navigate',
    url: 'https://idea-weaver.example/'
  });

  assert.equal(response.body, 'offline release');
});

test('static assets continue to use the cache first', async () => {
  const cachedAsset = createResponse('cached asset');
  const harness = createHarness({
    cachedEntries: {
      'https://idea-weaver.example/static/js/main.js': cachedAsset
    },
    fetchResponse: createResponse('network asset')
  });

  const response = await harness.dispatchFetch({
    method: 'GET',
    mode: 'no-cors',
    url: 'https://idea-weaver.example/static/js/main.js'
  });

  assert.equal(response.body, 'cached asset');
  assert.equal(harness.fetchRequests.length, 0);
});
