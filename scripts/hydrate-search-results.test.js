/**
 * Regression: advanced-search snapshots must not pin stale idea objects
 * that can wipe notes when Graph/Weave call updateIdea.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadHelper() {
  const srcPath = path.join(__dirname, '..', 'src', 'lib', 'hydrateSearchResults.ts');
  const source = fs.readFileSync(srcPath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  });
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  Function('exports', 'module', 'require', outputText)(module.exports, module, require);
  return module.exports;
}

test('hydrate replaces snapshot with live idea (preserves newer notes)', () => {
  const { hydrateSearchResultsById } = loadHelper();
  const snapshot = [{ id: 'a', title: 'Old', notes: [] }];
  const live = [{ id: 'a', title: 'Old', notes: [{ id: 'n1', content: 'board note' }] }];
  const hydrated = hydrateSearchResultsById(live, snapshot);
  assert.equal(hydrated.length, 1);
  assert.equal(hydrated[0].notes.length, 1);
  assert.equal(hydrated[0].notes[0].content, 'board note');
  assert.equal(hydrated[0], live[0]);
});

test('hydrate drops ids missing from live ideas', () => {
  const { hydrateSearchResultsById } = loadHelper();
  const snapshot = [{ id: 'gone' }, { id: 'keep' }];
  const live = [{ id: 'keep', notes: [] }];
  const hydrated = hydrateSearchResultsById(live, snapshot);
  assert.deepEqual(
    hydrated.map((i) => i.id),
    ['keep']
  );
});

test('shouldEnableAdvancedSearch is false when counts match (no filters)', () => {
  const { shouldEnableAdvancedSearch } = loadHelper();
  assert.equal(shouldEnableAdvancedSearch(3, 3), false);
});

test('shouldEnableAdvancedSearch is true when filters reduce the set', () => {
  const { shouldEnableAdvancedSearch } = loadHelper();
  assert.equal(shouldEnableAdvancedSearch(1, 5), true);
});

test('shouldEnableAdvancedSearch is false for empty library', () => {
  const { shouldEnableAdvancedSearch } = loadHelper();
  assert.equal(shouldEnableAdvancedSearch(0, 0), false);
});
