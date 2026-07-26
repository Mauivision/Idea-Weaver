/**
 * Regression tests for list drag-and-drop reorder persistence.
 * Run: node --test scripts/idea-reorder.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const SOURCE = path.join(__dirname, '..', 'src', 'lib', 'ideaReorder.ts');

function loadHelpers() {
  const source = fs.readFileSync(SOURCE, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    require,
  };
  vm.runInNewContext(compiled, context);
  return module.exports;
}

function idea(id, extras = {}) {
  return {
    id,
    title: id,
    description: '',
    category: 'Uncategorized',
    tags: [],
    isFavorite: false,
    isArchived: false,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    notes: [],
    connections: [],
    position: { x: 0, y: 0 },
    ...extras,
  };
}

describe('applyIdeaReorder', () => {
  const { applyIdeaReorder } = loadHelpers();

  it('reorders the full active list (the updateIdea-by-id bug path)', () => {
    const current = [idea('a'), idea('b'), idea('c')];
    const reordered = [idea('c'), idea('a'), idea('b')];
    const next = applyIdeaReorder(current, reordered);
    assert.deepEqual(
      next.map((item) => item.id),
      ['c', 'a', 'b']
    );
  });

  it('reorders only the filtered subset among its existing slots', () => {
    const current = [idea('a'), idea('b'), idea('c'), idea('d')];
    // Filtered view shows a,c,d; user drags to d,a,c
    const reorderedSubset = [idea('d'), idea('a'), idea('c')];
    const next = applyIdeaReorder(current, reorderedSubset);
    assert.deepEqual(
      next.map((item) => item.id),
      ['d', 'b', 'a', 'c']
    );
  });

  it('leaves archived ideas in place while reordering active slots', () => {
    const current = [
      idea('a'),
      idea('archived', { isArchived: true }),
      idea('b'),
      idea('c'),
    ];
    const reordered = [idea('c'), idea('b'), idea('a')];
    const next = applyIdeaReorder(current, reordered);
    assert.deepEqual(
      next.map((item) => item.id),
      ['c', 'archived', 'b', 'a']
    );
    assert.equal(next[1].isArchived, true);
  });

  it('returns the same array reference for invalid payloads (no wipe)', () => {
    const current = [idea('a'), idea('b')];
    assert.equal(applyIdeaReorder(current, [idea('missing')]), current);
    assert.equal(applyIdeaReorder(current, []), current);
    assert.equal(applyIdeaReorder(current, [idea('a'), idea('a')]), current);
  });

  it('keeps object identity from the current store (ignores stale subset fields)', () => {
    const liveA = idea('a', { title: 'Live A' });
    const liveB = idea('b', { title: 'Live B' });
    const current = [liveA, liveB];
    const staleSubset = [idea('b', { title: 'Stale B' }), idea('a', { title: 'Stale A' })];
    const next = applyIdeaReorder(current, staleSubset);
    assert.equal(next[0], liveB);
    assert.equal(next[1], liveA);
    assert.equal(next[0].title, 'Live B');
  });
});
