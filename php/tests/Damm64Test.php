<?php

/*
 Tests for the PHP base64 Damm check digit library. Dependency-free: run with
 `php php/tests/Damm64Test.php`.

 Copyright (c) 2026, Daniel Tillett
 SPDX-License-Identifier: BSD-2-Clause
 */

declare(strict_types=1);

require_once __DIR__ . '/../src/Damm64.php';

use Damm64\Damm64;

$failures = 0;

function check(bool $condition, string $message): void
{
    global $failures;
    if (!$condition) {
        fwrite(STDERR, "FAIL: $message\n");
        $failures++;
    }
}

$alphabet = str_split(Damm64::ALPHABET);

/* Alphabet is a bijection. */
check(count(array_unique($alphabet)) === Damm64::BASE, 'alphabet has 64 distinct characters');
foreach ($alphabet as $i => $char) {
    check(Damm64::value($char) === $i, "value of '$char'");
}
for ($c = 0; $c < 256; $c++) {
    if (strpos(Damm64::ALPHABET, chr($c)) === false) {
        check(Damm64::value(chr($c)) === -1, "byte $c is not in the alphabet");
    }
}

/* Every single substitution and adjacent transposition is detected (exhaustive). */
foreach ($alphabet as $a) {
    $row = [];
    $column = [];
    foreach ($alphabet as $b) {
        $row[] = Damm64::checkDigit($a . $b);
        $column[] = Damm64::checkDigit($b . $a);
    }
    check(count(array_unique($row)) === Damm64::BASE, "row $a is a permutation");
    check(count(array_unique($column)) === Damm64::BASE, "column $a is a permutation");

    foreach ($alphabet as $x) {
        foreach ($alphabet as $y) {
            if ($x !== $y && Damm64::checkDigit($a . $x . $y) === Damm64::checkDigit($a . $y . $x)) {
                check(false, "transposition $a$x$y / $a$y$x not detected");
            }
        }
    }
}

/* Case-sensitivity and invalid input. */
check(Damm64::checkDigit('abc') !== Damm64::checkDigit('ABC'), 'input is case-sensitive');
check(Damm64::checkDigit('ab=c') === Damm64::INVALID, "'=' is invalid");
check(Damm64::checkDigit('café') === Damm64::INVALID, 'non-ASCII is invalid');
check(Damm64::checkDigit('Hello') === 'p', 'Hello -> p');
check(Damm64::isValid('Hellop'), 'Hellop is valid');
check(!Damm64::isValid(''), 'empty string is invalid');

/* Shared vectors, identical to those used by the C and JavaScript tests. */
$count = 0;
foreach (file(__DIR__ . '/../../tests/vectors.txt', FILE_IGNORE_NEW_LINES) as $line) {
    if (strpos($line, "\t") === false) {
        continue;
    }
    [$code, $expected] = explode("\t", $line, 2);
    $expected = $expected === '' ? Damm64::INVALID : $expected;
    check(Damm64::checkDigit($code) === $expected, "vector $code");
    $count++;
}
check($count > 1000, 'shared vectors were read');

if ($failures > 0) {
    fwrite(STDERR, "$failures check(s) failed\n");
    exit(1);
}

echo "All tests passed\n";
