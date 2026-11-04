/*
 Tests for the JavaScript base64 Damm check digit library. Run with `npm test`.

 Copyright (c) 2026, Daniel Tillett
 SPDX-License-Identifier: BSD-2-Clause
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ALPHABET, INVALID, checkDigit, isValid, value } from './damm64.js';

const VECTORS = fileURLToPath(new URL('../tests/vectors.txt', import.meta.url));
const CLI = fileURLToPath(new URL('./bin/damm64.js', import.meta.url));
const CHARS = [...ALPHABET];

test('alphabet is a bijection', () => {
  assert.equal(new Set(CHARS).size, 64);
  CHARS.forEach((char, i) => assert.equal(value(char), i));
  for (const char of '=+/ \t.é') {
    assert.equal(value(char), -1, `'${char}' should not be in the alphabet`);
  }
});

test('every single substitution and adjacent transposition is detected', () => {
  for (const a of CHARS) {
    assert.equal(new Set(CHARS.map((b) => checkDigit(a + b))).size, 64, `row ${a}`);
    assert.equal(new Set(CHARS.map((b) => checkDigit(b + a))).size, 64, `column ${a}`);

    for (const x of CHARS) {
      for (const y of CHARS) {
        if (x !== y && checkDigit(a + x + y) === checkDigit(a + y + x)) {
          assert.fail(`transposition ${a}${x}${y} / ${a}${y}${x} not detected`);
        }
      }
    }
  }
});

test('known values, case-sensitivity and invalid input', () => {
  assert.equal(checkDigit('Hello'), 'p');
  assert.ok(isValid('Hellop'));
  assert.ok(!isValid('Hellpp'));
  assert.notEqual(checkDigit('abc'), checkDigit('ABC'));
  assert.equal(checkDigit('ab=c'), INVALID);
  assert.equal(checkDigit('café'), INVALID);
  assert.ok(!isValid(''));
  assert.throws(() => checkDigit(42), TypeError);
});

test('shared vectors match the reference implementation', () => {
  let count = 0;
  for (const line of readFileSync(VECTORS, 'utf8').split('\n')) {
    if (!line.includes('\t')) {
      continue;
    }
    const [code, expected] = line.split('\t');
    assert.equal(checkDigit(code), expected === '' ? INVALID : expected, `vector ${code}`);
    count++;
  }
  assert.ok(count > 1000);
});

test('CLI matches the C version', () => {
  const run = (args, input) => spawnSync(process.execPath, [CLI, ...args], { input, encoding: 'utf8' });

  assert.equal(run(['Hello']).stdout, 'Base64 Number: Hello\nBase64 Check Digit: p\nError Check: 0\n');
  assert.equal(
    run(['bad=char']).stdout,
    'Base64 Number: bad=char\nBase64 Check Digit: invalid character\nError Check: 0\n',
  );
  assert.equal(run(['-a', 'Hello']).stdout, 'Hellop\n');
  assert.equal(run(['-a'], 'Hello\n-dash\n\n').stdout, 'Hellop\n-dasha\n');
  assert.equal(run(['-a', '--', '-dash']).stdout, '-dasha\n');
  assert.equal(run(['-c', 'Hellop']).status, 0);
  assert.equal(run(['-c', 'Hellpp']).status, 1);
  assert.equal(run(['-a', 'bad=char']).status, 1);
  assert.equal(run(['--bogus']).status, 2);
});
