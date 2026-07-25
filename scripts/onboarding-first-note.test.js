/**
 * Regression tests for onboarding first-note durability helpers.
 * Run: node --test scripts/onboarding-first-note.test.js
 */

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const SOURCE = path.join(__dirname, '..', 'src', 'lib', 'onboardingFirstNote.ts');

function loadHelpers(localStorage) {
  const source = fs.readFileSync(SOURCE, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;

  let uuidCounter = 0;
  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    require,
    localStorage,
    crypto: {
      randomUUID: () => {
        uuidCounter += 1;
        return `00000000-0000-4000-8000-${String(uuidCounter).padStart(12, '0')}`;
      },
    },
    Math: {
      ...Math,
      random: () => 0.25,
    },
  };
  vm.runInNewContext(compiled, context);
  return module.exports;
}

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => {
      map.set(key, String(value));
    },
    removeItem: (key) => {
      map.delete(key);
    },
    _map: map,
  };
}

describe('composeOnboardingNoteText', () => {
  it('keeps visible interim speech that has not finalized yet', () => {
    const { composeOnboardingNoteText } = loadHelpers(createMemoryStorage());
    assert.equal(
      composeOnboardingNoteText('Call the plumber', 'about the leak'),
      'Call the plumber about the leak'
    );
  });

  it('supports interim-only capture', () => {
    const { composeOnboardingNoteText } = loadHelpers(createMemoryStorage());
    assert.equal(composeOnboardingNoteText('', 'buy lumber tomorrow'), 'buy lumber tomorrow');
  });
});

describe('persistOnboardingFirstNote', () => {
  let storage;
  let helpers;

  beforeEach(() => {
    storage = createMemoryStorage();
    helpers = loadHelpers(storage);
  });

  it('writes the first idea into ideaWeaverIdeas before app mount', () => {
    helpers.persistOnboardingFirstNote('Measure kitchen for cabinets');

    const stored = JSON.parse(storage.getItem('ideaWeaverIdeas'));
    assert.equal(stored.length, 1);
    assert.equal(stored[0].title, 'First Idea');
    assert.equal(stored[0].notes[0].content, 'Measure kitchen for cabinets');
    assert.equal(storage.getItem(helpers.ONBOARDING_FIRST_NOTE_KEY), null);
  });

  it('does not wipe unreadable ideas data; uses handoff key instead', () => {
    storage.setItem('ideaWeaverIdeas', '{not-json');
    helpers.persistOnboardingFirstNote('Do not lose this');

    assert.equal(storage.getItem('ideaWeaverIdeas'), '{not-json');
    assert.equal(storage.getItem(helpers.ONBOARDING_FIRST_NOTE_KEY), 'Do not lose this');
  });

  it('survives a simulated tab close after persist (localStorage still has the idea)', () => {
    helpers.persistOnboardingFirstNote('Survives refresh');
    // New page load only has localStorage; sessionStorage would be empty.
    const afterReload = JSON.parse(storage.getItem('ideaWeaverIdeas'));
    assert.equal(afterReload[0].notes[0].content, 'Survives refresh');
  });
});

describe('consumeOnboardingFirstNote', () => {
  it('reads and clears the fallback handoff key once', () => {
    const storage = createMemoryStorage();
    const helpers = loadHelpers(storage);
    storage.setItem(helpers.ONBOARDING_FIRST_NOTE_KEY, 'fallback note');

    assert.equal(helpers.consumeOnboardingFirstNote(), 'fallback note');
    assert.equal(helpers.consumeOnboardingFirstNote(), null);
  });
});
