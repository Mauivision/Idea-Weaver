/**
 * Regression: streak persistence must not abort voice/onboarding capture.
 * Run: node --test scripts/streak-capture.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const SOURCE = path.join(__dirname, '..', 'src', 'lib', 'streak.ts');

function loadStreak(localStorage) {
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
    localStorage,
    console,
    Date,
  };
  vm.runInNewContext(compiled, context);
  return module.exports;
}

function createThrowingStorage() {
  return {
    getItem: () => null,
    setItem: () => {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    },
    removeItem: () => {},
  };
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

/**
 * Mirrors App handleVoiceTranscript / onboarding handoff:
 * addIdea() then addNote(). If recordCapture throws inside addIdea,
 * addNote never runs and the transcript body is lost.
 */
function simulateVoiceCapture(recordCapture, transcript) {
  let ideaNotes = null;
  const addIdea = () => {
    recordCapture();
    return { id: 'idea-1', notes: [] };
  };
  const addNote = (ideaId, text) => {
    ideaNotes = { ideaId, text };
  };

  const newIdea = addIdea();
  if (newIdea) {
    addNote(newIdea.id, transcript);
  }
  return ideaNotes;
}

describe('recordCapture storage failures', () => {
  it('does not throw when localStorage.setItem raises QuotaExceededError', () => {
    const { recordCapture } = loadStreak(createThrowingStorage());
    assert.doesNotThrow(() => recordCapture());
    assert.equal(typeof recordCapture(), 'number');
  });

  it('still records normally when storage works', () => {
    const storage = createMemoryStorage();
    const { recordCapture, getStreak } = loadStreak(storage);
    const count = recordCapture();
    assert.equal(count, 1);
    assert.equal(getStreak()?.count, 1);
  });

  it('voice capture still attaches full note body when streak write fails', () => {
    const { recordCapture } = loadStreak(createThrowingStorage());
    const transcript = 'Call the supplier about the roof leak before Friday';
    const note = simulateVoiceCapture(recordCapture, transcript);
    assert.ok(note, 'addNote must run after addIdea');
    assert.equal(note.text, transcript);
  });
});
