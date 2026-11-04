<?php

/*
 Base64 implementation of the Damm error detection algorithm in PHP

 Copyright (c) 2026, Daniel Tillett
 SPDX-License-Identifier: BSD-2-Clause
 */

declare(strict_types=1);

namespace Damm64;

final class Damm64
{
    public const BASE = 64;

    /* The base64url alphabet (RFC 4648 section 5), so base64 zero is 'A'. Input is case-sensitive. */
    public const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

    /* Returned by checkDigit() when the input contains a character outside the alphabet. */
    public const INVALID = null;

    /*
     The quasigroup operation x * y = 2(x XOR y) in GF(64), using the primitive
     polynomial x^6 + x + 1. It has a zero diagonal and is totally
     anti-symmetric, so every single-character error and adjacent
     transposition is detected.
     */
    private static function op(int $x, int $y): int
    {
        $z = ($x ^ $y) << 1;

        return ($z & self::BASE) !== 0 ? $z ^ 0x43 : $z;
    }

    /**
     * Returns the value (0-63) of a base64 character, or -1 if it is not in the alphabet.
     */
    public static function value(string $char): int
    {
        if (strlen($char) !== 1) {
            return -1;
        }

        $index = strpos(self::ALPHABET, $char);

        return $index === false ? -1 : $index;
    }

    /**
     * Returns the base64 check digit for a string, or INVALID (null) if the
     * string contains a character outside the alphabet.
     */
    public static function checkDigit(string $code): ?string
    {
        $interim = 0;

        for ($i = 0, $len = strlen($code); $i < $len; $i++) {
            $value = self::value($code[$i]);

            if ($value < 0) {
                return self::INVALID;
            }

            $interim = self::op($interim, $value);
        }

        return self::ALPHABET[$interim];
    }

    /**
     * Returns true if the last character of a string is a valid Damm check
     * digit for the characters before it.
     */
    public static function isValid(string $code): bool
    {
        return $code !== '' && self::checkDigit($code) === self::ALPHABET[0];
    }
}
