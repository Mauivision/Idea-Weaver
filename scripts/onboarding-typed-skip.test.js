/**
 * Regression: typed onboarding draft must survive "Explore without sync"
 * without requiring an explicit "Add my first idea" submit.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

function loadHelper() {
  const srcPath = path.join(__dirname, '..', 'src', 'lib', 'onboardingFirstNoteContent.ts');
  const source = fs.readFileSync(srcPath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
  });
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  Function('exports', 'module', 'require', outputText)(module.exports, module, require);
  return module.exports;
}

test('skip with only unsaved typed draft keeps the note text', () => {
  const { resolveOnboardingFirstNoteContent } = loadHelper();
  assert.equal(
    resolveOnboardingFirstNoteContent('', '', '  Schedule concrete pour Friday  '),
    'Schedule concrete pour Friday'
  );
});

test('committed transcript wins over typed draft and interim', () => {
  const { resolveOnboardingFirstNoteContent } = loadHelper();
  assert.equal(
    resolveOnboardingFirstNoteContent('Final voice note', 'still listening', 'typed leftover'),
    'Final voice note'
  );
});

test('interim is used when transcript is empty', () => {
  const { resolveOnboardingFirstNoteContent } = loadHelper();
  assert.equal(
    resolveOnboardingFirstNoteContent('', 'buy lumber tomorrow', ''),
    'buy lumber tomorrow'
  );
});

test('empty inputs yield undefined (skip with no note)', () => {
  const { resolveOnboardingFirstNoteContent } = loadHelper();
  assert.equal(
    resolveOnboardingFirstNoteContent('   ', '', ''),
    undefined
  );
});
